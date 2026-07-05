import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  sidebarOpen: false,
  searchOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
  },
});

export const { toggleSidebar, toggleSearch } = uiSlice.actions;
export default uiSlice.reducer;
