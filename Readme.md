# Meeting Studio — Транскрибация и диаризация аудио

Веб-приложение для автоматической транскрибации аудиозаписей митингов с определением спикеров (диаризацией).

## Возможности

- 🎤 Транскрибация аудио с помощью Whisper (OpenAI)
- 👥 Определение спикеров с помощью PyAnnote
- 📊 История транскрибаций
- 🖥️ Удобный веб-интерфейс
- 🤖 AI-анализ (сводки, тезисы, ответы на вопросы) через Llama 3

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

### 2. Backend

```bash
cd backend

# Копирование и настройка конфигурации
cp .env.example .env
# Укажите HF_TOKEN в .env

# Создание виртуального окружения
python -m venv .venv
source .venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
```

Запуск:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
```

Запуск:

```bash
cd frontend
npm run dev
```

### 4. Ollama (для Llama 3)

Установка:

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

или скачать с https://ollama.com/download

Загрузка модели:

```bash
ollama pull llama3
```

Запуск сервера:

```bash
ollama serve
```

## Использование

1. Откройте http://localhost:3000 в браузере
2. Зарегистрируйтесь / войдите
3. Загрузите аудиофайл (.mp3, .wav и т.д.)
4. Выберите модель (base/pro)
5. Нажмите Transcribe
6. После завершения используйте Llama 3 панель:
   - Summary — краткая сводка
   - Key Points — основные идеи
   - Ask — задать вопрос по диалогу

## Docker

```bash
# Настройка
cp backend/.env.example backend/.env
# Укажите HF_TOKEN в backend/.env

# Запуск
docker-compose up -d
```

Доступ:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

Остановка:

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

## Переменные окружения

### Backend (опционально)

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `HF_TOKEN` | — | Токен HuggingFace (обязательно) |
| `OLLAMA_BASE_URL` | http://localhost:11434 | URL Ollama |
| `SECRET_KEY` | генерируется | Ключ для JWT |
| `DATABASE_URL` | sqlite:///./audio_results.db | URL базы данных |
| `WHISPER_MODEL` | base.en | Модель Whisper |

### Frontend (опционально)

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `NEXT_PUBLIC_API_URL` | http://localhost:8000 | URL API |

Подробнее о всех настройках — в документации (docs/).