import React, { useState } from 'react';
import { FaMicrophone, FaSearch, FaTag, FaShoppingCart, FaRestroom, FaEye } from 'react-icons/fa';
import AiChatModal from '../components/AiChatModal/AiChatModal';
import Order from './CustomerOrder';
import { useNavigate, useParams } from 'react-router';
import { AddToCartFlow } from '../components/addToCartFlow/AddToCartFlow';

const VoiceAssistantUI = () => {
  
  const navigate = useNavigate();
  const { tableId } = useParams();
  // const [tableId, setTableId] = useState('1'); // Default table ID
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  type Message = { from: 'user' | 'ai'; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiReply, setAiReply] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [items, setItems] = useState([]);
  const [intent, setIntent] = useState();

  console.log("aiReply", items);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'English' ? 'Hindi' : 'English'));
  };

  const speakResponse = (reply: any) => {
    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.lang = language === 'English' ? 'en-IN' : 'hi-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: any) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { from: 'user', text }]);

    // Replace with your actual AI API call
    const res = await fetch('http://localhost:5000/api/ai-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, lang: language === 'English' ? 'en' : 'hi', tableId: '1' })
    });
    const data = await res.json();

    setMessages(prev => [...prev, { from: 'ai', text: data.reply }]);
    setIntent(data.intent);
    setAiReply(data.reply.split('\n').filter((line: string) => line.trim() !== ''));
    setItems(data.items || []);
    speakResponse(data.reply);
      setLiveTranscript(""); // ✅ clear here

  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'English' ? 'en-IN' : 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResult[]).map((r) => r[0].transcript).join('');
      setLiveTranscript(transcript);

      if (event.results[0].isFinal) {
        handleSend(transcript);
        setIsListening(false);
        // setLiveTranscript('');
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
    setLiveTranscript('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-start font-sans p-4">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-2 tracking-wider">Shreemaya</h1>

      <div className="bg-blue-600 rounded-full p-8 shadow-lg mb-2 cursor-pointer" onClick={startListening}>
        <FaMicrophone className="text-white text-xl" />
      </div>


      <div className="bg-blue-100 border border-blue-300 px-6 py-2 rounded-xl text-center mb-3 shadow">
        <p className="font-semibold text-xl text-blue-900">Press and Ask</p>
        <p className="text-sm text-blue-700">e.g., Order masala dosa?”</p>
      </div>

      {(isListening || aiReply.length > 0) && (

        <div className="bg-white border p-4 text-gray-700 rounded-md mb-3">
          {isListening ? (
            // Show listening box
            <div className="p-3 rounded-xl text-gray-800 text-lg">
              🎙️ {liveTranscript || 'Listening...'}
            </div>
          ) : aiReply.length > 0 ? (
            // Show AI reply box
            <div className="bg-white border p-4 text-gray-700 rounded-md mb-3">
              {aiReply.map((reply, index) => (
                <p key={index} className="text-gray-600">{reply}</p>

              ))}
              {intent === "order_item" && items?.length > 0 && (
                <AddToCartFlow items={items} tableId={tableId ?? ""} />
              )}
            </div>
          ) : null
          }
        </div>
      )}

      <div className="flex items-center w-full max-w-md bg-white rounded-xl shadow mb-3">
        <input
          type="text"
          placeholder="Or type your question here..."
          className="flex-grow p-4 text-gray-700 rounded-l-xl outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSend((e.target as HTMLInputElement).value)}

          onFocus={() => setShowChat(true)}

        />
        <AiChatModal isOpen={showChat} onClose={() => setShowChat(false)}>
          <Order onClose={() => setShowChat(false)} />
        </AiChatModal>
        <div className="p-4 cursor-pointer" onClick={() => handleSend(liveTranscript)}>
          <FaSearch className="text-blue-600 text-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-3">
        <button className="bg-white text-blue-800 font-semibold py-4 rounded-xl shadow flex flex-col items-center justify-center hover:bg-blue-50 transition"
          onClick={() => navigate(`/categories/${tableId}`)}>
          <FaTag className="text-2xl mb-1 text-blue-600" /> View Menu By Categories
        </button>

        <button className="bg-white text-blue-800 font-semibold py-4 rounded-xl shadow flex flex-col items-center justify-center hover:bg-blue-50 transition"
          onClick={() => navigate(`/menu/${tableId}`)}>
          <FaShoppingCart className="text-2xl mb-1 text-blue-600" /> View Menu By Items
        </button>
      </div>

      <div className="flex gap-6 mb-4 underline text-blue-700 font-semibold">
        <a href="#">Jobs</a>
        <a href="#">Stores</a>
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition"
        onClick={toggleLanguage}
      >
        {language === 'English' ? 'हिंदी' : 'English'}
      </button>

      {/* Messages */}
      {/* <div className="mt-3 w-full max-w-xl">
        {messages.map((msg, i) => (
          <div key={i} className={`p-2 my-1 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-4 py-2 rounded-lg ${msg.from === 'user' ? 'bg-blue-200' : 'bg-green-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default VoiceAssistantUI;
