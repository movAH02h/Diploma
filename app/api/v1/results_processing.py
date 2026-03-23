from app.services.dependencies import get_audio_repository
from app.repository.audio import AudioRepository

router = APIRouter()


@router.get("/results")
async def get_all_results(repo: AudioRepository = Depends(get_audio_repository)):
    return repo.get_all_audio_results()


@router.get("/resulst/{file_name}")
async def get_result(file_name: str, repo: AudioRepository = Depends(get_audio_repository)):
    return repo.get_audio_result(file_name)