Frontend
========

Обзор
------

Фронтенд построен на **Next.js 14** (React, TypeScript) с использованием Tailwind CSS. Отвечает за пользовательский интерфейс: загрузку аудио, отображение транскрибаций, взаимодействие с AI-анализом и управление историей.

Архитектура: React Context для аутентификации, кастомные хуки для управления состоянием, паттерн Repository для API-взаимодействия.

Структура проекта
-----------------

.. code-block:: text

   frontend/
   ├── src/
   │   ├── app/                  # Страницы Next.js (page.tsx, layout.tsx)
   │   ├── components/
   │   │   ├── ui/               # Атомарные компоненты (AuthModal, LlamaPanel, FileUpload и др.)
   │   │   └── layout/           # Комплексные компоненты (ControlPanel, ResultPanel)
   │   ├── hooks/                # React хуки (useLlama, useTranscription, useHistory)
   │   ├── lib/                  # Утилиты (api.ts, types.ts)
   │   └── context/              # React контекст (AuthContext)
   ├── package.json
   ├── tailwind.config.js
   └── next.config.js

Основные модули
----------------

app/layout.tsx
~~~~~~~~~~~~~~

Корневой layout Next.js. Оборачивает приложение в ``AuthProvider`` (контекст аутентификации), подключает глобальные стили ``globals.css``.

.. code-block:: tsx

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           <AuthProvider>{children}</AuthProvider>
         </body>
       </html>
     )
   }

app/page.tsx
~~~~~~~~~~~~

Главная страница. Содержит всю логику взаимодействия компонентов:

- Состояние: ``currentResult``, ``selectedFile``, ``modelType``, ``showHistory``, ``showAuthModal``
- Управление историей: загрузка, выбор, очистка
- Обработка транскрибации: выбор файла, запуск, отображение результата
- Интеграция с Llama: пробрасывает пропсы в ``LlamaPanel``

Структура UI:

- **Хедер** (sticky): логотип, кнопка меню истории, аватар пользователя, выход
- **Сайдбар** (история): панель с транскрибациями, кнопка очистки
- **Основная область**: загрузка файла, выбор модели, кнопка транскрибации, ResultPanel, LlamaPanel
- **AuthModal**: модальное окно входа/регистрации

lib/api.ts
~~~~~~~~~~

API-клиент для взаимодействия с бэкендом. Все функции автоматически добавляют ``Authorization: Bearer <token>`` из localStorage.

Функции:

- ``uploadAudio(file, modelType)``: POST /api/v1/process_audio (FormData)
- ``fetchHistory()``: GET /api/v1/results → HistoryItem[]
- ``fetchResultById(id)``: GET /api/v1/results/{id} → TranscriptionResult
- ``deleteAllHistory()``: DELETE /api/v1/results
- ``summarizeTranscription(resultId, mode)``: POST /api/v1/llama/summarize
- ``askQuestion(resultId, question)``: POST /api/v1/llama/ask

lib/types.ts
~~~~~~~~~~~~

TypeScript-интерфейсы для типизации данных:

.. code-block:: ts

   interface TranscriptionSegment {
     start: number;
     end: number;
     text: string;
   }

   interface SpeakerTranscription {
     full_text: string;
     segments: TranscriptionSegment[];
   }

   interface TranscriptionResult {
     id: number;
     filename: string;
     status: string;
     full_text: string;
     created_at: string;
     transcriptions: Record<string, SpeakerTranscription>;
     speakers: string[];
   }

   interface HistoryItem {
     id: number;
     filename: string;
     status: string;
     created_at: string;
     speakers_count: number;
   }

   interface UserResponse {
     id: number;
     email: string;
     username: string;
     is_active: boolean;
   }

context/AuthContext.tsx
~~~~~~~~~~~~~~~~~~~~~~~

Контекст аутентификации. Хранит в state: ``user``, ``token``, ``isLoading``, ``onAuthSuccess`` (callback после успешной авторизации).

При загрузке приложения проверяет localStorage на наличие сохраненного токена и пользователя.

Интерфейс:

.. code-block:: ts

   interface AuthContextType {
     user: UserResponse | null;
     token: string | null;
     login: (email, password) => Promise<void>;
     register: (email, username, password) => Promise<void>;
     logout: () => void;
     isLoading: boolean;
     setOnAuthSuccess: (callback | null) => void;
   }

Хуки (hooks/)
~~~~~~~~~~~~~

**useLlama.ts**: Управление AI-анализом.

- Состояние: ``isLoading``, ``summary``, ``keyPoints``, ``qaHistory`` (массив пар Q&A), ``error``
- Методы: ``generateSummary()``, ``extractKeyPoints()``, ``ask(question)``, ``reset()``

**useTranscription.ts**: Управление транскрибацией.

- Состояние: ``isProcessing``, ``error``, ``result``
- Методы: ``transcribe(file, modelType)``, ``reset()``

**useHistory.ts**: Управление историей пользователя.

- Состояние: ``history`` (HistoryItem[]), ``loading``, ``error``
- Методы: ``loadHistory()``, ``clearHistory()``

Компоненты UI (components/ui/)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**AuthModal.tsx**: Модальное окно входа/регистрации.

- Два режима: login и register
- Валидация: пароль >= 6 символов, подтверждение пароля при регистрации
- При успехе закрывается и вызывает AuthContext.onAuthSuccess (загрузка истории)

**LlamaPanel.tsx**: Панель AI-анализа.

- Кнопки "Summary" и "Key Points" → вызывают соответствующие методы useLlama
- Блок вопросов: input + кнопка "Ask", история Q&A в прокручиваемом списке (max-h-64)
- Отображает loading spinner, ошибки, результаты

**FileUpload.tsx**: Компонент загрузки файла.

- forwardRef для доступа к input
- Валидация размера (макс. 2МБ), отображение информации о файле
- Кнопка "Clear" для сброса

**ModelSelector.tsx**: Селектор модели транскрибации.

- Два режима: Base / Pro
- Toggle-кнопки с подсветкой активного выбора

**TranscriptionView.tsx**: Отображение транскрибации.

- Объединяет сегменты по спикерам (сливает последовательные реплики одного спикера)
- Распределяет спикеров на левую/правую сторону (чередование)
- Форматирование: пузырьки чата с цветовой дифференциацией

**ConfirmModal.tsx**: Модальное окно подтверждения действия.

- Overlay с затемнением, кнопки Cancel/Confirm

**HistoryList.tsx**: Список элементов истории (используется в ControlPanel).

Компоненты Layout (components/layout/)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**ControlPanel.tsx**: Боковая панель с историей транскрибаций.

- Загрузка и отображение списка HistoryItem
- Клик по элементу → загрузка полного результата через fetchResultById
- Кнопка обновления (иконка), кнопка очистки с модальным подтверждением
- Подсветка выбранного элемента

**ResultPanel.tsx**: Обёртка для отображения результата.

- Состояние загрузки: спиннер + "Processing audio..."
- Пустое состояние: иконка микрофона + текст
- Нормальное состояние: рендеринг TranscriptionView

Основная логика
----------------

Аутентификация
~~~~~~~~~~~~~~

1. При загрузке ``AuthContext`` проверяет localStorage на наличие токена
2. Если токен найден — загружает данные пользователя
3. Если пользователь не авторизован — отображается экран приветствия с кнопками Sign In / Create Account
4. ``AuthModal`` позволяет переключаться между режимами входа и регистрации
5. После успешной авторизации токен сохраняется в localStorage, вызывается ``onAuthSuccess`` callback
6. При выходе токен и данные пользователя удаляются из localStorage

Загрузка и транскрибация аудио
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Пользователь нажимает "Upload Audio" — открывается file picker (audio file types)
2. Выбирается файл — отображается имя файла
3. Выбирается модель (Base/Pro) через встроенный селектор
4. Нажимается "Transcribe" — вызывается ``useTranscription.transcribe()``
5. Файл отправляется на бэкенд (FormData), показывается loading spinner
6. После получения результата: ResultPanel отображает транскрибацию, LlamaPanel становится активным, история обновляется

Взаимодействие с Llama
~~~~~~~~~~~~~~~~~~~~~~

- **Summary**: вызывает ``llama.generateSummary()`` → POST /api/v1/llama/summarize (mode: "summary")
- **Key Points**: вызывает ``llama.extractKeyPoints()`` → POST /api/v1/llama/summarize (mode: "key_points")
- **Ask**: вводит вопрос → вызывает ``llama.ask(question)`` → POST /api/v1/llama/ask
- Результаты Q&A накапливаются в ``qaHistory`` и отображаются в прокручиваемом списке
- При смене результата или выборе из истории LlamaPanel скрывается (resultId становится null)

Управление историей
~~~~~~~~~~~~~~~~~~~

- Боковая панель (ControlPanel) загружается через ``useHistory``
- При выборе элемента загружается полный результат и отображается в ResultPanel
- "Clear All" показывает ConfirmModal, при подтверждении удаляет все результаты
- После успешной очистки текущий результат сбрасывается

UI/UX особенности
~~~~~~~~~~~~~~~~~

- **Sticky header**: хедер зафиксирован, остается видимым при скролле
- **Sidebar animation**: боковая панель выезжает/заезжает с анимацией (transform transition)
- **Overlay**: при открытом сайдбаре фон затемняется, клик по нему закрывает сайдбар
- **Loading states**: все async-операции показывают спиннеры
- **Error handling**: ошибки отображаются в UI с красным текстом
- **Responsive**: адаптивная ширина контента (max-w-3xl)