import React, { useState, useEffect } from 'react';

// Gemini AI Call Integration
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import APIKey from './GeminiAPIKey';

// Twilio stuff

async function textNumber() {
  console.log("Needs Help!");

  const response = await fetch("http://localhost:5000/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "help!" }),
  });

  const data = await response.json();
  if (data.success) {
    return ("Message sent successfully!");
  } else {
    return (`Error: ${data.error}`);
  }

}


interface CallScreenProps {
  onEndCall: () => void;
}

declare global {
  interface Window {
      webkitSpeechRecognition: typeof SpeechRecognition;
  }

  var SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
  };

  interface SpeechRecognition {
      start(): void;
      stop(): void;
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((event: SpeechRecognitionEvent) => void) | null;
  }

  interface SpeechRecognitionEvent extends Event {
      results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
      readonly length: number;
      item(index: number): SpeechRecognitionResult;
      [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
      readonly length: number;
      readonly isFinal: boolean;
      item(index: number): SpeechRecognitionAlternative;
      [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
      readonly transcript: string;
      readonly confidence: number;
  }
}

const googleAI = new GoogleGenerativeAI(APIKey);
const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function startChat() {
    return model.startChat();
}


const restartChat = () => {
    console.warn("Restarting chat...");
    return startChat();
};

const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition;

const CallScreen: React.FC<CallScreenProps> = ({ onEndCall }) => {
    const [chat, setChat] = useState<ChatSession>(startChat());
    const [isWaiting, setWaiting] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!chat) setChat(startChat());
        if (SpeechRecognitionAPI) {
            const speechRec = new SpeechRecognitionAPI();
            speechRec.continuous = true;
            speechRec.interimResults = false;
            speechRec.lang = 'en-US';
            speechRec.onresult = (event: SpeechRecognitionEvent) => {
                if (isSpeaking) return; // Ignore AI-generated speech
                const transcript = event.results[event.results.length - 1][0].transcript;
                if(transcript.includes("help")) {
                  textNumber();
                }
                sendMessage(transcript);
            };
            setRecognition(speechRec);
            speechRec.start();
        }
    }, [chat]);

    const restartRecognition = () => {
        if (recognition) {
            recognition.stop();
            recognition.start();
        }
    };

    const speak = (text: string) => {
        return new Promise<void>((resolve) => {
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                startListening();
                resolve();
            };
            synth.speak(utterance);
        });
    };

    const sendMessage = async (input: string) => {
        input = input + " Respond briefly and conversationally. Be casual, and brief. The user is calling you to speak to you, so don't use emojis and don't bother with formatting.";
        if (isWaiting) return;
        if (input.trim() !== "") {
            setWaiting(true);
            try {
                const result = await chat?.sendMessage(input);
                if (!result) throw new Error("Failed to get response from AI");
                const responseText = await result.response.text();
                console.log("AI Response:", responseText);
                await speak(responseText);
            } catch (error) {
                console.error("Error with AI response:", error);
                setChat(restartChat());
                startListening();
            }
            setWaiting(false);
        }
    };

    const startListening = () => {
        try {
            if (recognition && !isSpeaking) {
                recognition.start();
            }
        } catch (error) {
            console.error("Error starting recognition:", error);
            restartRecognition();
        }
    };

    const [time, setTime] = useState<number>(0);
    const [calling, setCalling] = useState<boolean>(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setCalling(false);
            let startTime = Date.now();
            const interval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                setTime(elapsedTime);
            }, 1000);
            return () => clearInterval(interval);
        }, 2000);

        return () => clearTimeout(timeout);
    }, []);

    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.contactInfo}>
                <h2 style={styles.name}>John Doe</h2>
                <p style={styles.status}>{calling ? 'Calling...' : formatTime(time)}</p>
            </div>
            <div style={styles.buttonContainer}>
                <button style={styles.controlButton}><span style={styles.controlIcon}>🔊</span><span style={styles.controlLabel}>Speaker</span></button>
                <button style={styles.controlButton}><span style={styles.controlIcon}>📹</span><span style={styles.controlLabel}>FaceTime</span></button>
                <button style={styles.controlButton}><span style={styles.controlIcon}>🎤</span><span style={styles.controlLabel}>Mute</span></button>
                <button style={styles.controlButton}><span style={styles.controlIcon}>➕</span><span style={styles.controlLabel}>Add</span></button>
                <button style={styles.controlButton}><span style={styles.controlIcon}>📱</span><span style={styles.controlLabel}>Keypad</span></button>
            </div>
            <button style={styles.endCallButton} onClick={onEndCall}><span style={styles.endCallIcon}>📞</span></button>
        </div>
    );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50vh',
    transform: 'translateY(-50%)',
  },
  contactInfo: {
    textAlign: 'center' as 'center',
    marginTop: '40px',
  },
  name: {
    fontSize: '32px',
    margin: '0',
  },
  status: {
    fontSize: '20px',
    margin: '10px 0 0',
    color: '#888',
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    width: '100%',
    maxWidth: '400px',
    margin: '40px 0',
  },
  controlButton: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  controlIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  controlLabel: {
    fontSize: '14px',
    color: '#888',
  },
  endCallButton: {
    width: '80px',
    height: '80px',
    fontSize: '24px',
    backgroundColor: '#fff', // Red background
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  endCallIcon: {
    fontSize: '32px',
    color: '#000',
  },
};

export default CallScreen;
