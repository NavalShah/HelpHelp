'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import APIKey from './GeminiAPIKey';

const googleAI = new GoogleGenerativeAI(APIKey);
const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

function startChat() {
    return model.startChat();
}

enum messageSender {
    system,
    user,
    ai,
    error
}

type message = {
    sender: messageSender,
    text: string
}

function Gemini() {
    const [chat, setChat] = useState<ChatSession>();
    const [messages, setMessages] = useState<message[]>([]);
    const [isWaiting, setWaiting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!chat) setChat(startChat());
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const speechRec = new SpeechRecognition();
            speechRec.continuous = false;
            speechRec.interimResults = false;
            speechRec.lang = 'en-US';
            speechRec.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                sendMessage(transcript);
            };
            setRecognition(speechRec);
        }
    }, [chat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const speak = (text: string) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        synth.speak(utterance);
    };

    const newMessage = (response: string) => {
        speak(response);
    };

    const sendMessage = async (input: string) => {
        if (isWaiting) return;
        if (input.trim() !== "") {
            setMessages(prev => [...prev, { text: input, sender: messageSender.user }]);

            let aiContext = input;
            if (messages.length === 0) {
                aiContext = `You are the endpoint of a helpline, the user is calling you because they feel unsafe. Try to maintain regular conversation to make it seem like the user is on a real call. If the user says help three times in a row, inform them that emergency services will be contacted shortly, and try your best to comfort them.`;
            }

            setWaiting(true);
            try {
                const result = await chat?.sendMessage(aiContext);
                if (!result) throw new Error("Failed to get response from AI");

                setChat(chat);
                const responseText = result.response.text();
                setMessages(prev => [...prev, { text: responseText, sender: messageSender.ai }]);
                newMessage(responseText);
            } catch (error) {
                setMessages(prev => [...prev, { text: "AI couldn't respond.", sender: messageSender.error }]);
                newMessage("AI couldn't respond.");
            }
            setWaiting(false);
        }
    };

    const startListening = () => {
        if (recognition) {
            recognition.start();
        }
    };

    return (
        <div>
            <button onClick={startListening}>🎤 Speak</button>
        </div>
    );
}

export default Gemini;
