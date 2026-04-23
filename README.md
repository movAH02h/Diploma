# Meeting Studio

Приложение для транскрибации аудио совещаний с Llama 3 для анализа.

## Возможности

- Транскрибация аудио (Whisper)
- Определение говорящих (PyAnnote)
- Анализ диалогов через Llama 3 (сводка, ключевые идеи, вопросы)
- История для каждого пользователя

## Установка

### 1. Бэкенд

```bash
cd backend
pip install -r requirements.txt
```

### 2. Фронтенд

```bash
cd frontend
npm install
npm run build
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

## Запуск

### Бэкенд

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Фронтенд

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

## Структура проекта

```
backend/
├── app/
│   ├── api/v1/       # API эндпоинты
│   ├── models.py      # Модели БД
│   ├── services/      # Бизнес-логика
│   └── main.py       # Точка входа

frontend/
├── src/
│   ├── app/          # Страницы
│   ├── components/    # UI компоненты
│   ├── hooks/       # React хуки
│   └── lib/         # Утилиты
```