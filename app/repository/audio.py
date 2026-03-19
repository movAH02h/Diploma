audio_files = {}

def get_all_audio_files():
    return audio_files.values()


def get_audio_file(audio_name: str):
    if audio_name not in audio_files:
        raise HTTPException(
            status_code=400,
            detail="No such file"
        )
    return audio_files[audio_name]


def add_audio_file(audio_name: str, audio_path: str):
    if audio_name in audio_files:
        raise HTTPException(
            status_code=400,
            detail="Such file already exists"
        )
    audio_files[audio_name] = audio_path