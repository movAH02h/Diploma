import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.dependencies import get_audio_pipeline, get_audio_repository
from app.repository.audio import AudioRepository
from app.schemas import settings
from app.logger import logger

router = APIRouter()


@router.post("/process_audio")
async def process_audio(file: UploadFile = File(...), audio_pipeline = Depends(get_audio_pipeline)):
    temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
    try:
        data = {
            "audio_path": temp_path,
            "file": file,
        }
        logger.debug(f"Process file: {temp_path}...")
        return await audio_pipeline.process(data)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed pipeline. Error: {e}"
        )
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
