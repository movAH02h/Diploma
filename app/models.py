import whisper
from pyannote.audio import Pipeline
from huggingface_hub import login
from typing import Optional
from app.schemas import settings
from app.logger import logger

class ModelManager():
    def __init__(self):
        self.whisper = None
        self.diarization = None
    
    def load(self):
        self.whisper = whisper.load_model(settings.WHISPER_MODEL)
        if settings.HF_TOKEN:
            logger.debug("Token was successfully downloaded from file!")
            login(token=settings.HF_TOKEN)
        else:
            raise Exception(f"Token not found!")
        self.diarization = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1"
        )
        logger.debug("Models downloaded successfully!")
    
    def unload(self):
        if self.whisper is not None:
            del self.whisper
        if self.diarization is not None:
            del self.diarization
        self.whisper = None
        self.diarization = None
    
    def get_whisper(self):
        if self.whisper is None:
            raise RuntimeError("Whisper model not loaded. Call load() first")
        return self.whisper
    
    def get_diarization(self):
        if self.diarization is None:
            raise RuntimeError("Diarization model not loaded. Call load() first")
        return self.diarization

model_manager = ModelManager()