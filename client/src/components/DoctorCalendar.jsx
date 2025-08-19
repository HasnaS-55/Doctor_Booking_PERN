/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");
const toLocalDate = (dStr) => new Date(`${dStr}T00:00:00`);
const displayDate = (d) =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const dayLabel = (d) => d.toLocaleDateString(undefined, { weekday: "short" });

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function parseTimeToMinutes(t = "09:00") {
  const [hh = "0", mm = "0"] = String(t).split(":");
  return +hh * 60 + +mm;
}
function addMinutes(min, delta) {
  const h = Math.floor((min + delta) / 60),
    m = (min + delta) % 60;
  return `${pad(h)}:${pad(m)}`;
}

function Avatar({ name = "P", src }) {
  const initials = (name || "P")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-tree-blue text-white grid place-items-center overflow-hidden">
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold">{initials}</span>
      )}
    </div>
  );
}

function DetailsModal({ appt, onClose }) {
  if (!appt) return null;

  // Normalize patient fields from possible shapes
  const pName =
    appt.patient_name || appt.user_name || appt.patient?.user_name || "Patient";
  const pEmail = appt.patient_email || appt.email || appt.patient?.email || "";
  const pPhone =
    appt.patient_phone || appt.phone_number || appt.patient?.phone_number || "";
  const pImage = appt.patient_image || appt.image || appt.patient?.image || "";

  const tStart = appt.time?.slice(0, 5) || "09:00";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative h-2"
          style={{ background: "linear-gradient(90deg,#246AFE,#84ADFF)" }}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 rounded-full bg-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 ">
          <div className="flex items-center gap-3">
            <Avatar name={pName} src={pImage} />
            <div>
              <div className="font-semibold text-tree-dark">{pName}</div>
              {pEmail && <div className="text-sm text-gray-600">{pEmail}</div>}
              {pPhone && <div className="text-sm text-gray-600">{pPhone}</div>}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-tree-dark">Date:</span>{" "}
              {appt.date?.slice(0, 10)} — {tStart}
            </div>
            {appt.description && (
              <div className="mt-2">
                <div className="font-medium text-tree-dark mb-1">
                  Description
                </div>
                <p className="whitespace-pre-line">{appt.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorCalendar({
  appointments = [],
  slotMinutes = 30,
  startHour = 8,
  endHour = 18,
}) {
  const [anchor, setAnchor] = useState(new Date());
  const [activeId, setActiveId] = useState(null);
  const [openAppt, setOpenAppt] = useState(null);

  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const rows = ((endHour - startHour) * 60) / slotMinutes;
  const rowHeight = 44;
  const gridHeight = rows * rowHeight;

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = toLocalDate(a.date?.slice(0, 10));
      return d >= weekStart && d < weekEnd && a.status !== "rejected";
    });
  }, [appointments, weekStart, weekEnd]);

  const countByDay = useMemo(() => {
    const map = new Map();
    for (const d of days) map.set(d.toDateString(), 0);
    for (const a of weekAppointments) {
      const key = toLocalDate(a.date?.slice(0, 10)).toDateString();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [days, weekAppointments]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setAnchor(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setAnchor(d);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2 text-tree-dark">
          <CalendarDays className="text-tree-blue" size={18} />
          <span className="font-semibold">
            {displayDate(days[0])} – {displayDate(days[6])}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="rounded-md border border-black/10 bg-white px-2 py-1 hover:bg-gray-50"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="rounded-md border border-black/10 bg-white px-3 py-1 text-sm hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="rounded-md border border-black/10 bg-white px-2 py-1 hover:bg-gray-50"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] gap-2 mb-2">
        <div />
        {days.map((d) => {
          const count = countByDay.get(d.toDateString()) || 0;
          const isToday = new Date().toDateString() === d.toDateString();
          return (
            <div
              key={d.toISOString()}
              className={`rounded-lg px-3 py-2 flex items-center justify-between border ${
                isToday
                  ? "bg-tree-light border-tree-dark/30"
                  : "bg-white border-tree-dark/10"
              }`}
            >
              <div className="text-sm">
                <div className="font-medium text-tree-dark">
                  {dayLabel(d).toUpperCase()}
                </div>
                <div className="text-gray-500">{displayDate(d)}</div>
              </div>
              {count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-tree-dark/10 text-tree-blue">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] gap-2">
        {/* Time rail */}
        <div className="relative" style={{ height: gridHeight }}>
          {[...Array(endHour - startHour + 1)].map((_, i) => {
            const hour = startHour + i;
            const top = i * (60 / slotMinutes) * rowHeight;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0"
                style={{ top }}
              >
                <div className="text-[11px] text-gray-500 translate-y-[-6px]">
                  {hour % 24}:00
                </div>
              </div>
            );
          })}
        </div>

        {/* Days area (no clipping) */}
        <div
          className="col-span-7 relative rounded-xl border border-tree-dark/10 bg-white"
          style={{ height: gridHeight, overflow: "visible" }}
        >
          {/* subtle grid */}
          <div
            className="absolute inset-0 grid pointer-events-none"
            style={{
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
              gap: "1px",
              backgroundColor: "#F2F3F5",
            }}
          >
            {Array.from({ length: rows * 7 }).map((_, idx) => (
              <div key={idx} className="bg-white" />
            ))}
          </div>

          {/* events */}
          {weekAppointments.map((a, idx) => {
            const d = toLocalDate(a.date.slice(0, 10));
            const dayIdx = (d.getDay() + 6) % 7; // Mon=0..6
            const tStart = a.time?.slice(0, 5) || "09:00";
            const startMin = parseTimeToMinutes(tStart);
            const startRow = Math.max(
              1,
              Math.round((startMin - startHour * 60) / slotMinutes) + 1
            );
            const tEnd = addMinutes(startMin, slotMinutes);

            const leftPct = (dayIdx / 7) * 100;
            const colWidthPct = 100 / 7;
            const id = a.id || idx;

            const pName =
              a.patient_name ||
              a.user_name ||
              a.patient?.user_name ||
              "Patient";

            const statusColor =
              a.status === "pending"
                ? "border-amber-300"
                : "border-tree-light/40";

            const isActive = id === activeId;

            return (
              <div
                key={id}
                className="absolute"
                style={{ inset: 0, pointerEvents: "none" }}
              >
                <div
                  className={`pointer-events-auto transition-all ${
                    isActive ? "z-40" : "z-10 hover:z-20"
                  }`}
                  style={{
                    position: "absolute",
                    left: `calc(${leftPct}% + ${dayIdx * (2 / 7)}px)`,
                    top: (startRow - 1) * rowHeight,
                    width: `calc(${colWidthPct}% - 1px)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId((prev) => (prev === id ? null : id));
                    setOpenAppt(a);
                  }}
                >
                  <div
                    className={`mx-1 rounded-xl border bg-white shadow-sm px-3 py-2 text-sm leading-snug ring-1 ring-transparent ${
                      isActive ? "ring-tree-blue/40 shadow-md" : ""
                    } ${statusColor}`}
                  >
                    <div className="font-semibold text-[#0B0A0A] whitespace-normal break-words">
                      {pName}
                    </div>
                    <div className="text-[12px] text-tree-blue font-medium">
                      {tStart} – {tEnd}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <DetailsModal appt={openAppt} onClose={() => setOpenAppt(null)} />
    </div>
  );
}
