from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    APP_NAME: str = "Speech Transcription API"
    LANGUAGE_MODEL: str = "En"
    UPLOAD_FOLDER: str = "audio_files"
    LOG_LEVEL: str = "DEBUG" # LOG, DEBUG, ERROR, WARNING, CRITICAL
    MAX_FILE_SIZE: int = 100 * 1024 * 1024
    MIN_SEGMENT_DURATION: float = 0.5
    ALLOWED_EXTENSIONS: set = {".wav", ".mp3", ".ogg", ".flac"}

    HF_TOKEN: str = os.getenv("HF_TOKEN", "")


settings = Settings()