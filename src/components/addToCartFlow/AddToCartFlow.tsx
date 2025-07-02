import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, clearCart, fetchCart, removeFromCart } from "../../store/cartSlice";
import axios from "axios";
import { API_URL } from "../../config";

type ItemType = {
    id: string;
    name: { en: string; hi?: string };
    price: number;
    quantity?: number;
};

export function AddToCartFlow({ items, tableId }: { items: ItemType[]; tableId: string }) {
    const [quantities, setQuantities] = useState(() =>
        items.reduce((acc, item) => {
            acc[item.id] = item.quantity || 1;
            return acc;
        }, {} as Record<string, number>)
    );

    const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleAddToCart = async (item: ItemType) => {
        const quantity = quantities[item.id] || 1;
        setLoadingItemId(item.id);

        try {
            await dispatch(
                addToCart({
                    tableId,
                    menuItemId: item.id,
                    quantity,
                    customizations: [],
                })
            );
            setAddedItems((prev) => ({ ...prev, [item.id]: true }));
        } catch (err) {
            console.error("Add to cart error:", err);
        } finally {
            setLoadingItemId(null);
        }
    };

    const handleIncrement = async (item: ItemType) => {
        const newQty = (quantities[item.id] || 1) + 1;
        setQuantities((prev) => ({ ...prev, [item.id]: newQty }));
        await handleAddToCart({ ...item, quantity: newQty });
    };

    const handleDecrement = async (item: ItemType) => {
        const currentQty = quantities[item.id] || 1;
        if (currentQty <= 1) return;

        setQuantities((prev) => ({ ...prev, [item.id]: currentQty - 1 }));

        setLoadingItemId(item.id);
        try {
            await dispatch(
                removeFromCart({
                    tableId,
                    menuItemId: item.id,
                })
            );
            await dispatch(fetchCart(tableId));
        } catch (err) {
            console.error("Remove failed", err);
        } finally {
            setLoadingItemId(null);
        }
    };

    const handleSubmitOrder = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/orders`, {
                tableNumber: tableId,
                items: items.map((item) => ({
                    id: item.id,
                    quantity: quantities[item.id],
                })),
            });

            console.log("Order placed:", res.data);
            dispatch(clearCart());
            navigate("/order-placed", { replace: true });

        } catch (error: any) {
            console.error("Order failed:", error.response?.data || error.message);
        }
    };

    return (
        <div className="space-y-2 mt-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex justify-between items-center border p-2 rounded-md shadow-sm"
                >
                    <div>
                        <p className="font-semibold">{item.name.en}</p>
                        <p className="text-sm text-gray-600">₹{item.price}</p>
                    </div>

                    {addedItems[item.id] ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDecrement(item)}
                                className="w-6 h-6 bg-yellow-200 text-black rounded-full font-bold"
                                disabled={loadingItemId === item.id}
                            >
                                –
                            </button>
                            <span className="w-6 text-center font-medium">
                                {loadingItemId === item.id ? "..." : quantities[item.id]}
                            </span>
                            <button
                                onClick={() => handleIncrement(item)}
                                className="w-6 h-6 bg-yellow-200 text-black rounded-full font-bold"
                                disabled={loadingItemId === item.id}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleAddToCart(item)}
                            disabled={loadingItemId === item.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                            {loadingItemId === item.id ? "Adding..." : "Add to Cart"}
                        </button>
                    )}
                </div>
            ))}

            {Object.keys(addedItems).length > 0 && (
                <div className="flex justify-between gap-3 pt-2">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                        onClick={() => navigate(`/cart/${tableId}`)}
                    >
                        View Cart
                    </button>
                    <button
                        className="bg-orange-500 text-white px-4 py-2 rounded w-full"
                        onClick={handleSubmitOrder}
                    >
                        Place Order
                    </button>
                </div>
            )}

        </div>
    );
}
