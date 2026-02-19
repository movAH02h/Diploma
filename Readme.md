## Транскрибация митингов группы-лиц

**Настройка проекта:**
1. Необходимо настроить файл app/config.py. Там содержится важная информация о сервисе, такая как UPLOAD_FOLDER, ALLOWED_EXTENSIONS и многие другие
2. В переменной окружения HF_TOKEN должен лежать токен от Hugging Face для загрузки модели диаризации

**Запуск проекта на ASGI сервере uvicorn:**<br>
> uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

#### Сравнение моделей диаризации
1. Результаты для Pyannote: https://colab.research.google.com/drive/1j0MZ67onV5o-nB59WAtviugh7QKwokz4?usp=sharing
2. Результаты для NVIDIA NeMo: https://colab.research.google.com/drive/1QxiTAgz3z3wPc_gUD2CqKGFhe1GS6L4E?usp=sharing
3. Сравнительный анализ обоих моделей: https://colab.research.google.com/drive/1dOhfLhyMGCacXMaxl2YACRttmiVAexf6?usp=sharing
