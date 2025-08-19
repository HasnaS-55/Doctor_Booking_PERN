import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import api from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Stethoscope,
  MapPin,
  Phone,
  Tag,
  X,
  Filter,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const LIMIT = 9;
const cap = (v) =>
  String(v || "")
    .charAt(0)
    .toUpperCase() + String(v || "").slice(1);
const initials = (f = "", l = "") =>
  (f[0] || "D").toUpperCase() + (l[0] || "R").toUpperCase();

export default function Book_Filter() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  //url
  const initField = searchParams.get("field") || "";
  const initQ = searchParams.get("q") || "";
  const initPage = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);

  //filters
  const [fields, setFields] = useState([]);
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(initField);
  const [q, setQ] = useState(initQ);
  const [debouncedQ, setDebouncedQ] = useState(initQ);

  //pagination
  const [page, setPage] = useState(initPage);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  //pop up
  const [openId, setOpenId] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const goBook = async (id) => {
    try {
      await api.get("/auth/me");
      nav(`/book/${id}`);
    } catch {
      nav("/login", { state: { from: `/book/${id}` } });
    }
  };

  useEffect(() => {
    let mounted = true;
    api
      .get("/fields")
      .then((r) => mounted && setFields(Array.isArray(r.data) ? r.data : []))
      .catch(() => mounted && setFields([]));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 1000);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [selected, debouncedQ]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (selected) next.set("field", selected);
    if (debouncedQ) next.set("q", debouncedQ);
    if (page !== 1) next.set("page", String(page));
    const nextStr = next.toString();
    const curStr = searchParams.toString();
    if (nextStr !== curStr) setSearchParams(next);
  }, [selected, debouncedQ, page, searchParams, setSearchParams]);

  const lastKeyRef = useRef("");
  const fetchDoctors = useCallback(async () => {
    const key = JSON.stringify({ page, limit: LIMIT, selected, debouncedQ });
    lastKeyRef.current = key;
    setLoading(true);
    setErr(null);
    try {
      const { data } = await api.get("/doctors", {
        params: {
          field: selected || undefined,
          q: debouncedQ || undefined,
          page,
          limit: LIMIT,
        },
      });
      if (lastKeyRef.current !== key) return;
      const arr = Array.isArray(data) ? data : [];
      setDocs(arr);
      setHasMore(arr.length === LIMIT);
    } catch {
      if (lastKeyRef.current === key) {
        setErr("Failed to load doctors");
        setDocs([]);
        setHasMore(false);
      }
    } finally {
      if (lastKeyRef.current === key) setLoading(false);
    }
  }, [page, selected, debouncedQ]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => hasMore && setPage((p) => p + 1);

  const openDoctor = useCallback(
    async (doc) => {
      setOpenId(doc.id);
      if (!detailsById[doc.id]) {
        try {
          setLoadingId(doc.id);
          const { data } = await api.get(`/doctors/${doc.id}`, {
            params: { pick: "phone_number,about,skills" },
          });
          setDetailsById((prev) => ({
            ...prev,
            [doc.id]: {
              phone_number: data.phone_number ?? "",
              about: data.about ?? "",
              skills: Array.isArray(data.skills) ? data.skills : [],
            },
          }));
        } catch {
          setDetailsById((prev) => ({
            ...prev,
            [doc.id]: { phone_number: "", about: "", skills: [] },
          }));
        } finally {
          setLoadingId(null);
        }
      }
    },
    [detailsById]
  );

  const closeModal = useCallback(() => setOpenId(null), []);
  const openDoc = useMemo(
    () => docs.find((d) => d.id === openId) || null,
    [docs, openId]
  );
  const openExtras = openId
    ? detailsById[openId] || { phone_number: "", about: "", skills: [] }
    : null;

  return (
    <div className="w-[90%] mx-auto p-6 space-y-6 ">
      <h1 className="text-6xl mb-7xl font-bold bg-gradient-to-r from-tree-light via-tree-light to-white bg-clip-text text-transparent">
        Find a Doctor
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-tree-dark font-medium">
            <Filter size={18} className="text-[#246AFE]" />
            <span>Filters</span>
          </div>
          {(selected || q) && (
            <button
              onClick={() => {
                setSelected("");
                setQ("");
              }}
              className="inline-flex cursor-pointer text-tree-dark items-center gap-1 text-sm px-2.5 py-1.5 rounded-md border border-black/10 hover:bg-gray-50"
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label htmlFor="field" className="sr-only">
              Field
            </label>
            <div className="relative">
              <select
                id="field"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="appearance-none cursor-pointer  w-full rounded-lg border border-black/10 font-medium text-tree-dark px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-tree-blue"
              >
                <option value="">All fields</option>
                {(Array.isArray(fields) ? fields : []).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          <div className="sm:col-span-8">
            <label htmlFor="q" className="sr-only">
              Search
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or location"
                className="w-full rounded-lg border font-medium text-tree-dark border-black/10 bg-white pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tree-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {docs.map((d) => (
          <button
            key={d?.id}
            onClick={() => openDoctor(d)}
            className=" p-4 text-left bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-tree-blue"
          >
            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-[60px] h-[60px] rounded-full overflow-hidden bg-tree-blue text-white grid place-items-center">
                {d?.image ? (
                  <img
                    src={d.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold">
                    {initials(d?.first_name, d?.last_name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-tree-blue font-semibold">
                  DR {cap(d?.first_name)}{" "}
                  {String(d?.last_name || "").toUpperCase()}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-tree-dark">
                  <Stethoscope size={16} strokeWidth={2} className="shrink-0" />
                  <span>{d?.field}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-tree-dark">
                  <MapPin size={16} strokeWidth={2} className="shrink-0" />
                  <span>{d?.location}</span>
                </div>
              </div>
            </div>

            <div
              className="cursor-pointer mt-4 pt-4 pb-4 px-4 flex items-center relative w-full h-12 rounded-full  text-white font-medium
                                   bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_12px_28px_rgba(37,99,235,.35)]
                                   ring-1 ring-white/10 hover:to-blue-800 transition-colors"
            >
              Make an appointment
              <span
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center
                                         w-9 h-9 rounded-full bg-white text-blue-600 ring-1 ring-blue-300 shadow-md
                                         transition-transform duration-300 group-hover:translate-x-1"
              >
                <Stethoscope className="w-5 h-5" strokeWidth={2} />
              </span>
            </div>
          </button>
        ))}

        {/* Leading */}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`s-${i}`}
              className="bg-white rounded-xl shadow-sm border border-black/5 p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-[60px] h-[60px] rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-1/3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="mt-4 h-9 bg-gray-200 rounded" />
            </div>
          ))}
      </div>

      {err && (
        <div className="text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={prevPage}
          disabled={page === 1 || loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition
            ${
              page === 1 || loading
                ? "border-black/10 text-white/60 bg-white/30"
                : "border-tree-blue text-tree-dark bg-white/80 hover:bg-gray-50"
            }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="inline-flex items-center border border-black/20 justify-center min-w-[2.25rem] h-9 px-3 rounded-full bg-white/90 text-tree-dark text-sm font-semibold shadow-sm">
          {page}
        </span>

        <button
          onClick={nextPage}
          disabled={!hasMore || loading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition
            ${
              !hasMore || loading
                ? "border-black/10 text-white/60 bg-white/30"
                : "border-tree-blue text-tree-dark bg-white/80 hover:bg-gray-50"
            }`}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Pop up */}
      {openId && openDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative h-2"
              style={{
                background: "linear-gradient(90deg, #246AFE 0%, #84ADFF 100%)",
              }}
            >
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 p-1.5 rounded-full bg-white/90 hover:bg-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden bg-tree-blue text-white grid place-items-center ring-4 ring-white">
                  {openDoc.image ? (
                    <img
                      src={openDoc.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-xl">
                      {initials(openDoc.first_name, openDoc.last_name)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-tree-blue font-semibold text-lg truncate">
                    DR {cap(openDoc.first_name)}{" "}
                    {String(openDoc.last_name || "").toUpperCase()}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-tree-dark">
                    <Stethoscope size={16} strokeWidth={2} />
                    <span>{openDoc.field}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-tree-dark">
                    <MapPin size={16} strokeWidth={2} />
                    <span>{openDoc.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {loadingId === openId ? (
                  <div className="animate-pulse">
                    <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                  </div>
                ) : (
                  <>
                    {openExtras?.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-tree-dark">
                        <Phone size={16} strokeWidth={2} />
                        <span>{openExtras.phone_number}</span>
                      </div>
                    )}
                    {Array.isArray(openExtras?.skills) &&
                      openExtras.skills.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-tree-dark mb-1">
                            <Tag size={16} strokeWidth={2} />
                            <span>Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {openExtras.skills.map((s, idx) => (
                              <span
                                key={`${s}-${idx}`}
                                className="px-2 py-1 text-xs rounded-full bg-tree-light text-tree-dark/80 border border-tree-dark/20"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    {openExtras?.about && (
                      <div>
                        <div className="text-sm font-medium text-tree-dark mb-1">
                          About
                        </div>
                        <p className="text-sm text-tree-dark/80 leading-relaxed whitespace-pre-line">
                          {openExtras.about}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => goBook(openDoc.id)}
                className="mt-4 pt-4 pb-4 px-4 flex items-center relative w-full h-12 rounded-full  text-white font-medium
                                   bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_12px_28px_rgba(37,99,235,.35)]
                                   ring-1 ring-white/10 hover:to-blue-800 transition-colors"
              >
                Make an appointment
                <span
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center
                                         w-9 h-9 rounded-full bg-white text-blue-600 ring-1 ring-blue-300 shadow-md
                                         transition-transform duration-300 group-hover:translate-x-1"
                >
                  <Stethoscope className="w-5 h-5" strokeWidth={2} />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
