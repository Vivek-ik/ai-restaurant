import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart, fetchCart } from "../store/cartSlice";
import { AddToCartFlow } from "../components/addToCartFlow/AddToCartFlow";
import { useParams } from "react-router";
import { api } from "../api";
import { Item } from "./MainAiPage";
import { log } from "console";

type Message = {
  from: string;
  text: string;
  intent: string;
  items: any[];
  category?: Record<string, any>;
};

interface OrderProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function Order({ onClose, isOpen }: OrderProps) {
  const inputRef = useRef<HTMLInputElement>(null); // ⬅️ create ref

  const { tableId } = useParams();
  const [language, setLanguage] = useState("hi");
  console.log("language", language);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai", text: `👋 Namaste! Welcome to Bob's cafe. How can I help you today?
       Please select your language: हिंदी या English?`,
      intent: "", items: []
    }
  ]);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);


  // Load voices once
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();

      if (allVoices.length > 0) {
        console.log("✅ Voices loaded:", allVoices);

        // Optional: filter for Hindi voices only
        const hindiVoices = allVoices.filter((v) => v.lang === "hi-IN");
        setVoices(allVoices); // set full voices, or `hindiVoices` if only Hindi is needed
      } else {
        console.log("🕓 Voices not ready yet, waiting...");
      }
    };

    // First attempt to load
    loadVoices();

    // Attach listener for when voices become available
    window.speechSynthesis.onvoiceschanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      console.log("🔄 Voices loaded later:", updatedVoices);
      setVoices(updatedVoices);
    };

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);


  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Wait a short time to ensure modal animation/rendering finishes
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }
    setVoices(window.speechSynthesis.getVoices());

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
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

      // Live transcription
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
  }, [language]); // 👈 important to re-run when language changes

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

  const sendAIMessage = async (message: string, lang: string, history: any, lastAIItems: any) => {
    const res = await api.post("/api/ai-order", {
      tableId: tableId ?? "",
      message,
      lang,
      previousMessages: messages,
      suggestedItems: lastAIItems,
    },
      { timeout: 20000 }
    );
    console.log("AI response:", res);

    return {
      // reply: res.data.reply || "Didn't understand the qurey, please try again.",
      reply: res.data.reply || "Didn't understand the qurey. Please select a menu item or ask for help.",
      intent: res.data.intent,
      items: res.data.items || [],
      specialInstructions: res.data.specialInstructions || "",
      tableId: res.data.tableId || "1",
      itemsByCategory: res.data.itemsByCategory || {},
    };
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();

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
      speakResponse(data.reply);
      setItems(data.items || []);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { from: "ai", text: "❌ AI failed to respond. Try to ask anything else, e.g. order panner butter masala", intent: "", items: [] }]);
    } finally {
      setLoading(false);
    }
  };


  const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      if (voices.length > 0) return resolve(voices);

      const interval = setInterval(() => {
        voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          clearInterval(interval);
          resolve(voices);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        resolve([]); // fail-safe after 3s
      }, 2000);
    });
  };

  const removeEmojis = (text: string) => {
    // Regex removes most emoji ranges (works for Hindi + English text as well)
    return text.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)/g,
      ""
    );
  };

  const speakResponse = async (reply: string) => {
    try {
      const voices = await waitForVoices();

      const utterance = new SpeechSynthesisUtterance(removeEmojis(reply));
      utterance.volume = 1;
      utterance.pitch = 1;
      utterance.rate = 1;

      const hindiVoice =
        voices.find((v) => v.lang === "hi-IN" && v.name.includes("Google")) ||
        voices.find((v) => v.lang === "hi-IN");

      const englishVoice =
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang.startsWith("en"));

      const selectedVoice = language === "hi" ? hindiVoice : englishVoice;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        console.warn("⚠️ No suitable voice found for", language);
      }

      if (speechSynthesis.speaking || speechSynthesis.pending) {
        console.log("⛔ Cancelling previous speech");
        speechSynthesis.cancel();
        await new Promise((res) => setTimeout(res, 200));
      }

      speechSynthesis.speak(utterance);
      console.log("🎤 Speaking:", utterance.text);
    } catch (err) {
      console.error("❌ speakResponse error:", err);
    }
  };

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

            {/* ✅ Show language buttons only once, at the first AI message */}
            {msg.from === "ai" && idx === 0 && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 rounded border-2 transition-all duration-200 ${language === "en"
                    ? "bg-blue-600 border-blue-600 text-white font-semibold"
                    : "bg-white border-gray-300 text-gray-800 hover:bg-blue-100"
                    }`}
                >
                  English {language === "en" && "✅"}
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-3 py-1 rounded border-2 transition-all duration-200 ${language === "hi"
                    ? "bg-green-600 border-green-600 text-white font-semibold"
                    : "bg-white border-gray-300 text-gray-800 hover:bg-green-100"
                    }`}
                >
                  हिंदी {language === "hi" && "✅"}
                </button>
              </div>
            )}


            {/* {["menu_browsing", ""].includes(msg.intent ?? '') && msg.items.length > 0 && (() => {
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
            })()} */}
            {msg.intent === "order_item" && msg.items?.length > 0 && msg?.items?.[0] !== undefined && (
              <AddToCartFlow items={msg.items} tableId={tableId ?? ""} />
            )}
          </div>

        ))}

        {loading && (
          <div className="flex gap-1 text-gray-500 mt-2">
            <span className="animate-bounce">●</span>
            <span className="animate-bounce delay-150">●</span>
            <span className="animate-bounce delay-300">●</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <input
          ref={inputRef} // ⬅️ attach ref
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
        {/* <button
          onClick={handleMicClick}
          className={`px-3 py-1 rounded ${listening ? "bg-red-600" : "bg-gray-300"} text-white`}
          title="Speak"
        >
          🎤
        </button> */}
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
