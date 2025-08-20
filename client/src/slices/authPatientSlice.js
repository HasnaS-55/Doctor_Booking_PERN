import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

/** Register patient */
export const patientRegister = createAsyncThunk(
  'authPatient/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Registration failed');
    }
  }
);

/** Login (cookie-based). After login, fetch /auth/me to fill the store */
export const patientLogin = createAsyncThunk(
  'authPatient/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      await api.post('/auth/login', { email, password });   
      const { data } = await api.get('/auth/me');          
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Login failed');
    }
  }
);


export const patientMe = createAsyncThunk(
  'authPatient/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Me failed');
    }
  }
);


export const patientLogout = createAsyncThunk('authPatient/logout', async () => {
  await api.post('/auth/logout');
  return true;
});

const slice = createSlice({
  name: 'authPatient',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b
      // register
      .addCase(patientRegister.pending,   (s) => { s.status = 'loading'; s.error = null; })
      .addCase(patientRegister.fulfilled, (s) => { s.status = 'succeeded'; })
      .addCase(patientRegister.rejected,  (s,a) => { s.status = 'failed'; s.error = a.payload; })

      // login -> user filled from /auth/me
      .addCase(patientLogin.pending,      (s) => { s.status = 'loading'; s.error = null; })
      .addCase(patientLogin.fulfilled,    (s,a) => { s.status = 'succeeded'; s.user = a.payload; })
      .addCase(patientLogin.rejected,     (s,a) => { s.status = 'failed'; s.error = a.payload; s.user = null; })

      // me
      .addCase(patientMe.pending,         (s) => { s.status = 'loading'; s.error = null; })
      .addCase(patientMe.fulfilled,       (s,a) => { s.status = 'succeeded'; s.user = a.payload; })
      .addCase(patientMe.rejected,        (s,a) => { s.status = 'failed'; s.error = a.payload; s.user = null; })

      // logout
      .addCase(patientLogout.fulfilled,   (s) => { s.user = null; s.status = 'idle'; s.error = null; });
  },
});

export const { clearAuth } = slice.actions;
export default slice.reducer;
