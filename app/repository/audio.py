from typing import Dict, Any, List
from fastapi import HTTPException

storage: Dict[str, Any] = {}


class AudioRepository:
    def save_audio_result(self, file_name: str, result_data: Dict[str, Any]):
        if file_name in storage:
            raise HTTPException(
                status_code=400,
                detail="Such file already exists"
            )
        storage[file_name] = result_data

    def get_audio_result(self, file_name: str):
        if file_name not in storage:
            raise HTTPException(
                status_code=404,
                detail="No such file"
            )
        return storage[file_name]

    def get_all_audio_results(self) -> List[Dict[str, Any]]:
        return list(storage.values())
