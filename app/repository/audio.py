audio_files = {}


class AudioRepository:
    def __init__(self):
        self.storage = {}

    def save_audio_result(self, file_name: str, result_data: Dist[str, Any]):
        if file_name in storage:
            raise HTTPException(
                status_code=400,
                detail="Such file already exists"
            )
        storage[file_name] = result_data


    def get_audio_result(self, file_name: str):
        if file_name not in storage:
            raise HTTPException(
                status_code=400,
                detail="No such file"
            )
        return storage[file_name]

    def get_all_audio_results(self) -> List[Dict[str, Any]]:
        return list(audio_files.values())
