import { useMemo } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function DoctorDashboardHome({
  loading,
  appointments = [],
  onConfirm,
  onReject,
}) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayTotal = useMemo(
    () =>
      appointments.filter(
        (a) => a.date?.slice(0, 10) === todayStr && a.status !== "rejected"
      ).length,
    [appointments, todayStr]
  );
  const totalCancelled = useMemo(
    () => appointments.filter((a) => a.status === "rejected").length,
    [appointments]
  );

  const requests = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "pending")
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments]
  );

  return (
    <>
      {/* KPIs */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-tree-dark/5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Today’s appointments</div>
            <Clock size={18} className="text-tree-blue" />
          </div>
          <div className="mt-2 text-3xl font-bold text-tree-dark">
            {todayTotal}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-tree-dark/5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">All canceled</div>
            <XCircle size={18} className="text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-bold text-tree-dark">
            {totalCancelled}
          </div>
        </div>
      </section>

      {/* Requests list */}
      <section className="bg-white rounded-2xl shadow-sm border border-tree-dark/5 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-tree-dark">Requests</h2>
        </div>

        <div className="mt-3 space-y-2">
          {loading && <div className="text-sm text-gray-500">Loading…</div>}
          {!loading && requests.length === 0 && (
            <div className="text-sm text-gray-600">No pending requests.</div>
          )}

          {requests.map((a) => {
            const pName =
              a.patient_name ||
              a.user_name ||
              a.patient?.user_name ||
              "Patient";
            const date = a.date?.slice(0, 10);
            const time = a.time?.slice(0, 5);

            return (
              <div
                key={a.id}
                className="border border-tree-dark/10 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-medium text-tree-dark">{pName}</div>
                  <div className="text-sm text-gray-600">
                    {date} at {time}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onConfirm(a.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 text-white text-sm"
                  >
                    <CheckCircle2 size={16} /> Confirm
                  </button>
                  <button
                    onClick={() => onReject(a.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-600 text-white text-sm"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
