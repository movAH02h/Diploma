import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.services.dependencies import get_audio_pipeline
from app.schemas import settings
from app.logger import logger
from app.models import User
from app.auth import get_current_user

router = APIRouter()


@router.post("/process_audio")
async def process_audio(
    file: UploadFile = File(...),
    model_type: str = Form("base"),
    audio_pipeline = Depends(get_audio_pipeline),
    current_user: User = Depends(get_current_user)
):
    temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
    try:
        data = {
            "audio_path": temp_path,
            "file": file,
            "model_type": model_type,
            "user_id": current_user.id,
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
