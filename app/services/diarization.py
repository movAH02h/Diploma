from pyannote.audio import Pipeline
from huggingface_hub import login
from app.services.base_service import BaseService
from app.logger import logger
from typing import Dict, Any
from app.config import settings


class DiarizationService(BaseService):
    def __init__(self, hf_token: str):
        super().__init__("DiarizationService")
        if hf_token:
            logger.debug("Token was successfully downloaded from file!")
            login(token=hf_token)
        else:
            raise Exception(f"Token not found!")

        logger.debug("Load diarization model...")
        self.diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1"
        )


    def _process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        logger.debug("Получение результатов диаризации...")
        if "waveform_tensor" in data:
            waveform_tensor = data["waveform_tensor"]
        if "sample_rate" in data:
            sr = data["sample_rate"]
        outputs = self.diarization_pipeline({
            "waveform": waveform_tensor,
            "sample_rate": sr
        })

        predicted_diarization = outputs.speaker_diarization

        diarization_segments = []
        speakers = set()

        logger.debug("Разделение аудиозаписи по сегментам...")
        speakers = set()
        try:
            for segment, track, speaker in predicted_diarization.itertracks(yield_label=True):
                duration = segment.end - segment.start
                if duration < settings.MIN_SEGMENT_DURATION:
                    logger.debug("Слишком короткий сегмент -> continue...")
                    continue
                
                speakers.add(speaker)
                diarization_segments.append({
                    'speaker': speaker,
                    'start': segment.start,
                    'end': segment.end,
                    'segment': segment
                })
                logger.debug(f"   {speaker}: {segment.start:.1f}s - {segment.end:.1f}s")
        except Exception as e:
            logger.debug(f"Ошибка: {e}")
            

        logger.debug(f"\nSpeakers detected: {len(speakers)}")

        data["diarization_segments"] = diarization_segments
        data["speakers"] = list(speakers)
        if "waveform_numpy" not in data:
            if hasattr(waveform_tensor, 'numpy'):
                data["waveform_numpy"] = waveform_tensor.numpy()
            elif hasattr(waveform_tensor, 'detach'):
                data["waveform_numpy"] = waveform_tensor.detach().cpu().numpy()
            else:
                data["waveform_numpy"] = waveform_tensor

        return data
