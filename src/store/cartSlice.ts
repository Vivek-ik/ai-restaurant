import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (tableId: string) => {
    const res = await axios.get(`https://ai-restaurant-backend-production.up.railway.app/api/cart/${tableId}`);
    return res.data;
  }
);

interface AddToCartArgs {
  tableId: string;
  menuItemId: string;
  quantity: number;
  customizations?: any;
}

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ tableId, menuItemId }: { tableId: string; menuItemId: string }) => {
    const res = await axios.post("https://ai-restaurant-backend-production.up.railway.app/api/cart/remove", {
      tableId,
      menuItemId,
    });
    return res.data.cart;
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ tableId, menuItemId, quantity, customizations }: AddToCartArgs) => {
    const res = await axios.post("https://ai-restaurant-backend-production.up.railway.app/api/cart/add", {
      tableId,
      menuItemId,
      quantity,
      customizations,
    });
    return res.data.cart;
  }
);

export const removedFromCart = createAsyncThunk(
  "cart/removedFromCart",
  async ({ tableId, itemId }: { tableId: string; itemId: string }) => {
    const res = await axios.post(
      "https://ai-restaurant-backend-production.up.railway.app/api/cart/remove-cart-item",
      { tableId, itemId }
    );
    return res.data; // { items: [...] }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    fetchCartLoading: false,
    removeCartLoading: false,
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.fetchCartLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        // state.items = action.payload.items;
        state.fetchCartLoading = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.fetchCartLoading = false;
      })

      // Remove from  Cart items
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        // state.items = action.payload.items;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.loading = false;
      });
    // remove from cart

    builder
      .addCase(removedFromCart.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(removedFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.loading = false;
      })
      .addCase(removedFromCart.rejected, (state) => {
        state.loading = false;
      });
  },
});
export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
