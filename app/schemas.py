from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    APP_NAME: str = "Speech Transcription API"
    UPLOAD_FOLDER: str = "audio_files"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {".wav", ".mp3", ".ogg", ".flac"}

    # Diarization params
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    MIN_SEGMENT_DURATION: float = 0.5

    # Transcription params
    LANGUAGE_MODEL: str = "En"
    
    # Logger params
    LOG_LEVEL: str = "DEBUG" # LOG, DEBUG, ERROR, WARNING, CRITICAL


settings = Settings()