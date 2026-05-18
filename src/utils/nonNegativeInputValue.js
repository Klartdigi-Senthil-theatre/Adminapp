/** Keep empty input; clamp negative numbers to 0. */
export function nonNegativeInputValue(value) {
  if (value === "" || value == null) return value;
  const n = Number(value);
  return !Number.isNaN(n) && n < 0 ? "0" : value;
}
