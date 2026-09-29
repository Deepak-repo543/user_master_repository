import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/user-slice";
import userFilterReducer from "./slices/user-filter-slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    userFilter: userFilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;