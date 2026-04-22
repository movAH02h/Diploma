import os
import whisper
from pyannote.audio import Pipeline, Model
from pyannote.audio.pipelines import SpeakerDiarization
from huggingface_hub import login
from app.schemas import settings
from app.logger import logger
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from passlib.context import CryptContext

class ModelManager():
    def __init__(self):
        self.whisper = None
        self._diarization_base = None
        self._diarization_pro = None

    def load(self):
        self.whisper = whisper.load_model(settings.WHISPER_MODEL)
        if settings.HF_TOKEN:
            logger.debug("Token was successfully downloaded from file!")
            login(token=settings.HF_TOKEN)
        else:
            raise Exception("Token not found!")
        self._diarization_base = Pipeline.from_pretrained(
            settings.DIARIZATION_MODEL_BASE_NAME
        )
        logger.debug("Base diarization model downloaded successfully!")

        if os.path.exists(settings.SEGMENTATION_MODEL_PRO):
            base_params = self._diarization_base.parameters(instantiated=True)
            segmentation_model = Model.from_pretrained(
                settings.SEGMENTATION_MODEL_PRO
            )

            self._diarization_pro = SpeakerDiarization(
                segmentation=segmentation_model,
                embedding=self._diarization_base.embedding,
                embedding_exclude_overlap=self._diarization_base.embedding_exclude_overlap,
                clustering="AgglomerativeClustering"
            )
            self._diarization_pro.instantiate(base_params)
            logger.debug("Pro diarization model downloaded successfully!")
        else:
            logger.debug(f"PRO segmentation model not found at {settings.SEGMENTATION_MODEL_PRO}, using base model for pro requests")
            self._diarization_pro = self._diarization_base
    
    def unload(self):
        if self.whisper is not None:
            del self.whisper
        if self._diarization_base is not None:
            del self._diarization_base
        if self._diarization_pro is not None:
            del self._diarization_pro
        self.whisper = None
        self._diarization_base = None
        self._diarization_pro = None
    
    def get_whisper(self):
        if self.whisper is None:
            raise RuntimeError("Whisper model not loaded")
        return self.whisper
    
    def get_diarization(self, model_type: str = "base"):
        if model_type == "base":
            if self._diarization_base is None:
                raise RuntimeError("Base diarization model not loaded")
            return self._diarization_base
        else:
            if self._diarization_pro is None:
                raise RuntimeError("Pro diarization model not loaded")
            return self._diarization_pro

class AudioResult(Base):
    __tablename__ = "audio_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    status = Column(String, default="success")
    full_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audio_results")
    speakers = relationship("Speaker", back_populates="audio_result", cascade="all, delete-orphan")

class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(Integer, primary_key=True, index=True)
    audio_result_id = Column(Integer, ForeignKey("audio_results.id"), nullable=False)
    label = Column(String, nullable=False)

    audio_result = relationship("AudioResult", back_populates="speakers")
    segments = relationship("TranscriptionSegment", back_populates="speaker", cascade="all, delete-orphan")

class TranscriptionSegment(Base):
    __tablename__ = "transcription_segments"

    id = Column(Integer, primary_key=True, index=True)
    speaker_id = Column(Integer, ForeignKey("speakers.id"), nullable=False)
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)

    speaker = relationship("Speaker", back_populates="segments")

model_manager = ModelManager()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    audio_results = relationship("AudioResult", back_populates="user", cascade="all, delete-orphan")

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)