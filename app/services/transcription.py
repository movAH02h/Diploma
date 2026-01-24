import torch
from pydub import AudioSegment
import nemo.collections.asr as nemo_asr
from app.services.base_service import BaseService
import soundfile as sf
import json
import os
import tempfile
from typing import List, Dict
import numpy as np
from app.config import settings

class TranscriptionService():
    def __init__(self, hf_token: str):
        if settings.LANGUAGE_MODEL == "Ru":
            print("Load Russian NeMo model...")
            self.asr_model = nemo_asr.models.ASRModel.from_pretrained(
                model_name="stt_ru_conformer_ctc_large"
            )
        elif settings.LANGUAGE_MODEL == "En":
            print("Load English NeMo model...")
            self.asr_model = nemo_asr.models.ASRModel.from_pretrained(
                model_name="stt_en_conformer_ctc_medium"
            )


    def _process(self, audio_path: str):
        print("Checking audio_path in system...")
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Файл не найден: {audio_path}")

        print("Загрузка аудио с помощью pydub...")
        y, sr, duration = self._load_audio_pydub(audio_path=audio_path, target_sr=16000, mono=True)

        if np.any(np.isnan(y)) or np.any(np.isinf(y)):
            print("⚠️  Обнаружены NaN/Inf значения, исправляю...")
            y = np.nan_to_num(y)

        if len(y.shape) == 1:
            waveform_tensor = torch.from_numpy(y).float().unsqueeze(0)
        else:
            waveform_tensor = torch.from_numpy(y).float()

        if len(y) == 0:
            raise ValueError("Аудиофайл пустой")

        print("Получение результатов диаризации...")
        outputs = self.diarization_pipeline({
            "waveform": waveform_tensor,
            "sample_rate": sr
        })

        predicted_diarization = outputs.speaker_diarization

        diarization_segments = []
        speakers = set()

        print("Разделение аудиозаписи по сегментам...")
        speakers = set()
        try:
            for segment, track, speaker in predicted_diarization.itertracks(yield_label=True):
                speakers.add(speaker)
                print(f"   {speaker}: {segment.start:.1f}s - {segment.end:.1f}s")
        except Exception as e:
            print(f"⚠️  Ошибка в itertracks: {e}")
            # Пробуем другой способ итерации
            try:
                for turn, _, speaker in predicted_diarization.itertracks(yield_label=True):
                    speakers.add(speaker)
                    print(f"   {speaker}: {turn.start:.1f}s - {turn.end:.1f}s")
            except:
                pass

        print(f"\nSpeakers detected: {len(speakers)}")

        temp_wav_path = tempfile.mktemp(suffix='.wav')
        sf.write(temp_wav_path, y, sr, subtype='PCM_16')

        print("\nPerforming transcription...")
        transcription = self.asr_model.transcribe([temp_wav_path])
        full_text_hypothesis = transcription[0]

        if hasattr(full_text_hypothesis, 'text'):
            predicted_text = full_text_hypothesis.text
        else:
            predicted_text = str(full_text_hypothesis)

        print("Возвращаю результат...")
        return {"result": predicted_text}
    

    def _load_audio_pydub(self, audio_path: str, target_sr: int = 16000, mono: bool = True):
        print("Загрузка из файла...")
        audio = AudioSegment.from_file(audio_path)

        if mono and audio.channels > 1:
            audio = audio.set_channels(1)
        
        print("Преобразование в диапfзон [-1, 1]")
        samples = np.array(audio.get_array_of_samples())

        if audio.sample_width == 2:  # 16-bit
            samples = samples.astype(np.float32) / 32768.0
        elif audio.sample_width == 4:  # 32-bit
            samples = samples.astype(np.float32) / 2147483648.0
        elif audio.sample_width == 1:  # 8-bit
            samples = (samples.astype(np.float32) - 128) / 128.0
        else:
            samples = samples.astype(np.float32)

        print(f"Размерность аудио: {samples.shape}")
        
        print("Вычисление длительности аудио...")
        sr = target_sr
        audio_duration = len(samples) / sr
    
        print("Готово!")
        return samples, sr, audio_duration
