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
    diarization = DiarizationService(settings.HF_TOKEN)
    transcription = TranscriptionService()
    
    process_audio_service.set_next(diarization).set_next(transcription)
    
    return process_audio_service


@router.post("/process_audio")
async def process_audio(file: UploadFile = File(...)):
    try:
        result = await audio_service.process_audio(file)
    except Exception as e:
        logger.error(f"Error while audio processing: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Processing error: {str(e)}"
        )
# temp_path = f"{settings.UPLOAD_FOLDER}/{file.filename}"
# with open(temp_path, "wb") as buffer:
#     content = await file.read()
#     buffer.write(content)

# try:
#     logger.debug("Create dictionary with data...")
#     start_dict = create_start_dictionary(temp_path)
#     logger.debug("Create services for pipeline...")
#     pipeline = create_pipeline()
#     logger.debug("Process audio...")
#     result = pipeline.process(start_dict)

#     response = {
#         "status": "success",
#         "filename": file.filename
#     }

#     if "transcriptions" in result:
#         response["transcriptions"] = result["transcriptions"]
#         response["speakers"] = result.get("speakers", [])

#         all_text = ""
#         for speaker, trans_data in result["transcriptions"].items():
#             all_text += f"{speaker}: {trans_data['full_text']}\n\n"
        
#         response["full_text"] = all_text.strip()
#         logger.debug(f"Full text: {response['full_text']}")

#     os.remove(temp_path)
#     return JSONResponse(content=response)

# except Exception as e:
#     raise HTTPException(500, f"Ошибка обработки {str(e)}")
