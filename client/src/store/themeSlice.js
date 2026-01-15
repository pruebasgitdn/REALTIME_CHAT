import { createSlice } from "@reduxjs/toolkit";

const initialTheme = localStorage.getItem("theme") || "abyss";

const themeSlice = createSlice({
  name: "theme",
  initialState: { theme: initialTheme },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toogleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { toogleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
