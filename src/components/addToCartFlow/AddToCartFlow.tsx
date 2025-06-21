import { useState } from "react";
import { useNavigate } from "react-router";
import { addToCart, clearCart, fetchCart } from "../../store/cartSlice";
import { useDispatch } from "react-redux";
import axios from "axios";

// Add this component below 👇
export function AddToCartFlow({ items }: any) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);

    // const cartItems = useSelector((state: any) => state.order.items);
    const [errorMessage, setErrorMessage] = useState("");
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
    const [isButtonDisable, setIsButtonDisable] = useState<boolean>(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const handleSubmit = async () => {
        // if (!selectedItem) return;
        // setIsPlacingOrder(true);

        const orderData = {
            tableNumber: "1", // Replace with real table context
            items: items
        };

        try {
            const res = await axios.post("http://localhost:5000/api/orders", orderData);
            console.log("Order placed:", res.data);
            dispatch(clearCart());
            navigate("/order-placed", { replace: true });
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.response?.data?.error || "Failed to place order.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    type CartItem = {
        id: string;
        quantity: number;
        customizations?: any;
    };
    
    const handleAddToCart = async (items: CartItem[]) => {
        // setIsButtonDisable(true);
        // setLoadingItemId(itemId)
    
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


    if (added) {
        return (
            <div className="mt-2">
                <p className="text-green-500">Item added to cart. Do you want to order anything else?</p>
                <div className="flex gap-2 mt-1">
                    {/* add table id  */}
                    <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => navigate(`/cart/${1}`)}>View Cart</button>
                    <button className="bg-orange-500 text-white px-2 py-1 rounded" onClick={() => handleSubmit()}
                    >Place Order</button>
                </div>
            </div>
        )
    }

    return (
        <button
            className={`bg-green-600 text-white px-2 py-1 rounded mt-1 ${loading ? "opacity-50" : ""}`}
            onClick={() => handleAddToCart(items)}
            disabled={loading}
        >
            {loading ? "Adding..." : "Add to Cart"}
        </button>
    );
}
