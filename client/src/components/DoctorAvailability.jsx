import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Check, Loader2, Save } from "lucide-react";

const DAYS = [
  { label: "Sunday", weekday: 0 },
  { label: "Monday", weekday: 1 },
  { label: "Tuesday", weekday: 2 },
  { label: "Wednesday", weekday: 3 },
  { label: "Thursday", weekday: 4 },
  { label: "Friday", weekday: 5 },
  { label: "Saturday", weekday: 6 },
];

const EMPTY_ROW = (weekday) => ({
  weekday,
  is_active: false,
  start_time: "09:00",
  end_time: "17:00",
  slot_minutes: 30,
});

export default function DoctorAvailability() {
  const [rows, setRows] = useState(() => DAYS.map((d) => EMPTY_ROW(d.weekday)));
  const [status, setStatus] = useState("idle"); 
  const [error, setError] = useState("");

  // Helper to update a single day
  const patchRow = (weekday, patch) =>
    setRows((prev) =>
      prev.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r))
    );

  // Load existing rows
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStatus("loading");
        
        const { data } = await api.get("/doctor/availability");
        if (!mounted) return;

        // API returns times as "HH:MM:SS" – trim to "HH:MM"
        const byDay = new Map(
          (Array.isArray(data) ? data : []).map((r) => [
            Number(r.weekday),
            {
              weekday: Number(r.weekday),
              start_time: String(r.start_time).slice(0, 5),
              end_time: String(r.end_time).slice(0, 5),
              slot_minutes: Number(r.slot_minutes ?? 30),
              is_active: Boolean(r.is_active),
            },
          ])
        );

        setRows(DAYS.map((d) => byDay.get(d.weekday) ?? EMPTY_ROW(d.weekday)));
        setStatus("idle");
      } catch (e) {
        setError("Failed to load availability.");
        setStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canSave = useMemo(() => {
    
    for (const r of rows) {
      if (!r.is_active) continue;
      if (
        !/^\d{2}:\d{2}$/.test(r.start_time) ||
        !/^\d{2}:\d{2}$/.test(r.end_time)
      )
        return false;
      if (r.start_time >= r.end_time) return false;
      if (r.slot_minutes < 5 || r.slot_minutes > 240) return false;
    }
    return true;
  }, [rows]);

  const save = async () => {
    if (!canSave) return;
    setError("");
    setStatus("saving");
    try {
      const payload = rows
        .filter((r) => r.is_active)
        .map((r) => ({
          weekday: r.weekday,
          start_time: r.start_time, 
          end_time: r.end_time, 
          slot_minutes: r.slot_minutes,
          is_active: true,
        }));
      await api.post("/doctor/availability", payload);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    } catch {
      setStatus("error");
      setError("Failed to save availability.");
    }
  };

  const setAllActive = (active) => {
    setRows((prev) => prev.map((r) => ({ ...r, is_active: active })));
  };

  const copyWeekday = (fromWeekday, toList) => {
    const src = rows.find((r) => r.weekday === fromWeekday);
    if (!src) return;
    setRows((prev) =>
      prev.map((r) =>
        toList.includes(r.weekday)
          ? {
              ...r,
              is_active: src.is_active,
              start_time: src.start_time,
              end_time: src.end_time,
              slot_minutes: src.slot_minutes,
            }
          : r
      )
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#0B0A0A]">
            Weekly Availability
          </h2>
          <p className="text-sm text-gray-500">
            Toggle the days you work and set your start/end times and slot
            length.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAllActive(true)}
            className="px-3 py-1.5 rounded-md border border-black/10 text-sm hover:bg-gray-50"
          >
            Enable all
          </button>
          <button
            type="button"
            onClick={() => setAllActive(false)}
            className="px-3 py-1.5 rounded-md border border-black/10 text-sm hover:bg-gray-50"
          >
            Disable all
          </button>
          <button
            type="button"
            onClick={() => copyWeekday(1, [2, 3, 4, 5])} 
            className="px-3 py-1.5 rounded-md border border-black/10 text-sm hover:bg-gray-50"
            title="Copy Monday to Tue–Fri"
          >
            Copy Mon → Fri
          </button>

          <button
            type="button"
            disabled={!canSave || status === "saving"}
            onClick={save}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#246AFE] text-white text-sm hover:opacity-90 disabled:opacity-60"
          >
            {status === "saving" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save
          </button>
        </div>
      </div>

      {status === "error" && (
        <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {status === "saved" && (
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-sm">
          <Check size={14} /> Saved
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map(({ label, weekday }) => {
          const r = rows.find((x) => x.weekday === weekday);
          return (
            <div
              key={weekday}
              className="rounded-xl border border-black/10 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-[#0B0A0A]">{label}</div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="pointer"
                    checked={r.is_active}
                    onChange={(e) =>
                      patchRow(weekday, { is_active: e.target.checked })
                    }
                  />
                  <span>{r.is_active ? "Active" : "Off"}</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    value={r.start_time}
                    disabled={!r.is_active}
                    onChange={(e) =>
                      patchRow(weekday, { start_time: e.target.value })
                    }
                    className="w-full rounded-md border border-black/10 px-2 py-2 text-sm disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    End
                  </label>
                  <input
                    type="time"
                    value={r.end_time}
                    disabled={!r.is_active}
                    onChange={(e) =>
                      patchRow(weekday, { end_time: e.target.value })
                    }
                    className="w-full rounded-md border border-black/10 px-2 py-2 text-sm disabled:bg-gray-50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">
                    Slot minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={r.slot_minutes}
                    disabled={!r.is_active}
                    onChange={(e) =>
                      patchRow(weekday, {
                        slot_minutes: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-black/10 px-2 py-2 text-sm disabled:bg-gray-50"
                  />
                </div>
              </div>

              {r.is_active && r.start_time >= r.end_time && (
                <div className="mt-2 text-xs text-rose-600">
                  Start must be before end.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
