// store/menuSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  tags?: string[];
  description?: string;
  image?: string;
  available?: boolean;
  customizableOptions?: string[];
  allergens?: string[];
}

interface MenuState {
  items: MenuItem[];
}

const initialState: MenuState = {
  items: [],
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setMenuItems } = menuSlice.actions;
export default menuSlice.reducer;
