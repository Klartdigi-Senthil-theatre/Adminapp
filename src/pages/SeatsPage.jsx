import React, { useState } from "react";
import { Users, Eye, Calendar, Clock, Film, MapPin } from "lucide-react";
import moment from "moment/moment";
import TimingDropDown from "../components/TimingDropDown";
import PageHeader from "../components/PageHeader";

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
    { letter: "L", leftSeats: 9, rightSeats: 9, hasGap: true }, // L1-L9 (left) | L10-L20 (right)
    { letter: "M", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "N", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "O", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "P", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "Q", leftSeats: 10, rightSeats: 10, hasGap: true },
    { letter: "R", leftSeats: 7, rightSeats: 8, hasGap: true },
  ];

  return (
    <div className="w-full overflow-x-auto py-2 animate-fadeIn">
      <div className="min-w-max flex flex-col gap-3 items-center px-4">
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

              {/* Left section */}
              <div className="flex gap-1">
                {leftSeats.map((seat, seatIndex) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      className={`relative w-6 h-8 flex justify-center items-center rounded-t-lg rounded-b-sm font-bold text-xs border-2 transition-all duration-200 shadow-sm animate-seatPop ${
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
              <div className="flex gap-1">
                {rightSeats.map((seat, seatIndex) => {
                  const isSelected = selectedSeats.includes(seat.id);
                  return (
                    <button
                      key={seat.id}
                      className={`relative w-6 h-8 flex justify-center items-center rounded-t-lg rounded-b-sm font-bold text-xs border-2 transition-all duration-200 shadow-sm animate-seatPop ${
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


// Main Seats Page Component
const SeatsPage = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currentShow, setCurrentShow] = useState({
    movie: "Avengers: Endgame",
    date: "2024-07-27",
    time: "7:00 PM",
    screen: "Screen 1",
    price: 250,
  });

  const handleSeatSelect = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBookSeats = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    const totalAmount = selectedSeats.length * currentShow.price;
    const confirmation = confirm(
      `Book ${selectedSeats.length} seat(s): ${selectedSeats.join(
        ", "
      )}\nTotal: ₹${totalAmount}\n\nConfirm booking?`
    );

    if (confirmation) {
      alert("Booking confirmed! Seats: " + selectedSeats.join(", "));
      setSelectedSeats([]);
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.length * currentShow.price;
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div>
        {/* Show Information */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-4 mb-6">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            {/* Left Side - Date, Time, Movie in same line */}
            <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 sm:gap-4 lg:gap-6 flex-1">
              <div className="flex items-center space-x-2">
                <Calendar className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <input
                    type="date"
                    value={currentShow.date}
                    onChange={(e) =>
                      setCurrentShow({ ...currentShow, date: e.target.value })
                    }
                    className="font-semibold border rounded p-1"
                    min={new Date().toISOString().split("T")[0]} // Only allow future dates
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="text-orange-600" size={20} />
                <div>
                  <TimingDropDown
                    currentShow={currentShow}
                    onTimeSelect={(time) =>
                      setCurrentShow({ ...currentShow, time })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Film className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Movie</p>
                  <p className="font-semibold">{currentShow.movie}</p>
                </div>
              </div>
            </div>

            {/* Right Side - Statistics */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-full xl:w-auto justify-center xl:justify-end">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div>
                    <p className="text-gray-500 text-sm">Total Seats</p>
                    <p className="text-xl font-semibold text-blue-600">360</p>
                  </div>
                  <Users className="text-blue-600" size={20} />
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div>
                    <p className="text-gray-500 text-sm">Available</p>
                    <p className="text-xl font-semibold text-green-600">285</p>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-b from-orange-100 to-orange-200 border-2 border-orange-300 rounded"></div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <div>
                    <p className="text-gray-500 text-sm">Booked</p>
                    <p className="text-xl font-semibold text-red-600">75</p>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-b from-orange-400 to-orange-500 border-2 border-orange-600 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Seat Layout */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Select Your Seats
            </h2>

            <SeatLayout
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
            />
          </div>
        </div>

        {/* Booking Summary */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Booking Summary</h2>

            <div className="flex-1 flex flex-col">
              {selectedSeats.length > 0 && (
                <div className="space-y-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2">Selected Seats</h3>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
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

                  <div className="flex-1"></div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">
                        Seats ({selectedSeats.length})
                      </span>
                      <span className="font-semibold">
                        ₹{selectedSeats.length * currentShow.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{getTotalPrice()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedSeats([])}
                      className="w-full px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={handleBookSeats}
                      className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Users size={20} />
                      <span>Book Seats (₹{getTotalPrice()})</span>
                    </button>
                  </div>
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
