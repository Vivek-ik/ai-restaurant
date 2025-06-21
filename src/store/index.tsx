import { configureStore } from "@reduxjs/toolkit";
import orderReducer from "./orderSlice";
import menuReducer from "./menuSlice";
import categoryReducer from "./categorySlice";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    order: orderReducer,
    menu: menuReducer,
    category: categoryReducer,
    cart: cartReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
