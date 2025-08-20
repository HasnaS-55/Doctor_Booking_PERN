import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSlots } from '../slices/availabilitySlice';
import { createAppointment } from '../slices/appointmentsSlice';
import { patientMe } from '../slices/authPatientSlice';
import {
  Stethoscope,
  MapPin,
  CalendarDays,
  Clock,
  AlignLeft,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

function initials(first = '', last = '') {
  const a = (first[0] || '').toUpperCase();
  const b = (last[0] || '').toUpperCase();
  return (a + b) || 'DR';
}

export default function Book() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const { slots = [], status: slotsStatus } = useSelector((s) => s.availability || {});
  const { status: apptStatus } = useSelector((s) => s.appointments || {});
  const dispatch = useDispatch();
  const nav = useNavigate();

  useEffect(() => { api.get(`/doctors/${doctorId}`).then((r) => setDoctor(r.data)); }, [doctorId]);
  useEffect(() => { dispatch(fetchSlots({ doctorId, date })); }, [doctorId, date, dispatch]);
  useEffect(() => { dispatch(patientMe()); }, [dispatch]);

  const submitting = apptStatus === 'loading';
  const loadingSlots = slotsStatus === 'loading';
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const submit = async () => {
    const r = await dispatch(createAppointment({ doctor_id: doctorId, description, date, time }));
    if (r.meta.requestStatus === 'fulfilled') nav('/dashboard/patient');
  };

  if (!doctor) return null;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back */}
        <div>
          <Link to="/dashboard/patient" className="inline-flex items-center gap-2 text-sm text-[#246AFE] hover:underline">
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        {/* Header: Doctor card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#246AFE] text-white grid place-items-center shrink-0">
              {doctor.image ? (
                <img src={doctor.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-semibold">{initials(doctor.first_name, doctor.last_name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[#0B0A0A] text-xl font-bold">
                Dr. {doctor.first_name} {doctor.last_name}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-[#0B0A0A]">
                <Stethoscope size={16} className="text-[#246AFE]" />
                <span>{doctor.field}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-[#0B0A0A]">
                <MapPin size={16} className="text-[#246AFE]" />
                <span>{doctor.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 space-y-5">
          {/* Description */}
          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Reason / Notes (optional)
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 text-gray-500" size={16} />
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Describe your symptoms or reason for the visit…"
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE] resize-y"
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">{description.length}/500</div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Pick a date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                id="date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
              />
            </div>
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-sm font-medium text-[#0B0A0A] mb-2">Time slot</label>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="animate-spin" size={16} /> Loading slots…
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => {
                  const selected = time === s;
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setTime(s)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition
                        ${selected
                          ? 'bg-[#246AFE] text-white border-transparent'
                          : 'bg-white text-[#0B0A0A] border-black/10 hover:bg-gray-50'}`}
                    >
                      <Clock size={14} className={selected ? 'text-white' : 'text-[#246AFE]'} />
                      {s}
                    </button>
                  );
                })}
                {slots.length === 0 && (
                  <div className="text-sm text-gray-600">No slots for this date.</div>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              disabled={!time || submitting}
              onClick={submit}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#246AFE] text-white py-2.5 text-sm font-medium hover:opacity-90 active:opacity-95 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating appointment…
                </>
              ) : (
                'Review & Create'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
