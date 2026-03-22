from app.services.audio_processing import AudioProcessingService
from app.services.diarization import DiarizationService
from app.services.transcription import TranscriptionService
from app.schemas import settings


def get_audio_processing_service() -> AudioProcessingService:
    return AudioProcessingService()


def get_diarization_service() -> DiarizationService:
    return DiarizationService(hf_token=settings.HF_TOKEN)


def get_transcription_service() -> TranscriptionService:
    return TranscriptionService() # asr_model


def get_audio_pipeline(
    process_audio: AudioProcessingService = Depends(get_audio_processing_service),
    diarization: DiarizationService = Depends(get_diarization_service),
    transcription: TranscriptionService = Depends(get_transcription_service)
) -> BaseService:
    pipeline = process_audio
    pipeline.set_next(diarization).set_next(transcription)
    return pipeline
