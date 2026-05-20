Licensing
=========

MIT License
-----------

Copyright (c) 2024-2026 Meeting Studio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Сторонние лицензии
------------------

Проект использует следующие сторонние библиотеки:

+------------------------------+---------------+
| Библиотека                   | Лицензия      |
+==============================+===============+
| OpenAI Whisper               | MIT           |
+------------------------------+---------------+
| PyAnnote Audio               | Apache 2.0    |
+------------------------------+---------------+
| PyTorch                      | BSD-3         |
+------------------------------+---------------+
| FastAPI                      | MIT           |
+------------------------------+---------------+
| Next.js                      | MIT           |
+------------------------------+---------------+
| React                        | MIT           |
+------------------------------+---------------+
| Tailwind CSS                 | MIT           |
+------------------------------+---------------+
| NVIDIA NeMo                  | Apache 2.0    |
+------------------------------+---------------+
| SQLAlchemy                   | MIT           |
+------------------------------+---------------+

Ограничения
-----------

При использовании компонентов проекта учитывайте:

- **PyAnnote**: Для коммерческого использования моделей диаризации может потребоваться согласование с правообладателями. См. `PyAnnote Terms <https://huggingface.co/pyannote>`_
- **Whisper**: OpenAI Whisper имеет отдельные условия использования. См. `Whisper License <https://github.com/openai/whisper/blob/main/LICENSE>`_
- **NVIDIA NeMo**: Для некоторых моделей NeMo могут применяться дополнительные ограничения. Проверьте лицензию конкретной модели.
- **HuggingFace Models**: Модели, загружаемые с HuggingFace Hub, имеют собственные лицензии. Убедитесь в соответствии с условиями использования.

Аудиоданные
-----------

При работе с приложением:

- Не загружайте аудиозаписи, содержащие персональные данные третьих лиц без их согласия
- Соблюдайте требования GDPR и локального законодательства о защите данных
- Обеспечьте безопасное хранение и удаление аудиофайлов после обработки