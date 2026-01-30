from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.services.transcription import TranscriptionService
import os
from app.config import settings

router = APIRouter()

def create_pipeline():
    process_audio_service = ProcessAudioService()
    transcription = TranscriptionService(settings.hf_token)
    diarization = DiarizationService()
    
    # Setting pipeline's stages
    process_service.set_next(diarization).set_next(transcription)
    
    return process_service


@router.post("/process_audio")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    try:
        print("Create services for pipeline...")
        pipeline = create_pipeline()
        print("Process audio...")
        result = pipeline.process(data)

        os.remove(temp_path)
        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(500, f"Ошибка обработки {str(e)}")