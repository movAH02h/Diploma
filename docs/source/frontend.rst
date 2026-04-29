Frontend
========

Обзор
------

Фронтенд построен на Next.js 14 (React, TypeScript) с использованием Tailwind CSS. Отвечает за пользовательский интерфейс: загрузку аудио, отображение транскрибаций, взаимодействие с AI-анализом и управление историей.

Структура проекта
-----------------

.. code-block:: text

   frontend/
   ├── src/
   │   ├── app/             # Страницы Next.js (page.tsx, layout.tsx)
   │   ├── components/       # UI компоненты
   │   │   ├── ui/          # (LlamaPanel, AuthModal и др.)
   │   │   └── layout/      # (ControlPanel, ResultPanel)
   │   ├── hooks/           # React хуки (useLlama, useTranscription, useHistory)
   │   ├── lib/             # Утилиты (api.ts, types.ts)
   │   └── context/         # React контекст (AuthContext)
   ├── package.json
   └── package-lock.json

Основные модули
--------------

app/page.tsx
~~~~~~~~~~~~~

Главная страница приложения. Объединяет все компоненты:
- Управление состоянием (user, currentResult, selectedFile)
- Обработка загрузки аудио и транскрибации
- Рендеринг ControlPanel, ResultPanel, LlamaPanel
- Стикки-хедер (фиксированный при скролле)

components/
~~~~~~~~~~~

- **LlamaPanel.tsx**: Панель AI-анализа (Summary, Key Points, Ask с историей вопросов и ответов)
- **ControlPanel.tsx**: Боковая панель с историей транскрибаций
- **ResultPanel.tsx**: Отображение результата транскрибации с диаризацией
- **AuthModal.tsx**: Модальное окно входа/регистрации

hooks/
~~~~~

- **useLlama.ts**: Управление взаимодействием с Llama 3, хранение истории Q&A (qaHistory)
- **useTranscription.ts**: Управление загрузкой аудио и транскрибацией
- **useHistory.ts**: Управление историей пользователя (загрузка, очистка)

lib/api.ts
~~~~~~~~~~

API-клиент для взаимодействия с бэкендом. Содержит функции:
- uploadAudio: POST /api/v1/process_audio
- fetchHistory: GET /api/v1/results
- fetchResultById: GET /api/v1/results/{id}
- deleteAllHistory: DELETE /api/v1/results
- summarizeTranscription: POST /api/v1/llama/summarize
- askQuestion: POST /api/v1/llama/ask

context/AuthContext.tsx
~~~~~~~~~~~~~~~~~~~~~~

Контекст аутентификации: хранит состояние пользователя, токен (localStorage), функции входа/выхода.

Основная логика
--------------

Поток аутентификации
~~~~~~~~~~~~~~~~~~~~

1. Если пользователь не авторизован: отображается экран с кнопками Sign In / Create Account
2. Открывается AuthModal: выбор режима (login/register)
3. После успешного входа токен сохраняется в localStorage
4. Токен передается в заголовке Authorization: Bearer для API-запросов

Загрузка и транскрибация аудио
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Пользователь выбирает аудиофайл через Upload Audio
2. Выбирает модель транскрибации (Base / Pro)
3. Нажимает Transcribe → вызывается useTranscription.transcribe()
4. Файл отправляется на бэкенд (POST /api/v1/process_audio)
5. Результат (транскрибация + диаризация) отображается в ResultPanel

Взаимодействие с Llama 3
~~~~~~~~~~~~~~~~~~~~~~~~~

- **Summary**: Нажатие кнопки → вызов POST /api/v1/llama/summarize (mode: "summary")
- **Key Points**: Нажатие кнопки → вызов POST /api/v1/llama/summarize (mode: "key_points")
- **Ask**: Ввод вопроса → вызов POST /api/v1/llama/ask → пара Q&A добавляется в qaHistory
- История вопросов и ответов отображается в прокручиваемом блоке (max-h-64 overflow-y-auto)
- Ответы очищаются от Markdown-разметки на бэкенде

Управление историей
~~~~~~~~~~~~~~~~~~~

- Боковая панель ( ControlPanel) показывает список прошлых транскрибаций
- Клик по элементу загружает результат в ResultPanel
- Кнопка Clear History вызывает DELETE /api/v1/results
- Обновление истории после новой транскрибации

Управление состоянием UI
~~~~~~~~~~~~~~~~~~~~~~~~

- **Стикки-хедер**: Хедер зафиксирован (sticky top-0 z-50), остается видимым при скролле
- **Состояние Llama**: useLlama хранит summary, keyPoints, qaHistory (массив пар вопрос-ответ)
- **Состояние транскрибации**: useTranscription управляет процессом загрузки и обработки
