import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Flame,
  Dumbbell
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useGsapScrollReveal } from "../hooks/useGsapScroll";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];
const AnalyticsPage = () => {
  const containerRef = useRef(null);
  const [range, setRange] = useState("30d");
  const [workoutData, setWorkoutData] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useGsapScrollReveal(containerRef, ".gsap-chart-card", [loading, range]);
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [wRes, nRes] = await Promise.all([
        API.get(`/api/analytics/workouts?range=${range}`),
        API.get(`/api/analytics/nutrition?range=${range}`)
      ]);
      if (wRes.data?.success) setWorkoutData(wRes.data);
      if (nRes.data?.success) setNutritionData(nRes.data);
    } catch {
      showToast("Failed to load analytics trends.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnalytics();
  }, [range]);
  return <div ref={containerRef} className="space-y-6">
      {
    /* Header and Date Range Picker */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-500" /> Data Analytics & Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visual breakdown of training volume, category frequency, and macronutrient balance
          </p>
        </div>

        {
    /* Date Range Selector Buttons */
  }
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {[
    { label: "7 Days", val: "7d" },
    { label: "30 Days", val: "30d" },
    { label: "90 Days", val: "90d" },
    { label: "1 Year", val: "1y" }
  ].map((r) => <button
    key={r.val}
    type="button"
    onClick={() => setRange(r.val)}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${range === r.val ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
  >
              {r.label}
            </button>)}
        </div>
      </div>

      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-72 bg-slate-900 rounded-2xl" />)}
        </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {
    /* Chart 1: Workout Frequency & Duration */
  }
          <div className="gsap-chart-card p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-400" /> Workout Frequency & Duration
            </h3>
            <p className="text-xs text-slate-400 mb-4">Minutes exercised per active day</p>

            <div className="h-64 w-full">
              {workoutData?.frequencyTrend && workoutData.frequencyTrend.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workoutData.frequencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit="m" />
                    <Tooltip
    contentStyle={{
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      borderRadius: "0.75rem",
      color: "#f8fafc",
      fontSize: "12px"
    }}
  />
                    <Bar dataKey="durationMinutes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Duration (mins)" />
                  </BarChart>
                </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No workout frequency records in this range.
                </div>}
            </div>
          </div>

          {
    /* Chart 2: Daily Caloric Trend */
  }
          <div className="gsap-chart-card p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Daily Caloric Intake Trend
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Average intake: {nutritionData?.averageDailyCalories || 0} kcal / day
            </p>

            <div className="h-64 w-full">
              {nutritionData?.dailyTrend && nutritionData.dailyTrend.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={nutritionData.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit="kcal" />
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
    dataKey="calories"
    stroke="#f59e0b"
    strokeWidth={2.5}
    dot={{ r: 3 }}
    name="Calories"
  />
                  </LineChart>
                </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No nutrition intake records in this range.
                </div>}
            </div>
          </div>

          {
    /* Chart 3: Macronutrient Pie Breakdown */
  }
          <div className="gsap-chart-card p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" /> Macronutrient Ratio Split
            </h3>
            <p className="text-xs text-slate-400 mb-4">Protein vs Carbohydrates vs Fats</p>

            <div className="h-64 w-full">
              {nutritionData?.macroDistribution && nutritionData.macroDistribution.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
    data={nutritionData.macroDistribution}
    dataKey="grams"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={80}
    label={({ name, percentage }) => `${name} (${percentage}%)`}
    labelLine={false}
  >
                      {nutritionData.macroDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
    contentStyle={{
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      borderRadius: "0.75rem",
      color: "#f8fafc",
      fontSize: "12px"
    }}
  />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Log food items to see macronutrient breakdown.
                </div>}
            </div>
          </div>

          {
    /* Chart 4: Strength Lift Progression */
  }
          <div className="gsap-chart-card p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Lifting Weight Progress
            </h3>
            <p className="text-xs text-slate-400 mb-4">Max Bench, Squat, and Deadlift (kg)</p>

            <div className="h-64 w-full">
              {workoutData?.strengthProgress && workoutData.strengthProgress.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={workoutData.strengthProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit="kg" />
                    <Tooltip
    contentStyle={{
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      borderRadius: "0.75rem",
      color: "#f8fafc",
      fontSize: "12px"
    }}
  />
                    <Legend />
                    <Line type="monotone" dataKey="bench" stroke="#3b82f6" strokeWidth={2} name="Bench Press" />
                    <Line type="monotone" dataKey="squat" stroke="#10b981" strokeWidth={2} name="Squat" />
                    <Line type="monotone" dataKey="deadlift" stroke="#ec4899" strokeWidth={2} name="Deadlift" />
                  </LineChart>
                </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Record strength metrics in Body Progress to track lift curves.
                </div>}
            </div>
          </div>
        </div>}
    </div>;
};
export {
  AnalyticsPage
};
