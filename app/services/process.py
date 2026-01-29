from app.services.base_service import BaseService

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
        