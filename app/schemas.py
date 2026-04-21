from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # General params
    APP_NAME: str = "Transcription of speech"
    UPLOAD_FOLDER: str = "audio_files"
    MAX_FILE_SIZE: int = 2 * 1024 * 1024 # 2 Mb
    ALLOWED_EXTENSIONS: set = {".wav", ".mp3", ".ogg", ".flac"}

    # Diarization params (Pyannote)
    DIARIZATION_MODEL_BASE_NAME: str = "pyannote/speaker-diarization-3.1"
    SEGMENTATION_MODEL_PRO: str = "models/segmentation/best-epoch=09-step=5329.ckpt" # Path to checkpoint
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    MIN_SEGMENT_DURATION: float = 0.5

    # Transcription params (Whisper)
    WHISPER_MODEL: str = "base.en"
    
    # Logger params
    LOG_LEVEL: str = "DEBUG" # LOG, DEBUG, ERROR, WARNING, CRITICAL

    # State of the project
    IS_PRODUCTION: bool = False

    # database
    DATABASE_URL: str = "sqlite:///./audio_results.db"


settings = Settings()