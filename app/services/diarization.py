from pyannote.audio import Pipeline
from huggingface_hub import login
from app.services.base_service import BaseService
from app.logger import logger

class DiarizationService(BaseService):
    def __init__(self, hf_token: str):
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
                speakers.add(speaker)
                logger.debug(f"   {speaker}: {segment.start:.1f}s - {segment.end:.1f}s")
        except Exception as e:
            logger.debug(f"⚠️  Ошибка в itertracks: {e}")
            try:
                for turn, _, speaker in predicted_diarization.itertracks(yield_label=True):
                    speakers.add(speaker)
                    logger.debug(f"   {speaker}: {turn.start:.1f}s - {turn.end:.1f}s")
            except:
                pass

        logger.debug(f"\nSpeakers detected: {len(speakers)}")
    

    def _split_audio():
        pass
