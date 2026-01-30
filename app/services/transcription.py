import nemo.collections.asr as nemo_asr
from app.services.base_service import BaseService
import soundfile as sf
import tempfile
from typing import List, Dict, Any
from app.config import settings
from app.logger import logger
import torch
import numpy as np

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


    def _process(self, data: Dict[str, Any]):
        logger.debug("Extracting all from data...")

        speakers = data["speakers"]
        waveform_np = data["waveform_numpy"]
        sr = data["sample_rate"]
        segments = data["diarization_segments"]

        if waveform_np.dim() == 2 and waveform_np.shape[0] == 1:
            waveform_1d = waveform_np[0]
        else:
            waveform_1d = waveform_np
        
        transcriptions = []

        for i, segment in enumerate(segments):
            speaker = segment['speaker']
            start_time = segment['start']
            end_time = segment['end']

            start_sample = max(0, start_sample)
            end_sample = max(len(waveform_1d), end_sample)

            if start_sample >= end_sample:
                logger.debug("Invalid segment. Continue...")
                continue
            
            segment_audio = waveform_1d[start_sample:end_sample]

            segment_text = self._transcribe_segment(segment_audio, sr)

            transcriptions.append({
                'speaker': speaker,
                'start': start,
                'end': end,
                'text': segment_text
            })

        speaker_transcriptions = {}
        for tr in transcriptions:
            speaker = tr['speaker']
            if speaker not in speaker_transcriptions:
                speaker_transcriptions[speaker] = []
            
            speaker_transcriptions[speaker].append(tr)
        

        final_transcriptions = {}
        for speaker, segs in speaker_transcriptions.items():
            segs.sort(key=lambda x: x['start'])
            full_text = " ".join(seg['text'] for seg in segs)
            final_transcriptions[speaker] = {
                'full_text': full_text,
                'segments': segs
            }

        data["transcriptions"] = final_transcriptions
        logger.debug("Transcription completed !")

        return data
    

    def _transcribe_segment(self, audio_segment: np.ndarray, sr: int) -> str:
        pass