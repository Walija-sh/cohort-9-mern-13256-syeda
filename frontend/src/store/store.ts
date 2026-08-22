import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import noteReducer from "@/store/noteSlice";
import folderReducer from "@/store/folderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: noteReducer,
    folders: folderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
