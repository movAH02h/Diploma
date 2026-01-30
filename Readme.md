**Настройка проекта:**
1. Необходимо настроить файл app/config.py. Там содержится важная информация о сервисе, такая как UPLOAD_FOLDER, ALLOWED_EXTENSIONS и многие другие
2. В переменной окружения HF_TOKEN должен лежать токен от Hugging Face для загрузки модели диаризации

**Запуск проекта на ASGI сервере uvicorn:**<br>
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000