import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const doctorRegister = createAsyncThunk('doctor/register', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/doctors/auth/register', payload); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error || 'Error'); }
});

export const doctorLogin = createAsyncThunk('doctor/login', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/doctors/auth/login', payload); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.error || 'Error'); }
});

export const doctorMe = createAsyncThunk('doctor/me', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/doctors/auth/me'); return data; }
  catch (e) { return rejectWithValue(e); }
});

export const doctorLogout = createAsyncThunk('doctor/logout', async () => {
  await api.post('/doctors/auth/logout'); return true;
});

const slice = createSlice({
  name: 'authDoctor',
  initialState: { user: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(doctorRegister.fulfilled, (s,a)=>{ s.user=a.payload; })
     .addCase(doctorLogin.fulfilled, (s,a)=>{ s.user=a.payload; })
     .addCase(doctorMe.fulfilled, (s,a)=>{ s.user=a.payload; })
     .addCase(doctorLogout.fulfilled, (s)=>{ s.user=null; })
     .addMatcher((a)=>a.type.endsWith('/pending'), (s)=>{ s.status='loading'; s.error=null; })
     .addMatcher((a)=>a.type.endsWith('/fulfilled'), (s)=>{ s.status='succeeded'; })
     .addMatcher((a)=>a.type.endsWith('/rejected'), (s,a)=>{ s.status='failed'; s.error=a.payload; });
  }
});
export default slice.reducer;
