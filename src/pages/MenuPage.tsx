import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/orderSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { setMenuItems } from "../store/menuSlice";
import { addToCart, fetchCart, removeFromCart } from "../store/cartSlice";
import { RootState } from "../store";
import { ArrowLeft, Loader } from "lucide-react";

export const dummyMenuItems = [
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
];


type CartItem = {
  menuItem: {
    _id: string;
    [key: string]: any;
  };
  quantity: number;
  [key: string]: any;
};

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { tableId } = useParams();
  const { categoryId, categoryName } = location.state || {};
  const { items } = useSelector((state: RootState) => state.cart);
  const loading = useSelector((state: RootState) => state.cart.loading);


  console.log("items", items);

  const [menuItemsLocal, setMenuItemsLocal] = useState<any[]>([]);
  const [itemsToDisplay, setItemsToDisplay] = useState<any[]>([]);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  console.log("itemsToDisplay", itemsToDisplay);


  const getMenu = async () => {
    try {
      const res = await axios.get("https://ai-restaurant-backend-production.up.railway.app/api/orders/menu");
      setMenuItemsLocal(res.data);  // Local state (optional)
      dispatch(setMenuItems(res.data)); // Redux global state
    } catch (error: any) {
      console.error("Error fetching menu", error);
    }
  };

  useEffect(() => {
    dispatch(fetchCart(tableId ?? ""));
  }, [dispatch, tableId]);

  useEffect(() => {
    getMenu()
  }, [])

  useEffect(() => {
    if (categoryId) {
      setItemsToDisplay(
        menuItemsLocal?.filter((item: any) => item.category === categoryId)
      );
    } else {
      setItemsToDisplay(menuItemsLocal);
    }
  }, [menuItemsLocal, categoryId]);



  const getCartItem = (itemId: string): CartItem | undefined => {
    return items.find((ci: CartItem) => ci.menuItem._id === itemId);
  };

  const handleRemoveFromCart = async (itemId: string) => {
    setLoadingItemId(itemId);

    try {
      await dispatch(
        removeFromCart({
          tableId: tableId ?? "",
          menuItemId: itemId,
        })
      );

      await dispatch(fetchCart(tableId ?? "")); // Refresh cart
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleAddToCart = async (itemId: string) => {
    console.log("handleAddToCart called with itemId:", itemId);
    setLoadingItemId(itemId);

    try {
      await dispatch(
        addToCart({
          tableId: tableId ?? "",
          menuItemId: itemId,
          quantity: 1,
          // customizations: ["No Onion"],
        })
      );

      await dispatch(fetchCart(tableId ?? "")); // Refresh cart
    } catch (err) {
      console.error("Failed to add item:", err);

    }
  };
  return (
    <>
      <PageMeta title={`Menu for Table ${tableId}`} description="Customer menu view" />
      <div className="flex items-center space-x-2 px-4 pt-4">
        <button
          onClick={() => navigate(`/categories/${tableId}`)}
          className="flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to categories
        </button>
      </div>
      <PageBreadcrumb pageTitle={`Menu - Table ${tableId}`} />
      <div className=" p-4">
        {itemsToDisplay.map((item: any) => {
          const cartItem = getCartItem(item._id);

          return (
            <div
              key={item._id}
              className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300 p-4 group h-[333px] mb-4"
            >
              {/* Item Image */}
              <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4">
                <img
                  src={item.image || '/default-dish.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Item Info */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{item.itemName.en}</h3>
                <span className="text-sm font-semibold text-yellow-500">₹{item.price}</span>
              </div>

              {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.category}</p> */}

              <div className="flex gap-2 flex-wrap mb-3">
                {item.tags.map((tag: any, idx: any) => (
                  <span
                    key={idx}
                    className="rounded-full bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1 text-xs text-yellow-800 dark:text-yellow-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {item.available ? (
                  cartItem ? (
                    <div className="flex w-full items-center justify-between bg-yellow-100 dark:bg-yellow-900/20 rounded-xl px-4 py-2">
                      {loading && item?._id === loadingItemId ?
                        <div className="flex items-center justify-center w-full h-full">
                          <Loader style={{ height: "32px" }} />
                        </div>
                        :
                        <>
                          <button
                            onClick={() => {
                              // dispatch(removeItem(item.id));
                              handleRemoveFromCart(item?._id)
                            }}
                            className="px-3 py-1 bg-yellow-300 dark:bg-yellow-700 text-black dark:text-white rounded-full hover:bg-yellow-400 dark:hover:bg-yellow-600 transition"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{cartItem?.quantity}</span>
                          <button
                            onClick={() => {
                              // dispatch(addItem(item));
                              handleAddToCart(item?._id)
                            }}
                            className="px-3 py-1 bg-yellow-300 dark:bg-yellow-700 text-black dark:text-white rounded-full hover:bg-yellow-400 dark:hover:bg-yellow-600 transition"
                          >
                            +
                          </button>
                        </>
                      }
                    </div>
                  ) : (
                    loading && item?._id === loadingItemId ?
                      <div className="flex items-center justify-center w-full h-full">
                        <Loader style={{ height: "32px" }} />
                      </div>
                      :
                      <button
                        onClick={() => {
                          dispatch(addItem(item));
                          handleAddToCart(item._id)
                        }}
                        className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md hover:from-yellow-600 hover:to-yellow-700 transition"
                      >
                        Add to Order
                      </button>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full rounded-xl px-4 py-2 text-sm font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="bg-black text-white px-6 py-3 rounded-full shadow-lg font-semibold text-sm hover:bg-primary-dark transition-all"
          onClick={() => navigate(`/cart/${tableId}`)}
        >
          Checkout
        </button>
      </div>

    </>
  );
};

export default Orders;
