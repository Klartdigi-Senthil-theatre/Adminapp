import moment from "moment";

// For snacks: only disable a show time after the next show starts.
// Fallback: if there is no next show, disable after one-hour buffer from this show's time.
export const isTimeDisabledForSnacks = (availableTimings, showTime, isoDate) => {
  const currentTime = moment();

  // Normalize and parse all timings for the same date
  const allTimings = (availableTimings || [])
    .map((t) => {
      const normalized = String(t).replace(/([ap])\.?\s*?m$/i, (m) =>
        " " + m.toUpperCase().replace(/\./g, "")
      );
      // Try strict parse first
      let parsed = moment(
        `${isoDate} ${normalized}`,
        ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD h:mm A"],
        true
      );
      // Fallback to loose parse if strict fails
      if (!parsed.isValid()) {
        parsed = moment(`${isoDate} ${normalized}`);
      }
      return parsed.isValid() ? parsed : null;
    })
    .filter((t) => t !== null)
    .sort((a, b) => a.diff(b));

  // Next show relative to this specific show time
  const nextShowTime = allTimings.find((t) => t.isAfter(showTime));

  // Next upcoming show relative to NOW (inclusive: if exact equal, treat as started)
  const nextShowAfterNow = allTimings.find((t) => t.isSameOrAfter(currentTime));

  // If there is a next upcoming show (relative to NOW):
  // - Before it starts, allow printing for all earlier shows (enabled)
  // - After it starts, disable earlier shows (including this one if it's earlier)
  if (nextShowAfterNow) {
    if (currentTime.isBefore(nextShowAfterNow)) {
      return false; // enabled until the next show actually starts
    }
    return showTime.isBefore(nextShowAfterNow);
  }

  // If there is NO next show, fall back to a one-hour buffer from this show's time
  return currentTime.isAfter(showTime.clone().add(1, "hour"));
};


