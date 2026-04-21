// script.js (полный файл с изменениями)

const fileInput = document.getElementById('audioFile');
const fileNameDiv = document.getElementById('fileName');
const deleteBtn = document.getElementById('deleteFileBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const progressDiv = document.getElementById('progress');
const resultDiv = document.getElementById('result');
const historyListDiv = document.getElementById('historyList');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
let isFileValid = true;

// Базовый URL API
const API_BASE = `http://0.0.0.0:8000`;

// Текущий выбранный результат (id)
let currentResultId = null;

// Вспомогательные функции (escapeHtml, parseTextToSegments, renderChatFromSegments, displayResults)
// оставляем без изменений, как в исходном script.js (приведены ниже для полноты)

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showResultPlaceholder() {
    resultDiv.innerHTML = '<div class="placeholder">Here will be a result</div>';
    currentResultId = null;
    // Убираем выделение с элементов истории
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
}

function showWaitingPlaceholder() {
    resultDiv.innerHTML = '<div class="placeholder">Waiting for transcription...</div>';
}

function parseTextToSegments(fullText) {
    if (!fullText || typeof fullText !== 'string') return [];
    const lines = fullText.split(/\r?\n/);
    const segments = [];
    let currentSpeaker = null;
    let currentText = '';
    
    const speakerPattern = /^([A-Za-zА-Яа-я0-9_ \-+]+?):\s+(.*)$/;
    
    for (let line of lines) {
        line = line.trim();
        if (line === '') continue;
        
        const match = line.match(speakerPattern);
        if (match) {
            if (currentSpeaker && currentText.trim()) {
                segments.push({
                    speaker: currentSpeaker.trim(),
                    text: currentText.trim()
                });
            }
            currentSpeaker = match[1].trim();
            currentText = match[2];
        } else {
            if (currentSpeaker) {
                currentText += ' ' + line;
            } else {
                if (!currentSpeaker && !currentText) {
                    currentSpeaker = "Speaker";
                    currentText = line;
                } else if (currentSpeaker) {
                    currentText += ' ' + line;
                } else {
                    currentText = (currentText ? currentText + '\n' + line : line);
                    currentSpeaker = "Participant";
                }
            }
        }
    }
    if (currentSpeaker && currentText.trim()) {
        segments.push({
            speaker: currentSpeaker.trim(),
            text: currentText.trim()
        });
    }

    if (segments.length === 0 && fullText.trim()) {
        segments.push({ speaker: "Transcription", text: fullText.trim() });
    }
    return segments;
}

function renderChatFromSegments(segments) {
    if (!segments || segments.length === 0) {
        return '<div class="placeholder">No dialogue segments found</div>';
    }
    
    const speakerOrder = [];
    const sideMap = new Map();
    
    for (const seg of segments) {
        const speaker = seg.speaker;
        if (!sideMap.has(speaker)) {
            const side = speakerOrder.length % 2 === 0 ? 'left' : 'right';
            sideMap.set(speaker, side);
            speakerOrder.push(speaker);
        }
    }
    
    let chatHtml = '<div class="chat-messages">';
    for (const seg of segments) {
        const side = sideMap.get(seg.speaker) || 'left';
        const messageClass = side === 'left' ? 'message-left' : 'message-right';
        const speakerNameClean = escapeHtml(seg.speaker);
        const messageTextClean = escapeHtml(seg.text).replace(/\n/g, '<br>');
        
        chatHtml += `
            <div class="message ${messageClass}">
                <div class="speaker-name">${speakerNameClean}</div>
                <div class="message-bubble">${messageTextClean || '…'}</div>
            </div>
        `;
    }
    chatHtml += '</div>';
    return chatHtml;
}

function displayResults(data) {
    // Принимает объект ответа от сервера (как от /process_audio, так и от /results/{id})
    if (data.segments && Array.isArray(data.segments) && data.segments.length > 0) {
        const chatHtml = renderChatFromSegments(data.segments);
        resultDiv.innerHTML = chatHtml;
        return;
    }
    
    if (data.full_text && typeof data.full_text === 'string' && data.full_text.trim().length > 0) {
        const parsedSegments = parseTextToSegments(data.full_text);
        if (parsedSegments.length > 0) {
            const chatHtml = renderChatFromSegments(parsedSegments);
            resultDiv.innerHTML = chatHtml;
            return;
        } else {
            resultDiv.innerHTML = `<div class="plain-text">📜 ${escapeHtml(data.full_text).replace(/\n/g, '<br>')}</div>`;
            return;
        }
    }
    
    if (data.error || !data.full_text) {
        resultDiv.innerHTML = `<div class="placeholder">Here will be a result</div>`;
    } else {
        resultDiv.innerHTML = `<div class="placeholder">No dialogue segments recognized</div>`;
    }
}

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ ИСТОРИИ ==========

async function loadHistory() {
    try {
        historyListDiv.innerHTML = '<div class="history-placeholder">Loading history...</div>';
        const response = await fetch(`${API_BASE}/api/v1/results`);
        if (!response.ok) {
            throw new Error(`Failed to load history: ${response.status}`);
        }
        const results = await response.json();
        renderHistoryList(results);
    } catch (error) {
        console.error('History error:', error);
        historyListDiv.innerHTML = '<div class="history-placeholder" style="color:#b91c1c;">Failed to load history</div>';
    }
}

function renderHistoryList(results) {
    if (!results || results.length === 0) {
        historyListDiv.innerHTML = '<div class="history-placeholder">No saved transcriptions</div>';
        return;
    }

    let html = '';
    results.forEach(item => {
        const date = new Date(item.created_at).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const speakersCount = item.speakers_count || 0;
        const filename = escapeHtml(item.filename);
        const activeClass = (currentResultId === item.id) ? 'active' : '';
        
        html += `
            <div class="history-item ${activeClass}" data-id="${item.id}">
                <div class="history-filename">
                    <span>📄 ${filename}</span>
                </div>
                <div class="history-meta">
                    <span class="history-speakers">${speakersCount} speaker${speakersCount !== 1 ? 's' : ''}</span>
                    <span class="history-date">${date}</span>
                </div>
            </div>
        `;
    });
    historyListDiv.innerHTML = html;

    // Навешиваем обработчики на элементы истории
    document.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', async () => {
            const id = parseInt(el.dataset.id);
            if (currentResultId === id) return; // уже выбран
            
            // Убираем выделение с других
            document.querySelectorAll('.history-item').forEach(e => e.classList.remove('active'));
            el.classList.add('active');
            
            await loadResultById(id);
        });
    });
}

async function loadResultById(id) {
    try {
        resultDiv.innerHTML = '<div class="placeholder">Loading transcription...</div>';
        const response = await fetch(`${API_BASE}/api/v1/results/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to load result: ${response.status}`);
        }
        const data = await response.json();
        displayResults(data);
        currentResultId = id;
        progressDiv.innerHTML = ''; // очищаем прогресс
        
        // Прокручиваем результат вверх
        setTimeout(() => {
            const resultContainer = document.querySelector('.result-content');
            if (resultContainer) resultContainer.scrollTop = 0;
        }, 50);
    } catch (error) {
        console.error('Load result error:', error);
        resultDiv.innerHTML = '<div class="placeholder" style="color:#b91c1c;">Failed to load transcription</div>';
        currentResultId = null;
    }
}

// Обновление истории (перезагрузка списка)
async function refreshHistory() {
    await loadHistory();
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        let fileName = file.name;
        if (fileName.length > 35) {
            fileName = fileName.substring(0, 32) + '...';
        }
        
        if (file.size > MAX_FILE_SIZE_BYTES) {
            fileNameDiv.innerHTML = `<span>${fileName}</span><br>${fileSizeMB} MB <span style="color:#b91c1c;">(exceeds ${MAX_FILE_SIZE_MB} MB limit)</span>`;
            fileNameDiv.classList.add('show');
            showSizeError(`❌ File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
        } else {
            fileNameDiv.innerHTML = `<span>${fileName}</span><br>${fileSizeMB} MB`;
            fileNameDiv.classList.add('show');
            clearSizeError();
        }
    } else {
        fileNameDiv.classList.remove('show');
        fileNameDiv.innerHTML = '';
        clearSizeError();
    }
    showResultPlaceholder();
});

const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Функция очистки истории
async function clearHistory() {
    if (!confirm('Are you sure you want to delete all saved transcriptions?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/v1/results`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to clear history: ${response.status}`);
        }
        
        // Очищаем результат, если был открыт
        showResultPlaceholder();
        // Перезагружаем список истории
        await loadHistory();
        progressDiv.innerHTML = '✅ History cleared';
        setTimeout(() => {
            if (progressDiv.innerHTML === '✅ History cleared') {
                progressDiv.innerHTML = '';
            }
        }, 2000);
    } catch (error) {
        console.error('Clear history error:', error);
        progressDiv.innerHTML = '❌ Failed to clear history';
    }
}

// Добавить слушатель
clearHistoryBtn.addEventListener('click', clearHistory);

deleteBtn.addEventListener('click', function() {
    fileInput.value = '';
    fileNameDiv.classList.remove('show');
    fileNameDiv.innerHTML = '';
    progressDiv.innerHTML = '';
    showResultPlaceholder();
});

function clearSizeError() {
    progressDiv.classList.remove('error');
    progressDiv.innerHTML = '';
    isFileValid = true;
    transcribeBtn.disabled = false;
}

function showSizeError(message) {
    progressDiv.innerHTML = message;
    progressDiv.classList.add('error');
    isFileValid = false;
    transcribeBtn.disabled = true;
}

transcribeBtn.addEventListener('click', async () => {
    if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select an audio file first!');
        return;
    }

    const selectedModel = document.querySelector('input[name="model_type"]:checked')?.value || 'base';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('model_type', selectedModel);

    showWaitingPlaceholder();
    
    try {
        progressDiv.innerHTML = '⚙️ Processing audio...';
        await new Promise(resolve => setTimeout(resolve, 80));
        
        const response = await fetch(`${API_BASE}/api/v1/process_audio`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText.substring(0, 120)}`);
        }

        const data = await response.json();
        displayResults(data);
        
        // Если ответ содержит id, запоминаем его и обновляем историю
        if (data.id) {
            currentResultId = data.id;
            // Обновляем историю, чтобы новый результат появился в списке
            await loadHistory();
            // Подсвечиваем новый элемент (найдём по data-id)
            setTimeout(() => {
                document.querySelectorAll('.history-item').forEach(el => {
                    if (parseInt(el.dataset.id) === data.id) {
                        el.classList.add('active');
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
            }, 100);
        }
        
        progressDiv.innerHTML = '✅ Ready';
        setTimeout(() => {
            const resultContainer = document.querySelector('.result-content');
            if (resultContainer) resultContainer.scrollTop = resultContainer.scrollHeight;
        }, 50);
    } catch (error) {
        console.error('Transcription error:', error);
        progressDiv.innerHTML = 'Failed to transcribe';
        resultDiv.innerHTML = `<div class="placeholder" style="color:#b91c1c;">Failed to transcribe</div>`;
        currentResultId = null;
    }
});

refreshHistoryBtn.addEventListener('click', refreshHistory);

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    loadHistory();
    if (!resultDiv.innerHTML.trim() || resultDiv.innerHTML === '') {
        showResultPlaceholder();
    }
});