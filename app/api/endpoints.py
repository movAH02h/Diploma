from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.services.transcription import TranscriptionService
from app.services.diarization import DiarizationService
from app.services.process_audio import ProcessAudioService
import os
from app.config import settings
from app.logger import logger

router = APIRouter()

def create_pipeline():
    process_audio_service = ProcessAudioService()
    diarization = DiarizationService()
    transcription = TranscriptionService(settings.hf_token)
    
    # Setting pipeline's stages
    process_service.set_next(diarization).set_next(transcription)
    
    return process_service


def create_start_dictionary(audio_path: str):
    dict = {}
    dict["audio_path"] = audio_path


@router.post("/process_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    try:
        logger.debug("Create dictionary with data...")
        start_dict = create_start_dictionary()
        logger.debug("Create services for pipeline...")
        pipeline = create_pipeline()
        logger.debug("Process audio...")
        result = pipeline.process(start_dict)

        os.remove(temp_path)
        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(500, f"Ошибка обработки {str(e)}")
