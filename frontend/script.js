// Добавляем обработчик для отображения выбранного файла
document.getElementById('audioFile').addEventListener('change', function(e) {
    const fileNameDiv = document.getElementById('fileName');
    
    if (this.files[0]) {
        const file = this.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const fileName = file.name.length > 30 ? 
            file.name.substring(0, 30) + '...' : file.name;
        
        fileNameDiv.innerHTML = `Выбран файл: <span>${fileName}</span> (${fileSizeMB} MB)`;
        fileNameDiv.className = 'file-name show';
    } else {
        fileNameDiv.innerHTML = '';
        fileNameDiv.className = 'file-name';
    }
});

async function uploadFile() {
    const fileInput = document.getElementById('audioFile')
    const progressDiv = document.getElementById('progress')
    const resultDiv = document.getElementById('result')
    const fileNameDiv = document.getElementById('fileName')

    if (!fileInput.files[0]) {
        alert('Пожалуйста, выберите аудио файл!')
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0])
    
    progressDiv.innerHTML = 'Подготовка...'
    resultDiv.innerHTML = ''
    fileNameDiv.className = 'file-name' // Скрываем имя файла при отправке

    try {
        progressDiv.innerHTML = '📤 Отправка файла на сервер...'
        const response = await fetch('http://localhost:8000/transcribe/', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Ошибка сервера ${response.status}: ${errorText}`)
        }

        progressDiv.innerHTML = '⚙️ Обработка аудио...'
        const data = await response.json()
        console.log('Данные получены:', data)

        displayResults(data);
        progressDiv.innerHTML = '✅ Обработка завершена!'
        
    } catch (error) {
        console.error('Ошибка:', error)
        if (resultDiv) {
            resultDiv.innerHTML = `<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 5px;">
                <strong>Ошибка:</strong> ${error.message}
            </div>`
        }
        progressDiv.innerHTML = '❌ Ошибка: ' + error.message
        fileNameDiv.className = 'file-name show' // Показываем имя файла снова
    }
}

function displayResults(data) {
    const resultDiv = document.getElementById('result')
    let html = '<h2>📝 Результат транскрибации:</h2>'

    if (data.result) {
        html += `<div style="white-space: pre-wrap; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd; line-height: 1.6;">
                    ${data.result}
                 </div>`
    } else if (data.transcription && data.transcription.full_text) {
        html += `<div style="white-space: pre-wrap; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd; line-height: 1.6;">
                    ${data.transcription.full_text}
                 </div>`
    } else if (data.transcription) {
        html += `<div style="white-space: pre-wrap; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd; line-height: 1.6;">
                    ${JSON.stringify(data.transcription, null, 2)}
                 </div>`
    } else {
        html += `<pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
                    ${JSON.stringify(data, null, 2)}
                 </pre>`
    }
    
    resultDiv.innerHTML = html
}

// Дополнительно: можно добавить Drag & Drop
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('audioFile');
    const fileLabel = document.querySelector('.file-label');
    const container = document.querySelector('.container');
    
    // Подсветка при drag over
    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        container.style.boxShadow = '0 0 0 3px #3498db';
        fileLabel.style.background = '#2980b9';
    });
    
    container.addEventListener('dragleave', function() {
        container.style.boxShadow = '';
        fileLabel.style.background = '#3498db';
    });
    
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        container.style.boxShadow = '';
        fileLabel.style.background = '#3498db';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            
            // Триггерим событие change
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    });
});