from fastapi import Depends
from app.services.base_service import BaseService
from app.services.process_pipeline import ProcessPipeline
from app.services.audio_processing import ProcessAudioService
from app.services.diarization import DiarizationService
from app.services.transcription import TranscriptionService
from app.repository.audio import AudioRepository
from app.schemas import settings


def get_audio_repository() -> AudioRepository:
    return AudioRepository()


def get_process_audio_service() -> ProcessAudioService:
    return ProcessAudioService()


def get_diarization_service() -> DiarizationService:
    return DiarizationService(hf_token=settings.HF_TOKEN)


def get_transcription_service() -> TranscriptionService:
    return TranscriptionService()


def get_process_pipeline() -> ProcessPipeline:
    return ProcessPipeline()


def get_audio_pipeline(
    process_pipeline: ProcessPipeline = Depends(get_process_pipeline),
    process_audio: ProcessAudioService = Depends(get_process_audio_service),
    diarization: DiarizationService = Depends(get_diarization_service),
    transcription: TranscriptionService = Depends(get_transcription_service)
) -> BaseService:
    process_pipeline.set_next(process_audio).set_next(diarization).set_next(transcription)
    return process_pipeline
