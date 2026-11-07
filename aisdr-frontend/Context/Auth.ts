// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: any | null
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
    }
  }
});

// Export actions
export const {
  setToken,
  setUser
} = authSlice.actions;

export default authSlice.reducer;