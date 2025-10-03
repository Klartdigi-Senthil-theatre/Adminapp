import { ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "../config/api";
import { isTimeDisabledForSnacks } from "../utils/snacksTimeHelpers";
import moment from "moment";

const TimingDropdown = ({ currentShow, onTimeSelect, context = "booking" }) => {
  const [moviesMap, setMoviesMap] = useState(new Map());
  const [isOpen, setIsOpen] = useState(false);
  const [availableTimings, setAvailableTimings] = useState([]);
  const [showTimeData, setShowTimeData] = useState([]); // Store full showtime data with movies
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const isTimeInPast = (time) => {
    if (!currentShow?.date || !time) return false;

    // Helper: normalize currentShow.date to YYYY-MM-DD (if possible)
    const normalizeDateToISO = (dateStr) => {
      if (!dateStr) return null;
      const s = String(dateStr).trim();
      // Already ISO-ish: 2025-08-14
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // DD-MM-YYYY -> convert
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split("-");
        return `${yyyy}-${mm}-${dd}`;
      }
      // Try moment sensible parsing as last resort
      const parsed = moment(
        s,
        ["YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY", moment.ISO_8601],
        true
      );
      if (parsed.isValid()) return parsed.format("YYYY-MM-DD");
      // if cannot parse, return null so we don't incorrectly block selection
      return null;
    };

    const isoDate = normalizeDateToISO(currentShow.date);
    if (!isoDate) {
      // can't parse date — safer to allow selection
      return false;
    }

    const todayStart = moment().startOf("day");
    const selectedDayStart = moment(isoDate, "YYYY-MM-DD").startOf("day");

    // If selected date is strictly before today, everything on that date is in the past
    if (selectedDayStart.isBefore(todayStart)) {
      return true;
    }

    // If selected date is after today, nothing is in the past (for that date)
    if (selectedDayStart.isAfter(todayStart)) {
      return false;
    }

    // === At this point selected date is today: we must compare exact times ===

    // Normalize the time string:
    let timeOnly = String(time).trim();

    // If time contains date+time (e.g. "2025-08-14 18:00:00"), attempt to extract the time part
    if (/\d{4}-\d{2}-\d{2}/.test(timeOnly)) {
      // If it has date part, try to parse full datetime first (robust)
      const tryFull = moment(
        timeOnly,
        [
          "YYYY-MM-DD HH:mm:ss",
          "YYYY-MM-DD H:mm:ss",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD H:mm",
          "YYYY-MM-DD h:mm A",
          moment.ISO_8601,
        ],
        true
      );

      if (tryFull.isValid()) {
        if (context === "snacks") {
          // For snacks: only disable after next show starts
          return isSnacksTimeDisabled(tryFull, isoDate);
        } else {
          // For booking: use original logic (current time + 1 hour buffer)
          return moment().isAfter(tryFull.clone().add(1, "hour"));
        }
      }
      // if can't parse strict, keep going to other attempts
      // extract last token as fallback time
      const parts = timeOnly.split(/\s+/);
      timeOnly = parts[parts.length - 1];
    }

    // ensure "6:00PM" => "6:00 PM" (space before AM/PM) and uppercase AM/PM
    timeOnly = timeOnly.replace(/([ap])\.?\s*?m$/i, (m) => {
      // e.g. "6:00pm" or "6:00pm" -> "  PM"
      return " " + m.toUpperCase().replace(/\./g, "");
    });
    // also insert space when stuck like "6:00PM"
    timeOnly = timeOnly.replace(/([0-9])([AP]M)$/i, "$1 $2");

    // Build candidate datetime strings
    const datetimeStr = `${isoDate} ${timeOnly}`;

    // Try strict parsing with a list of likely formats:
    const strictFormats = [
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD H:mm:ss",
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DD H:mm",
      "YYYY-MM-DD h:mm A",
      "YYYY-MM-DD hh:mm A",
      "YYYY-MM-DD h:mma",
      "YYYY-MM-DD h:mmA",
    ];

    const parsedStrict = moment(
      `${isoDate} ${timeOnly}`,
      [
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD H:mm",
        "YYYY-MM-DD hh:mm A",
        "YYYY-MM-DD h:mm A",
      ],
      true
    ); // strict mode

    if (parsedStrict.isValid()) {
      if (context === "snacks") {
        // For snacks: only disable after next show starts
        return isSnacksTimeDisabled(parsedStrict, isoDate);
      } else {
        // For booking: use original logic (current time + 1 hour buffer)
        console.log("Now local:", moment().format("YYYY-MM-DD HH:mm"));
        console.log("Parsed local:", parsedStrict.format("YYYY-MM-DD HH:mm"));
        console.log(
          "Buffer cutoff:",
          moment().add(1, "hour").format("YYYY-MM-DD HH:mm")
        );

        return moment().isAfter(parsedStrict.clone().add(1, "hour"));
      }
    }

    // Fallback - loose parse
    const parsedLoose = moment(datetimeStr);
    if (parsedLoose.isValid()) {
      if (context === "snacks") {
        // For snacks: only disable after next show starts
        return isSnacksTimeDisabled(parsedLoose, isoDate);
      } else {
        // For booking: use original logic (current time + 1 hour buffer)
        return moment().isAfter(parsedLoose.clone().add(1, "hour"));
      }
    }

    // If we still cannot parse, be permissive (allow selection)
    return false;
  };

  // Wrapper to call shared snacks helper with local state
  const isSnacksTimeDisabled = (showTime, isoDate) =>
    isTimeDisabledForSnacks(availableTimings, showTime, isoDate);

  // Fetch available showtimes with assigned movies for the selected date
  useEffect(() => {
    const fetchAvailableTimings = async () => {
      try {
        setLoading(true);
        const formattedDate = currentShow.date || moment().format("YYYY-MM-DD");
        const plannedShowtimes = await api.get(
          `/show-time-planner/date/${formattedDate}`
        );

        const moviesMap = new Map();
        plannedShowtimes.forEach((entry) => {
          if (!entry.active || !entry.movie || !entry.showTime) return;
          const movieId = entry.movieId;
          if (!moviesMap.has(movieId)) {
            moviesMap.set(movieId, {
              id: movieId,
              title: entry.movie.movieName,
              genre: entry.movie.genre || "Not specified",
              language: entry.movie.language || "Not specified",
              poster: entry.movie.image || "/default-poster.jpg",
              certificate: entry.movie.certificate || "Not specified",
              duration: entry.movie.duration || 0,
              timings: [],
              prices: new Map(),
            });
          }
          const movie = moviesMap.get(movieId);
          const rawShowTime = entry.showTime.showTime;
          if (rawShowTime) {
            movie.timings.push(rawShowTime);
            movie.prices.set(entry.showTimeId, entry.price);
          } else {
            console.warn(
              `Invalid showTime for showTimeId ${entry.showTimeId}: ${rawShowTime}`
            );
          }
        });
        setMoviesMap(moviesMap);

        // Normalize time format to "hh:mm A" for consistent sorting
        const normalizeTime = (timeStr) => {
          if (!timeStr) {
            console.warn("normalizeTime: Empty or null time string received");
            return null;
          }
          let timeOnly = String(timeStr).trim();

          // Extract time if datetime string (e.g., "2025-08-14 14:30:00" -> "14:30:00")
          if (/\d{4}-\d{2}-\d{2}/.test(timeOnly)) {
            timeOnly = timeOnly.split(/\s+/).pop();
          }

          // Normalize spaces and AM/PM format
          timeOnly = timeOnly
            .replace(/\s+/g, " ") // Collapse multiple spaces
            .replace(/(\d+):(\d{1,2})\s*([AP]M)$/i, "$1:$2 $3") // Ensure "HH:mm AM/PM"
            .replace(/(\d+):(\d{1})\s*([AP]M)$/i, "$1:0$2 $3"); // Pad single-digit minutes (e.g., "6:0 PM" -> "6:00 PM")

          // Try parsing with flexible formats, including non-strict mode as fallback
          let parsed = moment(timeOnly, ["hh:mm A", "h:mm A"], true);
          if (!parsed.isValid()) {
            parsed = moment(timeOnly, ["HH:mm:ss", "HH:mm"], true);
            if (parsed.isValid()) {
              // Convert 24-hour to 12-hour format
              timeOnly = parsed.format("hh:mm A");
            } else {
              // Fallback to non-strict parsing
              parsed = moment(timeOnly);
              if (parsed.isValid()) {
                timeOnly = parsed.format("hh:mm A");
              } else {
                console.warn(
                  `normalizeTime: Failed to parse time string: ${timeOnly}`
                );
                return timeOnly; // Fallback to original string
              }
            }
          }

          return parsed.format("hh:mm A"); // Always return "hh:mm A" format (e.g., "02:00 PM")
        };

        // Process and sort showtime data
        const processedData = plannedShowtimes
          .filter((item) => item.movie && item.showTime)
          .map((item) => ({
            time: normalizeTime(item.showTime.showTime),
            movie: {
              id: item.movie.id,
              title: item.movie.movieName,
            },
            genre: item.movie.genre,
            language: item.movie.language,
            poster: item.movie.image,
            certificate: item.movie.certificate,
            duration: item.movie.duration,
            showTimeId: item.showTimeId,
            originalTime: item.showTime.showTime,
            showTimePlannerId: item.id,
            price: item.price,
          }))
          .sort((a, b) => {
            const timeA = moment(a.time, "hh:mm A", true);
            const timeB = moment(b.time, "hh:mm A", true);

            if (timeA.isValid() && timeB.isValid()) {
              return timeA.diff(timeB); // Chronological sort
            }

            // Log sorting fallback for debugging
            console.warn(
              `sort: Fallback to string comparison for times: ${a.time} vs ${b.time}`
            );
            return (a.time || "").localeCompare(b.time || "");
          });

        setShowTimeData(processedData);
        const timings = Array.from(
          new Set(processedData.map((item) => item.time))
        );

        setAvailableTimings(timings);

        if (currentShow.time && !timings.includes(currentShow.time)) {
          onTimeSelect("", null);
        }
      } catch (error) {
        console.error(
          "TimingDropdown: Error fetching available timings:",
          error
        );
        setAvailableTimings([]);
        setShowTimeData([]);
        if (currentShow.time) {
          onTimeSelect("", null);
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentShow.date) {
      fetchAvailableTimings();
    }
  }, [currentShow.date, onTimeSelect, currentShow.time]);

  const handleTimeSelect = (time) => {
    // double-guard: prevent selecting past times even if UI somehow allows it
    if (isTimeInPast(time)) {
      return;
    }
    const selectedShowTime = showTimeData.find((item) => item.time === time);
    onTimeSelect(time, selectedShowTime || null);
    setIsOpen(false);
  };

  // Close when clicking outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative flex items-center gap-1 sm:gap-3">
      {/* Time label on the left - only show on desktop */}
      <span className="hidden sm:inline text-xs sm:text-sm text-gray-600">
        Time :
      </span>

      <div
        className="flex items-center gap-1 sm:gap-2 cursor-pointer relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs sm:text-sm font-semibold">
          {loading
            ? "Loading..."
            : availableTimings.length === 0
              ? "No shows"
              : currentShow.time || "Select Time"}
        </span>
        <ChevronDown className="text-orange-600" size={14} />

        {/* Dropdown */}
        {isOpen && !loading && (
          <div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 top-full right-0 mt-1 w-36 sm:w-48 bg-white rounded-md shadow-lg border border-gray-200"
          >
            <div className="py-1">
              {availableTimings.length === 0 ? (
                <div className="px-2 sm:px-4 py-1 text-xs sm:text-sm text-gray-500 text-center">
                  No showtimes
                </div>
              ) : (
                availableTimings.map((time) => {
                  const disabled = isTimeInPast(time);

                  return (
                    <button
                      key={time}
                      // only call handler when not disabled
                      onClick={() => !disabled && handleTimeSelect(time)}
                      disabled={disabled}
                      aria-disabled={disabled}
                      className={`block w-full text-left px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm
                      ${currentShow.time === time
                          ? "bg-orange-100 text-orange-700"
                          : ""
                        }
                      ${disabled
                          ? "cursor-not-allowed text-gray-400 opacity-70"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                    `}
                    >
                      <span className="inline-block w-18 sm:w-24 truncate">
                        {time}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimingDropdown;
