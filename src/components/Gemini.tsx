'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import APIKey from './GeminiAPIKey';

const googleAI = new GoogleGenerativeAI(APIKey);
const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function startChat() {
  let chat = model.startChat();
  return chat;
}

type Props = {
  initialPrompt: string
  chat?: ChatSession
};

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

function Gemini({ initialPrompt }: Props) {
  const [chat, setChat] = useState<ChatSession>();
  useEffect(() => {
    if (!chat) setChat(startChat());
  }, [chat]);

  const [messages, setMessages] = useState<message[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setWaiting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (isWaiting) return;
    if (input.trim() !== "") {

      let userMessage = "" + input;
      setInput("");

      setMessages(prev => [...prev, { text: userMessage, sender: messageSender.user }]);


      let aiContext = userMessage;
      if (messages.length == 0) {
        aiContext = `Here is context for a conversation you will have with someone: '${initialPrompt}' Answer their questions in short paragraphs.\n\nNow, the beginning of the conversation:\n${userMessage}`;
      }

      setWaiting(true);
      try {
        const result = await chat?.sendMessage(aiContext);
        if (!result) throw new Error("Failed to get response from AI");
        setChat(chat);
        setMessages(prev => [...prev, { text: result.response.text(), sender: messageSender.ai }]);
      } catch (error) {
        setMessages(prev => [...prev, { text: "Error processing response.", sender: messageSender.error }]);
      }
      setWaiting(false);
    }
  };

  return (
    <center className="flex flex-col h-full auto p-4 bg-gray-100 margin-auto">
      <div className="flex bg-white p-4 shadow">
        {initialPrompt}
      </div>
      <div className="bg-gray-200 p-1 shadow italic light">
        You can use this Gemini-Powered chat to learn more.
      </div>
      <div className="flex flex-col overflow-auto bg-white p-4 shadow h-full flex-grow-1 space-y-2"> {/* Use flex-col and space-y for vertical stacking */}
        {messages.map((msg, index) => (
          (msg.sender !== messageSender.system && (
            <div
              key={index}
              className={`flex h-auto p-2 my-2 rounded-lg text-white block max-w-[75%] ${
                msg.sender === messageSender.user
                  ? "bg-blue-500 self-end mr-auto justify-start"
                  : msg.sender === messageSender.error
                  ? "bg-red-500 justify ml-auto justify-end"
                  : "bg-gray-500 ml-auto justify-end"
              }`}
            >
              {msg.text}
            </div>
          ))
        ))}

        {isWaiting && (
          <div className="flex justify-center items-center mt-2">
            <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg square"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className={`ml-2 p-2 text-white rounded-lg ${isWaiting ? "bg-gray-500" : "bg-blue-500"}`}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </center>
  );
}

export default Gemini;