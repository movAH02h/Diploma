from app.services.base_service import BaseService
from pydub import AudioSegment
import numpy as np

class ProcessAudioService(BaseService):
    def __int__(self):
        self.name = serf.__name__
    
    def process(file_path: str):
        print("Checking audio_path in system...")
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Файл не найден: {audio_path}")

        print("Загрузка аудио с помощью pydub...")
        y, sr, duration = self._load_audio_pydub(audio_path=audio_path, target_sr=16000, mono=True)

        if np.any(np.isnan(y)) or np.any(np.isinf(y)):
            print("Обнаружены NaN/Inf значения, исправляю...")
            y = np.nan_to_num(y)

        if len(y.shape) == 1:
            waveform_tensor = torch.from_numpy(y).float().unsqueeze(0)
        else:
            waveform_tensor = torch.from_numpy(y).float()

        if len(y) == 0:
            raise ValueError("Аудиофайл пустой")
        
        return waveform_tensor, sr
    

    def _load_audio_pydub(self, audio_path: str, target_sr: int = 16000, mono: bool = True):
        print("Загрузка из файла...")
        audio = AudioSegment.from_file(audio_path)

        if mono and audio.channels > 1:
            audio = audio.set_channels(1)
        
        print("Преобразование в диапfзон [-1, 1]")
        samples = np.array(audio.get_array_of_samples())

        if audio.sample_width == 2:  # 16-bit
            samples = samples.astype(np.float32) / 32768.0
        elif audio.sample_width == 4:  # 32-bit
            samples = samples.astype(np.float32) / 2147483648.0
        elif audio.sample_width == 1:  # 8-bit
            samples = (samples.astype(np.float32) - 128) / 128.0
        else:
            samples = samples.astype(np.float32)

        print(f"Размерность аудио: {samples.shape}")
        
        print("Вычисление длительности аудио...")
        sr = target_sr
        audio_duration = len(samples) / sr
    
        print("Готово!")
        return samples, sr, audio_duration