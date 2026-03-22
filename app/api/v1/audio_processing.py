from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.services.transcription import TranscriptionService
from app.services.diarization import DiarizationService
from app.services.audio_processing import ProcessAudioService
from app.services.dependencies import get_audio_pipeline
import os
from app.schemas import settings
from app.logger import logger

router = APIRouter()


@router.post("/process_audio")
async def process_audio(file: UploadFile = File(...), audio_pipeline = Depends(get_audio_pipeline)):
    temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
    try:
        logger.debug("Save loaded file into temp folder...")
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        logger.debug("Create dictionary with data...")
        start_dict = {
            "audio_path": temp_path
        }
        logger.debug("Create services for pipeline...")
        logger.debug("Process audio...")
        result = audio_pipeline.process(start_dict)

        response = {
            "status": "success",
            "filename": file.filename
        }

        if "transcriptions" in result:
            response["transcriptions"] = result["transcriptions"]
            response["speakers"] = result.get("speakers", [])

            all_text = ""
            for speaker, trans_data in result["transcriptions"].items():
                all_text += f"{speaker}: {trans_data['full_text']}\n\n"
            
            response["full_text"] = all_text.strip()
            logger.debug(f"Full text: {response['full_text']}")

        os.remove(temp_path)
        return JSONResponse(content=response)

    except Exception as e:
        raise HTTPException(500, f"Ошибка обработки {str(e)}")
