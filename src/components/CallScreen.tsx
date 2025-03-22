import React, { useState, useEffect, useRef } from 'react';

// Gemini AI Call Integration
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import APIKey from './GeminiAPIKey';

const googleAI = new GoogleGenerativeAI(APIKey);
const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function startChat() {
    return model.startChat();
}

const restartChat = () => {
    console.warn("Restarting chat...");
    return startChat();
};

const CallScreen: React.FC = () => {
    const [chat, setChat] = useState<ChatSession>(startChat());
    const [isWaiting, setWaiting] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!chat) setChat(startChat());
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const speechRec = new SpeechRecognition();
            speechRec.continuous = true; // Keep listening indefinitely
            speechRec.interimResults = false;
            speechRec.lang = 'en-US';
            speechRec.onerror = (event) => {
                console.error("Speech recognition error:", event);
                restartRecognition();
            };
            speechRec.onend = () => {
                console.warn("Speech recognition ended unexpectedly. Restarting...");
                restartRecognition();
            };
            speechRec.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript;
                sendMessage(transcript);
            };
            setRecognition(speechRec);
            speechRec.start();  // Start listening immediately
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
            utterance.onend = () => {
                startListening(); // Restart listening after speech
                resolve();
            };
            synth.speak(utterance);
        });
    };

    const sendMessage = async (input: string) => {
        input = input + " Respond briefly and conversationally.";
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
            if (recognition) {
                recognition.start();
            }
        } catch (error) {
            console.error("Error starting recognition:", error);
            restartRecognition();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.contactInfo}>
                <h2 style={styles.name}>John Doe</h2>
                <p style={styles.status}>Calling...</p>
            </div>
            <div style={styles.controls}>
                <button style={styles.controlButton} onClick={startListening}>
                    <span style={styles.controlIcon}>📞</span>
                    <span style={styles.controlLabel}>Keypad</span>
                </button>
                <button style={styles.endCallButton}>
                    <span style={styles.endCallIcon}>📞</span>
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        padding: '20px',
    },
    contactInfo: {
        textAlign: 'center',
        marginTop: '40px',
    },
    name: {
        fontSize: '24px',
        margin: '0',
    },
    status: {
        fontSize: '16px',
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
        flexDirection: 'column',
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
        gridColumn: '2 / 3',
        width: '80px',
        height: '80px',
        fontSize: '24px',
        backgroundColor: '#ff4444',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
    },
    endCallIcon: {
        fontSize: '32px',
    },
};

export default CallScreen;
