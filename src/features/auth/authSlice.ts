import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: SessionUser | null;
  /** True until Firebase reports the persisted session. Gates the splash. */
  initialising: boolean;
}

const initialState: AuthState = { user: null, initialising: true };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionResolved(state, action: PayloadAction<SessionUser | null>) {
      state.user = action.payload;
      state.initialising = false;
    },
    signedOut(state) {
      state.user = null;
      state.initialising = false;
    },
  },
});

export const { sessionResolved, signedOut } = authSlice.actions;
export default authSlice.reducer;
