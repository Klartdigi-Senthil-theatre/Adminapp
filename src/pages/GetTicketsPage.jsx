import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Notification";
import api from "../config/api"
import GetTicketPreviewPopup from "../dialog/GetTicketPreviewPopup";
import { Tickets, Eye } from "lucide-react";
import moment from "moment";

const GetTicketsPage = () => {
  const [searchBookingId, setSearchBookingId] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingSummary, setShowBookingSummary] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

const handleGetTickets = async () => {
    if (!searchBookingId) {
      notify.error("Please enter a Booking ID.");
      return;
    }
    setSearchLoading(true);
    setShowBookingSummary(false);

    try {
      // First get the booking details
      const bookingResult = await api.get(`/movie-seat-bookings/${searchBookingId}`);

      // Then get the movie details using the movieId from booking
      const movieResponse = await api.get(`/movies/${bookingResult.movieId}`);

      // Get showtime planner by date
      let showTimePlannerData = null;
      let ticketPrice = bookingResult.price; // fallback to booking price if present

      if (bookingResult.date) {
        try {
          const showTimeByDateResponse = await api.get(`/show-time-planner/date/${bookingResult.date}`);
          
          // If we get showtime data by date, use it
          if (showTimeByDateResponse && showTimeByDateResponse.length > 0) {
            // Find the matching showtime (you might want to add more specific matching logic)
            showTimePlannerData = showTimeByDateResponse[0]; // Using first result, adjust as needed
            
            if (showTimePlannerData && showTimePlannerData.price) {
              ticketPrice = showTimePlannerData.price;
            }

            // Get showTime details using showtimeId from showTimePlannerData
            if (showTimePlannerData && showTimePlannerData.showtimeId) {
              try {
                const showTimeResponse = await api.get(`/show-times/${showTimePlannerData.showtimeId}`);
                if (showTimeResponse && showTimeResponse.showTime) {
                  showTimePlannerData.showTime = showTimeResponse.showTime;
                }
              } catch (showTimeError) {
                console.warn("Could not fetch showTime details:", showTimeError);
              }
            }
          }
        } catch (dateApiError) {
          console.warn("Could not fetch showtime by date:", dateApiError);
          
          // Fallback to original method if date API fails
          if (bookingResult.showTimePlannerId) {
            try {
              showTimePlannerData = await api.get(`/show-time-planner/${bookingResult.showTimePlannerId}`);
              if (showTimePlannerData && showTimePlannerData.price) {
                ticketPrice = showTimePlannerData.price;
              }
            } catch (plannerIdError) {
              console.warn("Could not fetch showtime by ID:", plannerIdError);
            }
          }
        }
      } else if (bookingResult.showTimePlannerId) {
        // Fallback to showTimePlannerId if date is not available
        try {
          showTimePlannerData = await api.get(`/show-time-planner/${bookingResult.showTimePlannerId}`);
          if (showTimePlannerData && showTimePlannerData.price) {
            ticketPrice = showTimePlannerData.price;
          }
        } catch (plannerIdError) {
          console.warn("Could not fetch showtime by ID:", plannerIdError);
        }
      }

      // Combine the results
      const combinedResult = {
        ...bookingResult,
        movieDetails: movieResponse,
        showTimePlanner: showTimePlannerData,
        price: ticketPrice
      };

      console.log(combinedResult);

      setBookingResult(combinedResult);
      setShowBookingSummary(true);
      notify.success("Booking details fetched successfully!");
    } catch (err) {
      setBookingResult(null);
      setShowBookingSummary(false);
      setIsTicketPopupOpen(false);
      notify.error("No booking found for this Booking ID.");
    } finally {
      setSearchLoading(false);
    }
  };

const handleViewTickets = () => {
  setIsTicketPopupOpen(true);
  notify.success("Opening ticket preview...");
};

const handleNewSearch = () => {
  setSearchBookingId("");
  setBookingResult(null);
  setShowBookingSummary(false);
  setIsTicketPopupOpen(false);
};

  const seatCount = bookingResult?.seatNumber?.length || 0;
  const totalAmount = seatCount * (bookingResult?.price || 0);

  if (error) return <div className="p-4 text-red-500">Error loading showtimes: {error}</div>;

  return (
    <div className="p-2 lg:p-4 min-h-screen">
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
  
  <PageHeader title="Get Tickets" />

  {/* Centered container */}
  <div className="flex justify-center items-start mt-4">
    {/* Left Side - Card UI - Centered */}
    <div className="w-full max-w-xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
          <Tickets size={24} />
          Find Booking
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={searchBookingId}
              onChange={e => setSearchBookingId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter Booking ID"
              disabled={showBookingSummary}
            />
          </div>
        </div>

        {/* Action Button */}
        {!showBookingSummary ? (
          <button
            onClick={handleGetTickets}
            className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            disabled={searchLoading}
          >
            {searchLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <Tickets className="mr-2" size={18} />
                Get Tickets
              </>
            )}
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleViewTickets}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              <Eye className="mr-2" size={18} />
              View Tickets
            </button>
            <button
              onClick={handleNewSearch}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              New Search
            </button>
          </div>
        )}

        {/* Booking Info Card (shown when there's a result) */}
        {showBookingSummary && bookingResult && (
          <div className="mt-3 border-t pt-4">
            <h3 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
              <Tickets size={20} />
              Booking Summary
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Booking ID:</span>
                  <span className="font-semibold text-orange-600">ST - {bookingResult.bookingId || searchBookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Movie:</span>
                  <span className="font-medium">{bookingResult.movieDetails?.movieName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{moment(bookingResult.date).format("MMM D, YYYY")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{moment(bookingResult.showTimePlanner.showTime.showTime, "HH:mm").format("h:mm A")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-medium text-blue-600">
                    {bookingResult.seatNumber?.map(seat => seat.seatNo).join(', ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center font-medium mt-3 pt-3 border-t border-gray-200">
                  <span className="text-lg">Total Amount:</span>
                  <span className="text-lg text-green-600">₹{totalAmount || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>

      {isTicketPopupOpen && bookingResult && (
        <div className="lg:sticky lg:top-4">
          <GetTicketPreviewPopup
            selectedSeats={bookingResult.seatNumber?.map(seat => seat.seatNo) || []}
            currentShow={{
              movieName: bookingResult.movieDetails?.movieName || "Movie Title",
              poster: bookingResult.movieDetails?.image,
              date: bookingResult.date || bookingResult.showTimePlanner?.date,
              time: bookingResult.showTimePlanner.showTime.showTime,
              price: bookingResult.price || bookingResult.showTimePlanner?.price,
              movieDetails: bookingResult.movieDetails,
              showTimePlanner: bookingResult.showTimePlanner,
              theatre: bookingResult.showTimePlanner?.theatre
            }}
            bookingId={bookingResult.bookingId || searchBookingId}
            onClose={() => setIsTicketPopupOpen(false)}
          />
        </div>
      )}      
</div>
  );
};

export default GetTicketsPage;