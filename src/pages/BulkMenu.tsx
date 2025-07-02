// BulkUploader.tsx
import React, { useState } from "react";
import axios from "axios";
import { api } from "../api";

export default function BulkUploader() {
    const [jsonData, setJsonData] = useState(

        [
            {
                id: 1,
                name: "Paneer Butter Masala",
                price: 220,
                category: "Main Course",
                tags: ["Veg", "Spicy"],
                description: "Creamy and mildly spicy paneer curry made with tomato and butter.",
                image: "https://cdn.urbandart.com/cdn-cgi/imagedelivery/2MNxgsuI8U0tpsuIsD_ASA/ca15fb3f-ddb5-4c76-72a5-56f2deaf4b00/w=900,h=900,fit=cover",
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
                image: "https://cdn.urbandart.com/cdn-cgi/imagedelivery/2MNxgsuI8U0tpsuIsD_ASA/04489487-1e69-4e1c-b348-bc4994d61600/w=900,h=900,fit=cover",
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
                image: "https://cdn.urbandart.com/cdn-cgi/imagedelivery/2MNxgsuI8U0tpsuIsD_ASA/32e13b31-db4f-4369-2f0e-6a120e958100/w=900,h=900,fit=cover",
                available: false,
                customizableOptions: ["Spice Level", "Raita", "Extra Chicken"],
                allergens: ["Dairy"]
            },
            {
                id: 4,
                name: "Szechwan Noodles",
                price: 180,
                category: "Chinese",
                tags: ["Veg"],
                description: "Stir-fried noodles with crunchy vegetables and Indo-Chinese sauces.",
                image: "https://cdn.urbandart.com/cdn-cgi/imagedelivery/2MNxgsuI8U0tpsuIsD_ASA/9286c314-c594-43df-b10d-a98918945500/w=900,h=900,fit=cover",
                available: true,
                customizableOptions: ["Add Egg", "No Onion", "Extra Sauce"],
                allergens: ["Soy", "Wheat"]
            },
            {
                id: 5,
                name: "Murg Tikka Masala",
                price: 250,
                category: "Main Course",
                tags: ["Non-Veg", "Rich"],
                description: "Tender chicken cooked in buttery tomato cream sauce.",
                image: "https://cdn.urbandart.com/cdn-cgi/imagedelivery/2MNxgsuI8U0tpsuIsD_ASA/a65d0766-02b2-44dd-5c51-40554f1b4500/w=900,h=900,fit=cover",
                available: true,
                customizableOptions: ["Spice Level", "Extra Cream", "Boneless"],
                allergens: ["Dairy", "Nuts"]
            },
            {
                id: 6,
                name: "Butter Tandoori Roti",
                price: 25,
                category: "Breads",
                tags: ["Veg"],
                description: "Traditional Indian whole-wheat flatbread baked in a tandoor.",
                image: "https://www.cookwithmanali.com/wp-content/uploads/2021/07/Tandoori-Roti-500x500.jpg",
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
                image: "https://www.spiceupthecurry.com/wp-content/uploads/2020/08/gulab-jamun-recipe-2.jpg",
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
                image: "https://www.mrcoconut.in/img/products/23_10_2021_17_57_114_pm.webp",
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
                image: "https://www.chefkunalkapur.com/wp-content/uploads/2021/05/Veg-spring-rolls-1300x867.jpg?v=1620580103",
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
                image: "https://cooktogether.com/pinpics/uploads/2015/05/IMG_1484.jpg",
                available: true,
                customizableOptions: ["Spice Level", "Tartar Sauce", "Boneless"],
                allergens: ["Fish", "Mustard"]
            },
        ]
    );
    const [message, setMessage] = useState("");

    const handleUpload = async () => {
        try {
            const res = await api.post("/api/menu-items/bulk-insert", jsonData);
            setMessage(`✅ Inserted ${res.data.data.length} items successfully`);
        } catch (error: any) {
            setMessage(`❌ Error: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto bg-white shadow rounded mt-10">
            <h2 className="text-xl font-bold mb-4">Bulk Menu Item Uploader</h2>
            <textarea
                rows={10}
                className="w-full border p-2 rounded text-sm font-mono"
                placeholder='Paste JSON here...'
                // value={jsonData}
                onChange={(e: any) => setJsonData(e.target.value)}
            />
            <button
                onClick={handleUpload}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Upload Menu Items
            </button>
            {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
    );
}
