import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart, fetchCart } from "../store/cartSlice";
import { AddToCartFlow } from "../components/addToCartFlow/AddToCartFlow";
import { useParams } from "react-router";
import { api } from "../api";

export default function Order({ onClose }: any) {
  const dispatch = useDispatch();
  const { tableId } = useParams(); // So we can navigate back with the right tableId
  const [language, setLanguage] = useState("en"); // default English

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);

    console.log("Language switched to:", lang);
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{
    items: any[];
    intent: string;
    from: "user" | "ai";
    text: string;
  }[]>([
    {
      from: "ai", text: `👋 Namaste! Welcome to Shrimaya. How can I help you today?
       Please select your language: हिंदी या English?`,
      intent: "",
      items: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldSpeakRef = useRef(false); // Track if AI should reply in voice
  console.log("messages", messages);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => console.log("🎙️ Speech recognition started");
    recognition.onaudiostart = () => console.log("🎧 Audio capturing started");
    recognition.onend = () => {
      console.log("Speech recognition ended");
      setListening(false);
    };
    recognition.onerror = (e: any) => console.error("Speech recognition error", e);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("📝 Recognized:", transcript);
      shouldSpeakRef.current = true;
      handleSend(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };
  const sendAIMessage = async (message: string, lang: string) => {
    const res = await api.post("/api/ai-order", {
      tableId: tableId ?? "",
      message: message,
      lang: language,
    });

    console.log("AI raw response:", res.data);

    return {
      reply: res.data.reply || "No reply received",
      intent: res.data.intent,
      items: res.data.items || [],
      specialInstructions: res.data.specialInstructions || "",
      tableId: res.data.tableId || "1",
    };
  };
  const handleSend = async (customInput: string) => {
    const text = customInput || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text, intent: "", items: [] }]);
    setInput("");
    setLoading(true);

    try {

      const data = await sendAIMessage(text, language);
      console.log("data111111111111", data);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: data?.reply || "Internet issue, please try again.",
          intent: data?.intent || "",
          items: Array.isArray(data?.items) ? data.items : []
        }
      ]);
      if (shouldSpeakRef.current) {
        speakResponse(data.reply);
        shouldSpeakRef.current = false;
      }
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [...prev, { from: "ai", text: "❌ AI failed to respond.", intent: "", items: [] }]);
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (reply: string) => {
    console.log("🗣️ Speaking:", reply);

    try {
      const utterance = new SpeechSynthesisUtterance(reply);

      const voices = window.speechSynthesis.getVoices();
      console.log("Available voices:", voices);

      // Select the best matching voice
      const selectedVoice = voices.find(
        (v) =>
          v.name.includes("Google UK") ||
          v.name.includes("Heera") ||
          v.lang === "hi-IN" ||
          v.lang === "en-IN"
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang; // important: match voice language
        console.log("Selected voice:", selectedVoice);
      } else {
        console.warn("No suitable voice found.");
      }

      // Safe volume setting
      utterance.volume = 1;
      utterance.pitch = 1;
      utterance.rate = 1;

      utterance.onstart = () => console.log("Speech started");
      utterance.onend = () => console.log("Speech ended");
      utterance.onerror = (e) => console.error("Speech error", e);

      // Cancel any previous speech first
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (err) {
      console.error("❌ Error in speakResponse:", err);
    }
  };




  const handleAddToCart = async (items: any[]) => {
    console.log("Adding items to cart:", items);

    try {
      for (const item of items) {
        console.log("itemitemitemitemitem", item);

        const { id, quantity, customizations } = item;

        await dispatch(
          addToCart({
            tableId: tableId ?? "",  // or dynamically get tableId if needed
            menuItemId: id,
            quantity,
            customizations,
          })
        );
      }

      console.log("All items added to cart:", items);
      await dispatch(fetchCart(tableId ?? "")); // Refresh cart after all items added

    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  return (
    <div className="fixed bottom-0  m-6 w-[335px] bg-white shadow-xl rounded-lg p-4 h-[85%] w-[85%]">
      <button
        onClick={onClose}
        className="absolute top-2 right-4 text-gray-600 hover:text-black text-lg"
      >
        ✖
      </button>

      <h3 className="font-bold mb-2">Ask AI</h3>
      <div className="h-[85%] overflow-y-auto text-sm mb-2">
        {messages.map((msg, idx) => {
          console.log("Rendering message:", msg);

          return (
            <div key={idx} className={`mb-1 flex flex-col ${msg.from === "user" ? "text-right" : "text-left"}`}>
              <span className={msg.from === "user" ? "text-blue-600" : "text-green-600"}>
                {msg.text}
                {msg.items.map((item) => (
                  <div>{item.name.en}</div>
                ))}
              </span>

              {/* <div className="mb-4 flex justify-center space-x-2">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`px-4 py-2 rounded ${language === "en" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("hi")}
                  className={`px-4 py-2 rounded ${language === "hi" ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
                  Hindi
                </button>
              </div> */}
              {/* If AI message has intent = order_item, show Add to Cart */}
              {msg.intent === "order_item" && msg.items?.length > 0 && (


                <AddToCartFlow items={msg.items} tableId={tableId ?? ""} />

              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="w-full flex-1 border px-2 py-1 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
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
            shouldSpeakRef.current = false; // If using text input, no speech reply
            handleSend(input);
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
