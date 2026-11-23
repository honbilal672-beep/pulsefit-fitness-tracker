import { useState, useEffect, useRef } from "react";
import {
  Apple,
  Plus,
  Calendar,
  Coffee,
  Utensils,
  Sunset,
  Cookie,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import API from "../utils/api";
import { useToast } from "../context/ToastContext";
import { useGsapScrollReveal } from "../hooks/useGsapScroll";

const NutritionPage = () => {
  const containerRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(
    (new Date()).toISOString().split("T")[0]
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState("breakfast");
  const [foodItem, setFoodItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calories, setCalories] = useState(250);
  const [protein, setProtein] = useState(15);
  const [carbs, setCarbs] = useState(30);
  const [fat, setFat] = useState(8);
  const { showToast } = useToast();
  const fetchDailySummary = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/nutrition/daily-summary?date=${selectedDate}`);
      if (res.data?.success) {
        setSummary(res.data.summary);
      }
    } catch {
      showToast("Failed to load daily nutrition.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDailySummary();
  }, [selectedDate]);

  useGsapScrollReveal(containerRef, ".gsap-nutrition-panel", [loading, selectedDate]);
  const handleOpenAddModal = (mealType) => {
    setActiveMealType(mealType);
    setFoodItem("");
    setQuantity("");
    setCalories(200);
    setProtein(15);
    setCarbs(25);
    setFat(5);
    setIsModalOpen(true);
  };
  const handleSaveMealItem = async (e) => {
    e.preventDefault();
    if (!foodItem.trim() || !quantity.trim()) {
      showToast("Please enter food item and quantity portion.", "warning");
      return;
    }
    try {
      const res = await API.post("/api/nutrition", {
        date: selectedDate,
        mealType: activeMealType,
        items: [
          {
            foodItem: foodItem.trim(),
            quantity: quantity.trim(),
            calories: Number(calories),
            protein: Number(protein),
            carbs: Number(carbs),
            fat: Number(fat)
          }
        ]
      });
      if (res.data?.success) {
        showToast(`Added to ${activeMealType}!`, "success");
        setIsModalOpen(false);
        fetchDailySummary();
      }
    } catch {
      showToast("Error logging meal.", "error");
    }
  };
  const changeDateByDays = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };
  const mealsConfig = [
    { key: "breakfast", title: "Breakfast", icon: Coffee, color: "text-amber-400", border: "border-amber-500/20" },
    { key: "lunch", title: "Lunch", icon: Utensils, color: "text-blue-400", border: "border-blue-500/20" },
    { key: "dinner", title: "Dinner", icon: Sunset, color: "text-indigo-400", border: "border-indigo-500/20" },
    { key: "snacks", title: "Snacks & Hydration", icon: Cookie, color: "text-emerald-400", border: "border-emerald-500/20" }
  ];
  return <div ref={containerRef} className="space-y-6">
      {
    /* Top Header & Date Navigation */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Apple className="w-7 h-7 text-emerald-500" /> Nutrition Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Log meals by category, track daily caloric intake, and balance macro ratios
          </p>
        </div>

        {
    /* Date Selector Controls */
  }
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-start sm:self-auto">
          <button
    type="button"
    onClick={() => changeDateByDays(-1)}
    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    title="Previous Day"
  >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2 text-xs font-bold text-white">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="bg-transparent text-white border-0 focus:outline-none cursor-pointer text-xs"
  />
          </div>
          <button
    type="button"
    onClick={() => changeDateByDays(1)}
    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    title="Next Day"
  >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {
    /* Daily Macro Aggregate Banner */
  }
      <div className="gsap-nutrition-panel p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Day Intake
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{summary?.totalCalories || 0}</span>
              <span className="text-sm text-slate-400 font-semibold">kcal consumed</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 min-w-[100px]">
              <span className="text-[11px] font-bold text-blue-400 block uppercase">Protein</span>
              <span className="text-lg font-black text-white">{summary?.totalProtein || 0}g</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 min-w-[100px]">
              <span className="text-[11px] font-bold text-emerald-400 block uppercase">Carbohydrates</span>
              <span className="text-lg font-black text-white">{summary?.totalCarbs || 0}g</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 min-w-[100px]">
              <span className="text-[11px] font-bold text-amber-400 block uppercase">Fats</span>
              <span className="text-lg font-black text-white">{summary?.totalFat || 0}g</span>
            </div>
          </div>
        </div>
      </div>

      {
    /* Meals Grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mealsConfig.map((meal) => {
    const Icon = meal.icon;
    const mealData = summary?.meals?.[meal.key] || { calories: 0, items: [] };
    return <div
      key={meal.key}
      className={`gsap-nutrition-panel p-5 rounded-2xl bg-slate-900 border ${meal.border} flex flex-col justify-between`}
    >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <Icon className={`w-5 h-5 ${meal.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{meal.title}</h3>
                      <span className="text-xs text-slate-400 font-medium">{mealData.calories} kcal total</span>
                    </div>
                  </div>

                  <button
      type="button"
      onClick={() => handleOpenAddModal(meal.key)}
      className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors cursor-pointer"
      title={`Add item to ${meal.title}`}
    >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {
      /* Items in this meal */
    }
                <div className="space-y-2 my-2">
                  {mealData.items && mealData.items.length > 0 ? mealData.items.map((item, idx) => <div
      key={idx}
      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
    >
                        <div>
                          <p className="font-semibold text-white">{item.foodItem}</p>
                          <p className="text-[11px] text-slate-400">{item.quantity}</p>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-slate-200">{item.calories} kcal</span>
                          <p className="text-[10px] text-slate-500">
                            P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                          </p>
                        </div>
                      </div>) : <p className="text-xs text-slate-500 py-3 text-center">No items logged yet.</p>}
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
                <span>{mealData.items?.length || 0} items logged</span>
                <button
      type="button"
      onClick={() => handleOpenAddModal(meal.key)}
      className="text-blue-400 hover:text-blue-300 font-bold"
    >
                  + Add Food
                </button>
              </div>
            </div>;
  })}
      </div>

      {
    /* Add Food Modal */
  }
      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white capitalize">
                Add Food to {activeMealType}
              </h3>
              <button
    type="button"
    onClick={() => setIsModalOpen(false)}
    className="p-1 text-slate-400 hover:text-white"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMealItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Food Item Name *</label>
                <input
    type="text"
    required
    value={foodItem}
    onChange={(e) => setFoodItem(e.target.value)}
    placeholder="e.g. Rolled Oats with Whey"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Serving / Portion *</label>
                <input
    type="text"
    required
    value={quantity}
    onChange={(e) => setQuantity(e.target.value)}
    placeholder="e.g. 1 bowl (80g)"
    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Calories (kcal) *</label>
                  <input
    type="number"
    min="0"
    required
    value={calories}
    onChange={(e) => setCalories(Number(e.target.value))}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Protein (g)</label>
                  <input
    type="number"
    min="0"
    value={protein}
    onChange={(e) => setProtein(Number(e.target.value))}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Carbohydrates (g)</label>
                  <input
    type="number"
    min="0"
    value={carbs}
    onChange={(e) => setCarbs(Number(e.target.value))}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fats (g)</label>
                  <input
    type="number"
    min="0"
    value={fat}
    onChange={(e) => setFat(Number(e.target.value))}
    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
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
                  Log Food Item
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export {
  NutritionPage
};
