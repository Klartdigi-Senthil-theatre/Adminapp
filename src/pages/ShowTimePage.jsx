import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";
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
  const [editablePrice, setEditablePrice] = useState(null);
  const [movieOptions, setMovieOptions] = useState([]);
  const [allMovies, setAllMovies] = useState([]);

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
    return moment(dateTimeString).format('h:mm A');
  };

  useEffect(() => {
  const fetchPlannerForDate = async () => {
    try {
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      const response = await api.get(`/show-time-planner/date/${formattedDate}`);

      const assignments = {};
      let extractedPrice = "";

      response.forEach((item) => {
        const displayTime = moment(item.showTime.showTime).format("h:mm A");

        assignments[displayTime] = {
          id: item.movie.id,
          title: item.movie.movieName,
          showTimeId: item.showTimeId,
          plannerId: item.id,
        };

        if (!extractedPrice) {
          extractedPrice = item.price;
        }
      });

      // ✅ Always use full movie list
      setMovieOptions(allMovies); // this will be from full movie list
      setAssignedTimes(assignments);
      setEditablePrice(extractedPrice || "");
    } catch (err) {
      console.error("Error fetching planner:", err);
      setAssignedTimes({});
      setEditablePrice("");
      setMovieOptions(allMovies); // still allow dropdowns even if planner fails
    }
  };

  if (allMovies.length > 0) {
    fetchPlannerForDate();
  }
}, [selectedDate, allMovies]);


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

  // Get active showtimes for display
  const getActiveShowTimes = () => {
    return apiShowTimes
      .filter(showTime => showTime.active)
      .map(showTime => ({
        ...showTime,
        displayTime: formatShowTime(showTime.showTime),
        fullDateTime: showTime.showTime
      }));
  };

  // Date nav
  const handlePrevMonth = () => setCurrentDate(currentDate.clone().subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate(currentDate.clone().add(1, "month"));
  const handleDateSelect = (date) => setSelectedDate(date);

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
        alert(`Cannot add movie due to time conflicts: ${conflictingTimes.join(", ")}`);
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
  try {
    const formattedDate = selectedDate.format("YYYY-MM-DD");

    for (let [displayTime, assignment] of Object.entries(assignedTimes)) {
      if (!assignment?.id || !assignment?.showTimeId) continue;

      const payload = {
        movieId: assignment.id,
        showTimeId: assignment.showTimeId,
        date: `${formattedDate}T00:00:00Z`,
        price: parseFloat(editablePrice),
      };

      console.log(
        assignment.plannerId ? "PATCH →" : "POST →",
        assignment.plannerId ? `/show-time-planner/${assignment.plannerId}` : `/show-time-planner`,
        payload
      );

      // 🔁 Send to backend
      if (assignment.plannerId) {
        await api.patch(`/show-time-planner/${assignment.plannerId}`, payload);
      } else {
        await api.post(`/show-time-planner`, payload);
      }
    }

    alert("Showtimes submitted successfully.");
  } catch (error) {
    console.error("Submission error:", error?.response?.data || error.message);
    alert("Failed to save one or more showtimes.");
  }
};

  if (loading) return <div className="p-4">Loading showtimes...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading showtimes: {error}</div>;

  const activeShowTimes = getActiveShowTimes();

  return (
    <div className="p-4 lg:p-6">
      <PageHeader title="Movie Showtimes" />
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

          {/* Price Input - Left label, right input */}
          <div className="flex justify-start items-center mb-4">
            <label className="text-sm font-semibold text-gray-700 mr-2">Price (Per Ticket) ₹</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={editablePrice || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setEditablePrice(val);
                }
              }}
              className="border border-gray-300 rounded px-2 py-1 w-35 text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter price"
            />
          </div>

          <div className="flex flex-col gap-3">
            {activeShowTimes.length > 0 ? (
              activeShowTimes.map((showTimeItem) => {
                const assignedMovie = assignedTimes[showTimeItem.displayTime];

                return (
                  <div
                    key={showTimeItem.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border p-3 rounded-lg"
                  >
                    {/* Show timing label */}
                    <div className="text-sm font-semibold">
                      {showTimeItem.displayTime}
                    </div>

                    {/* Dropdown */}
                    <CustomDropdown
  value={assignedMovie?.id || ""}
  onChange={(id) => {
    const selectedMovie = movieOptions.find((m) => m.id === id);
    setAssignedTimes((prev) => ({
      ...prev,
      [showTimeItem.displayTime]: selectedMovie
        ? {
            id: selectedMovie.id,
            title: selectedMovie.title,
            showTimeId: showTimeItem.id,
            plannerId: assignedMovie?.plannerId || null,
          }
        : null,
    }));
  }}
  options={movieOptions}
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
                disabled={!editablePrice || activeShowTimes.length === 0}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowTimePage;