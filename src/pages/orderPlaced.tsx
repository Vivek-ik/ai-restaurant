import { useNavigate, useParams } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";
import { CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearOrder } from "../store/orderSlice";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function OrderPlaced() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tableId } = useParams();
  const [menuItemsLocal, setMenuItemsLocal] = useState<any[]>([]);
  console.log("Order Placed Page Rendered", menuItemsLocal);

  useEffect(() => {
    getMenu();
  }, [])

  const getMenu = async () => {
    try {
      const res = await api.get("/api/orders/");
      setMenuItemsLocal(res.data); // Local state only
      // dispatch(setMenuItems(res.data)); // Optional Redux usage
    } catch (error: any) {
      console.error("Error fetching menu", error);
    }
  };

  return (
    <>
      <PageMeta title="Order Placed" description="Confirmation of your recent order" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 pb-1 bg-gray-50 dark:bg-black">
        <div className="max-w-md w-full bg-white dark:bg-white/[0.05] shadow-md rounded-2xl p-6 space-y-6 text-center">
          <CheckCircle className="mx-auto text-green-500" size={60} />

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Order Placed Successfully!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Thank you for your order. Your delicious food will arrive shortly.
          </p>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left space-y-2 text-sm">
            <p><span className="font-semibold">Order ID:</span> #123456</p>
            <p><span className="font-semibold">Table:</span> 1</p>
            <p><span className="font-semibold">Estimated Time:</span> 20-25 mins</p>
            <p><span className="font-semibold">Status:</span> Preparing</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                dispatch(clearOrder())
                navigate(`/menu/${tableId}`)
              }}
              className="w-full py-2 rounded-lg bg-black text-white font-medium hover:bg-opacity-90 transition"
            >
              Order More
            </button>
            {/* <button
              onClick={() => {
                dispatch(clearOrder())
                navigate("/cart/1")
              }}
              className="w-full py-2 rounded-lg bg-black text-white font-medium hover:bg-opacity-90 transition"
            >
              View Cart
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
