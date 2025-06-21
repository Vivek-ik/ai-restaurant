import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart, fetchCart } from "../store/cartSlice";
import { AddToCartFlow } from "../components/addToCartFlow/AddToCartFlow";

export default function Order() {
  const dispatch = useDispatch();

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

  const sendAIMessage = async (message: string) => {
    const res = await axios.post("http://localhost:5000/api/ai-order", {
      tableId: "1",
      message: message,
      lang: "en",
    });

    console.log("AI raw response:", res.data);

    const aiReply = typeof res.data.reply === "string" ? JSON.parse(res.data.reply) : res.data.reply;

    return {
      reply: aiReply.reply,
      intent: aiReply.intent,
      items: res.data.items || [],
    };
  };

  const handleSend = async (customInput: string) => {
    const text = customInput || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text, intent: "", items: [] }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendAIMessage(text);
      console.log("data111111111111", data);

      setMessages((prev) => [...prev, { from: "ai", text: data.reply, intent: data.intent, items: data.items }]);

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
    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.lang = "hi-IN";
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((v) => v.name.includes("Google UK") || v.lang === "en-IN") || null;

    // 🔑 wait for voices to load
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voicesNew = window.speechSynthesis.getVoices();
        utterance.voice = voicesNew.find((v) => v.name.includes("Google UK") || v.lang === "en-IN") || null;
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
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
            tableId: "1",  // or dynamically get tableId if needed
            menuItemId: id,
            quantity,
            customizations,
          })
        );
      }

      console.log("All items added to cart:", items);
      await dispatch(fetchCart("1")); // Refresh cart after all items added

    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 m-6 w-[300px] bg-white shadow-xl rounded-lg p-4 z-50">
      <h3 className="font-bold mb-2">Ask AI</h3>
      <div className="h-[300px] overflow-y-auto text-sm mb-2">
        {messages.map((msg, idx) => {
          console.log("Rendering message:", msg);

          return (
            <div key={idx} className={`mb-1 flex flex-col ${msg.from === "user" ? "text-right" : "text-left"}`}>
              <span className={msg.from === "user" ? "text-blue-600" : "text-green-600"}>
                {msg.text}
              </span>

              {/* If AI message has intent = order_item, show Add to Cart */}
              {msg.intent === "order_item" && msg.items?.length > 0 && (
                // <button
                //   className="bg-green-600 text-white px-2 py-1 rounded mt-1"
                //   onClick={() => handleAddToCart(msg.items)}
                // >
                //   Add to Cart
                // </button>

                <AddToCartFlow items={msg.items} />

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
