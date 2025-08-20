import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doctorRegister } from "../slices/authDoctorSlice";
import { useNavigate, Link } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  ChevronDown,
  LogIn,
  UserPlus,
  ArrowLeft,
  Phone,
  Image as ImageIcon,
  Tag,
  FileText,
  X,
} from "lucide-react";

const FIELDS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Dentistry",
  "Orthopedics",
  "Neurology",
  "Gynecology",
  "Ophthalmology",
];

export default function DoctorRegister() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    field: "General Medicine",
    location: "",
    phone_number: "",
    about: "",
    image: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const { status, error } = useSelector(
    (s) => s.authDoctor || { status: "idle", error: null }
  );
  const loading = status === "loading";

  const dispatch = useDispatch();
  const nav = useNavigate();

  const up = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (!skills.includes(v)) setSkills((arr) => [...arr, v]);
    setSkillInput("");
  };
  const removeSkill = (v) => setSkills((arr) => arr.filter((x) => x !== v));
  const onSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      // 1) upload the image only now, if selected
      let imageUrl = form.image || null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);

        const { data } = await api.post("/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = data.url;
      }

      // 2) build payload and register
      const payload = {
        ...form,
        location: form.location || null,
        phone_number: form.phone_number || null,
        about: form.about || null,
        image: imageUrl,
        skills: skills.length ? skills : null,
      };

      await dispatch(doctorRegister(payload)).unwrap();
      nav("/dashboard/doctor");
    } catch {}
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-black/5 p-6 sm:p-8">
        <Link
          to="/"
          aria-label="Back to home"
          className="inline-flex items-center gap-2 mb-5 text-tree-blue font-medium hover:underline"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#246AFE] text-white grid place-items-center">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B0A0A]">
              Register as Doctor
            </h1>
            <p className="text-xs text-gray-500">
              Create your account to manage availability and appointments
            </p>
          </div>
        </div>

        {/* Error callout */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {String(error)}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
          {/* Names */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-[#0B0A0A] mb-1"
              >
                First name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="first_name"
                  required
                  className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                  placeholder="e.g. Amal"
                  value={form.first_name}
                  onChange={up("first_name")}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-[#0B0A0A] mb-1"
              >
                Last name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="last_name"
                  required
                  className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                  placeholder="e.g. Benali"
                  value={form.last_name}
                  onChange={up("last_name")}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#0B0A0A] mb-1"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                placeholder="you@clinic.ma"
                value={form.email}
                onChange={up("email")}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#0B0A0A] mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                placeholder="••••••••"
                value={form.password}
                onChange={up("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
          </div>

          {/* Field (specialty) */}
          <div>
            <label
              htmlFor="field"
              className="block text-sm font-medium text-[#0B0A0A] mb-1"
            >
              Specialty
            </label>
            <div className="relative">
              <Stethoscope
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <select
                id="field"
                value={form.field}
                onChange={up("field")}
                className="appearance-none w-full rounded-lg border border-black/10 bg-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
              >
                {FIELDS.map((f) => (
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

          {/* Location & Phone */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-[#0B0A0A] mb-1"
              >
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="location"
                  className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                  placeholder="Casablanca, Rabat, Marrakech…"
                  value={form.location}
                  onChange={up("location")}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-[#0B0A0A] mb-1"
              >
                Phone number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  id="phone_number"
                  type="tel"
                  className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                  placeholder="+212 6 12 34 56 78"
                  value={form.phone_number}
                  onChange={up("phone_number")}
                />
              </div>
            </div>
          </div>

          {/* Profile image */}

          <div>
            <label className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Profile image
            </label>
            <ImageUploader
              file={imageFile}
              onFile={setImageFile}
              onClear={() => setImageFile(null)}
            />

            {/* preview ImageUploader */}
            {form.image && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={form.image}
                  alt={`${form.first_name || "Doctor"} ${form.last_name || ""}`}
                  className="w-16 h-16 rounded-full object-cover border border-black/10"
                />
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            )}
          </div>

          {/* About */}
          <div>
            <label
              htmlFor="about"
              className="block text-sm font-medium text-[#0B0A0A] mb-1"
            >
              About
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 text-gray-500"
                size={16}
              />
              <textarea
                id="about"
                rows={4}
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                placeholder="Short bio, experience, languages…"
                value={form.about}
                onChange={up("about")}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[#EBF0FE] text-[#0B0A0A] border border-[#246AFE]/20"
                >
                  <Tag size={12} />
                  {s}
                  <button
                    type="button"
                    className="ml-1 rounded hover:bg-white/60"
                    onClick={() => removeSkill(s)}
                    aria-label={`Remove ${s}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-gray-500">
                  Add skills and press Enter
                </span>
              )}
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
              placeholder="e.g. Endoscopy, Allergies, Pediatrics…"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#246AFE] text-white py-2.5 text-sm font-medium hover:opacity-90 active:opacity-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Register
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-5 space-y-2 text-sm">
          Already registered?{" "}
          <Link
            to="/doctor/login"
            className="inline-flex items-center gap-1 text-[#246AFE] hover:underline"
          >
            <LogIn size={14} />
            Doctor Login
          </Link>
        </div>
      </div>
    </div>
  );
}
