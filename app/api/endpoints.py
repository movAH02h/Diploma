from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.services.transcription import TranscriptionService
import os
from app.config import settings

router = APIRouter()

@router.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        print("Create TranscriptionService...")
        service = TranscriptionService(settings.HF_TOKEN)
        print("Process audio...")
        result = service.process_audio(temp_path)

        os.remove(temp_path)
        return JSONResponse(content=result)
        
    except Exception as e:
        raise HTTPException(500, f"Ошибка обработки {str(e)}")