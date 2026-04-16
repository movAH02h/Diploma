## Meeting Transcription for Groups of People

#### Technical Specifications
1. OS: Linux Ubuntu 22.04
2. VSCode

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

#### Research
- Pyannote results: https://colab.research.google.com/drive/1j0MZ67onV5o-nB59WAtviugh7QKwokz4?usp=sharing
- NVIDIA NeMo results: https://colab.research.google.com/drive/1kPN60q5kYNOA1UpgHUx02mKHl9PtWg8t?usp=sharing
- Comparative analysis of both models: https://colab.research.google.com/drive/1EG3ng3IGTOJgHTGfPZLgoUuuzgezMLPH?usp=sharing
- Pyannote parameter optimization: https://colab.research.google.com/drive/1DJ4r51UBc7wQ2luYArCzFlGdzgRj695g?usp=sharing
- NeMo parameter optimization: https://colab.research.google.com/drive/1Dla6Il9qP3qLunkl28Cd8KMEIaj2N0PD?usp=sharing
- Fine-tuning Pyannote: https://colab.research.google.com/drive/1FUUZv7zvO44L1sXYSR0sUb10H40QlmIn?usp=sharing
- Fine-tuning NeMo: ?

#### Building the Application in Docker
You will need `docker` and `docker-compose` utilities.
> sudo docker-compose build
> sudo docker-compose up -d
- "-d" to run the container in detached (background) mode

#### API Auto-Documentation with Sphinx
**Build:**
Create the structure in the `docs` folder if it doesn't exist yet:
> sphinx-quickstart docs
Generate documentation:
> sphinx-build -b html docs/source docs/build
View documentation:
> xdg-open docs/build/index.html
