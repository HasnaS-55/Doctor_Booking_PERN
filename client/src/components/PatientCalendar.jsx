import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

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
  return parseInt(hh, 10) * 60 + parseInt(mm, 10);
}
function addMinutes(min, delta) {
  const h = Math.floor((min + delta) / 60);
  const m = (min + delta) % 60;
  return `${pad(h)}:${pad(m)}`;
}

export default function PatientCalendar({
  slotMinutes = 30,
  startHour = 8,
  endHour = 18,
  appointments: propAppointments,
}) {
  const mineFromStore = useSelector((s) => s.appointments?.mine || []);


  const confirmed = useMemo(
    () =>
      (propAppointments ?? mineFromStore).filter(
        (a) => a?.status === "confirmed"
      ),
    [propAppointments, mineFromStore]
  );

  const [anchor, setAnchor] = useState(new Date());
  const [activeId, setActiveId] = useState(null); 

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
    return confirmed.filter((a) => {
      const d = toLocalDate(a.date?.slice(0, 10));
      return d >= weekStart && d < weekEnd;
    });
  }, [confirmed, weekStart, weekEnd]);

  const countByDay = useMemo(() => {
    const map = new Map();
    for (const d of days) map.set(d.toDateString(), 0);
    for (const a of weekAppointments) {
      const key = toLocalDate(a.date?.slice(0, 10)).toDateString();
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
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
        <div className="border-1 py-2 px-4 rounded-xl bg-[#EBF0FE] border-tree-blue text-xs text-gray-700">
          <span className="text-tree-blue font-bold">
            {weekAppointments.length}
          </span>{" "}
          confirmed appointment{weekAppointments.length !== 1 ? "s" : ""} this
          week
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="rounded-md border border-tree-dark/10 bg-white px-2 py-1 hover:bg-gray-50"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setAnchor(new Date())}
            className="rounded-md border border-tree-dark/10 bg-white px-3 py-1 text-sm hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="rounded-md border border-tree-dark/10 bg-white px-2 py-1 hover:bg-gray-50"
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
                  ? "bg-[#EBF0FE] border-tree-/30"
                  : "bg-white border-tree-dark/10"
              }`}
            >
              <div className="text-sm">
                <div className="font-medium text-[#0B0A0A]">
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

        {/* Days area — allow spill (no clipping) */}
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

          {/* events (confirmed only) */}
          {weekAppointments.map((a, idx) => {
            const d = toLocalDate(a.date.slice(0, 10));
            const dayIdx = (d.getDay() + 6) % 7; 
            const tStart = a.time?.slice(0, 5) || "09:00";
            const startMin = parseTimeToMinutes(tStart);
            const startRow = Math.max(
              1,
              Math.round((startMin - startHour * 60) / slotMinutes) + 1
            );
            const tEnd = addMinutes(startMin, slotMinutes);

            const leftPct = (dayIdx / 7) * 100;
            const colWidthPct = 100 / 7;

            const isActive = activeId === (a.id || idx);

            return (
              <div
                key={a.id || idx}
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
                    // let the card be wider than a day if needed
                    width: `calc(${colWidthPct}% - 1px)`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId((prev) =>
                      prev === (a.id || idx) ? null : a.id || idx
                    );
                  }}
                >
                  <div
                    className={`mx-1 rounded-xl border bg-white shadow-sm px-3 py-2 text-sm leading-snug
                                ring-1 ring-transparent ${
                                  isActive ? "ring-[#246AFE]/40 shadow-md" : ""
                                }`}
                    style={{ borderColor: "rgba(36,106,254,0.25)" }}
                  >
                    {/* No truncation — wrap naturally */}
                    <div className="font-semibold text-[#0B0A0A] whitespace-normal break-words">
                      Dr. {a.first_name} {a.last_name}
                    </div>
                    <div className="text-[12px] text-gray-600 whitespace-normal break-words">
                      {a.field}
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
    </div>
  );
}
