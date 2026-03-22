import asyncio
import os
import torch
import numpy as np
import nemo.collections.asr as nemo_asr
from app.services.base_service import BaseService
import soundfile as sf
import tempfile
from typing import List, Dict, Any
from app.schemas import settings
from app.logger import logger
from scipy.io import wavfile


class TranscriptionService(BaseService):
    def __init__(self):
        super().__init__("TranscriptionService")
        if settings.LANGUAGE_MODEL == "Ru":
            logger.debug("Load Russian NeMo model...")
            self.asr_model = nemo_asr.models.ASRModel.from_pretrained(
                model_name="stt_ru_conformer_ctc_large"
            )
        elif settings.LANGUAGE_MODEL == "En":
            logger.debug("Load English NeMo model...")
            self.asr_model = nemo_asr.models.ASRModel.from_pretrained(
                model_name="stt_en_conformer_ctc_medium"
            )


    async def _process(self, data: Dict[str, Any]):
        logger.debug("Extracting all from data...")

        speakers = data["speakers"]
        waveform_np = data["waveform_numpy"]
        sr = data["sample_rate"]
        segments = data["diarization_segments"]

        logger.debug("Check if the sample rate is 16000 Hz...")
        if sr != 16000:
            logger.debug(f"Sample rate is not 16000, but this value is recommended !")

        logger.debug("Reduce waveform_np's demension...")
        if waveform_np.ndim == 2 and waveform_np.shape[0] == 1:
            waveform_1d = waveform_np[0]
        else:
            waveform_1d = waveform_np

        logger.debug("Transcript all segments...")
        transcriptions = []
        for i, segment in enumerate(segments):
            speaker = segment['speaker']
            start_time = segment['start']
            end_time = segment['end']
            duration = end_time - start_time

            if duration < 0.5:
                logger.debug("The segment is too short ! Continue...")
                continue

            start_sample = int(start_time * sr)
            end_sample = int(end_time * sr)

            start_sample = max(0, start_sample)
            end_sample = min(len(waveform_1d), end_sample)

            if start_sample >= end_sample:
                logger.debug("Invalid segment. Continue...")
                continue

            segment_audio = waveform_1d[start_sample:end_sample]

            logger.debug(f"Transcribe {i} segment...")
            segment_text = await self._transcribe_segment(segment_audio, sr)

            transcriptions.append({
                'speaker': speaker,
                'start': start_time,
                'end': end_time,
                'text': segment_text
            })

        logger.debug("Connect speaker and his text...")
        speaker_transcriptions = {}
        for tr in transcriptions:
            speaker = tr['speaker']
            if speaker not in speaker_transcriptions:
                speaker_transcriptions[speaker] = []

            speaker_transcriptions[speaker].append(tr)


        logger.debug("Process final distribution of the transcripted segments...")
        final_transcriptions = {}
        for speaker, segs in speaker_transcriptions.items():
            segs.sort(key=lambda x: x['start'])
            full_text = " ".join(seg['text'] for seg in segs)
            final_transcriptions[speaker] = {
                'full_text': full_text,
                'segments': segs
            }

        logger.debug(f"Final transcriptions: {final_transcriptions}")
        data["transcriptions"] = final_transcriptions
        logger.debug("Transcription completed !")

        return data


    async def _transcribe_segment(self, audio_segment: np.ndarray, sr: int) -> str:
        """ Transcribe particulary segment """
        if len(audio_segment) == 0:
            return ""

        max_amplitude = np.abs(audio_segment).max()
        if max_amplitude > 1.0:
            audio_segment = audio_segment / max_amplitude
        elif max_amplitude < 0.5:
            audio_segment = audio_segment * (0.7 / max_amplitude)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            temp_wav_path = tmp.name

            audio_segment = np.clip(audio_segment, -1, 1) # Нормализация. Диапазон [-1, 1]

            audio_int16 = np.int16(audio_segment * 32767) # Квантизация аудио

            wavfile.write(temp_wav_path, sr, np.int16(audio_segment * 32767))

        try:
            transcription = await asyncio.to_thread(self.asr_model.transcribe, [temp_wav_path])

            text = str(transcription[0])

            if hasattr(transcription[0], 'text'):
                text = transcription[0].text

            text = text.strip()
            
            return ' '.join(text.split())
        except Exception as e:
            logger.debug(f"Ошибка транскрибации: {e} !")
            return ""
        finally:
            try:
                os.unlink(temp_wav_path)
            except Exception as e:
                logger.debug(f"Unable to delete {temp_wav_path} file !")