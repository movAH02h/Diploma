FROM python:3.11-slim

WORKDIR /app

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код приложения
COPY . .

# Указываем Python путь для корректных импортов
ENV PYTHONPATH=/app

# Открываем порт
EXPOSE 8000

# Запуск (можно использовать uvicorn напрямую или gunicorn)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]