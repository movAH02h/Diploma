Развертывание
=============

Развертывание через Docker Compose
----------------------------------

Убедитесь, что установлены Docker и Docker Compose.

Клонирование и настройка:

.. code-block:: bash

    git clone <repository-url>
    cd Diploma

Создайте файл ``backend/.env`` на основе примера:

.. code-block:: bash

    cp backend/.env.example backend/.env

Отредактируйте ``backend/.env``, указав обязательные параметры:

.. code-block:: bash

    nano backend/.env

Обязательные переменные:

- ``HF_TOKEN`` — токен HuggingFace для доступа к моделям диаризации

Опциональные переменные:

- ``SECRET_KEY`` — ключ для JWT токенов (по умолчанию генерируется)
- ``DATABASE_URL`` — URL базы данных (по умолчанию SQLite)
- ``OLLAMA_BASE_URL`` — URL Ollama сервера (по умолчанию http://ollama:11434 в Docker)
- ``WHISPER_MODEL`` — модель Whisper (по умолчанию base.en)
- ``LOG_LEVEL`` — уровень логирования (DEBUG, INFO, WARNING, ERROR)

Сервисы Docker
~~~~~~~~~~~~~~

Проект разворачивается через Docker Compose и включает следующие сервисы:

- **ollama** — Ollama сервер для работы с Llama 3 (порт 11434)
- **backend** — FastAPI приложение (порт 8000)
- **frontend** — Next.js приложение (порт 3000)

Запуск
~~~~~~

1. Скачать модель Llama 3 (выполнить один раз):

   .. code-block:: bash

      docker compose --profile init run ollama-init

   Примечание: модель Llama 3 весит ~5GB, загрузка может занять 10-20 минут.

2. Запустить все сервисы:

   .. code-block:: bash

      docker compose up -d

После запуска доступны:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Документация API**: http://localhost:8000/docs
- **Ollama API**: http://localhost:11434

Остановка
~~~~~~~~~~

.. code-block:: bash

    docker compose down

Остановка с удалением volumes (данные БД и модели Ollama будут удалены):

.. code-block:: bash

    docker compose down -v

Пересборка образов
~~~~~~~~~~~~~~~~~~

После изменения кода пересоберите образы:

.. code-block:: bash

    docker compose up -d --build

Просмотр логов
~~~~~~~~~~~~~~

.. code-block:: bash

    # Все сервисы
    docker compose logs -f

    # Только backend
    docker compose logs -f backend

    # Только frontend
    docker compose logs -f frontend

    # Только ollama
    docker compose logs -f ollama

Управление моделями Ollama
~~~~~~~~~~~~~~~~~~~~~~~~~~

Для скачивания дополнительных моделей:

.. code-block:: bash

    docker compose exec ollama ollama pull <model-name>

Например:

.. code-block:: bash

    docker compose exec ollama ollama pull llama3.1

Требования к системе
--------------------

- Docker 20.10+
- Docker Compose 2.0+
- 4+ GB RAM (рекомендуется 8 GB для ML моделей)
- 10+ GB свободного места на диске

Volumes
~~~~~~~

Данные сохраняются в следующих volumes:

- ``ollama_data`` — модели Ollama (сохраняется между перезапусками)
- ``backend_audio_files`` — загруженные аудиофайлы