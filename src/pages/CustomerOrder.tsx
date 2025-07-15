import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart, fetchCart } from "../store/cartSlice";
import { AddToCartFlow } from "../components/addToCartFlow/AddToCartFlow";
import { useParams } from "react-router";
import { api } from "../api";
import { Item } from "./MainAiPage";

type Message = {
  from: string;
  text: string;
  intent: string;
  items: any[];
  category?: Record<string, any>;
};

export default function Order({ onClose }: any) {
  const dispatch = useDispatch();
  const { tableId } = useParams();
  const [language, setLanguage] = useState("en");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai", text: `👋 Namaste! Welcome to Shrimaya. How can I help you today?
       Please select your language: हिंदी या English?`,
      intent: "", items: []
    }
  ]);
  const [itemsByCategory, setItemsByCategory] = useState();
  const [intent, setIntent] = useState();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [updatedMessages, setUpdatedMessages] = useState<any>();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

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

      // Live transcription in input
      setInput(final || interim);

      // Final recognized => send
      if (final) {
        handleSend(final);
        setInput(""); // Clear box
      }
    };

    recognitionRef.current = recognition;

    return () => {
      window.speechSynthesis.cancel(); // stop any ongoing speech
    };
  }, []);

  // inside VoiceAssistantUI
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

  const handleMicClick = () => {
    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const sendAIMessage = async (message: string, lang: string, history: any, lastAIItems: any) => {
    const res = await api.post("/api/ai-order", {
      tableId: tableId ?? "",
      message,
      lang,
      previousMessages: messages,
      suggestedItems: lastAIItems,
    });
    return {
      reply: res.data.reply || "No reply received please try again.",
      intent: res.data.intent,
      items: res.data.items || [],
      specialInstructions: res.data.specialInstructions || "",
      tableId: res.data.tableId || "1",
      itemsByCategory: res.data.itemsByCategory || {},
    };
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const updatedMessages = [
      ...messages,
      { from: "user", text, intent: "", items: [] },
    ];

    setMessages(prev => [...prev, { from: "user", text, intent: "", items: [] }]);
    setLoading(true);

    const lastAIItems = updatedMessages
      .slice()
      .reverse()
      .find((msg) => msg.from === "ai" && msg.items && msg.items.length > 0)?.items || [];


    try {
      const data = await sendAIMessage(text, language, updatedMessages, lastAIItems);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: data.reply || "Internet issue, please try again.",
          intent: data.intent || "",
          items: Array.isArray(data.items) ? data.items : [],
        },
      ]);
      setItemsByCategory(data.itemsByCategory || {});
      setIntent(data.intent);
      speakResponse(data.reply);
      setItems(data.items || []);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { from: "ai", text: "❌ AI failed to respond. Try to ask anything else, e.g. order panner butter masala", intent: "", items: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (reply: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(reply);
      const voices = window.speechSynthesis.getVoices();

      const selectedVoice = voices.find(
        (v) =>
          v.name.includes("Google UK") ||
          v.name.includes("Heera") ||
          v.lang === "hi-IN" ||
          v.lang === "en-IN"
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }

      utterance.volume = 1;
      utterance.pitch = 1;
      utterance.rate = 1;

      window.speechSynthesis.cancel(); // Stop any current speech
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech error:", err);
    }
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
    <div className="fixed bottom-0 m-6 w-[335px] bg-white shadow-xl rounded-lg p-4 h-[85%] w-[85%]">
      <button onClick={onClose} className="absolute top-2 right-4 text-gray-600 hover:text-black text-lg">
        ✖
      </button>

      <h3 className="font-bold mb-2">Ask AI</h3>
      <div className="h-[85%] overflow-y-auto text-sm mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-1 flex flex-col ${msg.from === "user" ? "text-right" : "text-left"}`}>
            <span className={msg.from === "user" ? "text-blue-600" : "text-green-600"}>
              {msg.text}
            </span>

            {/* {msg.intent === "menu_browsing" && msg.category && (
              <div className="space-y-4">
                {Object.entries(msg.category).map(([cat, items]) => (
                  <div key={cat}>
                    <h3 className="text-xl font-bold text-blue-800">{cat}</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {(items as any[]).map((item, i) => (
                        <li key={i}>{item.name} – ₹{item.price}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )} */}

            {["menu_browsing", "filter_by_ingredients"].includes(msg.intent ?? '') && msg.items.length > 0 && (() => {
              const map: { [category: string]: any[] } = {};
              msg.items.forEach((item) => {
                const cat = item.category?.name || "Uncategorized";
                if (!map[cat]) map[cat] = [];
                map[cat].push(item);
              });

              return (
                <div className="space-y-4 mt-2">
                  {Object.entries(map).map(([cat, items]) => (
                    <div key={cat}>
                      <h3 className="text-xl font-bold text-blue-800">{cat}</h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {items.map((item, i) => (
                          <li key={i}>
                            {item.itemName?.en} – ₹{item.price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })()}
            {msg.intent === "order_item" && msg.items?.length > 0 && (
              <AddToCartFlow items={msg.items} tableId={tableId ?? ""} />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="w-full flex-1 border px-2 py-1 rounded"
          value={input}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim() !== '') {

              handleSend(input)
              setInput("")
            }
          }}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak or type something..."
        />
        <button
          onClick={handleMicClick}
          className={`px-3 py-1 rounded ${listening ? "bg-red-600" : "bg-gray-300"} text-white`}
          title="Speak"
        >
          🎤
        </button>
        <button
          onClick={() => {
            handleSend(input)
            setInput("")
          }}
          disabled={loading}
          className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
