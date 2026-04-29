.. _config:

Конфигурация
=============

Раздел описывает настройку проекта через переменные окружения и файлы конфигурации.

Бэкенд
------

Настройки бэкенда определены в ``backend/app/schemas.py`` (класс ``Settings`` на базе Pydantic Settings). Переменные окружения загружаются из файла ``backend/.env``.

Доступные переменные окружения:

.. list-table::
   :widths: 25 15 30 30
   :header-rows: 1

   * - Переменная
     - По умолчанию
     - Описание
     - Пример значения
   * - ``APP_NAME``
     - "Transcription of speech"
     - Название приложения (отображается в Swagger)
     - "Meeting Studio"
   * - ``UPLOAD_FOLDER``
     - "audio_files"
     - Папка для временного хранения загруженных аудиофайлов
     - "uploads"
   * - ``MAX_FILE_SIZE``
     - 2097152 (2МБ)
     - Максимальный размер загружаемого файла (в байтах)
     - 10485760 (10МБ)
   * - ``ALLOWED_EXTENSIONS``
     - {".wav", ".mp3", ".ogg", ".flac"}
     - Разрешенные расширения аудиофайлов
     - {".wav", ".mp4"}
   * - ``DIARIZATION_MODEL_BASE_NAME``
     - "pyannote/speaker-diarization-3.1"
     - Название базовой модели диаризации на HuggingFace
     - "pyannote/speaker-diarization-3.1"
   * - ``SEGMENTATION_MODEL_PRO``
     - "../models/segmentation/fine_tuned_segmentation_model.ckpt"
     - Путь к дообученной модели сегментации для режима Pro
     - "models/segmentation/model.ckpt"
   * - ``HF_TOKEN``
     - ""
     - Токен HuggingFace для доступа к закрытым моделям
     - "hf_xxxxxx"
   * - ``MIN_SEGMENT_DURATION``
     - 0.1
     - Минимальная длительность сегмента аудио для диаризации (сек)
     - 0.5
   * - ``WHISPER_MODEL``
     - "base.en"
     - Название модели Whisper для транскрибации
     - "large", "medium.en"
   * - ``LOG_LEVEL``
     - "DEBUG"
     - Уровень логирования (DEBUG, INFO, WARNING, ERROR)
     - "INFO"
   * - ``IS_PRODUCTION``
     - False
     - Режим продакшена (отключает Swagger/ReDoc)
     - True
   * - ``DATABASE_URL``
     - "sqlite:///./audio_results.db"
     - URL подключения к базе данных
     - "postgresql://user:pass@localhost/db"
   * - ``OLLAMA_BASE_URL``
     - "http://localhost:11434"
     - URL сервера Ollama (для Llama 3)
     - "http://ollama:11434"

Пример файла ``backend/.env``:

.. code-block:: bash

   APP_NAME=Meeting Studio
   WHISPER_MODEL=base.en
   LOG_LEVEL=INFO
   IS_PRODUCTION=False
   OLLAMA_BASE_URL=http://localhost:11434
   HF_TOKEN=hf_your_token_here

Фронтенд
-------

Настройки фронтенда определяются через переменные окружения Next.js, загружаемые из ``frontend/.env`` или ``frontend/.env.local``.

Доступные переменные:

.. list-table::
   :widths: 25 15 30 30
   :header-rows: 1

   * - Переменная
     - По умолчанию
     - Описание
     - Пример значения
   * - ``NEXT_PUBLIC_API_URL``
     - "http://127.0.0.1:8000"
     - URL бэкенд-сервера для API-запросов
     - "http://localhost:8000"

Пример файла ``frontend/.env.local``:

.. code-block:: bash

   NEXT_PUBLIC_API_URL=http://localhost:8000

Управление конфигурацией
-----------------------

1. **Приоритет настроек**: Переменные окружения переопределяют значения по умолчанию из ``schemas.py``
2. **Бэкенд**: Создайте ``backend/.env`` (не коммитьте в git!) для локальных настроек
3. **Фронтенд**: Создайте ``frontend/.env.local`` для локальных настроек
4. **Продакшен**: Устанавливайте переменные окружения на уровне системы или контейнера (Docker)

Рекомендации
-----------

- Не коммитьте файлы ``.env`` в git (добавьте их в ``.gitignore``)
- Для продакшена устанавливайте ``IS_PRODUCTION=True`` на бэкенде
- Для Ollama в Docker-контейнерах используйте ``OLLAMA_BASE_URL=http://ollama:11434``
- Используйте ``WHISPER_MODEL=large`` для более точной транскрибации (требует больше ресурсов)
