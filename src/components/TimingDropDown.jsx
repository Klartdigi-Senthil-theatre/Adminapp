import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../config/api';
import moment from 'moment';

const TimingDropdown = ({ currentShow, onTimeSelect }) => {
  const [moviesMap, setMoviesMap] = useState(new Map());
  const [isOpen, setIsOpen] = useState(false);
  const [availableTimings, setAvailableTimings] = useState([]);
  const [showTimeData, setShowTimeData] = useState([]); // Store full showtime data with movies
  const [loading, setLoading] = useState(true);



  // Fetch available showtimes with assigned movies for the selected date
  useEffect(() => {
    const fetchAvailableTimings = async () => {
      try {
        setLoading(true);
        const formattedDate = currentShow.date || moment().format('YYYY-MM-DD');

        // Fetch assigned showtimes for the date
        const plannedShowtimes = await api.get(`/show-time-planner/date/${formattedDate}`);

        const moviesMap = new Map();
        plannedShowtimes.forEach((entry) => {
          // Skip inactive or invalid entries
          if (!entry.active || !entry.movie || !entry.showTime) {
            //console.warn(`Skipping invalid entry: ${JSON.stringify(entry)}`);
            return;
          }

          const movieId = entry.movieId;
          // Initialize movie entry if it doesn't exist
          if (!moviesMap.has(movieId)) {
            moviesMap.set(movieId, {
              id: movieId,
              title: entry.movie.movieName,
              genre: entry.movie.genre || "Not specified", // Fallback for missing genre
              language: entry.movie.language || "Not specified",
              poster: entry.movie.image || "/default-poster.jpg",
              certificate: entry.movie.certificate || "Not specified",
              duration: entry.movie.duration || 0,
              timings: [],
              prices: new Map(), // Map showTimeId to price
            });
          }

          // Add showtime to the movie's timings and prices
          const movie = moviesMap.get(movieId);

          // Use raw showTime format to match ShowTimePage approach
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

        // Process showtime data with movie information
        const processedData = plannedShowtimes
          .filter(item => {
            const hasData = item.movie && item.showTime;
            if (!hasData) {
              //console.log('TimingDropdown: Skipping item without movie or showTime:', item);
            }
            return hasData;
          })
          .map(item => ({
            time: item.showTime.showTime, // Use raw time format like ShowTimePage
            movie: {
              id: item.movie.id,
              title: item.movie.movieName
            },
            genre: item.movie.genre,
            language: item.movie.language,
            poster: item.movie.image,
            certificate: item.movie.certificate,
            duration: item.movie.duration,
            showTimeId: item.showTimeId,
            originalTime: item.showTime.showTime,
            showTimePlannerId: item.id,
            price: item.price
          }))
          .sort((a, b) => {
            // Sort chronologically from AM to PM (earliest to latest)
            const parseTime = (timeStr) => {
              if (!timeStr) return null;
              
              // Handle different formats: "14:30", "14:30:00", "2023-10-05 14:30:00"
              let timeOnly = timeStr;
              
              // If it contains a space, extract just the time part
              if (timeStr.includes(' ')) {
                timeOnly = timeStr.split(' ')[1] || timeStr.split(' ')[0];
              }
              
              // Try parsing with moment using various time formats
              const formats = ['HH:mm', 'HH:mm:ss', 'H:mm', 'H:mm:ss'];
              
              for (const format of formats) {
                const parsed = moment(timeOnly, format);
                if (parsed.isValid()) {
                  return parsed;
                }
              }
              
              // Fallback: try default moment parsing
              const defaultParsed = moment(timeStr);
              if (defaultParsed.isValid()) {
                return defaultParsed;
              }
              
              return null;
            };
            
            const timeA = parseTime(a.time);
            const timeB = parseTime(b.time);
            
            if (timeA && timeB) {
              return timeA.diff(timeB);
            }
            
            // If parsing fails, fallback to string comparison
            if (!timeA && !timeB) return 0;
            if (!timeA) return 1;
            if (!timeB) return -1;
            
            return a.time.localeCompare(b.time);
          });

        // Store the full data and extract unique timings
        setShowTimeData(processedData);
        const timings = processedData
          .map(item => item.time)
          .filter((time, index, array) => array.indexOf(time) === index); // Remove duplicates

        // Debug log to verify chronological sorting (AM to PM)
        console.log('TimingDropDown: Times sorted chronologically (AM to PM):', timings);

        setAvailableTimings(timings);

        // If the currently selected time is not available for the new date, clear it
        if (currentShow.time && !timings.includes(currentShow.time)) {
          onTimeSelect("", null); // Clear the time selection and movie data
        }

      } catch (error) {
        console.error('TimingDropdown: Error fetching available timings:', error);
        setAvailableTimings([]); // Empty array if no assignments
        setShowTimeData([]); // Clear showtime data on error
        // Clear the time selection on error
        if (currentShow.time) {
          onTimeSelect("", null); // Pass null for movie data
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
    const selectedShowTime = showTimeData.find(item => item.time === time);
    onTimeSelect(time, selectedShowTime || null);
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center gap-4">
      {/* Time label on the left */}
      <span className="text-sm text-gray-600">Time :</span>

      <div
        className="flex items-center gap-2 cursor-pointer relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold">
          {loading
            ? "Loading times..."
            : availableTimings.length === 0
              ? "No shows"
              : currentShow.time || "Select Time"
          }
        </span>
        <ChevronDown className="text-orange-600" size={18} />

        {/* Dropdown */}
        {isOpen && !loading && (
          <div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200"
          >
            <div className="py-1">
              {availableTimings.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">
                  No showtimes
                </div>
              ) : (
                availableTimings.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`block w-full text-left px-4 py-2 text-sm ${currentShow.time === time
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {time}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimingDropdown;