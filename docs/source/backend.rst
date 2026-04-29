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
--------------

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
- **llama.py**: Класс LlamaService для связи с Ollama API, промпт-инжиниринг, очистка ответов
- **transcription.py**: Интеграция Whisper для перевода аудио в текст
- **diarization.py**: PyAnnote для диаризации дикторов
- **dependencies.py**: Внедрение зависимостей FastAPI для репозиториев, пайплайнов

models.py и database.py
~~~~~~~~~~~~~~~~~~~~~~

SQLAlchemy ORM модели (User, AudioResult) и управление сессиями базы данных.

schemas.py
~~~~~~~~~~

Настройки приложения, загружаемые из переменных окружения (см. раздел `Конфигурация`_).

Основная логика
--------------

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
2. Файл сохраняется в папку audio_files/
3. Whisper транскрибирует аудио в текст
4. PyAnnote выполняет диаризацию (идентификация дикторов)
5. Результат (транскрибация + диаризация) сохраняется в БД
6. Аудиофайл удаляется после обработки

Управление результатами
~~~~~~~~~~~~~~~~~~~~~~

- GET /api/v1/results: Список всех транскрибаций пользователя
- GET /api/v1/results/{id}: Получение конкретной транскрибации с диаризацией
- DELETE /api/v1/results: Удаление всех транскрибаций пользователя

Интеграция с Llama 3
~~~~~~~~~~~~~~~~~~~~~

Используется Ollama как локальный runtime для Llama 3:
1. Бэкенд отправляет запросы к Ollama API (http://localhost:11434/api/generate)
2. Промпты оптимизированы для анализа встреч (сводки, тезисы, Q&A)
3. Ответы очищаются от Markdown-разметки через clean_markdown()
4. Фронтенд взаимодействует через POST /api/v1/llama/summarize и POST /api/v1/llama/ask

API Роуты
---------

Все роуты находятся под префиксом ``/api/v1`` (кроме роутов аутентификации, которые под ``/api/v1/auth``):

Аутентификация
~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 10 30 20 15
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Аутентификация
     - Тело запроса
   * - /api/v1/auth/register
     - POST
     - Регистрация нового пользователя
     - Нет
     - {username, password}
   * - /api/v1/auth/login
     - POST
     - Вход, возврат токена
     - Нет
     - {username, password}
   * - /api/v1/auth/me
     - GET
     - Информация о текущем пользователе
     - Да
     - Нет

Обработка аудио
~~~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 10 30 20 15
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Аутентификация
     - Тело запроса
   * - /api/v1/process_audio
     - POST
     - Загрузка и транскрибация аудио
     - Да
     - FormData: file, model_type (base/pro)

Управление результатами
~~~~~~~~~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 10 30 20 15
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Аутентификация
     - Тело запроса
   * - /api/v1/results
     - GET
     - Список всех результатов пользователя
     - Да
     - Нет
   * - /api/v1/results/{id}
     - GET
     - Получение конкретного результата
     - Да
     - Нет
   * - /api/v1/results
     - DELETE
     - Удаление всех результатов пользователя
     - Да
     - Нет

Llama 3 Анализ
~~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 10 30 20 15
   :header-rows: 1

   * - Эндпоинт
     - Метод
     - Описание
     - Аутентификация
     - Тело запроса
   * - /api/v1/llama/summarize
     - POST
     - Генерация сводки или ключевых тезисов
     - Да
     - {result_id: int, mode: "summary"/"key_points"}
   * - /api/v1/llama/ask
     - POST
     - Ответ на вопрос по транскрибации
     - Да
     - {result_id: int, question: str}
