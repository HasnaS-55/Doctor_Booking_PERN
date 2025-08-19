import { configureStore } from '@reduxjs/toolkit';
import authPatient from '../slices/authPatientSlice';
import authDoctor from '../slices/authDoctorSlice';
import availability from '../slices/availabilitySlice';
import appointments from '../slices/appointmentsSlice';

export const store = configureStore({
  reducer: { authPatient, authDoctor, availability, appointments }
});
