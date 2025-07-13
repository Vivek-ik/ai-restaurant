import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../api";

interface AddToCartArgs {
  tableId: string;
  menuItemId: string;
  quantity: number;
  customizations?: any;
}

// Fetch Cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (tableId: string) => {
    const res = await api.get(`/api/cart/${tableId}`);
    return res.data;
  }
);

// Remove Single Item
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ tableId, menuItemId }: { tableId: string; menuItemId: string }) => {
    const res = await api.post("/api/cart/remove", {
      tableId,
      menuItemId,
    });
    return res.data.cart;
  }
);

// Add Item to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({
    tableId,
    menuItemId,
    quantity,
    customizations,
  }: {
    tableId: string;
    menuItemId: string;
    quantity: number;
    customizations?: any;
  }) => {
    const res = await api.post("/api/cart/add", {
      
      tableId,
      menuItemId,
      quantity,
      customizations,
    });
    console.log("quantitywww", quantity)
    return res.data.cart;
  }
);

// Remove Entire Cart Item
export const removedFromCart = createAsyncThunk(
  "cart/removedFromCart",
  async ({ tableId, itemId }: { tableId: string; itemId: string }) => {
    const res = await api.post("/api/cart/remove-cart-item", {
      tableId,
      itemId,
    });
    return res.data;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    fetchCartLoading: false,
    addToCartLoading: false,
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
        state.addToCartLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        // state.items = action.payload.items;
        state.addToCartLoading = false;
      })
      .addCase(addToCart.rejected, (state) => {
        state.addToCartLoading = false;
      })

      // Remove from  Cart items
      .addCase(removeFromCart.pending, (state) => {
        state.removeCartLoading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        console.log("removeFromCart fulfilled", action);
        state.removeCartLoading = false;
      })
      .addCase(removeFromCart.rejected, (state) => {
        state.removeCartLoading = false;
      });

    // remove from cart
    builder
      .addCase(removedFromCart.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(removedFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        console.log("removedFromCart fulfilled", action);
        
        state.loading = false;
      })
      .addCase(removedFromCart.rejected, (state) => {
        state.loading = false;
      });
  },
});
export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
