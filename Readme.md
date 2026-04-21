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

### Лinting

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

## Исследовательская часть

- [Результаты Pyannote](https://colab.research.google.com/drive/1j0MZ67onV5o-nB59WAtviugh7QKwokz4)
- [Результаты NVIDIA NeMo](https://colab.research.google.com/drive/1kPN60q5kYNOA1UpgHUx02mKHl9PtWg8t)
- [Сравнительный анализ](https://colab.research.google.com/drive/1EG3ng3IGTOJgHTGfPZLgoUuuzgezMLPH)

## Лицензия

MIT
