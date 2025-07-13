import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import BackButton from "../backButton/BackButton";
import { useEffect, useState } from "react";
import CustomizationModal from "../customizationModal/CustomizationModal";
import { useNavigate, useParams } from "react-router";
import {
  addToCart,
  clearCart,
  removedFromCart,
  removeFromCart,
  fetchCart,
} from "../../store/cartSlice";
import { Loader } from "lucide-react";
import { api } from "../../api";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tableId } = useParams();

  const { items } = useSelector((state: any) => state.cart);
  console.log("items", items);
  
  const loading = useSelector((state: RootState) => state.cart.loading);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [localCartMap, setLocalCartMap] = useState<Record<string, number>>({});
  useEffect(() => {
    dispatch(fetchCart(tableId ?? ""));
  }, [tableId]);

  useEffect(() => {
    const quantityMap: Record<string, number> = {};
    items.forEach((item: any) => {
      quantityMap[item.menuItem._id] = item.quantity;
    });
    setLocalCartMap(quantityMap);
  }, [items]);

  const handleAddToCart = async (item: any) => {
    const id = item.menuItem._id;
    setLoadingItemId(id);
    try {
      await dispatch(
        addToCart({
          tableId: tableId ?? "",
          menuItemId: id,
          quantity: 1,
        })
      );
      setLocalCartMap((prev) => ({
        ...prev,
        [id]: (prev[id] || item.quantity) + 1,
      }));
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemoveFromCart = async (item: any) => {
    const id = item.menuItem._id;
    setLoadingItemId(id);
    try {
      await dispatch(
        removeFromCart({
          tableId: tableId ?? "",
          menuItemId: id,
        })
      );
      setLocalCartMap((prev) => ({
        ...prev,
        [id]: Math.max((prev[id] || item.quantity) - 1, 0),
      }));
    } catch (err) {
      console.error("Remove from cart failed", err);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleRemoveItemFromCart = async (tableId: string | undefined, itemId: string, decrement = false) => {
    if (decrement) {
      await dispatch(removedFromCart({ tableId: tableId ?? "", itemId }));
      await dispatch(fetchCart(tableId ?? ""));
    } else {
      setRemovingItemId(itemId);
      await dispatch(removedFromCart({ tableId: tableId ?? "", itemId }));
      setLoadingItemId(itemId)
      await dispatch(fetchCart(tableId ?? ""));
      setRemovingItemId(null);

    }

  };
  return (
    <div className="max-w-2xl mx-auto mb-[70px] p-2">
      <BackButton buttonText="Back to Menu" bgTransparent={true} />
      <h2 className="bg-transparent text-lg font-semibold text-gray-800 dark:text-white px-4 pb-0">Your Order</h2>
      {items.length === 0 ? (
        <p className="bg-transparent max-w-2xl mx-auto mb-[70px] p-2 text-center mt-4 text-gray-500">No items in your order.</p>
      ) : (
        <div className="space-y-4 p-4">
          {items.map((item: any) => {
            const id = item.menuItem._id;
            const quantity = localCartMap[id] ?? item.quantity;
            const isLoading = loadingItemId === id;

            return (
              <div key={id} className="w-full gap-4 border rounded p-4 bg-white shadow-sm">
                <div className="flex flex-row justify-between">
                  <img src={item.menuItem.image} className="w-20 h-20 object-cover rounded" />
                  <div className="ml-4 flex flex-col items-end">
                    <span className="text-lg pb-[5px] font-semibold">{item.menuItem.itemName?.en}</span>
                    <p className="text-sm text-gray-600">₹{item.menuItem.price} × {quantity}</p>
                    {/* buttons */}
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button
                        onClick={() => quantity > 1 ? handleRemoveFromCart(item) : handleRemoveItemFromCart(tableId, item.menuItem._id, true)}
                        className="w-6 h-6 bg-yellow-200 text-black rounded-full font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm w-[15px] font-semibold text-center">
                        {isLoading ? "..." : quantity}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-6 h-6 bg-yellow-200 text-black rounded-full font-bold"
                      >
                        +
                      </button>
                    </div>

                  </div>
                </div>
                {/* remove */}
                <div className="flex flex-row sm:flex-row gap-3 mt-2">
                  <button
                    disabled={removingItemId === item.menuItem._id}
                    onClick={() => {
                      // dispatch(removeItem(item.id));
                      // handleRemoveFromCart(item.menuItem._id)
                      handleRemoveItemFromCart(tableId, item.menuItem._id);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    {removingItemId === item.menuItem._id ? (
                      <span className="flex items-center justify-center">
                        <Loader height="16px" width="16px" />
                      </span>
                    ) : (
                      `🗑 Remove`
                    )}
                  </button>

                  {/* {item.customizableOptions && (
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
                        >
                          ✏️ Customize
                        </button>
                      )} */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="w-[87%] fixed bottom-6 right-6 z-50">
          <button
            disabled={isPlacingOrder}
            className="w-full bg-black text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-primary-dark transition-all"
            onClick={async () => {
              setIsPlacingOrder(true);
              try {
                await api.post("/api/orders", { tableNumber: tableId, items });
                dispatch(clearCart());
                navigate(`/order-placed/${tableId}`, { replace: true });
              } catch (error) {
                console.error("Order placement failed", error);
              } finally {
                setIsPlacingOrder(false);
              }
            }}
          >
            {isPlacingOrder ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin h-4 w-4" /> Placing...
              </div>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      )}

      <CustomizationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}
