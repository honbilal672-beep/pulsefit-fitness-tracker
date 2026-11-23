import test from "node:test";
import assert from "node:assert/strict";
import { getReminderScheduleLabel } from "./reminderSchedule.js";

test("Reminder schedule labels match selected days", () => {
  assert.equal(getReminderScheduleLabel([1, 2, 3, 4, 5]), "Weekdays");
  assert.equal(getReminderScheduleLabel([0, 1, 2, 3, 4, 5, 6]), "Daily");
  assert.equal(getReminderScheduleLabel([0, 6]), "Weekends");
  assert.equal(getReminderScheduleLabel([1, 3, 5]), "Custom schedule");
  assert.equal(getReminderScheduleLabel([]), "No days");
});
