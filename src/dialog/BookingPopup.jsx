import { X } from "lucide-react";
import { useState } from "react";

const BookingPopup = ({
  selectedSeats,
  totalPrice,
  onConfirm,
  onCancel,
  currentShow,
}) => {

  console.log(currentShow);

  const handleConfirm = () => {
    const newBookingId = `ST-${Math.floor(100000 + Math.random() * 900000)}`;
    onConfirm(newBookingId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Confirm Booking</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600">You're booking:</p>
            <div className="flex flex-wrap gap-2 mt-2">
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

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Seats:</span>
              <span className="font-semibold">
                ({selectedSeats.length}) × ₹{currentShow.price}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="text-lg font-bold text-orange-600">
                ₹{totalPrice}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPopup;
