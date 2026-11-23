import { useState, useEffect, useRef } from "react";
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Clock,
  Flame,
  X,
  PlusCircle,
  Tag
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useGsapScrollReveal } from "../hooks/useGsapScroll";

const WorkoutsPage = () => {
  const containerRef = useRef(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({
    title: "",
    description: "",
    category: "strength",
    tags: "",
    durationMinutes: 45,
    intensity: "medium",
    exercises: [
      { name: "", sets: 3, reps: 10, weight: 0, notes: "" }
    ]
  });
  const [completeForm, setCompleteForm] = useState({
    durationMinutes: 45,
    caloriesBurned: 350
  });
  const { showToast } = useToast();
  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);
      const res = await API.get(`/api/workouts?${params.toString()}`);
      if (res.data?.success) {
        setWorkouts(res.data.workouts || []);
      }
    } catch {
      showToast("Failed to load workout routines.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkouts();
  }, [categoryFilter]);

  useGsapScrollReveal(containerRef, ".gsap-workout-card", [loading, workouts.length]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkouts();
  };
  const handleAddExerciseRow = () => {
    setWorkoutForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", sets: 3, reps: 10, weight: 0, notes: "" }]
    }));
  };
  const handleExerciseChange = (index, field, value) => {
    const updated = [...workoutForm.exercises];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutForm((prev) => ({ ...prev, exercises: updated }));
  };
  const handleRemoveExerciseRow = (index) => {
    if (workoutForm.exercises.length <= 1) return;
    setWorkoutForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };
  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      const tagArray = workoutForm.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const payload = {
        ...workoutForm,
        tags: tagArray,
        durationMinutes: Number(workoutForm.durationMinutes)
      };
      const res = await API.post("/api/workouts", payload);
      if (res.data?.success) {
        showToast("Workout routine created successfully!", "success");
        setIsModalOpen(false);
        fetchWorkouts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create workout.", "error");
    }
  };
  const handleDeleteWorkout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout routine?")) return;
    try {
      await API.delete(`/api/workouts/${id}`);
      showToast("Workout deleted.", "info");
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    } catch {
      showToast("Could not delete workout.", "error");
    }
  };
  const handleOpenCompleteModal = (workout) => {
    setSelectedWorkout(workout);
    setCompleteForm({
      durationMinutes: workout.durationMinutes || 45,
      caloriesBurned: workout.caloriesBurned || 300
    });
    setIsCompleteModalOpen(true);
  };
  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    if (!selectedWorkout) return;
    try {
      const res = await API.post(`/api/workouts/${selectedWorkout._id}/complete`, {
        durationMinutes: Number(completeForm.durationMinutes),
        caloriesBurned: Number(completeForm.caloriesBurned),
        completedAt: /* @__PURE__ */ new Date()
      });
      if (res.data?.success) {
        showToast("Workout marked as completed! Notification sent.", "success");
        setIsCompleteModalOpen(false);
        fetchWorkouts();
      }
    } catch {
      showToast("Error recording completion.", "error");
    }
  };
  return <div ref={containerRef} className="space-y-6">
      {
    /* Header and Controls */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-blue-500" /> Workout Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build routines, log exercises with sets/reps, and record completed training sessions
          </p>
        </div>

        <button
    type="button"
    onClick={() => setIsModalOpen(true)}
    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
  >
          <Plus className="w-4 h-4" /> Create Routine
        </button>
      </div>

      {
    /* Filter and Search Bar */
  }
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search workouts, exercises, or tags..."
    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
  />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {["", "strength", "cardio", "hiit", "flexibility", "endurance"].map((cat) => <button
    key={cat}
    type="button"
    onClick={() => setCategoryFilter(cat)}
    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${categoryFilter === cat ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"}`}
  >
              {cat === "" ? "All Categories" : cat.toUpperCase()}
            </button>)}
        </div>
      </div>

      {
    /* Workouts Grid */
  }
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 bg-slate-900 rounded-2xl" />)}
        </div> : workouts.length === 0 ? <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No workout routines found</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Get started by creating your first workout routine or adjust your search filter.
          </p>
          <button
    type="button"
    onClick={() => setIsModalOpen(true)}
    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
  >
            Create Routine
          </button>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workouts.map((w) => <div
    key={w._id}
    className="gsap-workout-card p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
  >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-white leading-tight">{w.title}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                    {w.category}
                  </span>
                </div>

                {w.description && <p className="text-xs text-slate-400 line-clamp-2 mb-3">{w.description}</p>}

                {
    /* Exercises Preview */
  }
                <div className="space-y-1.5 my-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Exercises ({w.exercises?.length || 0})
                  </p>
                  {w.exercises?.slice(0, 3).map((ex, idx) => <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                      <span className="truncate">{ex.name}</span>
                      <span className="font-mono text-slate-400 shrink-0 ml-2">
                        {ex.sets} × {ex.reps} {ex.weight > 0 ? `(${ex.weight}kg)` : ""}
                      </span>
                    </div>)}
                  {w.exercises?.length > 3 && <p className="text-[10px] text-blue-400 font-semibold pt-1">
                      +{w.exercises.length - 3} more exercises
                    </p>}
                </div>

                {
    /* Tags */
  }
                {w.tags && w.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-3">
                    {w.tags.map((tag, tidx) => <span
    key={tidx}
    className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full flex items-center gap-1"
  >
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>)}
                  </div>}
              </div>

              {
    /* Bottom Card Controls */
  }
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {w.durationMinutes}m
                  </span>
                  {w.caloriesBurned > 0 && <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3.5 h-3.5" /> {w.caloriesBurned}kcal
                    </span>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
    type="button"
    onClick={() => handleDeleteWorkout(w._id)}
    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
    title="Delete routine"
  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {w.isCompleted ? <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span> : <button
    type="button"
    onClick={() => handleOpenCompleteModal(w)}
    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
  >
                      Complete
                    </button>}
                </div>
              </div>
            </div>)}
        </div>}

      {
    /* Create Workout Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-500" /> Create Workout Routine
              </h2>
              <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="p-1 text-slate-400 hover:text-white"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Routine Title *</label>
                <input
    type="text"
    required
    value={workoutForm.title}
    onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
    placeholder="e.g. Upper Body Hypertrophy"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
    value={workoutForm.category}
    onChange={(e) => setWorkoutForm({ ...workoutForm, category: e.target.value })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
                    <option value="strength">Strength Training</option>
                    <option value="cardio">Cardiovascular</option>
                    <option value="hiit">HIIT (High Intensity)</option>
                    <option value="flexibility">Flexibility & Yoga</option>
                    <option value="endurance">Endurance</option>
                    <option value="calisthenics">Calisthenics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (minutes)</label>
                  <input
    type="number"
    min="5"
    max="300"
    value={workoutForm.durationMinutes}
    onChange={(e) => setWorkoutForm({ ...workoutForm, durationMinutes: Number(e.target.value) })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
                <input
    type="text"
    value={workoutForm.tags}
    onChange={(e) => setWorkoutForm({ ...workoutForm, tags: e.target.value })}
    placeholder="chest, triceps, hypertrophy, bench"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
              </div>

              {
    /* Dynamic Exercise Rows */
  }
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200">Exercises in this Routine</label>
                  <button
    type="button"
    onClick={handleAddExerciseRow}
    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {workoutForm.exercises.map((ex, idx) => <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                      <input
    type="text"
    required
    placeholder="Exercise name"
    value={ex.name}
    onChange={(e) => handleExerciseChange(idx, "name", e.target.value)}
    className="flex-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
  />
                      <input
    type="number"
    min="1"
    placeholder="Sets"
    value={ex.sets}
    onChange={(e) => handleExerciseChange(idx, "sets", Number(e.target.value))}
    className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white text-center"
    title="Sets"
  />
                      <input
    type="number"
    min="1"
    placeholder="Reps"
    value={ex.reps}
    onChange={(e) => handleExerciseChange(idx, "reps", Number(e.target.value))}
    className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white text-center"
    title="Reps"
  />
                      <input
    type="number"
    min="0"
    placeholder="Weight (kg)"
    value={ex.weight}
    onChange={(e) => handleExerciseChange(idx, "weight", Number(e.target.value))}
    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white text-center"
    title="Weight (kg)"
  />
                      <button
    type="button"
    onClick={() => handleRemoveExerciseRow(idx)}
    className="p-1.5 text-slate-500 hover:text-rose-400"
    title="Remove"
  >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>)}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30"
  >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Complete Workout Modal */
  }
      {isCompleteModalOpen && selectedWorkout && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Mark Workout Completed</h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording completion for: <span className="font-semibold text-slate-200">{selectedWorkout.title}</span>
            </p>

            <form onSubmit={handleConfirmComplete} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Duration (Minutes)</label>
                <input
    type="number"
    required
    min="1"
    value={completeForm.durationMinutes}
    onChange={(e) => setCompleteForm({ ...completeForm, durationMinutes: Number(e.target.value) })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Calories Burned (Estimated kcal)</label>
                <input
    type="number"
    min="0"
    value={completeForm.caloriesBurned}
    onChange={(e) => setCompleteForm({ ...completeForm, caloriesBurned: Number(e.target.value) })}
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => setIsCompleteModalOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
  >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  WorkoutsPage
};
