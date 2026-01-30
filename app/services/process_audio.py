from app.services.base_service import BaseService
from pydub import AudioSegment
import numpy as np
from app.logger import logger
from typing import Dict, Any


class ProcessAudioService(BaseService):    
    def process(self, data: Dict[str, Any]):
        if "audio_path" in data:
            audio_path = data["audio_path"]

        logger.debug("Checking audio_path in system...")
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Файл не найден: {audio_path}")

        logger.debug("Загрузка аудио с помощью pydub...")
        y, sr, duration = self._load_audio_pydub(audio_path=audio_path, target_sr=16000, mono=True)

        if len(y) == 0:
            raise ValueError("Аудиофайл пустой")

        if np.any(np.isnan(y)) or np.any(np.isinf(y)):
            logger.debug("Обнаружены NaN/Inf значения, исправляю...")
            y = np.nan_to_num(y)

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
        logger.debug("Загрузка из файла...")
        audio = AudioSegment.from_file(audio_path)

        if mono and audio.channels > 1:
            audio = audio.set_channels(1)

        logger.debug("Преобразование в диапазон [-1, 1]")
        samples = np.array(audio.get_array_of_samples())

        if audio.sample_width == 2:  # 16-bit
            samples = samples.astype(np.float32) / 32768.0
        elif audio.sample_width == 4:  # 32-bit
            samples = samples.astype(np.float32) / 2147483648.0
        elif audio.sample_width == 1:  # 8-bit
            samples = (samples.astype(np.float32) - 128) / 128.0
        else:
            samples = samples.astype(np.float32)

        logger.debug(f"Размерность аудио: {samples.shape}")
        
        logger.debug("Вычисление длительности аудио...")
        sr = target_sr
        audio_duration = len(samples) / sr
    
        logger.debug("Готово!")
        return samples, sr, audio_duration