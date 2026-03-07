## Транскрибация митингов группы-лиц

#### Настройка проекта
Действия:
1. Необходимо настроить файл app/config.py. Там содержится важная информация о сервисе, такая как UPLOAD_FOLDER, ALLOWED_EXTENSIONS и многие другие
2. В переменной окружения HF_TOKEN должен лежать токен от Hugging Face для загрузки модели диаризации
3. Скачать все зависимости:
> pip install -r requirements.txt

**Запуск проекта на ASGI сервере uvicorn:**<br>
> uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

#### Сравнение моделей диаризации
- Результаты для Pyannote: https://colab.research.google.com/drive/1j0MZ67onV5o-nB59WAtviugh7QKwokz4?usp=sharing
  - Используется стандартный модульный pipeline: VAD + SpeakerEmbeddings + Clusterisation
- Результаты для NVIDIA NeMo: https://colab.research.google.com/drive/1kPN60q5kYNOA1UpgHUx02mKHl9PtWg8t?usp=sharing
  - Используется модель vad_multilingual_marblenet в этапе VAD
  - Используется модель titanet_large на этапе SpeakerEmbeddings
  - Используется модель кластеризации + MSDD для лучших результатов при перекрытии речи, что характерно для митингов
- Сравнительный анализ обоих моделей: https://colab.research.google.com/drive/1dOhfLhyMGCacXMaxl2YACRttmiVAexf6?usp=sharing
