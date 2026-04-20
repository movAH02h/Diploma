import os
import whisper
from pyannote.audio import Pipeline, Model
from pyannote.audio.pipelines import SpeakerDiarization
from huggingface_hub import login
from app.schemas import settings
from app.logger import logger

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

model_manager = ModelManager()