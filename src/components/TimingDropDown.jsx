import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../config/api';
import moment from 'moment';

const TimingDropdown = ({ currentShow, onTimeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableTimings, setAvailableTimings] = useState([]);
  const [showTimeData, setShowTimeData] = useState([]); // Store full showtime data with movies
  const [loading, setLoading] = useState(true);

  // Helper function to format API datetime to display time
  const formatShowTime = (dateTimeString) => {
    if (!dateTimeString) {
      console.warn('formatShowTime: No datetime string provided');
      return 'Time not set';
    }

    let momentDate = moment(dateTimeString);

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
      console.warn('formatShowTime: Invalid datetime string:', dateTimeString);
      return 'Invalid time';
    }

    return momentDate.format('h:mm A');
  };

  // Fetch available showtimes with assigned movies for the selected date
  useEffect(() => {
    const fetchAvailableTimings = async () => {
      try {
        setLoading(true);
        const formattedDate = currentShow.date || moment().format('YYYY-MM-DD');

        console.log('TimingDropdown: Fetching timings for date:', formattedDate);

        // Fetch assigned showtimes for the date
        const plannedShowtimes = await api.get(`/show-time-planner/date/${formattedDate}`);
        console.log('TimingDropdown: Raw showtime data:', plannedShowtimes);

        // Process showtime data with movie information
        const processedData = plannedShowtimes
          .filter(item => {
            const hasData = item.movie && item.showTime;
            if (!hasData) {
              console.log('TimingDropdown: Skipping item without movie or showTime:', item);
            }
            return hasData;
          })
          .map(item => ({
            time: formatShowTime(item.showTime.showTime),
            movie: {
              id: item.movie.id,
              title: item.movie.movieName
            },
            showTimeId: item.showTimeId,
            originalTime: item.showTime.showTime,
            showTimePlannerId: item.id
          }))
          .sort((a, b) => {
            // Sort chronologically
            const convertTo24Hour = (timeStr) => {
              const cleanTime = timeStr.toLowerCase().replace(/[^\d:apm]/g, '');
              const [time, period] = cleanTime.split(/([ap]m)/);
              let [hours, minutes] = time.split(':').map(Number);
              if (period === 'pm' && hours !== 12) hours += 12;
              if (period === 'am' && hours === 12) hours = 0;
              return hours * 60 + minutes;
            };
            return convertTo24Hour(a.time) - convertTo24Hour(b.time);
          });

        // Store the full data and extract unique timings
        setShowTimeData(processedData);
        const timings = processedData
          .map(item => item.time)
          .filter((time, index, array) => array.indexOf(time) === index); // Remove duplicates

        console.log('TimingDropdown: Available timings for date:', formattedDate, timings);
        setAvailableTimings(timings);

        // If the currently selected time is not available for the new date, clear it
        if (currentShow.time && !timings.includes(currentShow.time)) {
          console.log('TimingDropdown: Current time not available for new date, clearing selection');
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
  }, [currentShow.date]); // Re-fetch when date changes

  const handleTimeSelect = (time) => {
    // Find the movie data for the selected time
    const selectedShowTime = showTimeData.find(item => item.time === time);
    const movieData = selectedShowTime ? selectedShowTime.movie : null;
    debugger
    console.log('TimingDropdown: Selected time:', time, 'Movie data:', movieData);
    onTimeSelect(time, selectedShowTime);
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