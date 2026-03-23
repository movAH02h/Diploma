document.getElementById('audioFile').addEventListener('change', function(e) {
    const fileNameDiv = document.getElementById('fileName');
    
    if (this.files[0]) {
        const file = this.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const fileName = file.name.length > 30 ? 
            file.name.substring(0, 30) + '...' : file.name;
        
        fileNameDiv.innerHTML = `The file is selected: <span>${fileName}</span> (${fileSizeMB} MB)`;
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
        alert('Please, select the audio file!')
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0])
    
    progressDiv.innerHTML = 'Preparation...'
    resultDiv.innerHTML = ''
    fileNameDiv.className = 'file-name'

    try {
        progressDiv.innerHTML = '⚙️ Audio Processing...'
        await new Promise(resolve => requestAnimationFrame(resolve))
        const response = await fetch('http://localhost:8000/process_audio', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Server error ${response.status}: ${errorText}`)
        }
        const data = await response.json()

        displayResults(data);
        progressDiv.innerHTML = '✅ Processing completed!'
        
    } catch (error) {
        console.error('Error:', error)
        progressDiv.innerHTML = '❌ Error'
        fileNameDiv.className = 'file-name show'
    }
}

function displayResults(data) {
    const resultDiv = document.getElementById('result')
    let html = '<h2>📝 Transcription result:</h2>'
    console.log('Final results: ', data.full_text)
    html += `<div style="white-space: pre-wrap; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd; line-height: 1.6;">
                ${data.full_text}
                </div>`
    
    resultDiv.innerHTML = html
}
