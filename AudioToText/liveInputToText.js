const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();

let recording = false
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

setInterval(resetVoiceRecog, 10000);
function resetVoiceRecog() {
    if(recording) {
        recognition.stop();
        //Refrence the llm for audio content
    }
}

recognition.onstart = () => {
    recording = true;
    console.log('Speech recognition started');
};

recognition.onresult =  (event) => {
    let transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript);
    console.log(transcript);
    document.getElementById('transcript').textContent = transcript;
};

recognition.onend = () => {
    console.log('Speech recognition ended');
    if(recording) {
        recognition.start();
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
};

let button = document.getElementById("record_button");
button.addEventListener("click", () => {
    if(!recording) {
        recognition.start();
    }
    if(recording) {
        recording = false;
        recognition.stop();
    }
})