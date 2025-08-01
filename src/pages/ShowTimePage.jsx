import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import moment from "moment";

const ShowTimePage = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sample movie data with show times
  const [movies, setMovies] = useState([
    {
      id: 1,
      title: "Avengers: Endgame",
      duration: "3h 1m",
      rating: "PG-13",
      showTimes: ["10:00 AM", "1:30 PM", "5:00 PM", "8:30 PM"],
    },
    {
      id: 2,
      title: "Spider-Man: No Way Home",
      duration: "2h 28m",
      rating: "PG-13",
      showTimes: ["11:00 AM", "2:30 PM", "6:00 PM", "9:30 PM"],
    },
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
    },
  ]);

  // Generate days for the current month view
  const startOfMonth = currentDate.clone().startOf("month").startOf("week");
  const endOfMonth = currentDate.clone().endOf("month").endOf("week");

  const days = [];
  let day = startOfMonth.clone();

  while (day.isBefore(endOfMonth, "day")) {
    days.push(day.clone());
    day.add(1, "day");
  }

  // Group days by week
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "month"));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Reset selected movie when date changes
    setSelectedMovie(null);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setIsDropdownOpen(false);
  };

  const isSameDay = (day1, day2) => {
    return day1.isSame(day2, "day");
  };

  const isCurrentMonth = (day) => {
    return day.isSame(currentDate, "month");
  };

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl lg:text-2xl font-semibold mb-6">
        Movie Showtimes
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Calendar */}
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

        {/* Right Side - Movie Showtimes */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:w-2/3">
          <h2 className="text-xl font-semibold mb-4">
            Showtimes for {selectedDate.format("dddd, MMMM D")}
          </h2>

          {/* Movie dropdown selector */}
          <div className="relative mb-6">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex justify-between items-center w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left hover:border-orange-500 transition-colors"
            >
              <span className="truncate">
                {selectedMovie ? selectedMovie.title : "Select a movie"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""
                  }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {movies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleMovieSelect(movie)}
                    className={`w-full px-4 py-2 text-left hover:bg-orange-50 ${selectedMovie?.id === movie.id
                      ? "bg-orange-100 text-orange-600"
                      : ""
                      }`}
                  >
                    {movie.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Showtimes display */}
          {selectedMovie ? (
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{selectedMovie.title}</h3>
                <div className="flex space-x-2 text-sm text-gray-600">
                  <span>{selectedMovie.duration}</span>
                  <span>•</span>
                  <span>{selectedMovie.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {selectedMovie.showTimes.map((time, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {movies.length > 0
                ? "Please select a movie to see showtimes"
                : "No movies available for selected date"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowTimePage;
