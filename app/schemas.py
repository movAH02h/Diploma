from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # General params
    APP_NAME: str = "Transcription of speech"
    UPLOAD_FOLDER: str = "audio_files"
    MAX_FILE_SIZE: int = 2 * 1024 * 1024 # 2 Mb
    ALLOWED_EXTENSIONS: set = {".wav", ".mp3", ".ogg", ".flac"}

    # Diarization params (Pyannote)
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    MIN_SEGMENT_DURATION: float = 0.5

    # Transcription params (Whisper)
    WHISPER_MODEL: str = "base.en"
    
    # Logger params
    LOG_LEVEL: str = "DEBUG" # LOG, DEBUG, ERROR, WARNING, CRITICAL

    # State of the project
    IS_PRODUCTION: bool = False


settings = Settings()