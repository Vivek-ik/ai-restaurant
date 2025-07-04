import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import BackButton from "../backButton/BackButton";
import { useEffect, useState } from "react";
import CustomizationModal from "../customizationModal/CustomizationModal";
// import { dummyMenuItems } from "../../pages/MenuPage";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { addToCart, clearCart, fetchCart, removedFromCart, removeFromCart } from "../../store/cartSlice";
import { Loader } from "lucide-react";
import { api } from "../../api";


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
  note?: string;
};


export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tableId } = useParams();
  console.log("v", tableId);

  const { items } = useSelector((state: any) => state.cart);
  // const bacd = useSelector((state: any) => state.cart);
  const loading = useSelector((state: RootState) => state.cart.loading);

  const [modalOpen, setModalOpen] = useState(false);
  const [isRemoveCalled, setIsRemoveCalled] = useState(false);
  // const cartItems = useSelector((state: any) => state.order.items);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isButtonDisable, setIsButtonDisable] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [removingItemId, setRemovingItemId] = useState<string | null>(null);


  const [orders, setOrders] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // console.log("bacd", bacd);
  useEffect(() => {
    dispatch(fetchCart(tableId ?? ""));
  }, [dispatch, isRemoveCalled, tableId]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to fetch orders");
      } finally {
        // setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  console.log("selectedItem", selectedItem);

  const handleCustomizationChange = (option: string) => {
    setCustomizations((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleOpenModal = (item: any) => {
    setSelectedItem(item)
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsPlacingOrder(true);

    const orderData = {
      tableNumber: tableId,
      items: items,
    };

    try {
      const res = await api.post("/api/orders", orderData);
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

  const handleRemoveFromCart = async (itemId: string) => {
    console.log("68486bd3d4bb82a3cc00a94b", itemId);
    setIsButtonDisable(true);

    setLoadingItemId(itemId)
    await dispatch(
      removeFromCart({
        tableId: tableId ?? "",
        menuItemId: itemId,
      })
    );
    await dispatch(fetchCart(tableId ?? ""));

    setIsRemoveCalled(!isRemoveCalled);
    setIsButtonDisable(false);
  };

  const handleRemoveItemFromCart = async (tableId: string | undefined, itemId: string) => {
    setRemovingItemId(itemId);
    // setLoadingItemId(itemId)
    await dispatch(removedFromCart({ tableId: tableId ?? "", itemId }));
    await dispatch(fetchCart(tableId ?? ""));
    setRemovingItemId(null);

  };


  const handleAddToCart = async (itemId: string) => {
    setIsButtonDisable(true);
    setLoadingItemId(itemId)

    try {
      await dispatch(
        addToCart({
          tableId: tableId ?? "",
          menuItemId: itemId,
          quantity: 1,
          customizations: ["No Onion"],
        })
      );

      setIsButtonDisable(false);
      setIsRemoveCalled(!isRemoveCalled);
      // await dispatch(fetchCart("1")); // Refresh cart
    } catch (err) {
      console.error("Failed to add item:", err);

    }
  };


  return (
    <div className="max-w-2xl mx-auto mb-[70px]">
      <BackButton buttonText="Back to Menu" bgTransparent={true}/>
      <h2 className="bg-white text-lg font-semibold text-gray-800 dark:text-white px-4 pb-0">Your Order</h2>

      {items.length === 0 ? (
        <div>
          <p className="flex justify-center items-end text-gray-500 p-4 text-center bg-white h-[144px]">No items in your order.</p>
          <div className=" flex items-center justify-center p-4 bg-white">
            <img src="../../../public/images/empty-cart-photo.jpg" />

          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {items?.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            items.map((item: any) => {
              console.log("item._id", item);

              return (
                <div
                  key={item.menuItem._id}
                  className=" w-full gap-4 border rounded p-4 bg-white shadow-sm"
                >
                  <div>
                    <div className="flex flex-row justify-between">
                      <img
                        src={item.menuItem.image}
                        // alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <div className="ml-4 flex flex-col items-end flex-col">
                          <span className="text-lg pb-[5px] text-right font-semibold">{item?.menuItem?.itemName?.en}</span>
                          <p className="text-sm text-gray-600">₹{item?.menuItem?.price} × {item?.quantity}</p>
                           {item.customizations?.length > 0 && (
                            <div className="text-sm  py-2">
                              <span className="font-medium">Customizations:</span>{" "}
                              {item.customizations.join(", ")}
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-1">
                            <button
                              disabled={isButtonDisable}
                              onClick={() => handleRemoveFromCart(item.menuItem._id)}
                              className="w-6 h-6 flex items-center justify-center text-sm font-bold rounded-full bg-yellow-200 dark:bg-yellow-700 text-black dark:text-white hover:bg-yellow-300 transition"
                            >
                              -
                            </button>
                            <span className="text-sm w-[15px] font-semibold text-center"> {loading && item.menuItem._id === loadingItemId ? <Loader height={"15px"} width={"10px"} /> : item.quantity}</span>
                            <button
                              disabled={isButtonDisable}
                              onClick={() => handleAddToCart(item.menuItem._id)}
                              className="w-6 h-6 flex items-center justify-center text-sm font-bold rounded-full bg-yellow-200 dark:bg-yellow-700 text-black dark:text-white hover:bg-yellow-300 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="ml-4">
                          {/* {item.customizableOptions?.length > 0 && (
                          <p className="text-sm mt-1 text-gray-500 text-right">
                            Custom: {item.customizableOptions.join(", ")}
                          </p>
                        )} */}
                         
                        </div>
                      </div>
                    </div>

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

                      {item.customizableOptions && (
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
                        >
                          ✏️ Customize
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="w-[87%] fixed bottom-6 right-6 z-50">
          <button
            disabled={isPlacingOrder}
            className="w-full bg-black text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-primary-dark transition-all"
            onClick={() => handleSubmit()}
          >
            {isPlacingOrder ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Placing...
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
      // customizations={selectedCustomization}
      />
    </div>
  );
}
