Research
========

Папка ``research/`` содержит Jupyter Notebook'и с экспериментами по тестированию и дообучению моделей диаризации.

Структура
---------

::

    research/
    ├── Pyannote_Diarization.ipynb        # Тестирование PyAnnote
    ├── NeMo_Diarization.ipynb             # Тестирование NVIDIA NeMo
    ├── Pyannote_hyperparameter_optimization.ipynb  # Оптимизация гиперпараметров
    ├── Pyannote_domain_adaptation.ipynb   # Дообучение модели сегментации
    └── Testing_pro_diarization_model.ipynb # Тестирование Pro модели

Описание ноутбуков
-----------------

Pyannote_Diarization.ipynb
~~~~~~~~~~~~~~~~~~~~~~~~~~

Тестирование базовой модели диаризации ``pyannote/speaker-diarization-3.1`` на тестовых данных из AMI (IHM). Ноутбук включает:

- Подключение Google Drive для сохранения результатов
- Установку зависимостей (pyannote.audio, ffmpeg и другие)
- Загрузку и предобработку аудиофайлов
- Запуск диаризации и сохранение результатов в RTTM формате
- Экспорт итоговых метрик в CSV для анализа

NeMo_Diarization.ipynb
~~~~~~~~~~~~~~~~~~~~~~

Альтернативная реализация процесса диаризации с использованием NVIDIA NeMo toolkit. Содержит:

- Установку nemo_toolkit[asr] и других зависимостей
- Загрузку и предобработку аудиофайлов
- Тестирование конвейера NeMo для diarization
- Экспорт результатов в CSV для анализа

Pyannote_domain_adaptation.ipynb
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Дообучение модели сегментации PyAnnote на предметной области (митинги/звонки):

- Загрузка датасета с разметкой (RTTM файлы)
- Конфигурация model Setup из PyAnnote
- Обучение модели сегментации на PyTorch Lightning
- Сохранение чекпоинта дообученной модели в ``models/segmentation/``

Результат обучения сохраняется в ``models/segmentation/fine_tuned_segmentation_model.ckpt`` и используется в режиме Pro.

Pyannote_hyperparameter_optimization.ipynb
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Подбор гиперпараметров для улучшения качества диаризации с дообученной моделью сегментации из конвейера Pyannote:

- Оптимизация пороговых значений (clustering threshold)
- Настройка параметров сегментации (min_region_size)
- Влияние на метрики DER (Diarization Error Rate)
- Построение графиков зависимости качества от параметров

Testing_pro_diarization_model.ipynb
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Комплексное тестирование дообученной Pro-модели:

- Загрузка fine-tuned модели сегментации
- Сравнение base vs pro моделей на тестовых данных
- Оценка метрик: DER, Purity, Coverage
- Визуализация метрик качества

Запуск ноутбуков
----------------

Для запуска необходим Google Colab:

- GPU с CUDA (например, T4)
- Не менее 16GB RAM
- Google Drive для сохранения результатов (в Colab)