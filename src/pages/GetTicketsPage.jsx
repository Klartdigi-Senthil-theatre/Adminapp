import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Notification";
import api from "../config/api";
import GetTicketPreviewPopup from "../dialog/GetTicketPreviewPopup";
import { Tickets, Eye } from "lucide-react";
import moment from "moment";

const GetTicketsPage = () => {
  const [searchBookingId, setSearchBookingId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isBookingIdMode, setIsBookingIdMode] = useState(false); // false = booking ID, true = phone number
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
    if (!isBookingIdMode && !searchBookingId) {
      notify.error("Please enter a Booking ID.");
      return;
    }
    if (isBookingIdMode && !phoneNumber) {
      notify.error("Please enter a Phone Number.");
      return;
    }
    setSearchLoading(true);
    setShowBookingSummary(false);

    try {
      let bookingResult;

      // Determine which endpoint to call based on toggle
      if (isBookingIdMode) {
        // Call phone number endpoint
        const response = await api.get(
          `/movie-seat-bookings/phone/${phoneNumber}`
        );
        // Take the last booking from the array
        bookingResult =
          response && response.length > 0
            ? response[response.length - 1]
            : null;
        if (!bookingResult) {
          throw new Error("No bookings found for this phone number.");
        }
      } else {
        // Call booking ID endpoint
        bookingResult = await api.get(
          `/movie-seat-bookings/${searchBookingId}`
        );
      }

      // Map the phone number endpoint response to match the booking ID response structure
      if (isBookingIdMode) {
        bookingResult = {
          bookingId: bookingResult.id,
          movieId: bookingResult.movieId || null,
          movieName: bookingResult.movieName || null,
          userId: bookingResult.userId || null,
          adminUserId: bookingResult.adminUserId || null,
          showTimePlannerId: bookingResult.showTimePlannerId || null,
          date: bookingResult.date,
          seatNumber: bookingResult.bookingSeats.map((seat) => ({
            seatNo: seat,
          })),
          price: bookingResult.price,
          time: bookingResult.showTime,
          customerName: bookingResult.customerName,
          customerEmailId: bookingResult.customerEmailId,
          customerPhoneNumber: bookingResult.customerPhoneNumber,
          totalAmount: bookingResult.totalAmount,
        };
      }

      // Fetch movie details using the movieId (if available)
      let movieResponse = null;
      if (bookingResult.movieId) {
        movieResponse = await api.get(`/movies/${bookingResult.movieId}`);
      } else {
        // Fallback movie details for phone number response
        movieResponse = {
          movieName: bookingResult.movieName,
          image: bookingResult.image,
        };
      }

      // Get showtime planner by date
      let showTimePlannerData = null;
      let ticketPrice = bookingResult.price; // Fallback to booking price

      // Fetch showtime planner data if showTimePlannerId exists
      if (bookingResult.showTimePlannerId) {
        try {
          showTimePlannerData = await api.get(
            `/show-time-planner/${bookingResult.showTimePlannerId}`
          );
          if (showTimePlannerData && showTimePlannerData.price) {
            ticketPrice = showTimePlannerData.price;
          }

          // Get showTime details if available
          if (showTimePlannerData && showTimePlannerData.showTimeId) {
            try {
              const showTimeResponse = await api.get(
                `/show-times/${showTimePlannerData.showTimeId}`
              );
              if (showTimeResponse && showTimeResponse.showTime) {
                showTimePlannerData.showTime = showTimeResponse.showTime;
              }
            } catch (showTimeError) {
              console.warn("Could not fetch showTime details:", showTimeError);
            }
          }
        } catch (plannerIdError) {
          console.warn(
            "Could not fetch showtime by planner ID:",
            plannerIdError
          );

          // Fallback to date-based lookup
          if (bookingResult.date) {
            try {
              const showTimeByDateResponse = await api.get(
                `/show-time-planner/date/${bookingResult.date}`
              );
              if (showTimeByDateResponse && showTimeByDateResponse.length > 0) {
                const matchingEntry = showTimeByDateResponse.find(
                  (entry) =>
                    entry.id === bookingResult.showTimePlannerId ||
                    (entry.movieId === bookingResult.movieId &&
                      entry.showTimeId === bookingResult.showTimeId)
                );

                if (matchingEntry) {
                  showTimePlannerData = matchingEntry;
                  if (matchingEntry.price) {
                    ticketPrice = matchingEntry.price;
                  }
                } else {
                  console.warn(
                    "No exact match found, using first available entry"
                  );
                  showTimePlannerData = showTimeByDateResponse[0];
                  if (showTimePlannerData && showTimePlannerData.price) {
                    ticketPrice = showTimePlannerData.price;
                  }
                }

                if (showTimePlannerData && showTimePlannerData.showTimeId) {
                  try {
                    const showTimeResponse = await api.get(
                      `/show-times/${showTimePlannerData.showTimeId}`
                    );
                    if (showTimeResponse && showTimeResponse.showTime) {
                      showTimePlannerData.showTime = showTimeResponse.showTime;
                    }
                  } catch (showTimeError) {
                    console.warn(
                      "Could not fetch showTime details:",
                      showTimeError
                    );
                  }
                }
              }
            } catch (dateApiError) {
              console.warn("Could not fetch showtime by date:", dateApiError);
            }
          }
        }
      } else if (bookingResult.date) {
        // Date-based lookup if no showTimePlannerId
        try {
          const showTimeByDateResponse = await api.get(
            `/show-time-planner/date/${bookingResult.date}`
          );
          if (showTimeByDateResponse && showTimeByDateResponse.length > 0) {
            const matchingEntry = showTimeByDateResponse.find(
              (entry) => entry.movieId === bookingResult.movieId
            );
            if (matchingEntry) {
              showTimePlannerData = matchingEntry;
              if (matchingEntry.price) {
                ticketPrice = matchingEntry.price;
              }
            } else {
              showTimePlannerData = showTimeByDateResponse[0];
              if (showTimePlannerData && showTimePlannerData.price) {
                ticketPrice = showTimePlannerData.price;
              }
            }

            if (showTimePlannerData && showTimePlannerData.showTimeId) {
              try {
                const showTimeResponse = await api.get(
                  `/show-times/${showTimePlannerData.showTimeId}`
                );
                if (showTimeResponse && showTimeResponse.showTime) {
                  showTimePlannerData.showTime = showTimeResponse.showTime;
                }
              } catch (showTimeError) {
                console.warn(
                  "Could not fetch showTime details:",
                  showTimeError
                );
              }
            }
          }
        } catch (dateApiError) {
          console.warn("Could not fetch showtime by date:", dateApiError);
        }
      }

      // Combine the results
      const combinedResult = {
        ...bookingResult,
        movieDetails: movieResponse,
        showTimePlanner: showTimePlannerData,
        price: ticketPrice,
      };

      setBookingResult(combinedResult);
      setShowBookingSummary(true);
      notify.success("Booking details fetched successfully!");
    } catch (err) {
      console.log(err);
      setBookingResult(null);
      setShowBookingSummary(false);
      setIsTicketPopupOpen(false);
      notify.error(
        isBookingIdMode
          ? "No booking found for this Phone Number."
          : "No booking found for this Booking ID."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewTickets = async () => {
    try {
      const res = await api.axiosInstance.post("/printed-tickets", {
        bookingId: Number(bookingResult.bookingId || searchBookingId),
        adminUserId: 1,
      });

      setIsTicketPopupOpen(true);
      notify.success(res, { autoClose: 8000 });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "An error occurred.";

      console.error(
        "Error creating printed ticket:",
        err?.response?.data || err
      );

      if (errorMessage === "Ticket has already been printed.") {
        // Still open the popup for already printed tickets
        setIsTicketPopupOpen(true);
        notify.error(errorMessage);
      } else {
        notify.error(errorMessage, { autoClose: 20000 });
      }
    }
  };

  const handleNewSearch = () => {
    setSearchBookingId("");
    setPhoneNumber("");
    setBookingResult(null);
    setShowBookingSummary(false);
    setIsTicketPopupOpen(false);
  };

  const seatCount = bookingResult?.seatNumber?.length || 0;
  const totalAmount = seatCount * (bookingResult?.price || 0);

  if (error)
    return (
      <div className="p-4 text-red-500">Error loading showtimes: {error}</div>
    );

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
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            {/* Header with responsive layout */}
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-orange-600 flex items-center gap-2 mb-4 sm:mb-0">
                <Tickets size={20} className="sm:w-6 sm:h-6" />
                Find Booking
              </h2>

              {/* Toggle Switch - Responsive Layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-2">
                <div className="flex items-center justify-center gap-2 sm:gap-2">
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isBookingIdMode ? "text-gray-500" : "text-orange-600"
                    }`}
                  >
                    Booking ID
                  </span>
                  <button
                    onClick={() => setIsBookingIdMode(!isBookingIdMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      isBookingIdMode ? "bg-orange-600" : "bg-gray-300"
                    }`}
                    disabled={showBookingSummary}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isBookingIdMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isBookingIdMode ? "text-orange-600" : "text-gray-500"
                    }`}
                  >
                    Phone Number
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Show Booking ID field when in Booking ID mode (toggle disabled) */}
              {!isBookingIdMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={searchBookingId}
                    onChange={(e) => setSearchBookingId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
                    placeholder="Enter Booking ID"
                    disabled={showBookingSummary}
                  />
                </div>
              )}

              {/* Show Phone Number field when in Phone Number mode (toggle enabled) */}
              {isBookingIdMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
                    placeholder="Enter Phone Number"
                    disabled={showBookingSummary}
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            {!showBookingSummary ? (
              <button
                onClick={handleGetTickets}
                className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 sm:py-2 px-4 rounded-md transition duration-200 flex items-center justify-center text-base sm:text-sm touch-manipulation"
                disabled={searchLoading}
              >
                {searchLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleViewTickets}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 sm:py-2 px-4 rounded-md transition duration-200 flex items-center justify-center text-base sm:text-sm touch-manipulation"
                >
                  <Eye className="mr-2" size={18} />
                  View Tickets
                </button>
                <button
                  onClick={handleNewSearch}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 sm:py-2 px-4 rounded-md transition duration-200 text-base sm:text-sm touch-manipulation"
                >
                  Close
                </button>
              </div>
            )}

            {/* Booking Info Card (shown when there's a result) */}
            {showBookingSummary && bookingResult && (
              <div className="mt-3 border-t pt-3">
                <h3 className="font-semibold mb-2 text-green-700 flex items-center gap-2 text-sm sm:text-lg">
                  <Tickets size={16} className="sm:w-5 sm:h-5" />
                  Booking Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    {/* Booking ID */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Booking ID:
                      </span>
                      <span className="font-semibold text-orange-600 text-sm sm:text-sm">
                        ST - {bookingResult.bookingId || searchBookingId}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 flex-shrink-0">
                        User ID:
                      </span>
                      <span className="font-medium text-right max-w-[60%] break-words text-xs sm:text-sm">
                        {bookingResult.userId || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 flex-shrink-0">
                        Movie:
                      </span>
                      <span className="font-medium text-right max-w-[60%] break-words text-xs sm:text-sm">
                        {bookingResult.movieDetails?.movieName || "N/A"}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 flex-shrink-0">Date:</span>
                      <span className="font-medium text-right max-w-[60%] break-words text-xs sm:text-sm">
                        {moment(bookingResult.date).format("MMM D, YYYY")}
                      </span>
                    </div>

                    {/* Show Time */}
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 flex-shrink-0">Time:</span>
                      <span className="font-medium text-right max-w-[60%] break-words text-xs sm:text-sm">
                        {(() => {
                          // Try multiple possible sources for show time
                          const timeValue =
                            bookingResult.showTimePlanner?.showTime?.showTime ||
                            bookingResult.showTimePlanner?.showTime ||
                            bookingResult.time ||
                            bookingResult.showTime;

                          if (timeValue) {
                            const momentTime = moment(timeValue, [
                              "HH:mm",
                              "HH:mm:ss",
                              "h:mm A",
                              "h:mm a",
                            ]);
                            return momentTime.isValid()
                              ? momentTime.format("h:mm A")
                              : timeValue;
                          }
                          return "N/A";
                        })()}
                      </span>
                    </div>

                    {/* Seats */}
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 flex-shrink-0">
                        Seats:
                      </span>
                      <span className="font-medium text-blue-600 text-right max-w-[60%] break-all text-xs sm:text-sm">
                        {bookingResult.seatNumber
                          ?.map((seat) => seat.seatNo)
                          .join(", ") || "N/A"}
                      </span>
                    </div>

                    {/* Total Amount */}
                    <div className="flex justify-between items-center font-medium mt-2 pt-2 border-t border-gray-200">
                      <span className="text-sm sm:text-lg text-gray-800">
                        Total:
                      </span>
                      <span className="text-base sm:text-lg text-green-600 font-bold">
                        ₹{totalAmount || "N/A"}
                      </span>
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
            selectedSeats={
              bookingResult.seatNumber?.map((seat) => seat.seatNo) || []
            }
            currentShow={{
              movieName: bookingResult.movieDetails?.movieName || "Movie Title",
              poster: bookingResult.movieDetails?.image,
              date: bookingResult.date || bookingResult.showTimePlanner?.date,
              time:
                bookingResult.showTimePlanner?.showTime?.showTime ||
                bookingResult.showTimePlanner?.showTime ||
                bookingResult.time ||
                bookingResult.showTime,
              price:
                bookingResult.price || bookingResult.showTimePlanner?.price,
              movieDetails: bookingResult.movieDetails,
              userId: bookingResult.userId,
              showTimePlanner: bookingResult.showTimePlanner,
              theatre: bookingResult.showTimePlanner?.theatre,
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
