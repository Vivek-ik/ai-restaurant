import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { RootState } from "../store";
import { setMenuItems } from "../store/menuSlice";
import axios from "axios";
import { setCategories } from "../store/categorySlice";
// import { dummyMenuItems } from "./MenuPage";


const categoryImages: { [key: string]: string } = {
    "Main Course": "https://bpage.sgp1.digitaloceanspaces.com/1711704348154.png",
    "South Indian": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxbQ-DZHSLbhVMi9FU5DAjlEbSKT_8fJobyg&s",
    "Chinese": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqCOqdarAb2zDb8PCmudGtZsrERi26afV0ng&s",
    "Breads": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoeeTiTGKfH-TL3Q-O57gSh93kUL8alj55sw&s",
    "Dessert": "https://static.toiimg.com/thumb/63799510.cms?imgsize=1091643&width=800&height=800",
    "Beverages": "https://www.archanaskitchen.com/images/archanaskitchen/0-Affiliate-Articles/Indian_summer_drinks.jpg",
    "Appetizers": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv7mY6jbr957Pnd9wIi7c1H-Gop0hAeglgIQeaAyiuOtpHq9g0uMVXcocsr-KVZSDvwGo&usqp=CAU"
};


export default function MenuByCategory() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tableId } = useParams();
    console.log("tableId", tableId);

    const menuItems = useSelector((state: RootState) => state.menu.items);
    console.log("menuItems", menuItems);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const categories = useSelector((state: RootState) => state.category.items);
    console.log("categories from redux", categories);

    const categoryMap = Object.fromEntries(categories.map(cat => [cat._id, cat.name]));

    console.log("categories", categories);

    const itemsToDisplay = selectedCategory
        ? menuItems.filter((item) => item.category === selectedCategory)
        : [];

    const handleSimulatedScan = (category: any) => {
        console.log("category", category);

        setSelectedCategory(category)
        navigate(`/menu/${tableId}`, { state: { categoryName: category.name, categoryId: category._id } });
    };

    const getMenu = async () => {
        try {
            const res = await axios.get("https://ai-restaurant-backend-production.up.railway.app/api/orders/menu");
            // setMenuItemsLocal(res.data);  // Local state (optional)
            dispatch(setMenuItems(res.data)); // Redux global state
        } catch (error: any) {
            console.error("Error fetching menu", error);
        }
    };

    // inside Orders component
    const getCategories = async () => {
        try {
            const res = await axios.get("https://ai-restaurant-backend-production.up.railway.app/api/categories");
            dispatch(setCategories(res.data));
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    useEffect(() => {
        getMenu()
        getCategories();

    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-6">
            <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-10">
                🍽️ What would you like to eat today?
            </h2>

            {/* Category Grid */}
            {!selectedCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category: any) => {
                        console.log("category", category);

                        return (
                            <div
                                key={category._id}
                                onClick={() => handleSimulatedScan(category)}
                                className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg transform transition hover:scale-105 group"
                            >
                                <img
                                    src={categoryImages[category.name]}
                                    alt={category.name}
                                    className="w-full h-52 object-cover brightness-90"
                                />
                                <div className="absolute bg-black text-center bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent to-transparent p-4">
                                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                                </div>
                            </div>
                        )
                    })}

                </div>
            )}

            {/* Items Grid */}
            {selectedCategory && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            {/* <FaUtensils className="text-orange-500" /> */}
                            {selectedCategory}
                        </h3>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-orange-600 font-medium flex items-center gap-1 hover:underline"
                        >
                            {/* <FaArrowLeft /> */}
                            Back
                        </button>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {itemsToDisplay.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-5">
                                    <h4 className="font-bold text-xl text-gray-800">{item.name}</h4>
                                    <p className="text-gray-500 mt-1 text-sm">₹{item.price}</p>
                                    <button
                                        onClick={() => alert("Customize modal")}
                                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition"
                                    >
                                        Customize Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
