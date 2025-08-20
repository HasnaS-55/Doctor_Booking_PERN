import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

/**
 * Patient creates an appointment
 * POST /api/appointments
 */
export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { doctor_id, description, date, time } = payload;
      const { data } = await api.post('/appointments', { doctor_id, description, date, time });
      return data; 
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Failed to create appointment');
    }
  }
);

/**
 * Patient: my appointments
 * GET /api/appointments/mine
 */
export const myAppointments = createAsyncThunk(
  'appointments/mine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/appointments/mine');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Failed to load appointments');
    }
  }
);

/**
 * Doctor: list appointments
 * GET /api/doctor/appointments?status=&from=&to=
 */
export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/doctorList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/doctor/appointments', { params });
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Failed to load doctor appointments');
    }
  }
);


export const doctorAppointments = fetchDoctorAppointments;

/**
 * Doctor: update appointment status
 * PATCH /api/doctor/appointments/:id { status: 'confirmed'|'rejected' }
 */
export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/doctor/appointments/${id}`, { status });
      
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.error || 'Failed to update status');
    }
  }
);

const initialState = {
  mine: [],        // patient view
  doctorList: [],  // doctor view
  status: 'idle',
  error: null,
};

const slice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    
    b.addCase(createAppointment.fulfilled, (s, a) => {
      
      s.mine = [a.payload, ...s.mine];
    });

    // Patient list
    b.addCase(myAppointments.fulfilled, (s, a) => {
      s.mine = a.payload || [];
    });

    // Doctor list
    b.addCase(fetchDoctorAppointments.fulfilled, (s, a) => {
      s.doctorList = a.payload || [];
    });

    // Update status (affects both views if present)
    b.addCase(updateAppointmentStatus.fulfilled, (s, a) => {
      const updated = a.payload;
      const id = updated?.id;

      if (!id) return;

      const upd = (arr) => arr.map((x) => (x.id === id ? { ...x, ...updated } : x));

      s.doctorList = upd(s.doctorList);
      s.mine = upd(s.mine);
    });

    // Generic status flags
    b.addMatcher((a) => a.type.startsWith('appointments/') && a.type.endsWith('/pending'), (s) => {
      s.status = 'loading';
      s.error = null;
    });

    b.addMatcher((a) => a.type.startsWith('appointments/') && a.type.endsWith('/fulfilled'), (s) => {
      s.status = 'succeeded';
    });

    b.addMatcher((a) => a.type.startsWith('appointments/') && a.type.endsWith('/rejected'), (s, a) => {
      s.status = 'failed';
      s.error = a.payload || a.error?.message || 'Error';
    });
  },
});

export default slice.reducer;
