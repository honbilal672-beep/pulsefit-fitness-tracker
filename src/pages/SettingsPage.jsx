import { useState } from "react";
import {
  Settings,
  User,
  Key,
  Shield,
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import API from "../utils/api";
const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    age: user?.age || 25,
    gender: user?.gender || "prefer_not_to_say",
    height: user?.height || 175,
    weight: user?.weight || 70,
    fitnessGoal: user?.fitnessGoal || "general_health",
    isProfilePublic: user?.isProfilePublic ?? false,
    units: user?.settings?.units || "metric"
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await API.put("/api/auth/profile", {
        name: profileForm.name,
        age: Number(profileForm.age),
        gender: profileForm.gender,
        height: Number(profileForm.height),
        weight: Number(profileForm.weight),
        fitnessGoal: profileForm.fitnessGoal,
        isProfilePublic: profileForm.isProfilePublic,
        settings: {
          ...user?.settings,
          units: profileForm.units
        }
      });
      if (res.data?.success) {
        updateUser(res.data.user);
        showToast("Profile and preferences updated!", "success");
      }
    } catch {
      showToast("Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    try {
      setChangingPass(true);
      const res = await API.put("/api/auth/change-password", {
        currentPassword,
        newPassword
      });
      if (res.data?.success) {
        showToast("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Password update failed.", "error");
    } finally {
      setChangingPass(false);
    }
  };
  const handleDownloadGDPRData = async () => {
    try {
      const token = localStorage.getItem("pulsefit_token");
      const response = await fetch("/api/users/me/export-data", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Data export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pulsefit-gdpr-data-${user?.username}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Personal data package downloaded (JSON).", "success");
    } catch {
      showToast("Failed to export account data.", "error");
    }
  };
  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== "DELETE") {
      showToast("Please type DELETE in capital letters to confirm.", "warning");
      return;
    }
    try {
      await API.delete("/api/users/me/delete-account");
      showToast("Account permanently deleted. Goodbye!", "info");
      logout();
    } catch {
      showToast("Error deleting account.", "error");
    }
  };
  return <div className="space-y-8 max-w-4xl">
      {
    /* Header */
  }
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-500" /> Account Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal profile, unit preferences, password, and GDPR data compliance
        </p>
      </div>

      {
    /* Profile & Biometrics Settings */
  }
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" /> Athlete Profile & Preferences
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
    type="text"
    value={profileForm.name}
    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fitness Goal</label>
              <select
    value={profileForm.fitnessGoal}
    onChange={(e) => setProfileForm({ ...profileForm, fitnessGoal: e.target.value })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="maintenance">Maintenance</option>
                <option value="general_health">General Health</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
              <input
    type="number"
    value={profileForm.age}
    onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
              <input
    type="number"
    value={profileForm.height}
    onChange={(e) => setProfileForm({ ...profileForm, height: Number(e.target.value) })}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
              <input
    type="number"
    value={profileForm.weight}
    onChange={(e) => setProfileForm({ ...profileForm, weight: Number(e.target.value) })}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Measurement Units</label>
              <select
    value={profileForm.units}
    onChange={(e) => setProfileForm({ ...profileForm, units: e.target.value })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lb, in)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Privacy</label>
              <select
    value={profileForm.isProfilePublic ? "public" : "private"}
    onChange={(e) => setProfileForm({ ...profileForm, isProfilePublic: e.target.value === "public" })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  >
                <option value="public">Public (Visible in Athlete Community)</option>
                <option value="private">Private (Only you can see logs)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
    type="submit"
    disabled={savingProfile}
    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
  >
              {savingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>

      {
    /* Change Password */
  }
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" /> Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
            <input
    type="password"
    required
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (min 6 chars)</label>
            <input
    type="password"
    required
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
            <input
    type="password"
    required
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
          </div>

          <div className="pt-2">
            <button
    type="submit"
    disabled={changingPass}
    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer disabled:opacity-50"
  >
              {changingPass ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {
    /* GDPR Data & Account Deletion */
  }
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" /> Data Privacy & GDPR Rights
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          In compliance with privacy standards, you have the right to obtain a full copy of all your tracked workouts, nutrition entries, and personal records, or to permanently erase your account.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Download Personal Data</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Receive a complete archive of your profile, all workouts, daily nutrition logs, body measurements, and support inquiries in structured JSON format.
              </p>
            </div>
            <button
    type="button"
    onClick={handleDownloadGDPRData}
    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
  >
              <Download className="w-4 h-4 text-emerald-400" /> Download My Data (JSON)
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/30 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-rose-300 mb-1">Delete Account Permanently</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Permanently purge your account, profile picture, workouts, and measurement entries. This action cannot be reversed.
              </p>
            </div>
            <button
    type="button"
    onClick={() => setIsDeleteModalOpen(true)}
    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
  >
              <Trash2 className="w-4 h-4" /> Delete My Account
            </button>
          </div>
        </div>
      </div>

      {
    /* Delete Confirmation Modal */
  }
      {isDeleteModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will permanently delete your user account and all recorded workouts, nutrition logs, progress entries, and notifications.
            </p>
            <p className="text-xs font-semibold text-slate-200 mb-2">
              Type <span className="font-mono text-rose-400 font-bold">DELETE</span> to confirm:
            </p>
            <input
    type="text"
    value={confirmDeleteText}
    onChange={(e) => setConfirmDeleteText(e.target.value)}
    placeholder="DELETE"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-rose-500/40 text-sm text-white mb-4 focus:outline-none"
  />
            <div className="flex justify-end gap-3">
              <button
    type="button"
    onClick={() => setIsDeleteModalOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
  >
                Cancel
              </button>
              <button
    type="button"
    onClick={handleDeleteAccount}
    disabled={confirmDeleteText !== "DELETE"}
    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40"
  >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export {
  SettingsPage
};
