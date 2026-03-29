const fileInput = document.getElementById('audioFile');
const fileNameDiv = document.getElementById('fileName');
const deleteBtn = document.getElementById('deleteFileBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const progressDiv = document.getElementById('progress');
const resultDiv = document.getElementById('result');

function showPlaceholder() {
    resultDiv.innerHTML = '<div class="placeholder">Here will be a result</div>';
}

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        let fileName = file.name;
        if (fileName.length > 35) {
            fileName = fileName.substring(0, 32) + '...';
        }
        fileNameDiv.innerHTML = `📄 <span>${fileName}</span><br>${fileSizeMB} MB`;
        fileNameDiv.classList.add('show');
    } else {
        fileNameDiv.classList.remove('show');
        fileNameDiv.innerHTML = '';
    }
    progressDiv.innerHTML = '';
    showPlaceholder();
});

deleteBtn.addEventListener('click', function() {
    fileInput.value = '';
    fileNameDiv.classList.remove('show');
    fileNameDiv.innerHTML = '';
    progressDiv.innerHTML = '';
    resultDiv.innerHTML = '';
    showPlaceholder();
});

transcribeBtn.addEventListener('click', async () => {
    if (!fileInput.files || !fileInput.files[0]) {
        alert('Пожалуйста, выберите аудиофайл!');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    showPlaceholder();

    try {
        progressDiv.innerHTML = '⚙️ Обработка аудио...';
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = await fetch('http://localhost:8000/process_audio', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка сервера ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        displayResults(data);
        progressDiv.innerHTML = '✅ Готово!';
    } catch (error) {
        console.error('Ошибка:', error);
        progressDiv.innerHTML = '❌ Ошибка при транскрипции';
        resultDiv.innerHTML = `<div style="color: #e74c3c;">Не удалось получить результат: ${error.message}</div>`;
    }
});

function displayResults(data) {
    if (data.full_text) {
        resultDiv.innerHTML = data.full_text.replace(/\n/g, '<br>');
    } else {
        resultDiv.innerHTML = 'Текст не получен.';
    }
}