import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Apple,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  BellRing,
  Award
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DashboardPage = () => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/api/dashboard");
        if (res.data?.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-stat-card", {
        opacity: 0,
        y: 22,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
      ScrollTrigger.batch(".dashboard-panel", {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.12,
              ease: "power2.out",
              clearProps: "transform,opacity"
            }
          );
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);
  if (loading) {
    return <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-900 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-900 rounded-2xl" />
          <div className="h-72 bg-slate-900 rounded-2xl" />
        </div>
      </div>;
  }
  const {
    recentWorkouts = [],
    weeklyStats = { completedWorkoutsThisWeek: 0, weeklyGoal: 4, completionPercentage: 0 },
    todayNutrition = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, targetCalories: 2200, caloriePercentage: 0 },
    progressSnapshot = { latest: null, weightDelta: 0, currentWeight: user?.weight || 70 },
    upcomingReminders = []
  } = dashboardData || {};
  return <div ref={containerRef} className="space-y-8">
      {
    /* Top Welcome & Quick Actions */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Welcome back, {user?.name?.split(" ")[0] || "Athlete"}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Goal: <span className="text-blue-400 font-semibold uppercase">{user?.fitnessGoal?.replace("_", " ") || "General Fitness"}</span> • {(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
    to="/workouts"
    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
  >
            <Plus className="w-4 h-4" /> Log Workout
          </Link>
          <Link
    to="/nutrition"
    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
  >
            <Apple className="w-4 h-4 text-emerald-400" /> Log Meal
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Consistency Card */}
        <div className="dashboard-stat-card p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Weekly Workouts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{weeklyStats.completedWorkoutsThisWeek}</span>
              <span className="text-xs text-slate-400">/ {weeklyStats.weeklyGoal} planned</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, weeklyStats.completionPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's Calories Card */}
        <div className="dashboard-stat-card p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Today's Nutrition</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{todayNutrition.totalCalories}</span>
              <span className="text-xs text-slate-400">/ {todayNutrition.targetCalories} kcal</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, todayNutrition.caloriePercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Weight Card */}
        <div className="dashboard-stat-card p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Weight</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{progressSnapshot.currentWeight}</span>
              <span className="text-xs text-slate-400">kg</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {progressSnapshot.weightDelta < 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {Math.abs(progressSnapshot.weightDelta)} kg
                </span>
              ) : progressSnapshot.weightDelta > 0 ? (
                <span className="text-blue-400 font-semibold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{progressSnapshot.weightDelta} kg
                </span>
              ) : (
                <span className="text-slate-500">Steady</span>
              )}
              <span className="text-slate-500 ml-1">vs previous entry</span>
            </div>
          </div>
        </div>

        {/* Daily Macros Snapshot Card */}
        <div className="dashboard-stat-card p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Macros Logged</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 rounded-lg bg-slate-950/60">
              <span className="block text-[10px] text-blue-400 font-bold uppercase">Pro</span>
              <span className="text-xs font-black text-white">{todayNutrition.totalProtein}g</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60">
              <span className="block text-[10px] text-emerald-400 font-bold uppercase">Carb</span>
              <span className="text-xs font-black text-white">{todayNutrition.totalCarbs}g</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60">
              <span className="block text-[10px] text-amber-400 font-bold uppercase">Fat</span>
              <span className="text-xs font-black text-white">{todayNutrition.totalFat}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Workouts & Nutrition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workouts */}
        <div className="dashboard-panel lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Recent Workouts</h2>
            </div>
            <Link to="/workouts" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentWorkouts.length === 0 ? <div className="text-center py-10 text-slate-400">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No workouts recorded yet.</p>
                <Link
    to="/workouts"
    className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
  >
                  Create your first workout
                </Link>
              </div> : recentWorkouts.map((w) => <div
    key={w._id}
    className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
  >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">{w.title}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {w.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {w.durationMinutes} mins
                      </span>
                      <span>•</span>
                      <span>{w.exercises?.length || 0} exercises</span>
                      {w.caloriesBurned > 0 && <>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">{w.caloriesBurned} kcal</span>
                        </>}
                    </div>
                  </div>

                  <div>
                    {w.isCompleted ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span> : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                        Scheduled
                      </span>}
                  </div>
                </div>)}
          </div>
        </div>

        {/* Right Column: Reminders & Goals */}
        <div className="space-y-6">
          {/* Active Reminders Box */}
          <div className="dashboard-panel p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Daily Alerts</h2>
              </div>
              <Link to="/reminders" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingReminders.length === 0 ? <p className="text-xs text-slate-500 py-4 text-center">No active reminders configured.</p> : upcomingReminders.map((r) => <div key={r._id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200">{r.title}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{r.reminderType}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                      {r.scheduleTime}
                    </span>
                  </div>)}
            </div>
          </div>

          {/* Quick Nav Card */}
          <div className="dashboard-panel p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/20">
            <h3 className="text-sm font-bold text-white mb-2">Detailed Visual Reports</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Export comprehensive fitness summaries as formatted PDF documents or raw CSV data spreadsheets.
            </p>
            <Link
    to="/reports"
    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
  >
              Export reports now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export {
  DashboardPage
};
