"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ArcwarePixeclStreamingManager } from "@/lib/webrtcClient";
import { useMessageStore } from "@/store/messageStore";

interface ChatbotProps {
  chatbotName: string | null;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatbotComponent: React.FC<ChatbotProps> = ({
  chatbotName,
}) => {
  const [userInput, setUserInput] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatboxRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const { sendCommand } = ArcwarePixeclStreamingManager();

  const {
    lastBotMessage,
    setLastBotMessage,
    isProcessingMessage,
    setIsProcessingMessage,
    setMessageTimestamp,
  } = useMessageStore();


  useEffect(() => {
    if (lastBotMessage && !isProcessingMessage) {
      setMessages((prev) => [
        ...prev,
        {
          text: lastBotMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);

      setLastBotMessage(null);

      if (chatboxRef.current) {
        chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
      }
    }
  }, [lastBotMessage, isProcessingMessage, setLastBotMessage]);

  useEffect(() => {
    if (isProcessingMessage) {
      const timeout = setTimeout(() => {
        setIsProcessingMessage(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [isProcessingMessage, setIsProcessingMessage]);

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        handleUserMessage(speechText);
      };

      recognition.current.onend = () => {
        setIsCallActive(false);
      };

      recognition.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsCallActive(false);
      };
    }
  });

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (chatboxRef.current) {
      const scrollHeight = chatboxRef.current.scrollHeight;
      const height = chatboxRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chatboxRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleUserMessage = useCallback(
    (message: string) => {
      console.log("Sending user message:", message);

      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isUser: true,
          timestamp: new Date(),
        },
      ]);

      setIsProcessingMessage(true);
      setMessageTimestamp(Date.now());

      sendCommand({ usermessege: message });
    },
    [sendCommand, setIsProcessingMessage, setMessageTimestamp]
  );


  const handleSendMessage = useCallback(() => {
    if (userInput.trim()) {
      handleUserMessage(userInput.trim());
      setUserInput("");
    }
  }, [userInput, handleUserMessage]);

  const handleCallToggle = useCallback(() => {
    if (!recognition.current) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome."
      );
      return;
    }

    if (isCallActive) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsCallActive((prev) => !prev);
  }, [isCallActive]);

  return (
    <div id="chat-container" className="chat-container backdrop-blur-sm	p-6 rounded-xl shadow-2xl">
      <div
        ref={chatboxRef}
        id="chatbox"
        className="chat-content pr-4 h-[calc(100vh-50vh)] overflow-y-auto"
      >
        {messages.map((message, index) => (
          <div
            key={`${index}-${message.timestamp.getTime()}`}
            className={`message-container ${message.isUser ? "text-right" : ""
              } mb-2`}
          >
            <p className={`text-md font-bold ${message.isUser ? 'text-green-500' : 'text-amber-500'}`}> {message.isUser ? "You" : chatbotName}: </p>
            <p
              className={`message-text inline-block p-2 rounded-lg ${message.isUser
                ? "bg-[#00cdff] text-white"
                : "bg-[rgba(0,0,0,0.2)] text-white"
                }`}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      <div id="chat-input" className="chat-input">
        <div className="chat-input-container flex items-center">
          <div className="input-wrapper flex-grow mr-2">
            <input
              id="user-input"
              type="text"
              placeholder="Type a message..."
              className="user-input-field w-full"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
          <div
            id="send-button"
            className="send-button cursor-pointer"
            onClick={handleSendMessage}
          >
            <svg
              id="send_button"
              style={{ color: "white" }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              width="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </div>
          {!isCallActive ? (
            <div
              id="call-button"
              className="call-button cursor-pointer"
              onClick={handleCallToggle}
            >
              <svg
                fill="#FFFFFF"
                height="25px"
                width="25px"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                enableBackground="new 0 0 512 512"
              >
                <g>
                  <path d="m439.5,236c0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,70-64,126.9-142.7,126.9-78.7,0-142.7-56.9-142.7-126.9 0-11.3-9.1-20.4-20.4-20.4s-20.4,9.1-20.4,20.4c0,86.2 71.5,157.4 163.1,166.7v57.5h-23.6c-11.3,0-20.4,9.1-20.4,20.4 0,11.3 9.1,20.4 20.4,20.4h88c11.3,0 20.4-9.1 20.4-20.4 0-11.3-9.1-20.4-20.4-20.4h-23.6v-57.5c91.6-9.3 163.1-80.5 163.1-166.7z" />
                  <path d="m256,323.5c51,0 92.3-41.3 92.3-92.3v-127.9c0-51-41.3-92.3-92.3-92.3s-92.3,41.3-92.3,92.3v127.9c0,51 41.3,92.3 92.3,92.3zm-52.3-220.2c0-28.8 23.5-52.3 52.3-52.3s52.3,23.5 52.3,52.3v127.9c0,28.8-23.5,52.3-52.3,52.3s-52.3-23.5-52.3-52.3v-127.9z" />
                </g>
              </svg>
            </div>
          ) : (
            <div
              id="stopcall-button"
              className="stopcall-button cursor-pointer"
              onClick={handleCallToggle}
            >
              <img
                src="/images/Microphone.gif"
                alt="Microphone Animation"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default ChatbotComponent;
