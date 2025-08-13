import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";
import { notify } from "../components/Notification";
import api from "../config/api"

const initialMovies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    duration: "3h 1m",
    rating: "PG-13",
    showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
  }
];

const allPossibleMovies = [
  ...initialMovies,
  {
    id: 3,
    title: "Dune",
    duration: "2h 35m",
    rating: "PG-13",
    showTimes: ["10:30 AM", "3:00 PM", "7:00 PM"],
  },
  {
    id: 4,
    title: "The Batman",
    duration: "2h 56m",
    rating: "PG-13",
    showTimes: ["12:00 PM", "4:00 PM", "8:00 PM"],
  }
];

const ShowTimePage = () => {
  const [showTimes, setShowTimes] = useState([]);
  const [apiShowTimes, setApiShowTimes] = useState([]); // New state for API data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [planners, setPlanners] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [assignedTimes, setAssignedTimes] = useState({});
  const [showtimePrices, setShowtimePrices] = useState({});
  const DEFAULT_TICKET_PRICE = "150";
  const [movieOptions, setMovieOptions] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionData, setLastSubmissionData] = useState(null);

  // Core state: moviesByDate
  const [moviesByDate, setMoviesByDate] = useState({
    [moment().format('YYYY-MM-DD')]: initialMovies
  });

  // dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMovieToAdd, setSelectedMovieToAdd] = useState(null);

  // Fetch showtimes from API
  useEffect(() => {
    const fetchShowTimes = async () => {
      try {
        setLoading(true);
        const data = await api.get('/show-times');
        console.log('API showtime data:', data); // Debug log to see API structure
        setApiShowTimes(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching showtimes:", err);
      }
    };

    fetchShowTimes();
  }, []);

  // Helper function to format API datetime to display time
  const formatShowTime = (dateTimeString) => {
    if (!dateTimeString) {
      console.warn('formatShowTime: No datetime string provided');
      return 'Time not set';
    }
    
    // Handle different possible formats and ensure we get a valid date
    let momentDate;
    
    // Try parsing with moment's default parser first
    momentDate = moment(dateTimeString);
    
    // If that fails, try some common datetime formats
    if (!momentDate.isValid()) {
      const formats = [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'YYYY-MM-DDTHH:mm:ssZ',
        'HH:mm:ss',
        'HH:mm'
      ];
      
      for (const format of formats) {
        momentDate = moment(dateTimeString, format);
        if (momentDate.isValid()) {
          break;
        }
      }
    }
    
    if (!momentDate.isValid()) {
      console.warn('formatShowTime: Invalid datetime string after trying multiple formats:', dateTimeString);
      return 'Invalid time';
    }
    
    return momentDate.format('h:mm A');
  };

  // Extract planner fetching logic into reusable function
  const refreshPlannerData = useCallback(async () => {
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await api.get(`/show-time-planner/date/${formattedDate}`);

      const assignments = {};
      const prices = {};

      // First, set default prices for all active showtimes
      const activeShowTimes = apiShowTimes
        .filter(showTime => showTime.active);
      
      activeShowTimes.forEach((showTime) => {
        prices[showTime.id] = DEFAULT_TICKET_PRICE;
      });

      // Then override with actual prices from planner data
      response.forEach((item) => {
        const displayTime = formatShowTime(item.showTime.showTime);
        const showTimeId = item.showTimeId;

        // Debug logging to identify duplicate displayTime issues
        if (assignments[showTimeId]) {
          console.warn(`Duplicate showTimeId detected: ${showTimeId}`, {
            existing: assignments[showTimeId],
            new: {
              id: item.movie.id,
              title: item.movie.movieName,
              showTimeId: item.showTimeId,
              plannerId: item.id,
              displayTime: displayTime,
            },
            rawTime: item.showTime.showTime
          });
        }

        // Use showTimeId as key instead of displayTime for more reliable mapping
        assignments[showTimeId] = {
          id: item.movie.id,
          title: item.movie.movieName,
          showTimeId: item.showTimeId,
          plannerId: item.id,
          displayTime: displayTime,
        };

        prices[showTimeId] = item.price || DEFAULT_TICKET_PRICE;
      });

      // ✅ Always use full movie list
      setMovieOptions(allMovies); // this will be from full movie list
      setAssignedTimes(assignments);
      setShowtimePrices(prices);
      
      console.log('✅ Planner data refreshed with updated plannerIds:', assignments);
    } catch (err) {
      console.error("Error fetching planner:", err);
      setAssignedTimes({});
      
      // Set default prices for all active showtimes when planner fetch fails
      const activeShowTimes = apiShowTimes
        .filter(showTime => showTime.active);
      
      const defaultPrices = {};
      activeShowTimes.forEach((showTime) => {
        defaultPrices[showTime.id] = DEFAULT_TICKET_PRICE;
      });
      setShowtimePrices(defaultPrices);
      
      setMovieOptions(allMovies); // still allow dropdowns even if planner fails
    }
  }, [selectedDate, apiShowTimes, allMovies]);

  useEffect(() => {
    if (allMovies.length > 0) {
      refreshPlannerData();
    }
  }, [selectedDate, allMovies, refreshPlannerData]);


useEffect(() => {
  const fetchMovies = async () => {
    try {
      const response = await api.get("/movies"); // Assuming this exists
      setMovieOptions(response);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  fetchMovies();
}, []);

useEffect(() => {
  const fetchAllMovies = async () => {
    try {
      const res = await api.get("/movies");
      const formatted = res.map((m) => ({
        id: m.id,
        title: m.movieName,
      }));
      setAllMovies(formatted);
    } catch (err) {
      console.error("Failed to fetch all movies", err);
    }
  };

  fetchAllMovies();
}, []);

// Initialize default prices for all active showtimes
useEffect(() => {
  if (apiShowTimes.length > 0) {
    const activeShowTimes = apiShowTimes
      .filter(showTime => showTime.active)
      .map(showTime => ({
        ...showTime,
        displayTime: formatShowTime(showTime.showTime),
      }))
      .sort((a, b) => {
        // Sort by time chronologically - access the nested showTime property
        const timeA = moment(a.showTime);
        const timeB = moment(b.showTime);
        
        console.log('UseEffect sorting:', a.displayTime, 'vs', b.displayTime);
        
        if (timeA.isValid() && timeB.isValid()) {
          return timeA.diff(timeB);
        }
        
        // Fallback to display time sorting
        if (!timeA.isValid() || !timeB.isValid()) {
          const convertTo24Hour = (timeStr) => {
            const cleanTime = timeStr.toLowerCase().replace(/[^\d:apm]/g, '');
            const [time, period] = cleanTime.split(/([ap]m)/);
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'pm' && hours !== 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          
          const timeValueA = convertTo24Hour(a.displayTime);
          const timeValueB = convertTo24Hour(b.displayTime);
          return timeValueA - timeValueB;
        }
        
        if (timeA.isValid() && !timeB.isValid()) return -1;
        if (!timeA.isValid() && timeB.isValid()) return 1;
        
        return 0;
      });
    
    setShowtimePrices((prev) => {
      const newPrices = { ...prev };
      
      activeShowTimes.forEach((showTimeItem) => {
        const showTimeId = showTimeItem.id;
        // Set default if no price exists or if price is empty/undefined
        if (!newPrices[showTimeId] || newPrices[showTimeId] === "") {
          newPrices[showTimeId] = DEFAULT_TICKET_PRICE;
        }
      });
      
      return newPrices;
    });
  }
}, [apiShowTimes]);

// Ensure default prices are set when date changes
useEffect(() => {
  if (apiShowTimes.length > 0) {
    setShowtimePrices((prev) => {
      const newPrices = { ...prev };
      const activeShowTimes = apiShowTimes.filter(showTime => showTime.active);
      
      activeShowTimes.forEach((showTime) => {
        // Always ensure there's a price, set default if missing or empty
        if (!newPrices[showTime.id] || newPrices[showTime.id] === "") {
          newPrices[showTime.id] = DEFAULT_TICKET_PRICE;
        }
      });
      
      return newPrices;
    });
  }
}, [selectedDate, apiShowTimes]);

// Reset submission tracking when assignments or prices change (with debounce)
useEffect(() => {
  // Only reset if we actually have submission data to reset
  if (!lastSubmissionData) return;
  
  // Small delay to prevent resetting during rapid state updates or refresh operations
  const timer = setTimeout(() => {
    console.log('🔄 Resetting lastSubmissionData due to state changes');
    setLastSubmissionData(null);
  }, 1000); // Increased delay to account for refresh operations
  
  return () => clearTimeout(timer);
}, [assignedTimes, showtimePrices, lastSubmissionData]);

  // Check if the selected date allows editing (only future dates)
  const isDateEditable = () => {
    const today = moment().startOf('day');
    const selected = selectedDate.clone().startOf('day');
    return selected.isAfter(today);
  };

  // Get active showtimes for display
  const getActiveShowTimes = () => {
    // Only filter for active showtimes, no formatting or mapping
    return apiShowTimes.filter(showTime => showTime.active);
  };

  // Date nav
  const handlePrevMonth = () => setCurrentDate(currentDate.clone().subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.clone().add(1, "month"));
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Reset last submission data when date changes
    setLastSubmissionData(null);
  };

  // Per this day
  const thisDayKey = selectedDate.format("YYYY-MM-DD");
  const moviesToday = moviesByDate[thisDayKey] || [];

  // Booked times for this date only!
  const getAllBookedTimes = () => moviesToday.flatMap(movie => movie.showTimes);

  // Add new movie for this date only
  const handleAddMovie = () => {
    if (selectedMovieToAdd) {
      const bookedTimes = getAllBookedTimes();
      const conflictingTimes = selectedMovieToAdd.showTimes.filter(time =>
        bookedTimes.includes(time)
      );
      if (conflictingTimes.length > 0) {
        notify.warning(`Cannot add movie due to time conflicts: ${conflictingTimes.join(", ")}`);
        return;
      }
      // Add for this date only
      setMoviesByDate({
        ...moviesByDate,
        [thisDayKey]: [
          ...(moviesToday || []),
          { ...selectedMovieToAdd }
        ]
      });
      setSelectedMovieToAdd(null);
      setIsDropdownOpen(false);
    }
  };

  // Calendar days (reuse your code)
  const startOfMonth = currentDate.clone().startOf("month").startOf("week");
  const endOfMonth = currentDate.clone().endOf("month").endOf("week");
  const days = [];
  let day = startOfMonth.clone();
  while (day.isBefore(endOfMonth, "day")) {
    days.push(day.clone());
    day.add(1, "day");
  }
  const isSameDay = (day1, day2) => day1.isSame(day2, "day");
  const isCurrentMonth = (d) => d.isSame(currentDate, "month");

  // Handle form submission
const handleSubmit = async () => {
  // Prevent multiple submissions
  if (isSubmitting) {
    return;
  }

  try {
    setIsSubmitting(true);
    const formattedDate = selectedDate.format("YYYY-MM-DD");

    // Create a unique identifier for this submission to prevent duplicate data
    const submissionIdentifier = {
      date: formattedDate,
      assignments: JSON.stringify(assignedTimes),
      prices: JSON.stringify(showtimePrices)
    };

    // Check if this exact same data was just submitted
    if (lastSubmissionData && 
        lastSubmissionData.date === submissionIdentifier.date &&
        lastSubmissionData.assignments === submissionIdentifier.assignments &&
        lastSubmissionData.prices === submissionIdentifier.prices) {
      console.log('Identical submission detected - skipping to prevent duplicates');
      notify.warning('No changes detected since last submission');
      return;
    }

    // Collect all assignments into arrays
    const newEntries = [];
    const updateEntries = [];
    const deleteEntries = [];

    // First, get all active showtimes to check for deletions
    const activeShowTimes = getActiveShowTimes();
    
    // Check each active showtime for assignments or deletions needed
    activeShowTimes.forEach((showTimeItem) => {
      const assignment = assignedTimes[showTimeItem.id];
      
      console.log(`🔍 Processing showtime ${showTimeItem.displayTime} (ID: ${showTimeItem.id}):`, {
        assignment,
        hasPlannerId: !!assignment?.plannerId,
        hasMovieAssignment: !!(assignment?.id && assignment?.showTimeId)
      });
      
      if (assignment && assignment.id && assignment.showTimeId) {
        // Has a current assignment
        const showTimePrice = showtimePrices[assignment.showTimeId];
        if (!showTimePrice) {
          notify.warning(`Please enter a price for ${assignment.displayTime || showTimeItem.displayTime} showtime.`);
          return;
        }

        const payload = {
          movieId: assignment.id,
          showTimeId: assignment.showTimeId,
          date: `${formattedDate}T00:00:00Z`,
          price: parseFloat(showTimePrice),
        };

        // Separate new entries from updates
        if (assignment.plannerId) {
          console.log(`📝 UPDATE: ${showTimeItem.displayTime} - PlannerId: ${assignment.plannerId}`);
          updateEntries.push({
            ...payload,
            id: assignment.plannerId
          });
        } else {
          console.log(`➕ NEW: ${showTimeItem.displayTime} - No plannerId found`);
          newEntries.push(payload);
        }
      } else if (assignment && assignment.plannerId && (!assignment.id || !assignment.showTimeId)) {
        // Had an assignment before but now deselected (plannerId exists but no current movie)
        console.log(`🗑️ DELETE: ${showTimeItem.displayTime} - PlannerId: ${assignment.plannerId}`);
        deleteEntries.push({
          id: assignment.plannerId,
          showTimeId: showTimeItem.id,
          displayTime: showTimeItem.displayTime
        });
      } else if (!assignment) {
        console.log(`⭕ SKIP: ${showTimeItem.displayTime} - No assignment`);
      } else {
        console.log(`❓ UNCLEAR: ${showTimeItem.displayTime} - Assignment state unclear:`, assignment);
      }
    });

    // Process any remaining assignments that might not be in active showtimes
    for (let [showTimeId, assignment] of Object.entries(assignedTimes)) {
      // Skip if already processed in the activeShowTimes loop
      const alreadyProcessed = activeShowTimes.some(st => st.id.toString() === showTimeId.toString());
      if (alreadyProcessed) continue;

      if (assignment && assignment.plannerId && (!assignment.id || !assignment.showTimeId)) {
        // This is a deletion case
        deleteEntries.push({
          id: assignment.plannerId,
          showTimeId: showTimeId,
          displayTime: assignment.displayTime || 'Unknown'
        });
      }
    }

    // Deduplicate entries to prevent duplicate API calls
    const uniqueNewEntries = newEntries.filter((entry, index, arr) => 
      arr.findIndex(e => e.movieId === entry.movieId && e.showTimeId === entry.showTimeId && e.date === entry.date) === index
    );
    
    const uniqueUpdateEntries = updateEntries.filter((entry, index, arr) => 
      arr.findIndex(e => e.id === entry.id) === index
    );

    const uniqueDeleteEntries = deleteEntries.filter((entry, index, arr) => 
      arr.findIndex(e => e.id === entry.id) === index
    );

    // Debug logging for submission summary
    console.log("Submission Summary:", {
      totalAssignments: Object.keys(assignedTimes).length,
      newEntries: uniqueNewEntries.length,
      updateEntries: uniqueUpdateEntries.length,
      deleteEntries: uniqueDeleteEntries.length,
      originalNewEntries: newEntries.length,
      originalUpdateEntries: updateEntries.length,
      originalDeleteEntries: deleteEntries.length,
      assignedTimes: assignedTimes,
      deleteDetails: uniqueDeleteEntries
    });

    // Handle new entries (POST as array)
    if (uniqueNewEntries.length > 0) {
      console.log("POST → /show-time-planner", uniqueNewEntries);
      try {
        await api.post("/show-time-planner", uniqueNewEntries);
      } catch (postError) {
        if (postError.response?.status === 404) {
          // Try alternative endpoint patterns
          console.log("Primary POST endpoint failed, trying alternatives...");
          try {
            await api.post("/show-time-planners", uniqueNewEntries);
          } catch (altError) {
            if (altError.response?.status === 404) {
              try {
                await api.post("/showtimes", uniqueNewEntries);
              } catch (altError2) {
                // If all alternatives fail, throw the original error
                throw postError;
              }
            } else {
              throw altError;
            }
          }
        } else {
          throw postError;
        }
      }
    }

    // Handle updates (individual PUT/PATCH requests)
    for (let updateEntry of uniqueUpdateEntries) {
      const { id, ...updatePayload } = updateEntry;
      console.log("PUT →", `/show-time-planner/${id}`, updatePayload);
      
      try {
        await api.put(`/show-time-planner/${id}`, updatePayload);
      } catch (putError) {
        if (putError.response?.status === 404 || putError.response?.status === 405) {
          // Try alternative endpoint patterns for updates
          console.log("PUT failed, trying alternative endpoints...");
          try {
            await api.put(`/show-time-planners/${id}`, updatePayload);
          } catch (altPutError) {
            if (altPutError.response?.status === 404 || altPutError.response?.status === 405) {
              // If PUT endpoints don't exist, try PATCH as fallback
              console.log("PUT alternatives failed, trying PATCH as fallback...");
              try {
                await api.patch(`/show-time-planner/${id}`, updatePayload);
              } catch (patchError) {
                if (patchError.response?.status === 404) {
                  await api.patch(`/show-time-planners/${id}`, updatePayload);
                } else {
                  throw patchError;
                }
              }
            } else {
              throw altPutError;
            }
          }
        } else {
          throw putError;
        }
      }
    }

    // Handle deletions (individual DELETE requests)
    for (let deleteEntry of uniqueDeleteEntries) {
      console.log("DELETE →", `/show-time-planner/${deleteEntry.id}`, {
        showTimeId: deleteEntry.showTimeId,
        displayTime: deleteEntry.displayTime
      });
      
      try {
        await api.delete(`/show-time-planner/${deleteEntry.id}`);
      } catch (deleteError) {
        if (deleteError.response?.status === 404) {
          // Try alternative endpoint patterns for deletion
          console.log("Primary DELETE endpoint failed, trying alternatives...");
          try {
            await api.delete(`/show-time-planners/${deleteEntry.id}`);
          } catch (altDeleteError) {
            if (altDeleteError.response?.status === 404) {
              // If the record doesn't exist, consider it already deleted (not an error)
              console.log(`Record ${deleteEntry.id} not found, assuming already deleted`);
            } else {
              throw altDeleteError;
            }
          }
        } else if (deleteError.response?.status === 405) {
          // Some APIs might not support DELETE, try a different approach
          console.log("DELETE method not allowed, this might be expected");
        } else {
          throw deleteError;
        }
      }
    }

    // Refresh planner data to get updated plannerIds from server
    // This ensures we have the correct plannerId values for future operations
    await refreshPlannerData();

    // Store the submission data to prevent duplicate submissions
    setLastSubmissionData(submissionIdentifier);

    notify.success("Showtimes submitted successfully!");
  } catch (error) {
    console.error("Submission error details:", {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    // More specific error messages
    if (error.response?.status === 404) {
      notify.error(`API endpoint not found. Please check if the endpoint exists: ${error.config?.url}`);
    } else if (error.response?.status === 401) {
      notify.error("Authentication failed. Please check your login credentials.");
    } else if (error.response?.status === 500) {
      notify.error("Server error occurred. Please try again later.");
    } else {
      notify.error(`Failed to save showtimes - ${error.response?.status} error. ${error.response?.data?.error || error.response?.data?.message || error.message}`);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (error) return <div className="p-4 text-red-500">Error loading showtimes: {error}</div>;

  const activeShowTimes = getActiveShowTimes();

  return (
    <div className="p-4 lg:p-6">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              <span>Loading...</span>
            </div>
          </div>
        </div>
      )}
      
      <PageHeader title="Showtime Planner" />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar: Same as your code */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:w-1/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {currentDate.format("MMMM YYYY")}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => handleDateSelect(day)}
                className={`p-2 rounded-full text-center
                   ${
                     isSameDay(day, selectedDate)
                       ? "bg-orange-600 text-white border hover:border-orange-600 hover:text-black"
                       : ""
                   }
                   ${
                     !isCurrentMonth(day)
                       ? "text-gray-400"
                       : "hover:bg-gray-100"
                   }
                   ${isSameDay(day, moment()) ? "border border-orange-500" : ""}
                 `}
                disabled={!isCurrentMonth(day)}
              >
                {day.format("D")}
              </button>
            ))}
          </div>
          {/* Selected date info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Selected:{" "}
              <span className="font-medium">
                {selectedDate.format("dddd, MMMM D, YYYY")}
              </span>
            </p>
          </div>
        </div>

        {/* Showtime Panel */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:w-2/3 border-1 border-orange-400">
          <h2 className="text-lg font-semibold mb-4">
            Showtimes for <span className="text-orange-600">{selectedDate.format("dddd, MMMM D")}</span>
          </h2>

          {/* Info message when editing is disabled */}
          {!isDateEditable() && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Read-only mode:</strong> Price and movie changes are disabled for current and past dates. Select a future date to enable editing.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {activeShowTimes.length > 0 ? (
              activeShowTimes.map((showTimeItem) => {
                const assignedMovie = assignedTimes[showTimeItem.id];

                return (
                  <div
                    key={showTimeItem.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border p-3 rounded-lg"
                  >
                    {/* Show timing label */}
                    <div className="text-sm font-semibold">
                      {showTimeItem.showTime}
                    </div>

                    {/* Price Input */}
                    <div className="flex items-center gap-2">
                      <label className={`text-sm font-semibold ${!isDateEditable() ? 'text-gray-400' : 'text-gray-700'}`}>Price ₹</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={showtimePrices[showTimeItem.id] || DEFAULT_TICKET_PRICE}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*\.?\d*$/.test(val)) {
                            setShowtimePrices((prev) => ({
                              ...prev,
                              [showTimeItem.id]: val,
                            }));
                          }
                        }}
                        disabled={!isDateEditable()}
                        className={`border rounded px-2 py-1 w-20 text-center ${
                          !isDateEditable() 
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                            : 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500'
                        }`}
                        placeholder="150"
                      />
                    </div>

                    {/* Dropdown */}
                    <CustomDropdown
  value={assignedMovie?.id || ""}
  onChange={(id) => {
    if (id === null) {
      // User deselected the movie
      setAssignedTimes((prev) => ({
        ...prev,
        [showTimeItem.id]: assignedMovie?.plannerId 
          ? {
              // Keep plannerId for deletion but clear movie details
              plannerId: assignedMovie.plannerId,
              showTimeId: showTimeItem.id,
              displayTime: showTimeItem.displayTime,
              id: null,
              title: null,
            }
          : null, // Completely remove if no plannerId (was never saved)
      }));
    } else {
      // User selected a movie
      const selectedMovie = movieOptions.find((m) => m.id === id);
      if (selectedMovie) {
        setAssignedTimes((prev) => ({
          ...prev,
          [showTimeItem.id]: {
            id: selectedMovie.id,
            title: selectedMovie.title,
            showTimeId: showTimeItem.id,
            plannerId: assignedMovie?.plannerId || null,
            displayTime: showTimeItem.displayTime,
          }
        }));
      }
    }
  }}
  options={movieOptions}
  disabled={!isDateEditable()}
/>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No active showtimes available
              </div>
            )}
            
            <div className="bottom-10 right-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !isDateEditable() ||
                  activeShowTimes.length === 0 ||
                  Object.entries(assignedTimes).some(([showTimeId, assignment]) => 
                    assignment && !showtimePrices[assignment.showTimeId]
                  )
                }
                className="bg-orange-600 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowTimePage;