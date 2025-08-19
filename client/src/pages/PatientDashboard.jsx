import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { myAppointments } from '../slices/appointmentsSlice';
import { patientMe, patientLogout } from '../slices/authPatientSlice';
import PatientCalendar from '../components/PatientCalendar';
import { Link, useNavigate } from 'react-router-dom';
import Book_Filter from '../components/book_filter';
import { LayoutDashboard, CalendarDays, LogOut, UserRound } from 'lucide-react';

export default function PatientDashboard() {
  const dispatch = useDispatch();
  const { mine = [] } = useSelector((s) => s.appointments);
  const { user, status } = useSelector((s) => s.authPatient);
  const nav = useNavigate();
  const [tab, setTab] = useState('dashboard'); // 'dashboard' | 'calendar'

  // Ensure /auth/me is in store once
  useEffect(() => {
    if (!user && status === 'idle') dispatch(patientMe());
  }, [user, status, dispatch]);

  // Load appointments after we know the user
  useEffect(() => {
    if (user?.id) dispatch(myAppointments());
  }, [user?.id, dispatch]);

  if (!user && status !== 'loading') {
    return (
      <div className="p-6">
        Please <Link to="/login" className="underline text-[#246AFE]">login</Link>.
      </div>
    );
  }

  const logout = async () => {
    await dispatch(patientLogout());
    nav('/');
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex gap-6">
          {/* LEFT RAIL */}
          <aside className="w-64 shrink-0">
            <div className="sticky top-4 bg-white rounded-2xl shadow-sm border border-black/5 p-4 space-y-4">
              {/* Mini profile — values come straight from the store (/auth/me) */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#246AFE] text-white grid place-items-center">
                  <UserRound size={18} />
                </div>
                <div className="min-w-0">
                  {/* Azul username */}
                  <div className="font-semibold truncate text-[#246AFE]">
                    {user?.user_name || 'Patient'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email || ''}
                  </div>
                </div>
              </div>

              {/* Nav buttons */}
              <nav className="space-y-2">
                <button
                  onClick={() => setTab('dashboard')}
                  className={`w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
                    ${tab === 'dashboard'
                      ? 'bg-[#246AFE] text-white border-transparent'
                      : 'bg-white text-[#0B0A0A] border-black/10 hover:bg-gray-50'}`}
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setTab('calendar')}
                  className={`w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
                    ${tab === 'calendar'
                      ? 'bg-[#246AFE] text-white border-transparent'
                      : 'bg-white text-[#0B0A0A] border-black/10 hover:bg-gray-50'}`}
                >
                  <CalendarDays size={16} />
                  <span>Calendar</span>
                </button>
              </nav>

              <hr className="border-black/10" />

              <button
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-black/10 text-sm hover:bg-gray-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 space-y-6">
            {tab === 'dashboard' ? (
              <>
                {/* Appointments */}
                <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-4">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[#0B0A0A]">My Appointments</h1>
                  </div>

                  <div className="mt-3 space-y-2">
                    {mine.map((a) => (
                      <div
                        key={a.id}
                        className="border border-black/10 rounded-lg p-3 flex justify-between items-center bg-white"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-[#0B0A0A] truncate">
                            Dr. {a.first_name} {a.last_name} — {a.field}
                          </div>
                          <div className="text-sm text-gray-600">
                            {a.date?.slice(0, 10)} at {a.time?.slice(0, 5)}
                          </div>
                        </div>
                        <div
                          className={`text-xs capitalize px-2.5 py-1 rounded-full border
                            ${
                              a.status === 'confirmed'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : a.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                        >
                          {a.status}
                        </div>
                      </div>
                    ))}
                    {mine.length === 0 && (
                      <div className="text-sm text-gray-600">No appointments yet.</div>
                    )}
                  </div>
                </section>

                {/* Book filter below */}
                <section className="bg-tree-blue rounded-2xl shadow-sm border border-black/5 p-4">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Book a new appointment
                  </h2>
                  <Book_Filter />
                </section>
              </>
            ) : (
              <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-4">
  <PatientCalendar />
</section>

            )}
          </main>
        </div>
      </div>
    </div>
  );
}
