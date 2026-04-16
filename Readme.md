# Транскрибация митингов группы-лиц

#### Техническая спецификация, требуемое окружение и программы:
1. OC Linux Ubuntu 22.04
2. VSCode
3. Переменная окружения HF_TOKEN=<your_hugging_face_token>

#### Project Setup
Steps:
1. Configure the `app/config.py` file. It contains important service information such as `UPLOAD_FOLDER`, `ALLOWED_EXTENSIONS`, and many others.
2. The `HF_TOKEN` environment variable must contain a Hugging Face token for loading the diarization model.
3. Install required dependencies:
> pip install -r requirements.txt
4. Install development dependencies (formatters, documentation, ...):
> pip install -r requirements-dev.txt

**Run the project on the ASGI server uvicorn:**<br>
> uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

#### Исследовательская часть
- Результаты для Pyannote: https://colab.research.google.com/drive/1j0MZ67onV5o-nB59WAtviugh7QKwokz4?usp=sharing
- Результаты для NVIDIA NeMo: https://colab.research.google.com/drive/1kPN60q5kYNOA1UpgHUx02mKHl9PtWg8t?usp=sharing
- Сравнительный анализ обоих моделей: https://colab.research.google.com/drive/1EG3ng3IGTOJgHTGfPZLgoUuuzgezMLPH?usp=sharing
<br>**Важно!!!** Перед тем, как выполнять дообучение или настройку гиперпараметров, нужно скачать AMI-diarization-setup репозиторий: https://github.com/pyannote/AMI-diarization-setup.git
<br>В нем нужно запустить скрипт download_ami.sh, он скачает все нужные аудио, объемом более 15Гб. Если все качать не нужно, можно удалить некоторые строки wget в файле download_ami.sh, и некоторые аудио скачиваться не будут. Затем нужно перекинуть итоговую папку AMI-diarization-setup на ваш google disk. В данной папке должны лежать подпапки: lists, pyannote, uems, word_and_vocalsounds. В папке pyannote должен лежать файл database.yml, где должны содержаться пути ко всем файлам: .lst, .uem, .rttm, .wav.<br>
- Оптимизация параметров Pyannote: https://colab.research.google.com/drive/1DJ4r51UBc7wQ2luYArCzFlGdzgRj695g?usp=sharing
- Оптимизация параметров NeMo: https://colab.research.google.com/drive/1Dla6Il9qP3qLunkl28Cd8KMEIaj2N0PD?usp=sharing
- Дообучение Pyannote: https://colab.research.google.com/drive/1FUUZv7zvO44L1sXYSR0sUb10H40QlmIn?usp=sharing
- Дообучение NeMo: ?

#### Building the Application in Docker
You will need `docker` and `docker-compose` utilities.
> sudo docker-compose build
> sudo docker-compose up -d
- "-d" to run the container in detached (background) mode

#### Автодокументация API с помощью Sphinx
Выполнить построение:
Создание структуры в папке docs, если ее еще нет:
> sphinx-quickstart docs

Генерация документации:
> sphinx-build -b html docs/source docs/build

Просмотр документации:
> xdg-open docs/build/index.html
