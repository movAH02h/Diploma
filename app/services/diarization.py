import asyncio
from pyannote.audio import Pipeline
from huggingface_hub import login
from typing import Dict, Any
from app.services.base_service import BaseService
from app.logger import logger
from app.schemas import settings
from app.models import model_manager

class DiarizationService(BaseService):
    def __init__(self, hf_token: str):
        super().__init__("DiarizationService")

    async def _process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        logger.debug("Получение модели диаризации...")
        diarization_pipeline = model_manager.get_diarization()
        logger.debug("Получение результатов диаризации...")
        if "waveform_tensor" in data:
            waveform_tensor = data["waveform_tensor"]
        if "sample_rate" in data:
            sr = data["sample_rate"]
        outputs = diarization_pipeline({
            "waveform": waveform_tensor,
            "sample_rate": sr
        })

        predicted_diarization = outputs.speaker_diarization

        logger.debug("Разделение аудиозаписи по сегментам...")
        diarization_segments = []
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
