import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import themeSlice from "./themeSlice.js";
import chatSlice from "./chatSlice.js";
import groupSlice from "./groupSlice.js";

const store = configureStore({
  reducer: {
    user: authSlice,
    theme: themeSlice,
    chat: chatSlice,
    groups: groupSlice,
  },
});

export default store;
