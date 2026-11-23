import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Plus,
  Trash2,
  Scale,
  Ruler,
  Trophy,
  X
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useGsapScrollReveal } from "../hooks/useGsapScroll";

const ProgressPage = () => {
  const containerRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weight, setWeight] = useState(75);
  const [bodyFat, setBodyFat] = useState("");
  const [measurements, setMeasurements] = useState({
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    thighs: 0
  });
  const [metrics, setMetrics] = useState({
    maxBench: 0,
    maxSquat: 0,
    maxDeadlift: 0,
    runTimeMinutes: 0
  });
  const [notes, setNotes] = useState("");
  const { showToast } = useToast();
  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/progress?limit=50");
      if (res.data?.success) {
        setEntries(res.data.entries || []);
      }
    } catch {
      showToast("Failed to load progress records.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProgress();
  }, []);

  useGsapScrollReveal(containerRef, ".gsap-progress-panel", [loading, entries.length]);
  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!weight) {
      showToast("Weight is required.", "warning");
      return;
    }
    try {
      const res = await API.post("/api/progress", {
        weight: Number(weight),
        bodyFatPercentage: bodyFat ? Number(bodyFat) : void 0,
        measurements,
        performanceMetrics: metrics,
        notes
      });
      if (res.data?.success) {
        showToast("Progress milestone saved!", "success");
        setIsModalOpen(false);
        fetchProgress();
      }
    } catch {
      showToast("Error saving progress.", "error");
    }
  };
  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Delete this measurement entry?")) return;
    try {
      await API.delete(`/api/progress/${id}`);
      showToast("Record deleted.", "info");
      setEntries((prev) => prev.filter((p) => p._id !== id));
    } catch {
      showToast("Could not delete entry.", "error");
    }
  };
  const chartData = [...entries].reverse().map((e) => ({
    date: new Date(e.date).toLocaleDateString([], { month: "short", day: "numeric" }),
    weight: e.weight,
    bodyFat: e.bodyFatPercentage || null,
    bench: e.performanceMetrics?.maxBench || null
  }));
  return <div ref={containerRef} className="space-y-6">
      {
    /* Top Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-purple-500" /> Body Metrics & Strength
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track body weight fluctuations, circumferences, and personal lifting records
          </p>
        </div>

        <button
    type="button"
    onClick={() => setIsModalOpen(true)}
    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Record Measurement
        </button>
      </div>

      {
    /* Progress Chart */
  }
      <div className="gsap-progress-panel p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Body Weight Timeline
          </h3>
          <span className="text-xs text-slate-400">{entries.length} data points logged</span>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={["auto", "auto"]} stroke="#94a3b8" fontSize={11} unit="kg" />
                <Tooltip
    contentStyle={{
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      borderRadius: "0.75rem",
      color: "#f8fafc",
      fontSize: "12px"
    }}
  />
                <Line
    type="monotone"
    dataKey="weight"
    stroke="#a855f7"
    strokeWidth={3}
    dot={{ r: 4, fill: "#a855f7" }}
    activeDot={{ r: 6 }}
    name="Weight (kg)"
  />
              </LineChart>
            </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No weight timeline data yet. Log your first measurement to view graph.
            </div>}
        </div>
      </div>

      {
    /* History Table */
  }
      <div className="gsap-progress-panel p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Measurement History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Date</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Body Fat</th>
                <th className="p-3">Waist</th>
                <th className="p-3">Arms</th>
                <th className="p-3">Max Bench</th>
                <th className="p-3">Max Squat</th>
                <th className="p-3 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {entries.length === 0 ? <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No progress entries yet.
                  </td>
                </tr> : entries.map((entry) => <tr key={entry._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white whitespace-nowrap">
                      {new Date(entry.date).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric"
  })}
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-400">{entry.weight} kg</td>
                    <td className="p-3 text-slate-400">
                      {entry.bodyFatPercentage ? `${entry.bodyFatPercentage}%` : "\u2014"}
                    </td>
                    <td className="p-3 text-slate-400">{entry.measurements?.waist || "\u2014"} cm</td>
                    <td className="p-3 text-slate-400">{entry.measurements?.arms || "\u2014"} cm</td>
                    <td className="p-3 text-blue-400 font-mono">
                      {entry.performanceMetrics?.maxBench ? `${entry.performanceMetrics.maxBench} kg` : "\u2014"}
                    </td>
                    <td className="p-3 text-blue-400 font-mono">
                      {entry.performanceMetrics?.maxSquat ? `${entry.performanceMetrics.maxSquat} kg` : "\u2014"}
                    </td>
                    <td className="p-3 text-right">
                      <button
    type="button"
    onClick={() => handleDeleteEntry(entry._id)}
    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
    title="Delete entry"
  >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {
    /* Record Progress Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-purple-400" /> Record Metrics Milestone
              </h3>
              <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="p-1 text-slate-400 hover:text-white"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Body Weight (kg) *</label>
                  <input
    type="number"
    step="0.1"
    required
    value={weight}
    onChange={(e) => setWeight(Number(e.target.value))}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Body Fat (%)</label>
                  <input
    type="number"
    step="0.1"
    value={bodyFat}
    onChange={(e) => setBodyFat(e.target.value ? Number(e.target.value) : "")}
    placeholder="Optional"
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
                </div>
              </div>

              {
    /* Circumferences */
  }
              <div>
                <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-emerald-400" /> Body Circumferences (cm)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
    type="number"
    placeholder="Chest"
    value={measurements.chest || ""}
    onChange={(e) => setMeasurements({ ...measurements, chest: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                  <input
    type="number"
    placeholder="Waist"
    value={measurements.waist || ""}
    onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                  <input
    type="number"
    placeholder="Hips"
    value={measurements.hips || ""}
    onChange={(e) => setMeasurements({ ...measurements, hips: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                  <input
    type="number"
    placeholder="Arms"
    value={measurements.arms || ""}
    onChange={(e) => setMeasurements({ ...measurements, arms: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                  <input
    type="number"
    placeholder="Thighs"
    value={measurements.thighs || ""}
    onChange={(e) => setMeasurements({ ...measurements, thighs: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                </div>
              </div>

              {
    /* Performance */
  }
              <div>
                <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" /> Max Lift Records (kg)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
    type="number"
    placeholder="Max Bench"
    value={metrics.maxBench || ""}
    onChange={(e) => setMetrics({ ...metrics, maxBench: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                  <input
    type="number"
    placeholder="Max Squat"
    value={metrics.maxSquat || ""}
    onChange={(e) => setMetrics({ ...metrics, maxSquat: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
                  <input
    type="number"
    placeholder="Max Deadlift"
    value={metrics.maxDeadlift || ""}
    onChange={(e) => setMetrics({ ...metrics, maxDeadlift: Number(e.target.value) })}
    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
  />
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  ProgressPage
};
