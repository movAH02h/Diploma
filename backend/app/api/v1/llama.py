from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.llama import llama_service
from app.api.v1.auth import get_current_user
from app.models import User

router = APIRouter()


class SummarizeRequest(BaseModel):
    result_id: int
    mode: str  # "summary", "key_points", "question"


class QuestionRequest(BaseModel):
    result_id: int
    question: str


def get_transcription_text(result_id: int, user_id: int, db: Session) -> str:
    from app.repository.audio import AudioRepository
    audio_repo = AudioRepository(db)
    result = audio_repo.get_audio_result(result_id, user_id)
    return result.get("full_text", "")


@router.post("/summarize")
async def summarize(
    request: SummarizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate summary or extract key points"""
    text = get_transcription_text(request.result_id, current_user.id, db)
    if not text:
        raise HTTPException(404, "Transcription not found")
    
    try:
        if request.mode == "summary":
            result = await llama_service.generate_summary_async(text)
        elif request.mode == "key_points":
            result = await llama_service.extract_key_points_async(text)
        else:
            raise HTTPException(400, "Invalid mode")
        
        return {"result": result}
    except Exception as e:
        raise HTTPException(500, f"Llama error: {str(e)}")


@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ask question about transcription"""
    text = get_transcription_text(request.result_id, current_user.id, db)
    if not text:
        raise HTTPException(404, "Transcription not found")
    
    try:
        result = await llama_service.answer_question_async(text, request.question)
        return {"result": result}
    except Exception as e:
        raise HTTPException(500, f"Llama error: {str(e)}")