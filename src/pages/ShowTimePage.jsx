import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";

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
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [assignedTimes, setAssignedTimes] = useState({});

  // Core state: moviesByDate
  const [moviesByDate, setMoviesByDate] = useState({
    [moment().format('YYYY-MM-DD')]: initialMovies
  });

  // dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMovieToAdd, setSelectedMovieToAdd] = useState(null);

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
                   ${isSameDay(day, selectedDate)
                    ? "bg-orange-600 text-white border hover:border-orange-600 hover:text-black"
                    : ""
                  }
                   ${!isCurrentMonth(day) ? "text-gray-400" : "hover:bg-gray-100"
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
          <h2 className="text-xl font-semibold mb-4">
            Showtimes for {selectedDate.format("dddd, MMMM D")}
          </h2>

          <div className="flex flex-col gap-3">
            {["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"].map((time, index) => {
              const assignedMovie = assignedTimes[time];

              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border p-3 rounded-lg"
                >
                  {/* Show timing label */}
                  <div className="text-sm font-semibold">{time}</div>

                  {/* Dropdown */}
                  <CustomDropdown
                    value={assignedMovie?.id}
                    onChange={(id) => {
                      const selectedMovie = allPossibleMovies.find(m => m.id === id);
                      setAssignedTimes(prev => ({
                        ...prev,
                        [time]: selectedMovie ? {
                          id: selectedMovie.id,
                          title: selectedMovie.title
                        } : null
                      }));
                    }}
                    options={allPossibleMovies}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowTimePage;