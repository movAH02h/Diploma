import os
import torch
import numpy as np
from pydub import AudioSegment
from app.services.base_service import BaseService
from app.logger import logger
from app.schemas import settings

class ProcessAudioService(BaseService):
    def __init__(self):
        super().__init__("ProcessAudioService")

    async def _process(self, data):
        logger.debug("Extract the audio_path...")
        audio_path = data.get("audio_path")
        if not audio_path:
            raise ValueError("No audio_path in data")

        logger.debug("Checking audio_path in system...")
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"File {audio_path} not found")

        logger.debug("Check the file size...")
        file_size = os.path.getsize(audio_path)
        if file_size > settings.MAX_FILE_SIZE:
            raise ValueError(f"The file size exceeds 2 MB (Actual file size: {file_size / 1024 / 1024:.2f} MB)")
        else:
            logger.debug("File size if appropriate! Continue...")
        logger.debug("Load audio with pydub...")
        y, sr, duration = self._load_audio_pydub(
            audio_path=audio_path,
            target_sr=16000,
            mono=True
        )

        if len(y) == 0:
            raise ValueError(f"Audio file {audio_path} is empty")

        if np.any(np.isnan(y)) or np.any(np.isinf(y)):
            logger.debug("NaN/Inf values are detected...")
            y = np.nan_to_num(y)
            logger.debug("Correction completed!")

        if len(y.shape) == 1:
            waveform_tensor = torch.from_numpy(y).float().unsqueeze(0)
        else:
            waveform_tensor = torch.from_numpy(y).float()
        
        if "waveform_tensor" not in data:
            data["waveform_tensor"] = waveform_tensor
        if "sample_rate" not in data:
            data["sample_rate"] = sr

        return data


    def _load_audio_pydub(self, audio_path: str, target_sr: int = 16000, mono: bool = True):
        logger.debug("Download from file {audio_path}...")
        audio = AudioSegment.from_file(audio_path)

        if audio.frame_rate != target_sr:
            audio = audio.set_frame_rate(target_sr)

        if mono and audio.channels > 1:
            audio = audio.set_channels(1)

        logger.debug("Convertion to the range [-1, 1]")
        samples = np.array(audio.get_array_of_samples())

        if audio.sample_width == 2:
            samples = samples.astype(np.float32) / 32768.0
        elif audio.sample_width == 4:
            samples = samples.astype(np.float32) / 2147483648.0 
        elif audio.sample_width == 1:
            samples = (samples.astype(np.float32) - 128) / 128.0
        else:
            samples = samples.astype(np.float32)
        
        logger.debug("Calculating the audio duration...")
        sr = target_sr
        audio_duration = len(samples) / sr
    
        logger.debug("load_audio_pydub completed!")
        return samples, sr, audio_duration