const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

const recognition = new SpeechRecognition();

let recording = false;
let silenceTimeout;
let safeWord = "help";

recognition.continuous = true;

recognition.lang = 'en-US';

function checkIfWordIsInSentences(word, sentences) {
    for (const sentence of sentences) {
      if (sentence.includes(word)) {
        return true; 
      }
    }
    return false;
  }

recognition.onstart = () => {
    recording = true;
    console.log('Speech recognition started');
};

recognition.onresult = (event) => {
    /*
    clearTimeout(silenceTimeout);

    let transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript);
    console.log(transcript);
    document.getElementById('transcript').textContent = transcript;

    silenceTimeout = setTimeout(() => {
        console.log("No updates detected in 12 seconds. Restarting recognition...");
        recognition.stop(); // Stop the current recognition
        recognition.start(); // Restart the recognition
    }, 12000); // 12 seconds
    */
    const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript);
    console.log(transcript);
    document.getElementById('transcript').textContent = transcript;

    for (const sentence of transcript) {
        if (sentence.includes(safeWord)) {
          console.log("need help");
        }
    }
    console.log("does not need help");

    transcript[transcript.length-1]    
};

recognition.onend = () => {
    console.log('Speech recognition ended');
    recording = false;
    if(recording) {
        //recognition.start();
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