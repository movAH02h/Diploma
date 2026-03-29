import asyncio
import os
import torch
import numpy as np
import tempfile
from typing import Dict, Any
from app.logger import logger
from scipy.io import wavfile
from app.services.base_service import BaseService
from app.models import model_manager


class TranscriptionService(BaseService):
    def __init__(self):
        super().__init__("TranscriptionService")

    async def _process(self, data: Dict[str, Any]):
        logger.debug("Extracting all from data...")
        waveform_np = data["waveform_numpy"]
        sr = data["sample_rate"]
        segments = data["diarization_segments"]

        logger.debug("Check if the sample rate is 16000 Hz...")
        if sr != 16000:
            logger.debug("Sample rate is not 16000, but this value is recommended !")

        logger.debug("Reduce waveform_np's demension...")
        if waveform_np.ndim == 2 and waveform_np.shape[0] == 1:
            waveform_1d = waveform_np[0]
        else:
            waveform_1d = waveform_np

        logger.debug("Obtaining Whisper model...")
        whisper_model = model_manager.get_whisper()
        transcriptions = []
        logger.debug("Transcript all segments...")
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
            segment_text = await self._transcribe_segment(whisper_model, segment_audio, sr)

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


    async def _transcribe_segment(self, whisper_model, audio_segment: np.ndarray, sr: int) -> str:
        if len(audio_segment) == 0:
            return ""

        max_amplitude = np.abs(audio_segment).max()
        if max_amplitude > 1.0:
            audio_segment = audio_segment / max_amplitude
        elif max_amplitude < 0.5:
            audio_segment = audio_segment * (0.7 / max_amplitude)

        audio_segment = np.clip(audio_segment, -1, 1)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            temp_wav_path = tmp.name
            wavfile.write(temp_wav_path, sr, np.int16(audio_segment * 32767))

        try:
            transcription = await asyncio.to_thread(
                whisper_model.transcribe,
                temp_wav_path,
                language="en",
                task="transcribe",
                fp16=torch.cuda.is_available()
            )

            text = transcription["text"].strip()            
            return ' '.join(text.split())
        except Exception as e:
            logger.debug(f"Whisper transcription error: {e} !")
            return ""
        finally:
            try:
                os.unlink(temp_wav_path)
            except Exception:
                logger.debug(f"Unable to delete {temp_wav_path} file !")
