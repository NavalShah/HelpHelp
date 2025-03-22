const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onstart = () => {
    console.log('Speech recognition started');
};

recognition.addEventListener("result", (event) => {
    let transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript);
    for (let i = event.resultIndex; i < event.results[0].length; i++) {
        if (event.results[0][i].isFinal) {
            transcript += event.results[0][i].transcript; // Add the new recognized text
        }
    }
    console.log(transcript);
    document.getElementById('transcript').textContent = transcript;
});

recognition.onend = () => {
    console.log('Speech recognition ended');
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
};

let recording = false
let button = document.getElementById("record_button");
button.addEventListener("click", () => {
    recording = !recording;
    if(recording) {
        recognition.start();
    }
    if(!recording) {
        recognition.stop();
    }
})