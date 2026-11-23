import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, UserPlus, Mail, Key, User, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    age: "25",
    gender: "prefer_not_to_say",
    height: "175",
    weight: "70",
    fitnessGoal: "general_health",
    consentAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!formData.consentAccepted) {
      setError("You must accept the privacy policy & GDPR data processing consent.");
      return;
    }
    setError("");
    setLoading(true);
    const success = await register({
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight)
    });
    setLoading(false);
    if (success) {
      navigate("/dashboard", { replace: true });
    }
  };
  return <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Set up your profile to track workouts, daily meals, and personal progress
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          {error && <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
    type="text"
    name="name"
    required
    value={formData.name}
    onChange={handleChange}
    placeholder="Your full name"
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="text-slate-500 absolute left-3.5 top-2.5 text-sm font-bold">@</span>
                  <input
    type="text"
    name="username"
    required
    value={formData.username}
    onChange={handleChange}
    placeholder="username"
    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
    type="email"
    name="email"
    required
    value={formData.email}
    onChange={handleChange}
    placeholder="you@example.com"
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password (min 6 chars) *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
    type="password"
    name="password"
    required
    value={formData.password}
    onChange={handleChange}
    placeholder="••••••••"
    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
                <input
    type="number"
    name="age"
    min="12"
    max="120"
    value={formData.age}
    onChange={handleChange}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Height (cm)</label>
                <input
    type="number"
    name="height"
    min="50"
    max="280"
    value={formData.height}
    onChange={handleChange}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weight (kg)</label>
                <input
    type="number"
    name="weight"
    min="30"
    max="350"
    value={formData.weight}
    onChange={handleChange}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                <select
    name="gender"
    value={formData.gender}
    onChange={handleChange}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Fitness Goal
                </label>
                <select
    name="fitnessGoal"
    value={formData.fitnessGoal}
    onChange={handleChange}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  >
                  <option value="weight_loss">Weight Loss (Caloric Deficit)</option>
                  <option value="muscle_gain">Muscle Gain / Hypertrophy</option>
                  <option value="endurance">Endurance & Cardio</option>
                  <option value="maintenance">Weight Maintenance</option>
                  <option value="general_health">General Functional Health</option>
                </select>
              </div>
            </div>

            {
    /* GDPR Consent Checkbox */
  }
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
    type="checkbox"
    name="consentAccepted"
    checked={formData.consentAccepted}
    onChange={handleChange}
    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
  />
                <span className="text-xs text-slate-300 leading-relaxed select-none">
                  I agree to the processing of my fitness and health data in accordance with the{" "}
                  <span className="text-blue-400 underline font-semibold">GDPR Data Privacy Policy</span>. I acknowledge I can download or delete my data anytime.
                </span>
              </label>
            </div>

            <button
    type="submit"
    disabled={loading}
    className="w-full mt-4 py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
  >
              <UserPlus className="w-4 h-4" />
              {loading ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export {
  RegisterPage
};
