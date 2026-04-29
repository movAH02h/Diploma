# Meeting Studio — Транскрибация и диаризация аудио

Веб-приложение для автоматической транскрибации аудиозаписей митингов с определением спикеров (диаризацией).

## Возможности

- 🎤 Транскрибация аудио с помощью Whisper (OpenAI)
- 👥 Определение спикеров с помощью PyAnnote
- 📊 История транскрибаций
- 🖥️ Удобный веб-интерфейс

## Требования

- Python 3.11+
- Node.js 20+
- FFmpeg
- HuggingFace токен для модели диаризации

## Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd Diploma
```

### 2. Настройка окружения

#### Backend

```bash
cd backend

# Копирование примера конфигурации
cp .env.example .env

# Редактирование .env — добавьте ваш HuggingFace токен
nano .env
```

Получить токен можно на https://huggingface.co/settings/tokens

```bash
# Создание виртуального окружения
python -m venv .venv
source .venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
```

#### Frontend

```bash
cd frontend

# Установка зависимостей
npm install
```

### 3. Ollama (для Llama 3)

#### Установка Ollama

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

или скачать с https://ollama.com/download

#### Скачать модель Llama 3

```bash
ollama pull llama3
```

#### Запуск Ollama

```bash
ollama serve
```

### 3. Запуск

#### Backend (в одном терминале)

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (в другом терминале)

```bash
cd frontend
npm run dev
```

## Переменные окружения

### Бэкенд (опционально)

- `OLLAMA_BASE_URL` — URL Ollama (по умолчанию http://localhost:11434)
- `SECRET_KEY` — ключ для JWT
- `DATABASE_URL` — URL базы данных

### Фронтенд (опционально)

- `NEXT_PUBLIC_API_URL` — URL API (по умолчанию http://localhost:8000)

## Использование

1. Зарегистрируйтесь / войдите
2. Загрузите аудиофайл (.mp3, .wav и т.д.)
3. Выберите модель (base/pro)
4. Нажмите Transcribe
5. После завершения используйте Llama 3 панель:
   - Summary — краткая сводка
   - Key Points — основные идеи
   - Ask — задать вопрос по диалогу

Откройте http://localhost:3000 в браузере.

## Docker

### Сборка и запуск

```bash
# Копирование конфигурации
cp backend/.env.example backend/.env
# Добавьте ваш HF_TOKEN в backend/.env

# Сборка и запуск
docker-compose up -d
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

### Остановка

```bash
docker-compose down
```

## Структура проекта

```
Diploma/
├── backend/                 # FastAPI приложение
│   ├── app/
│   │   ├── api/            # API эндпоинты
│   │   ├── services/       # Бизнес-логика
│   │   ├── models.py       # Модели БД
│   │   ├── schemas.py     # Настройки
│   │   └── ...
│   ├── .env               # Конфигурация
│   ├── requirements.txt    # Зависимости Python
│   └── Dockerfile
│
├── frontend/               # Next.js приложение
│   ├── src/
│   │   ├── app/          # Страницы
│   │   ├── components/   # Компоненты
│   │   ├── hooks/        # React хуки
│   │   └── lib/          # Утилиты
│   ├── package.json
│   └── Dockerfile
│
├── models/                 # Модели ML
│   └── segmentation/
│
└── docker-compose.yml     # Docker Compose конфиг
```

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/v1/process_audio` | Транскрибация аудио |
| GET | `/api/v1/results` | Список всех результатов |
| GET | `/api/v1/results/{id}` | Получить результат по ID |
| DELETE | `/api/v1/results` | Удалить все результаты |

## Настройки

Настройки приложения находятся в `backend/app/schemas.py`:

| Параметр | Описание | Значение по умолчанию |
|----------|---------|---------------------|
| `WHISPER_MODEL` | Модель Whisper | base.en |
| `MAX_FILE_SIZE` | Макс. размер файла | 2 MB |
| `ALLOWED_EXTENSIONS` | Допустимые расширения | .wav, .mp3, .ogg, .flac |
| `DIARIZATION_MODEL_BASE_NAME` | Модель диаризации | pyannote/speaker-diarization-3.1 |

## Разработка

### Linting

```bash
# Python
cd backend
ruff check .

# Frontend
cd frontend
npm run lint
```

### Сборка Frontend

```bash
cd frontend
npm run build
```
