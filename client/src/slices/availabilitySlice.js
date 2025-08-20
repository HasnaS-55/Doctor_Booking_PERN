import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchSlots = createAsyncThunk('availability/fetch', async ({ doctorId, date }, { rejectWithValue }) => {
  try { const { data } = await api.get(`/doctors/${doctorId}/availability`, { params: { date } }); return data; }
  
  catch (e) { return rejectWithValue('Failed'); }
});

const slice = createSlice({
  name: 'availability',
  initialState: { slots: [], status: 'idle' },
  reducers: { clearSlots: (s)=>{ s.slots=[]; } },
  extraReducers: (b) => {
    b.addCase(fetchSlots.fulfilled, (s,a)=>{ s.slots=a.payload; s.status='succeeded'; })
     .addCase(fetchSlots.pending, (s)=>{ s.status='loading'; })
     .addCase(fetchSlots.rejected, (s)=>{ s.status='failed'; });
  }
});
export const { clearSlots } = slice.actions;
export default slice.reducer;
