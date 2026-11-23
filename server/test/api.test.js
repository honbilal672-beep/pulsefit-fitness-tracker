import test from "node:test";
import assert from "node:assert/strict";
import { Parser } from "json2csv";
test("Nutrition macro aggregator calculation", () => {
  const items = [
    { foodItem: "Grilled Chicken Breast", quantity: "200g", calories: 330, protein: 62, carbs: 0, fat: 7 },
    { foodItem: "Brown Rice", quantity: "1 cup", calories: 218, protein: 5, carbs: 46, fat: 2 },
    { foodItem: "Steamed Broccoli", quantity: "150g", calories: 55, protein: 4, carbs: 11, fat: 1 }
  ];
  const totalCalories = Math.round(items.reduce((acc, item) => acc + item.calories, 0));
  const totalProtein = Math.round(items.reduce((acc, item) => acc + item.protein, 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((acc, item) => acc + item.carbs, 0) * 10) / 10;
  const totalFat = Math.round(items.reduce((acc, item) => acc + item.fat, 0) * 10) / 10;
  assert.equal(totalCalories, 603);
  assert.equal(totalProtein, 71);
  assert.equal(totalCarbs, 57);
  assert.equal(totalFat, 10);
});
test("Weight delta calculation for progress snapshot", () => {
  const latestWeight = 74.5;
  const previousWeight = 76.2;
  const delta = Math.round((latestWeight - previousWeight) * 10) / 10;
  assert.equal(delta, -1.7);
});
test("CSV Parser formatting with json2csv", () => {
  const fields = ["title", "category", "durationMinutes", "isCompleted"];
  const testData = [
    { title: "Morning HIIT", category: "hiit", durationMinutes: 30, isCompleted: "Yes" },
    { title: "Upper Body Strength", category: "strength", durationMinutes: 50, isCompleted: "No" }
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(testData);
  assert.ok(csv.includes('"title","category","durationMinutes","isCompleted"'));
  assert.ok(csv.includes('"Morning HIIT","hiit",30,"Yes"'));
});
test("Workout volume calculation across sets and reps", () => {
  const exercises = [
    { name: "Bench Press", sets: 4, reps: 10, weight: 80 },
    { name: "Overhead Press", sets: 3, reps: 8, weight: 50 }
  ];
  const totalVolume = exercises.reduce((sum, ex) => sum + ex.sets * ex.reps * ex.weight, 0);
  assert.equal(totalVolume, 4400);
});
