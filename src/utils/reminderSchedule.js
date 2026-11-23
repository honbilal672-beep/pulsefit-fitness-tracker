const WEEKDAYS = [1, 2, 3, 4, 5];

const getReminderScheduleLabel = (daysOfWeek = []) => {
  const selectedDays = new Set(daysOfWeek);

  if (selectedDays.size === 7) return "Daily";
  if (selectedDays.size === WEEKDAYS.length && WEEKDAYS.every((day) => selectedDays.has(day))) {
    return "Weekdays";
  }
  if (selectedDays.size === 2 && selectedDays.has(0) && selectedDays.has(6)) {
    return "Weekends";
  }
  return selectedDays.size === 0 ? "No days" : "Custom schedule";
};

export { getReminderScheduleLabel };
