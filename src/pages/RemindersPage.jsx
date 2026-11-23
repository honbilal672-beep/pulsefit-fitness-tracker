import { useState, useEffect } from "react";
import {
  BellRing,
  Plus,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  Dumbbell,
  Apple,
  Droplets,
  Target
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { getReminderScheduleLabel } from "../utils/reminderSchedule";
const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [reminderType, setReminderType] = useState("workout");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]);
  const { showToast } = useToast();
  const daysLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/reminders");
      if (res.data?.success) {
        setReminders(res.data.reminders || []);
      }
    } catch {
      showToast("Failed to load reminders.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReminders();
  }, []);
  const handleToggleDay = (dayIndex) => {
    if (selectedDays.includes(dayIndex)) {
      if (selectedDays.length <= 1) return;
      setSelectedDays(selectedDays.filter((d) => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scheduleTime) {
      showToast("Please provide a title and schedule time.", "warning");
      return;
    }
    try {
      const res = await API.post("/api/reminders", {
        title: title.trim(),
        reminderType,
        scheduleTime,
        daysOfWeek: selectedDays
      });
      if (res.data?.success) {
        showToast("Reminder scheduled successfully!", "success");
        setIsModalOpen(false);
        setTitle("");
        fetchReminders();
      }
    } catch {
      showToast("Error scheduling reminder.", "error");
    }
  };
  const handleToggleActive = async (id) => {
    try {
      const res = await API.patch(`/api/reminders/${id}/toggle`);
      if (res.data?.success) {
        setReminders(
          (prev) => prev.map((r) => r._id === id ? { ...r, isActive: !r.isActive } : r)
        );
      }
    } catch {
      showToast("Error updating reminder status.", "error");
    }
  };
  const handleDeleteReminder = async (id) => {
    try {
      await API.delete(`/api/reminders/${id}`);
      showToast("Reminder deleted.", "info");
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch {
      showToast("Could not delete reminder.", "error");
    }
  };
  const getTypeIcon = (type) => {
    switch (type) {
      case "workout":
        return <Dumbbell className="w-5 h-5 text-blue-400" />;
      case "meal":
        return <Apple className="w-5 h-5 text-emerald-400" />;
      case "water":
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      default:
        return <Target className="w-5 h-5 text-purple-400" />;
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-7 h-7 text-amber-500" /> Alerts & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure recurring prompts for workouts, nutrition meal prep, and hydration
          </p>
        </div>

        <button
    type="button"
    onClick={() => setIsModalOpen(true)}
    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Create Reminder
        </button>
      </div>

      {
    /* Reminders Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? [1, 2, 3].map((i) => <div key={i} className="h-44 bg-slate-900 rounded-2xl animate-pulse" />) : reminders.length === 0 ? <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <BellRing className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No active reminders configured</p>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Never miss a gym session or meal time by scheduling an alert.
            </p>
            <button
    type="button"
    onClick={() => setIsModalOpen(true)}
    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
  >
              Add First Reminder
            </button>
          </div> : reminders.map((r) => <div
    key={r._id}
    className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${r.isActive ? "border-slate-800" : "border-slate-800/40 opacity-60"}`}
  >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getTypeIcon(r.reminderType)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{r.title}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {r.reminderType}
                      </span>
                    </div>
                  </div>

                  <button
    type="button"
    onClick={() => handleToggleActive(r._id)}
    className="text-slate-400 hover:text-white transition-colors"
    title={r.isActive ? "Disable reminder" : "Enable reminder"}
  >
                    {r.isActive ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                  </button>
                </div>

                <div className="my-3 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-black text-amber-400">
                    {r.scheduleTime}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {getReminderScheduleLabel(r.daysOfWeek)}
                  </span>
                </div>

                {
    /* Days of week active pills */
  }
                <div className="flex gap-1">
                  {daysLabel.map((lbl, idx) => {
    const isActiveDay = r.daysOfWeek?.includes(idx);
    return <span
      key={lbl}
      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isActiveDay ? "bg-blue-500/20 text-blue-300 font-black" : "bg-slate-950 text-slate-600"}`}
    >
                        {lbl}
                      </span>;
  })}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-800/80 flex justify-end">
                <button
    type="button"
    onClick={() => handleDeleteReminder(r._id)}
    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
    title="Delete reminder"
  >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>)}
      </div>

      {
    /* Create Reminder Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-500" /> Schedule Reminder
              </h3>
              <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="p-1 text-slate-400 hover:text-white"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reminder Title *
                </label>
                <input
    type="text"
    required
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. Afternoon Leg Workout"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
    value={reminderType}
    onChange={(e) => setReminderType(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  >
                    <option value="workout">Workout Routine</option>
                    <option value="meal">Meal Intake</option>
                    <option value="water">Water / Hydration</option>
                    <option value="goal">Goal Check-in</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time (24h)</label>
                  <input
    type="time"
    required
    value={scheduleTime}
    onChange={(e) => setScheduleTime(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
                </div>
              </div>

              {
    /* Days Selector */
  }
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Repeat Days
                </label>
                <div className="flex gap-1.5 justify-between">
                  {daysLabel.map((lbl, idx) => {
    const isSelected = selectedDays.includes(idx);
    return <button
      key={lbl}
      type="button"
      onClick={() => handleToggleDay(idx)}
      className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isSelected ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"}`}
    >
                        {lbl[0]}
                      </button>;
  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
  >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  RemindersPage
};
