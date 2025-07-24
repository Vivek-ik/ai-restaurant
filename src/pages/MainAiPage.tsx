import React, { useEffect, useMemo, useState } from 'react';
import { FaMicrophone, FaSearch, FaTag, FaShoppingCart, FaRestroom, FaEye, FaTags } from 'react-icons/fa';
import AiChatModal from '../components/AiChatModal/AiChatModal';
import Order from './CustomerOrder';
import { useNavigate, useParams } from 'react-router';
import { AddToCartFlow } from '../components/addToCartFlow/AddToCartFlow';
import { api } from '../api';

export type Item = {
  name: { en: string;[key: string]: string };
  price: number;
  quantity: number;
  specialInstructions?: any;
  [key: string]: any;
};


const VoiceAssistantUI = () => {

  const navigate = useNavigate();
  const { tableId } = useParams();
  const recognitionRef = React.useRef<InstanceType<typeof window.SpeechRecognition> | InstanceType<typeof window.webkitSpeechRecognition> | null>(null);
  const [language, setLanguage] = useState('Hindi');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  type Message = { from: 'user' | 'ai'; text: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiReply, setAiReply] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [intent, setIntent] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const toggleLanguage = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    window.speechSynthesis.cancel();

    setLanguage(prev => (prev === 'English' ? 'Hindi' : 'English'));
  };

    useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }
    // setVoices(window.speechSynthesis.getVoices());

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    // recognition.onstart = () => setListening(true);
    // recognition.onend = () => setListening(false);

    recognition.onerror = (e: any) => console.error("Speech recognition error", e);

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        handleSend(final);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      window.speechSynthesis.cancel(); // stop any ongoing speech
    };
  }, [language]); // 👈 important to re-run when language changes


  useEffect(() => {
    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel();
    };

    // Cancel speech when the component unmounts or before page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.speechSynthesis.cancel(); // on component unmount
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const speakResponse = (reply: string) => {
    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.lang = language === 'English' ? 'en-IN' : 'hi-IN';

      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.lang === utterance.lang);
      if (selectedVoice) utterance.voice = selectedVoice;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  };


  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { from: 'user', text }]);
    setIsLoading(true);

    try {
      const res = await api.post("/api/ai-order", {
        message: text,
        lang: language === "English" ? "en" : "hi",
        tableId: tableId || "1",
        messages
      });

      const data = res.data;

      setMessages(prev => [...prev, { from: 'ai', text: data.reply }]);
      setIntent(data.intent);
      setAiReply(data.reply.split('\n').filter((line: string) => line.trim() !== ''));
      setItems(data.items || []);
      speakResponse(data.reply);
    } catch (err) {
      console.error("AI error", err);
    } finally {
      setLiveTranscript("");
      setIsLoading(false);
    }
  };


  const startListening = () => {
    window.speechSynthesis.cancel();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'English' ? 'en-IN' : 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognitionRef.current = recognition; // ✅ Save instance in ref

    // ✅ Only clear AI replies and items here — NOT liveTranscript
    setAiReply([]);
    setItems([]);
    setIntent(undefined);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResult[])
        .map((r) => r[0].transcript)
        .join('');
      setLiveTranscript(transcript);

      if (event.results[0].isFinal) {
        handleSend(transcript); // will clear transcript after reply
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  // group items by category name
  const groupedItems = useMemo(() => {
    const map: { [category: string]: any[] } = {};

    items?.forEach((item: any) => {
      const categoryName = item.category?.name || "Uncategorized";
      if (!map[categoryName]) map[categoryName] = [];
      map[categoryName].push(item);
    });

    return map;
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-start font-sans p-4">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-2 tracking-wider">Bob's Cafe</h1>

      <div className="bg-blue-600 rounded-full p-8 shadow-lg mb-2 cursor-pointer" onClick={startListening}>
        <FaMicrophone className="text-white text-xl" />
      </div>


      <div className="bg-blue-100 border border-blue-300 px-6 py-2 rounded-xl text-center mb-3 shadow">
        <p className="font-semibold text-xl text-blue-900">Press and Ask</p>
        <p className="text-sm text-blue-700">Aaj menu me kya h?</p>
      </div>

      {(isListening || aiReply.length > 0 || isLoading) && (
        <div className="bg-white p-4 text-gray-700 rounded-md mb-3 w-full max-w-md">
          {isListening && (
            <div className="flex items-center justify-center -*p-3 rounded-xl text-gray-800 text-lg">
              🎙️ {liveTranscript || 'Listening...'}
            </div>
          )}

          {isLoading && !isListening && (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm italic">
              <span className="loader w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              Thinking...
            </div>
          )}

          {!isListening && !isLoading && aiReply.length > 0 && (
            <div className="p-2">
              {aiReply.map((reply, index) => (
                <p key={index} className="text-gray-600">{reply}</p>
              ))}
              {['order_item', 'customize_order'].includes(intent ?? '') && items?.length > 0 && (
                <div className="mt-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-blue-900">{item.name.en}</h3>
                        <span className="text-sm text-blue-700">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-blue-800">Quantity: {item.quantity}</p>
                      {item.specialInstructions && (
                        <p className="text-sm text-orange-600 italic">📝 {item.specialInstructions}</p>
                      )}
                    </div>
                  ))}
                  <div className="mt-2">
                    <AddToCartFlow
                      items={items.map((item, idx) => ({
                        id: item.id ?? `${item.name?.en ?? 'item'}-${idx}`,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        specialInstructions: item.specialInstructions ?? [],
                        customizations: item.specialInstructions ? [item.specialInstructions] : [],
                      }))}
                      tableId={tableId ?? ""}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {["menu_browsing", "filter_by_jain"].includes(intent ?? '') && (
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([categoryName, items]) => (
                <div key={categoryName}>
                  <h3 className="text-xl font-bold text-blue-800">{categoryName}</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {items.map((item, idx) => (
                      <li key={idx}>
                        {language === "hi"
                          ? item.itemName?.hi || item.itemName?.en
                          : item.itemName?.en}
                        – ₹{item.price}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

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
          <Order isOpen={showChat} onClose={() => {
            setShowChat(false); window.speechSynthesis.cancel();
          }}
          />
        </AiChatModal>
        <div className="p-4 cursor-pointer" onClick={() => handleSend(liveTranscript)}>
          <FaSearch className="text-blue-600 text-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-3">
        <button className="bg-white text-blue-800 font-semibold py-4 rounded-xl shadow flex flex-col items-center justify-center hover:bg-blue-50 transition"
          onClick={() => navigate(`/categories/${tableId}`)}>
          <FaTag className="text-2xl mb-1 text-blue-600" />
          View Menu By Categories
        </button>

        <button className="bg-white text-blue-800 font-semibold py-4 px-2 rounded-xl shadow flex flex-col items-center justify-center hover:bg-blue-50 transition"
          onClick={() => navigate(`/menu/${tableId}`)}>
          <FaTags className="text-2xl mb-1 text-blue-600" />
          View Menu By Items
        </button>

        <button className="bg-white text-blue-800 font-semibold py-4 rounded-xl shadow flex flex-col items-center justify-center hover:bg-blue-50 transition"
          onClick={() => navigate(`/cart/${tableId}`)}>
          <FaShoppingCart className="text-2xl mb-1 text-blue-600" /> View cart
        </button>
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition"
        onClick={toggleLanguage}
      >
        {language === 'English' ? 'English' : 'हिंदी'}
      </button>
    </div>
  );
};

export default VoiceAssistantUI;
