import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { addItem } from "../../store/orderSlice";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  tags: string[];
  description: string;
  image: string;
  available: boolean;
  customizableOptions: string[];
  allergens: string[];
  note?: string; // Allow custom note
};

const dummyMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Paneer Butter Masala",
    price: 220,
    category: "Main Course",
    tags: ["Veg", "Spicy"],
    description: "Creamy and mildly spicy paneer curry made with tomato and butter.",
    image: "/images/paneer-butter-masala.jpg",
    available: true,
    customizableOptions: ["Spice Level", "Extra Butter", "Paneer Quantity"],
    allergens: ["Dairy", "Nuts"]
  },
  {
    id: 2,
    name: "Masala Dosa",
    price: 150,
    category: "South Indian",
    tags: ["Veg", "Gluten-Free"],
    description: "Crispy fermented rice pancake filled with spiced potato filling.",
    image: "/images/masala-dosa.jpg",
    available: true,
    customizableOptions: ["Extra Chutney", "Less Oil", "No Ghee"],
    allergens: ["Mustard Seeds"]
  },
  {
    id: 3,
    name: "Chicken Biryani",
    price: 280,
    category: "Main Course",
    tags: ["Non-Veg", "Spicy"],
    description: "Aromatic basmati rice cooked with marinated chicken and Indian spices.",
    image: "/images/chicken-biryani.jpg",
    available: false,
    customizableOptions: ["Spice Level", "Raita", "Extra Chicken"],
    allergens: ["Dairy"]
  },
  {
    id: 4,
    name: "Hakka Noodles",
    price: 180,
    category: "Chinese",
    tags: ["Veg"],
    description: "Stir-fried noodles with crunchy vegetables and Indo-Chinese sauces.",
    image: "/images/hakka-noodles.jpg",
    available: true,
    customizableOptions: ["Add Egg", "No Onion", "Extra Sauce"],
    allergens: ["Soy", "Wheat"]
  },
  {
    id: 5,
    name: "Butter Chicken",
    price: 250,
    category: "Main Course",
    tags: ["Non-Veg", "Rich"],
    description: "Tender chicken cooked in buttery tomato cream sauce.",
    image: "/images/butter-chicken.jpg",
    available: true,
    customizableOptions: ["Spice Level", "Extra Cream", "Boneless"],
    allergens: ["Dairy", "Nuts"]
  },
  {
    id: 6,
    name: "Tandoori Roti",
    price: 25,
    category: "Breads",
    tags: ["Veg"],
    description: "Traditional Indian whole-wheat flatbread baked in a tandoor.",
    image: "/images/tandoori-roti.jpg",
    available: true,
    customizableOptions: ["Butter", "Crispy"],
    allergens: ["Wheat"]
  },
  {
    id: 7,
    name: "Gulab Jamun",
    price: 90,
    category: "Dessert",
    tags: ["Veg", "Sweet"],
    description: "Soft, deep-fried milk balls soaked in cardamom-scented sugar syrup.",
    image: "/images/gulab-jamun.jpg",
    available: true,
    customizableOptions: ["Extra Syrup", "Warm"],
    allergens: ["Dairy"]
  },
  {
    id: 8,
    name: "Cold Coffee",
    price: 120,
    category: "Beverages",
    tags: ["Veg", "Cold"],
    description: "Chilled coffee blended with milk and ice cream.",
    image: "/images/cold-coffee.jpg",
    available: true,
    customizableOptions: ["No Sugar", "Extra Ice Cream", "Strong Coffee"],
    allergens: ["Dairy"]
  },
  {
    id: 9,
    name: "Spring Rolls",
    price: 110,
    category: "Appetizers",
    tags: ["Veg", "Crispy"],
    description: "Crispy fried rolls filled with mixed vegetables and Asian spices.",
    image: "/images/spring-rolls.jpg",
    available: true,
    customizableOptions: ["Extra Sauce", "No Garlic"],
    allergens: ["Wheat", "Soy"]
  },
  {
    id: 10,
    name: "Fish Fry",
    price: 240,
    category: "Appetizers",
    tags: ["Non-Veg", "Spicy"],
    description: "Crispy, spicy fried fish served with chutney.",
    image: "/images/fish-fry.jpg",
    available: true,
    customizableOptions: ["Spice Level", "Tartar Sauce", "Boneless"],
    allergens: ["Fish", "Mustard"]
  },
];

const CustomizationPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: any) => state.order.items);
  console.log("cartItems", cartItems);

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");

  const selectedItem = cartItems.find((ci: any) => dummyMenuItems[ci.id]);

  useEffect(() => {
    if (selectedItem) {
      // Simulate AI suggestions
      setTimeout(() => {
        setAiSuggestions([
          `Add extra spice to ${selectedItem.name}`,
          `Pair with Butter Naan`,
          `Customer favorites: Jeera Rice with ${selectedItem.name}`,
        ]);
      }, 1000);
    }
  }, [selectedItem]);

  const handleAddCustomizedItem = () => {
    dispatch(addItem({ ...(selectedItem as MenuItem), note: customNote } as MenuItem));
    // navigate("/menu");
  };

  if (!selectedItem) return <div>Item not found</div>;

  return (
    <div className="p-2 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-primary mb-4">← Back to Menu</button>
      <h2 className="text-2xl font-bold mb-2">Customize: {selectedItem.name}</h2>
      <p className="text-gray-600 mb-4">Price: ₹{selectedItem.price}</p>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Special instructions</label>
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Add extra cheese, no onions, etc."
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">AI Suggestions:</h4>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          {aiSuggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>

      <button
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        onClick={handleAddCustomizedItem}
      >
        Add to Order
      </button>
    </div>
  );
};

export default CustomizationPage;
