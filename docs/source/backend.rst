Backend
========

Обзор
------

Бэкенд построен на FastAPI (Python) и обрабатывает всю серверную логику: обработку аудио, AI-анализ, аутентификацию пользователей и хранение данных.

Структура проекта
-----------------

.. code-block:: text

   backend/
   ├── app/
   │   ├── api/v1/              # API эндпоинты
   │   │   ├── auth.py          # Роуты аутентификации
   │   │   ├── audio_processing.py  # Загрузка и обработка аудио
   │   │   ├── results_processing.py  # Управление результатами
   │   │   └── llama.py        # Роуты интеграции с Llama 3
   │   ├── services/            # Бизнес-логика
   │   │   ├── llama.py        # LlamaService (клиент Ollama)
   │   │   ├── transcription.py # Транскрибация через Whisper
   │   │   ├── diarization.py  # Диаризация через PyAnnote
   │   │   └── dependencies.py  # Внедрение зависимостей
   │   ├── models.py            # SQLAlchemy модели БД
   │   ├── database.py          # Конфигурация базы данных
   │   ├── schemas.py           # Настройки приложения
   │   ├── main.py              # Точка входа FastAPI
   │   └── auth.py             # Утилиты аутентификации
   ├── audio_files/             # Загруженные аудиофайлы
   ├── requirements.txt         # Python зависимости
   └── Dockerfile

Основные модули
----------------

main.py
~~~~~~~

Точка входа FastAPI. Настраивает:
- CORS middleware
- Регистрацию роутеров (api/v1 роуты)
- Статические файлы для фронтенда (при сборке)
- Контекстный менеджер lifespan для запуска/остановки

Ключевой код (из main.py):

.. code-block:: python

   app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
   app.include_router(audio_processing_router, prefix="/api/v1")
   app.include_router(results_processing_router, prefix="/api/v1")
   app.include_router(auth_router)
   app.include_router(llama_router, prefix="/api/v1")

api/v1/ Роуты
~~~~~~~~~~~~~~

Содержит все API эндпоинты, сгруппированные по функциональности (все роуты описаны в разделе `API Роуты`_).

services/
~~~~~~~~~

Слой бизнес-логики:

- **base_service.py**: Базовый класс ``BaseService`` с паттерном цепочки обязанностей (Chain of Responsibility). Каждый сервис реализует ``_process()`` и может вызывать следующий сервис через ``set_next()``. Позволяет строить гибкие пайплайны обработки.

- **llama.py**: Класс ``LlamaService`` для связи с Ollama API, промпт-инжиниринг. Поддерживает режимы:

  - **summary**: генерация краткой сводки (3-5 предложений) о встрече
  - **key_points**: извлечение 5-7 ключевых тезисов
  - **question**: ответы на вопросы по транскрибации

  Промпты оптимизированы для русского/английского языков и исключают Markdown-разметку.

- **transcription.py**: Интеграция Whisper для перевода аудио в текст. Транскрибирует аудио по сегментам, полученным от диаризации.

- **diarization.py**: PyAnnote для диаризации дикторов. Поддерживает базовую и PRO модели.

- **process_pipeline.py**: ``ProcessPipeline`` — первый сервис пайплайна. Сохраняет результат в БД, передает данные дальше по цепочке.

- **audio_processing.py**: ``ProcessAudioService`` — загрузка и валидация аудио (pydub, проверка формата).

- **dependencies.py**: Внедрение зависимостей FastAPI. Строит пайплайн сервисов: ``ProcessPipeline`` → ``ProcessAudioService`` → ``DiarizationService`` → ``TranscriptionService``.

- **logger.py**: ``Logger`` — централизованное логирование с настраиваемым уровнем (DEBUG, INFO, WARNING, ERROR).

models.py и database.py
~~~~~~~~~~~~~~~~~~~~~~~~

``database.py``: Конфигурация SQLAlchemy. Создает ``engine`` и ``SessionLocal`` из ``DATABASE_URL``.

``models.py`` содержит:

- ``ModelManager``: Singleton для загрузки ML-моделей (Whisper, PyAnnote). При старте загружает модели, при остановке выгружает.

- ``User``: Модель пользователя (email, username, hashed_password через bcrypt, is_active). Методы ``verify_password()`` и ``hash_password()``.

- ``AudioResult``: Результат транскрибации (filename, status, full_text, created_at).

- ``Speaker``: Спикер с меткой и связью к сегментам.

- ``TranscriptionSegment``: Сегмент транскрибации (start_time, end_time, text).

schemas.py
~~~~~~~~~~~~

``schemas.py``: Настройки приложения через Pydantic ``Settings`` (загружает ``.env``).

schemas_auth.py
~~~~~~~~~~~~~~~~

Схемы Pydantic для аутентификации:

- ``UserCreate``: email, username, password
- ``UserLogin``: email, password
- ``UserResponse``: id, email, username, is_active, created_at
- ``Token``: access_token, token_type
- ``TokenData``: user_id (опционально)

auth.py
~~~~~~~

Утилиты аутентификации:

- ``SECRET_KEY``: Ключ для подписи JWT (минимум 32 символа)
- ``ALGORITHM``: "HS256"
- ``ACCESS_TOKEN_EXPIRE_MINUTES``: 1440 (24 часа)
- ``create_access_token(data)``: Создание JWT токена с expiration
- ``verify_token(token)``: Проверка и декодирование токена, возврат user_id
- ``get_current_user``: Зависимость FastAPI. Извлекает пользователя из заголовка ``Authorization: Bearer <token>``, проверяет существование и активность.

Основная логика
----------------

Запуск приложения
~~~~~~~~~~~~~~~~~

При старте (через контекстный менеджер lifespan в main.py):
1. Создается папка для загрузок (UPLOAD_FOLDER)
2. Загружаются ML-модели (Whisper, PyAnnote) через model_manager
3. Модели выгружаются при остановке приложения

Поток аутентификации
~~~~~~~~~~~~~~~~~~~~

1. Пользователь регистрируется через POST /api/v1/auth/register (пароль хешируется)
2. Вход через POST /api/v1/auth/login (возвращает токен)
3. Токен передается в заголовке Authorization: Bearer для защищенных роутов
4. Текущий пользователь получается через GET /api/v1/auth/me

Пайплайн обработки аудио
~~~~~~~~~~~~~~~~~~~~~~~~~

1. Пользователь загружает аудиофайл через POST /api/v1/process_audio
2. ``ProcessAudioService`` загружает и валидирует аудио (pydub)
3. ``DiarizationService`` выполняет диаризацию (PyAnnote) — определяет границы речи и спикеров
4. ``TranscriptionService`` транскрибирует аудио по сегментам (Whisper)
5. ``ProcessPipeline`` сохраняет результат в БД, удаляет временные файлы

Управление результатами
~~~~~~~~~~~~~~~~~~~~~~~~

- GET /api/v1/results: Список всех транскрибаций пользователя
- GET /api/v1/results/{id}: Получение конкретной транскрибации с диаризацией
- DELETE /api/v1/results: Удаление всех транскрибаций пользователя

Интеграция с Llama 3 (Ollama)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Система использует **Ollama** как локальный runtime для работы с LLM. Это позволяет:

- Запускать модели без зависимости от облачных API
- Полностью контролировать обработку данных
- Использовать модели типа Llama 3 локально

**Настройка Ollama:**

1. Установка (Linux):

   .. code-block:: bash

      curl -fsSL https://ollama.com/install.sh | sh

2. Загрузка модели Llama 3:

   .. code-block:: bash

      ollama pull llama3

3. Запуск сервера:

   .. code-block:: bash

      ollama serve

Сервер Ollama запускается на ``http://localhost:11434`` (по умолчанию).

**Интеграция с бэкендом:**

``LlamaService`` в ``app/services/llama.py`` отправляет HTTP-запросы к Ollama API:

.. code-block:: python

   POST http://localhost:11434/api/generate
   {
     "model": "llama3",
     "prompt": "...",
     "stream": false
   }

Фронтенд взаимодействует через эндпоинты:

- ``POST /api/v1/llama/summarize``: генерация сводки или ключевых тезисов (mode: "summary" | "key_points")
- ``POST /api/v1/llama/ask``: ответ на вопрос по транскрибации

**Промпты:**

Промпты оптимизированы для анализа деловых встреч:
- Сводка: кто участвовал, основные темы, решения
- Тезисы: 5-7 ключевых пунктов с нумерацией
- Q&A: ответы на вопросы по транскрибации

Все ответы возвращаются без Markdown-разметки (только обычный текст).

**Docker-конфигурация:**

В Docker-окружении используйте:

.. code-block:: bash

   OLLAMA_BASE_URL=http://ollama:11434

В ``docker-compose.yml`` добавьте сервис ollama.

repository/audio.py
~~~~~~~~~~~~~~~~~~~~

``AudioRepository`` — паттерн Repository для доступа к данным:

- ``save_audio_result(user_id, file_name, result_data)``: Сохранение результата транскрибации с транскрипциями по спикерам
- ``get_audio_result(result_id, user_id)``: Получение конкретного результата с сегментами
- ``get_audio_results_by_user(user_id)``: Список всех результатов пользователя (новые первые)
- ``delete_all_audio_results_by_user(user_id)``: Удаление всех результатов пользователя

API Роуты
---------

Все роуты находятся под префиксом ``/api/v1`` (кроме роутов аутентификации, которые под ``/api/v1/auth``):

Аутпоинты возвращают JSON. При ошибках — HTTPException с кодом и detail.

Аутентификация
~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 15 30 40
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Тело запроса / Ответ
   * - /api/v1/auth/register
     - POST
     - Регистрация нового пользователя
     - ``{email, username, password}`` → ``{id, email, username, created_at}``
   * - /api/v1/auth/login
     - POST
     - Вход, возврат токена
     - ``{email, password}`` → ``{access_token, token_type}``
   * - /api/v1/auth/me
     - GET
     - Информация о текущем пользователе
     - Заголовок ``Authorization: Bearer <token>`` → ``{id, email, username, created_at}``

Обработка аудио
~~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 15 30 40
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Тело / Ответ
   * - /api/v1/process_audio
     - POST
     - Загрузка и транскрибация аудио
     - FormData: ``file`` + ``model_type`` (base/pro) → ``{id, ...}``

Управление результатами
~~~~~~~~~~~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 15 30 40
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Ответ
   * - /api/v1/results
     - GET
     - Список всех результатов пользователя
     - ``[{id, ...}, ...]``
   * - /api/v1/results/{result_id}
     - GET
     - Получение конкретного результата
     - ``{id, full_text, segments, ...}``
   * - /api/v1/results
     - DELETE
     - Удаление всех результатов пользователя
     - ``{status, deleted}``

Llama 3 Анализ
~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 15 30 40
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Тело / Ответ
   * - /api/v1/llama/summarize
     - POST
     - Генерация сводки или ключевых тезисов
     - ``{result_id, mode}`` (mode: "summary" | "key_points") → ``{result}``
   * - /api/v1/llama/ask
     - POST
     - Ответ на вопрос по транскрибации
     - ``{result_id, question}`` → ``{result}``
