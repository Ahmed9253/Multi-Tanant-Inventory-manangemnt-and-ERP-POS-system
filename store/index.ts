"use client";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import businessReducer from "./business-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      business: businessReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
