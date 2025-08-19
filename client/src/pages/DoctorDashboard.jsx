import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, LogOut, UserRound } from 'lucide-react';
import DoctorDashboardHome from '../components/DoctorDashboardHome';
import DoctorCalendar from '../components/DoctorCalendar';
import DoctorAvailability from '../components/DoctorAvailability';
import { doctorMe, doctorLogout } from '../slices/authDoctorSlice';
import { fetchDoctorAppointments, updateAppointmentStatus } from '../slices/appointmentsSlice';

function initials(first = '', last = '') {
  return `${(first?.[0] || 'D').toUpperCase()}${(last?.[0] || 'R').toUpperCase()}`;
}

export default function DoctorDashboard() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { user, status: meStatus } = useSelector(s => s.authDoctor || { user: null, status: 'idle' });
  const { doctorList = [], status: apptStatus } = useSelector(s => s.appointments || {});

  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!user && meStatus === 'idle') dispatch(doctorMe());
  }, [user, meStatus, dispatch]);

  useEffect(() => {
    // load all doctor appointments (optionally you can pass a range)
    if (user?.id) dispatch(fetchDoctorAppointments({}));
  }, [user?.id, dispatch]);

  if (!user && meStatus !== 'loading') {
    return (
      <div className="p-6">
        Please <Link to="/doctor/login" className="underline text-[#246AFE]">login</Link>.
      </div>
    );
  }

  const onConfirm = (id) => dispatch(updateAppointmentStatus({ id, status: 'confirmed' }));
  const onReject  = (id) => dispatch(updateAppointmentStatus({ id, status: 'rejected' }));

  const logout = async () => {
    await dispatch(doctorLogout());
    nav('/');
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex gap-6">
          {/* LEFT RAIL */}
          <aside className="w-72 shrink-0">
            <div className="sticky top-4 bg-white rounded-2xl shadow-sm border border-black/5 p-5 space-y-5">
              {/* Mini profile */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#246AFE] text-white grid place-items-center overflow-hidden">
                  {user?.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold">{initials(user?.first_name, user?.last_name)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Welcome back</div>
                  <div className="font-semibold truncate text-[#0B0A0A]">
                    Dr. {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              </div>

              {/* Tabs */}
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
                <button
                  onClick={() => setTab('availability')}
                  className={`w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
                    ${tab === 'availability'
                      ? 'bg-[#246AFE] text-white border-transparent'
                      : 'bg-white text-[#0B0A0A] border-black/10 hover:bg-gray-50'}`}
                >
                  <UserRound size={16} />
                 <span>Availability</span>
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

          {/* MAIN */}
          <main className="flex-1 space-y-6">
            {tab === 'dashboard' ? (
              <DoctorDashboardHome
                loading={apptStatus === 'loading'}
                appointments={doctorList}
                onConfirm={onConfirm}
                onReject={onReject}
              />
            ) : tab === 'calendar' ? (
               <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-4">
                 <DoctorCalendar appointments={doctorList} />
               </section>
            ) : (
              <DoctorAvailability />
             )}
          </main>
        </div>
      </div>
    </div>
  );
}
