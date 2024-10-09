let mediaRecorder;
let audioChunks = [];
const outputContainer = document.getElementById('outputText');
const prefixElement = document.getElementById('prefix');
let menuAccepted = false; 

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US'; 


let defaultVoice;


function populateVoices() {
    const voices = window.speechSynthesis.getVoices();
    defaultVoice = voices.find(voice => voice.name === 'Google US English');
}


if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
}

document.getElementById('recordButton').addEventListener('click', async () => {
    
    if (!menuAccepted) {
    
        return; 
    }
    
    try {
        if (!mediaRecorder) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                
                audioChunks = []; 
            };
        }

        if (mediaRecorder.state === 'inactive') {
            mediaRecorder.start();
            document.getElementById('recordButton').classList.add('recording');
            document.querySelector('.label').textContent = 'Recording...';
            console.log('Recording started...');

            recognition.start();
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript; 
                const newOutputDiv = document.createElement('div');
                newOutputDiv.classList.add('transcription-output');

                if (transcript.trim() !== "") {
                    newOutputDiv.innerHTML = `<p><strong>User :</strong> "${transcript}"</p>`;
                    outputContainer.appendChild(newOutputDiv); 

                
                    const utterance = new SpeechSynthesisUtterance(transcript);
                    utterance.voice = defaultVoice; 
                    window.speechSynthesis.speak(utterance); 
                }
            };
        } else {
            mediaRecorder.stop();
            recognition.stop(); 
            document.getElementById('recordButton').classList.remove('recording');
            document.querySelector('.label').textContent = 'Record';
            console.log('Recording stopped...');
        }
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access the microphone. Please check your permissions.');
    }
});

document.getElementById('cancel').addEventListener('click', function() {
    window.close();
    if (window.closed === false) {
        alert('You are restricting the rules so that it closes the website. The browser prevented closing this window. Please close it manually.');
    }
});

document.getElementById('accept').addEventListener('click', function() {
    const cautionMenu = document.getElementById('card');
    cautionMenu.classList.add('fade-out');

    
    menuAccepted = true;

    setTimeout(() => {
        cautionMenu.classList.add('hidden');
    }, 500); 
});
