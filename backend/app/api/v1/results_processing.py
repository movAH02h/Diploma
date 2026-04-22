from fastapi import APIRouter, Depends
from app.services.dependencies import get_audio_repository
from app.repository.audio import AudioRepository
from app.models import User
from app.auth import get_current_user

router = APIRouter()


@router.get("/results")
async def get_all_results(
    repo: AudioRepository = Depends(get_audio_repository),
    current_user: User = Depends(get_current_user)
):
    return repo.get_audio_results_by_user(current_user.id)


@router.get("/results/{result_id}")
async def get_result(
    result_id: int,
    repo: AudioRepository = Depends(get_audio_repository),
    current_user: User = Depends(get_current_user)
):
    return repo.get_audio_result(result_id, current_user.id)


@router.delete("/results")
async def delete_all_results(
    repo: AudioRepository = Depends(get_audio_repository),
    current_user: User = Depends(get_current_user)
):
    deleted_count = repo.delete_all_audio_results_by_user(current_user.id)
    return {"status": "success", "deleted": deleted_count}
