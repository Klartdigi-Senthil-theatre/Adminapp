import React, { useState } from "react";
import { Users, Eye, Calendar, Clock, Film } from "lucide-react";
import TimingDropDown from "../components/TimingDropDown";
import BookingPopup from "../dialog/BookingPopup";
import { notify } from "../components/Notification";

// Seat Layout Component (recreated without framer-motion)
const SeatLayout = ({ selectedSeats, onSeatSelect }) => {
  // Define rows with their specific configurations
  const rows = [
    { letter: "A", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "B", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "C", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "D", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "E", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "F", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "G", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "H", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "I", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "J", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "K", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "L", leftSeats: 9, rightSeats: 9, hasGap: true, hasEntry: true }, // L1-L9 (left) | L10-L20 (right)
    { letter: "M", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "N", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "O", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "P", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "Q", leftSeats: 10, rightSeats: 10, hasGap: true },
    {
      letter: "R",
      leftSeats: 7,
      rightSeats: 8,
      hasGap: true,
      centerAlign: true,
    },
  ];

  return (
    <div className="w-full overflow-x-auto py-1 animate-fadeIn">
      <div className="min-w-max flex flex-col gap-1 items-center px-3">
        {rows.map((row, rowIndex) => {
          // Generate left section seats (1 to leftSeats)
          const leftSeats = Array.from({ length: row.leftSeats }, (_, i) => ({
            number: i + 1,
            id: `${row.letter}${i + 1}`,
          }));

          // Generate right section seats - Special logic for row L
          let rightStart, rightSeats;
          if (row.letter === "L") {
            // For row L: right section starts at 10 and goes to 20
            rightStart = 10;
            rightSeats = Array.from({ length: row.rightSeats }, (_, i) => ({
              number: rightStart + i,
              id: `${row.letter}${rightStart + i}`,
            }));
          } else {
            // For other rows: normal logic
            rightStart = row.leftSeats + 1;
            rightSeats = Array.from({ length: row.rightSeats }, (_, i) => ({
              number: rightStart + i,
              id: `${row.letter}${rightStart + i}`,
            }));
          }

          return (
            <div
              key={row.letter}
              className="flex gap-4 items-center animate-slideInLeft"
              style={{ animationDelay: `${rowIndex * 50}ms` }}
            >
              {/* Row label - Left */}
              <div className="w-6 text-center">
                <span className="text-slate-600 font-bold text-sm">
                  {row.letter}
                </span>
              </div>

              {/* Left section with padding for center alignment */}
              <div className={`flex gap-1 ${row.centerAlign ? "pl-9" : ""}`}>
                {/* Entry indicator for L row */}
                {row.hasEntry && (
                  <div className="w-6 h-6 flex items-center justify-center rounded text-[8px] rotate-270 text-gray-600 tracking-wide font-bold">
                    ENTRY
                  </div>
                )}

                {leftSeats.map((seat, seatIndex) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      className={`relative w-6 h-6 flex justify-center items-center rounded-t-lg rounded-b-sm font-bold text-xs border-2 transition-all duration-200 shadow-sm animate-seatPop ${
                        isSelected
                          ? "bg-gradient-to-b from-orange-400 to-orange-600 text-white border-orange-700 shadow-lg scale-105"
                          : "bg-gradient-to-b from-orange-100 to-orange-200 text-orange-800 border-orange-300 hover:border-orange-500 hover:from-orange-200 hover:to-orange-300 hover:shadow-md hover:scale-110"
                      }`}
                      onClick={() => onSeatSelect(seat.id)}
                      style={{
                        animationDelay: `${rowIndex * 50 + seatIndex * 10}ms`,
                      }}
                    >
                      <span className="relative z-10 text-[10px]">
                        {seat.number}
                      </span>
                      {/* Seat cushion effect */}
                      <div
                        className={`absolute bottom-0 left-0.5 right-0.5 h-1.5 rounded-sm ${
                          isSelected ? "bg-orange-700" : "bg-orange-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Center aisle gap */}
              {row.hasGap && (
                <div className="w-8 flex justify-center items-center">
                  <div className="h-px w-6 bg-slate-300"></div>
                </div>
              )}

              {/* Right section */}
              <div className={`flex gap-1 ${row.centerAlign ? "pr-3" : ""}`}>
                {rightSeats.map((seat, seatIndex) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      className={`relative w-6 h-6 flex justify-center items-center rounded-t-lg rounded-b-sm font-bold text-xs border-2 transition-all duration-200 shadow-sm animate-seatPop ${
                        isSelected
                          ? "bg-gradient-to-b from-orange-400 to-orange-600 text-white border-orange-700 shadow-lg scale-105"
                          : "bg-gradient-to-b from-orange-100 to-orange-200 text-orange-800 border-orange-300 hover:border-orange-500 hover:from-orange-200 hover:to-orange-300 hover:shadow-md hover:scale-110"
                      }`}
                      onClick={() => onSeatSelect(seat.id)}
                      style={{
                        animationDelay: `${
                          rowIndex * 50 + (leftSeats.length + seatIndex) * 10
                        }ms`,
                      }}
                    >
                      <span className="relative z-10 text-[10px]">
                        {seat.number}
                      </span>
                      {/* Seat cushion effect */}
                      <div
                        className={`absolute bottom-0 left-0.5 right-0.5 h-1.5 rounded-sm ${
                          isSelected ? "bg-orange-700" : "bg-orange-300"
                        }`}
                      />
                    </button>
                  );
                })}

                {/* Exit indicator for L row */}
                {row.hasEntry && (
                  <div className="w-6 h-6 flex items-center justify-center rounded text-[8px] rotate-90 tracking-widest font-bold">
                    EXIT
                  </div>
                )}
              </div>

              {/* Row label - Right */}
              <div className="w-6 text-center">
                <span className="text-slate-600 font-bold text-sm">
                  {row.letter}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes seatPop {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-seatPop {
          animation: seatPop 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

const SeatsPage = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [amountReceived, setAmountReceived] = useState("");
  const [currentShow, setCurrentShow] = useState({
    movie: "Avengers: Endgame",
    date: "2024-07-27",
    time: "7:00 PM",
    screen: "Screen 1",
    price: 250,
  });
  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const handleSeatSelect = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const confirmBooking = () => {
    // Your booking confirmation logic here
    notify.success(`Booking confirmed for seats: ${selectedSeats.join(", ")}`);
    setSelectedSeats([]);
    setAmountReceived("");
    setShowBookingPopup(false);
  };

  const cancelBooking = () => {
    setShowBookingPopup(false);
  };

  const handleBookSeats = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    setShowBookingPopup(true);
  };

  const getTotalPrice = () => {
    return selectedSeats.length * currentShow.price;
  };

  const getAmountToReturn = () => {
    const received = parseFloat(amountReceived) || 0;
    const total = getTotalPrice();
    return Math.max(0, received - total);
  };

  const handleAmountReceivedChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmountReceived(value);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-2">
        {/* Show Information */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            {/* Left Side - Date, Time, Movie */}
            <div className="flex flex-col gap-2">
              {/* First row: Date and Time */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="text-green-600" size={18} />
                  <span className="text-sm font-medium">
                    Date -{" "}
                    <input
                      type="date"
                      value={currentShow.date}
                      onChange={(e) =>
                        setCurrentShow({ ...currentShow, date: e.target.value })
                      }
                      className="w-35 font-medium border rounded text-sm md:text-base"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="text-orange-600" size={18} />
                  <span className="text-sm font-medium">
                    <TimingDropDown
                      currentShow={currentShow}
                      onTimeSelect={(time) =>
                        setCurrentShow({ ...currentShow, time })
                      }
                    />
                  </span>
                </div>

                {/* Movie on same line for desktop, new line for mobile */}
                <div className="hidden lg:flex items-center gap-1">
                  <Film className="text-blue-600" size={18} />
                  <span className="text-sm font-medium">
                    Movie - {currentShow.movie}
                  </span>
                </div>
              </div>

              {/* Second row: Movie (mobile only) */}
              <div className="flex lg:hidden items-center gap-1">
                <Film className="text-blue-600" size={18} />
                <span className="text-sm font-medium">
                  Movie - {currentShow.movie}
                </span>
              </div>
            </div>

            {/* Right Side - Statistics */}
            <div className="flex flex-col gap-2">
              {/* First row: Total Seats and Available */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="text-blue-600" size={18} />
                  <span className="text-sm font-medium">Total Seats - 360</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gradient-to-b from-orange-100 to-orange-200 border border-orange-300 rounded"></div>
                  <span className="text-sm font-medium">Available - 285</span>
                </div>

                {/* Booked on same line for desktop, new line for mobile */}
                <div className="hidden lg:flex items-center gap-1">
                  <div className="w-3 h-3 bg-gradient-to-b from-orange-400 to-orange-500 border border-orange-600 rounded"></div>
                  <span className="text-sm font-medium">Booked - 75</span>
                </div>
              </div>

              {/* Second row: Booked (mobile only) */}
              <div className="flex lg:hidden items-center gap-1">
                <div className="w-3 h-3 bg-gradient-to-b from-orange-400 to-orange-500 border border-orange-600 rounded"></div>
                <span className="text-sm font-medium">Booked - 75</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Seat Layout */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md h-full p-2">
            <h2 className="text-md text-center font-semibold text-gray-800 mb-2">
              Select Your Seats
            </h2>
            <SeatLayout
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />

            <div className="relative w-full h-8 flex justify-center items-end">
              {/* Curved screen base */}
              <div className="w-[70%] h-6 bg-gradient-to-b from-gray-700 to-gray-900 rounded-b-[50%] shadow-2xl border-t-4 border-yellow-400 flex items-end justify-center">
                <span className="text-orange-400 font-semibold text-sm sm:text-base md:text-md">
                  SCREEN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-2 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedSeats.length > 0 ? (
                <div className="flex flex-col h-full">
                  {/* Scrollable seats list */}
                  <div className="overflow-y-auto flex-1 max-h-[calc(100%-200px)]">
                    <div className="flex flex-wrap gap-2 pb-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fixed bottom section */}
                  <div className="mt-auto border-t pt-4 space-y-3">
                    {/* Seats calculation */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Seats ({selectedSeats.length}) × ₹{currentShow.price}
                      </span>
                      <span className="font-semibold">
                        ₹{selectedSeats.length * currentShow.price}
                      </span>
                    </div>

                    {/* Amount received input */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Amount Received:
                      </span>
                      <input
                        type="text"
                        value={amountReceived}
                        onChange={handleAmountReceivedChange}
                        placeholder="Enter amount"
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Amount to return */}
                    {amountReceived && (
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">
                          Amount to Return:
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          ₹{getAmountToReturn().toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Total amount */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold">Total Amount</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{getTotalPrice()}
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedSeats([]);
                          setAmountReceived("");
                        }}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Clear Selection
                      </button>
                      <button
                        onClick={handleBookSeats}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Users size={18} />
                        <span>Book Seats (₹{getTotalPrice()})</span>
                      </button>
                    </div>
                  </div>

                  {/* Booking Popup */}
                  {showBookingPopup && (
                    <BookingPopup
                      selectedSeats={selectedSeats}
                      totalPrice={getTotalPrice()}
                      onConfirm={confirmBooking}
                      onCancel={cancelBooking}
                      currentShow={currentShow}
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Select seats to see booking summary
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatsPage;
