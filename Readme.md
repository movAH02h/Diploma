## Транскрибация митингов группы-лиц

#### Техническая спецификация
1. OC Linux Ubuntu 22.04
2. VSCode

#### Настройка проекта
Действия:
1. Необходимо настроить файл app/config.py. Там содержится важная информация о сервисе, такая как UPLOAD_FOLDER, ALLOWED_EXTENSIONS и многие другие
2. В переменной окружения HF_TOKEN должен лежать токен от Hugging Face для загрузки модели диаризации
3. Скачать обязательные зависимости:
> pip install -r requirements.txt
4. Скачать зависимости для разработки (форматтеры, документация, ...):
> pip install -r requirements-dev.txt

**Запуск проекта на ASGI сервере uvicorn:**<br>
> uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

#### Исследовательская часть
- Результаты для Pyannote: https://colab.research.google.com/drive/1j0MZ67onV5o-nB59WAtviugh7QKwokz4?usp=sharing
- Результаты для NVIDIA NeMo: https://colab.research.google.com/drive/1kPN60q5kYNOA1UpgHUx02mKHl9PtWg8t?usp=sharing
- Сравнительный анализ обоих моделей: https://colab.research.google.com/drive/1EG3ng3IGTOJgHTGfPZLgoUuuzgezMLPH?usp=sharing
- Оптимизация параметров Pyannote: https://colab.research.google.com/drive/1DJ4r51UBc7wQ2luYArCzFlGdzgRj695g?usp=sharing
- Оптимизация параметров NeMo: https://colab.research.google.com/drive/1Dla6Il9qP3qLunkl28Cd8KMEIaj2N0PD?usp=sharing
- Дообучение Pyannote: https://colab.research.google.com/drive/1FUUZv7zvO44L1sXYSR0sUb10H40QlmIn?usp=sharing
- Дообучение NeMo: ?

#### Сборка приложения в docker
Для сборки понадобятся утилиты docker и docker-compose.
> sudo docker-compose build
> sudo docker-compose up -d
- "-d" для запуска контейнера в фоновом режиме

#### Автодокументация API с помощью Sphinx
**Выполнить построение:**
Создание структуры в папке docs, если ее еще нет:
> sphinx-quickstart docs
Генерация документации:
> sphinx-build -b html docs/source docs/build
Просмотр документации:
> xdg-open docs/build/index.html
