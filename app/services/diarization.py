from pyannote.audio import Pipeline
from huggingface_hub import login
from app.services.base_service import BaseService

class DiarizationService(BaseService):
    def __init__(self, hf_token: str):
        if hf_token:
            print("Token was successfully downloaded from file!")
            login(token=hf_token)
        else:
            raise Exception(f"Token not found!")

        print("Load diarization model...")
        self.diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1"
        )
    

    def _process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    

    def _split_audio():
        pass
