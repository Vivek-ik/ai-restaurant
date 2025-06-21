import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send } from 'lucide-react'; // Optional: lucide icons

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type SpeechRecognition = typeof window.webkitSpeechRecognition;

interface VoiceChatOrderingProps {
  onSendMessage: (message: string) => void;
}

const VoiceChatOrdering: React.FC<VoiceChatOrderingProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Welcome! You can order by voice or chat. Try saying "Show me the menu."' }
  ]);
  const [input, setInput] = useState('');
  const recognitionRef = useRef<null | InstanceType<SpeechRecognition>>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setMessages((msgs) => [...msgs, { from: 'user', text: speechResult }]);
      onSendMessage(speechResult);
    };

    recognitionRef.current = recognition;
  }, [onSendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startVoice = () => {
    recognitionRef.current?.start();
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: 'user', text: input }]);
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="max-w-md mx-auto flex flex-col h-[80vh] border shadow rounded-xl overflow-hidden">
      <div className="flex-1 bg-white p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-2xl ${
              msg.from === 'user'
                ? 'ml-auto bg-blue-100 text-right'
                : 'mr-auto bg-gray-100'
            }`}
          >
            <div className="text-sm">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-gray-50 flex items-center gap-2">
        <button
          onClick={startVoice}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          <Mic size={20} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message"
          className="w-full flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default VoiceChatOrdering;
