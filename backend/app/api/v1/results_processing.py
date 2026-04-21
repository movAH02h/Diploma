from fastapi import APIRouter, Depends
from app.services.dependencies import get_audio_repository
from app.repository.audio import AudioRepository

router = APIRouter()

@router.get("/results")
async def get_all_results(repo: AudioRepository = Depends(get_audio_repository)):
    return repo.get_all_audio_results()

@router.get("/results/{result_id}")
async def get_result(result_id: int, repo: AudioRepository = Depends(get_audio_repository)):
    return repo.get_audio_result(result_id)

@router.delete("/results")
async def delete_all_results(repo: AudioRepository = Depends(get_audio_repository)):
    deleted_count = repo.delete_all_audio_results()
    return {"status": "success", "deleted": deleted_count}
