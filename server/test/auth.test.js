import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
test("New user profiles are private by default", () => {
  const user = new User({
    username: "privateuser",
    email: "privateuser@example.com",
    password: "Password123!",
    name: "Private User"
  });
  assert.equal(user.isProfilePublic, false);
});
test("JWT generation and signature verification", () => {
  const secret = "test_secret_key_12345";
  const payload = {
    id: "507f1f77bcf86cd799439011",
    role: "user",
    email: "user@example.com",
    username: "fituser"
  };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  assert.ok(token, "Token should be generated");
  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.id, payload.id);
  assert.equal(decoded.email, payload.email);
  assert.equal(decoded.role, "user");
});
test("Password hashing and bcrypt comparison", async () => {
  const plainPassword = "SecretPassword123!";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);
  assert.notEqual(plainPassword, hash);
  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.equal(isMatch, true);
  const isWrong = await bcrypt.compare("WrongPassword", hash);
  assert.equal(isWrong, false);
});
test("Macro calculations helper test", () => {
  const items = [
    { foodItem: "Oatmeal", quantity: "1 bowl", calories: 250, protein: 10, carbs: 45, fat: 5 },
    { foodItem: "Boiled Eggs", quantity: "2 eggs", calories: 140, protein: 12, carbs: 1, fat: 10 }
  ];
  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
  assert.equal(totalCalories, 390);
  assert.equal(totalProtein, 22);
  assert.equal(totalCarbs, 46);
  assert.equal(totalFat, 15);
});
