from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    APP_NAME: str = "Transcription of speech"
    UPLOAD_FOLDER: str = "audio_files"
    MAX_FILE_SIZE: int = 2 * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {".wav", ".mp3", ".ogg", ".flac"}
    DIARIZATION_MODEL_BASE_NAME: str = "pyannote/speaker-diarization-3.1"
    SEGMENTATION_MODEL_PRO: str = "../models/segmentation/best-epoch=09-step=5329.ckpt"
    HF_TOKEN: str = ""
    MIN_SEGMENT_DURATION: float = 0.1
    WHISPER_MODEL: str = "base.en"
    LOG_LEVEL: str = "DEBUG"
    IS_PRODUCTION: bool = False
    DATABASE_URL: str = "sqlite:///./audio_results.db"

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        case_sensitive = True


settings = Settings()