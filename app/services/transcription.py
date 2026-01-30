import nemo.collections.asr as nemo_asr
from app.services.base_service import BaseService
import soundfile as sf
import tempfile
from typing import List, Dict
from app.config import settings
from app.logger import logger

class TranscriptionService():
    def __init__(self, hf_token: str):
        if settings.LANGUAGE_MODEL == "Ru":
            print("Load Russian NeMo model...")
            self.asr_model = nemo_asr.models.ASRModel.from_pretrained(
                model_name="stt_ru_conformer_ctc_large"
            )
        elif settings.LANGUAGE_MODEL == "En":
            print("Load English NeMo model...")
            self.asr_model = nemo_asr.models.ASRModel.from_pretrained(
                model_name="stt_en_conformer_ctc_medium"
            )


    def _process(self, data: Dict[str, Any]):
        temp_wav_path = tempfile.mktemp(suffix='.wav')
        sf.write(temp_wav_path, y, sr, subtype='PCM_16')

        print("\nPerforming transcription...")
        transcription = self.asr_model.transcribe([temp_wav_path])
        full_text_hypothesis = transcription[0]

        if hasattr(full_text_hypothesis, 'text'):
            predicted_text = full_text_hypothesis.text
        else:
            predicted_text = str(full_text_hypothesis)

        print("Возвращаю результат...")
        return {"result": predicted_text}
