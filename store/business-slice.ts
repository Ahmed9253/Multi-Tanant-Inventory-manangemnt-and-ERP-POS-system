import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BusinessState {
  currentBusinessId: string | null;
  currentStoreId: string | null;
  businesses: Array<{ id: string; name: string; currency: string }>;
  stores: Array<{ id: string; name: string; code: string }>;
}

const initialState: BusinessState = {
  currentBusinessId: null,
  currentStoreId: null,
  businesses: [],
  stores: [],
};

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    setCurrentBusiness(state, action: PayloadAction<string | null>) {
      state.currentBusinessId = action.payload;
    },
    setCurrentStore(state, action: PayloadAction<string | null>) {
      state.currentStoreId = action.payload;
    },
    setBusinesses(
      state,
      action: PayloadAction<Array<{ id: string; name: string; currency: string }>>
    ) {
      state.businesses = action.payload;
    },
    setStores(
      state,
      action: PayloadAction<Array<{ id: string; name: string; code: string }>>
    ) {
      state.stores = action.payload;
    },
  },
});

export const { setCurrentBusiness, setCurrentStore, setBusinesses, setStores } =
  businessSlice.actions;
export default businessSlice.reducer;
