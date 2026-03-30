const fileInput = document.getElementById('audioFile');
const fileNameDiv = document.getElementById('fileName');
const deleteBtn = document.getElementById('deleteFileBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const progressDiv = document.getElementById('progress');
const resultDiv = document.getElementById('result');

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
let isFileValid = true;

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
}

function showWaitingPlaceholder() {
    resultDiv.innerHTML = '<div class="placeholder">Waiting for transcription...</div>'
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
        resultDiv.innerHTML = `<div class="placeholder">Here will be a results</div>`;
    } else {
        resultDiv.innerHTML = `<div class="placeholder">No dialogue segments recognized</div>`;
    }
}

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
        
        const response = await fetch('http://localhost:8000/process_audio', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error ${response.status}: ${errorText.substring(0, 120)}`);
        }

        const data = await response.json();
        displayResults(data);
        progressDiv.innerHTML = '✅ Ready';
        setTimeout(() => {
            const resultContainer = document.querySelector('.result-content');
            if (resultContainer) resultContainer.scrollTop = resultContainer.scrollHeight;
        }, 50);
    } catch (error) {
        console.error('Transcription error:', error);
        progressDiv.innerHTML = 'Failed to transcribe';
        resultDiv.innerHTML = `<div class="placeholder" style="color:#b91c1c;">Failed to transcribe</div>`;
    }
});

window.addEventListener('load', () => {
    if (!resultDiv.innerHTML.trim() || resultDiv.innerHTML === '') {
        showResultPlaceholder();
    }
});