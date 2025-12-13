// src/redux/reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/authSlice.js';
import themeReducer from './features/themeSlice.js';

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
});

export type RootReducer = ReturnType<typeof rootReducer>;
