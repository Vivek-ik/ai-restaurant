// store/categorySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Category {
  _id: string;
  name: string;
}

interface CategoryState {
  items: Category[];
}

const initialState: CategoryState = {
  items: [],
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
    },
  },
});

export const { setCategories } = categorySlice.actions;
export default categorySlice.reducer;
