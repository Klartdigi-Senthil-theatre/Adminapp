import { useState, useRef } from "react";
import { X, Download } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const BookingPopup = ({
  selectedSeats,
  totalPrice,
  onConfirm,
  onCancel,
  currentShow, // Pass the currentShow object from SeatsPage
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const ticketRef = useRef(null);

  // Use currentShow data or fallback to defaults
  const movieName = currentShow?.movie || "Movie Title";
  const theatreName = "PVR Cinemas";
  const showTime = currentShow?.time || "10:00 AM";
  const showDate = currentShow?.date || new Date().toISOString().split("T")[0];

  // Calculate tax breakdown (18% GST)
  const seatPrice = currentShow?.price || 250; // Use price from currentShow
  const subtotal = selectedSeats.length * seatPrice;
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const calculatedTotal = subtotal + gstAmount;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const generateTicketPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const ticketElement = ticketRef.current;

      // Make element temporarily visible for capture
      ticketElement.style.visibility = "visible";
      ticketElement.style.position = "absolute";
      ticketElement.style.left = "0";
      ticketElement.style.top = "0";

      const canvas = await html2canvas(ticketElement, {
        scale: 3, // Higher resolution for A4
        logging: true,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: ticketElement.scrollWidth,
        windowHeight: ticketElement.scrollHeight,
      });

      // Hide element after capture
      ticketElement.style.visibility = "hidden";
      ticketElement.style.position = "";

      const imgData = canvas.toDataURL("image/png", 1.0);

      // A4 dimensions in mm (portrait)
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth - 40; // With margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Center the ticket on A4 page
      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", xPos, yPos, imgWidth, imgHeight);
      pdf.save(`Ticket_${movieName.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      if (ticketRef.current) {
        ticketRef.current.style.visibility = "hidden";
        ticketRef.current.style.position = "";
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleConfirm = async () => {
    await generateTicketPDF();
    onConfirm();
  };

  return (
    <>
      {/* Ticket template for PDF generation */}
      <div
        ref={ticketRef}
        style={{
          visibility: "hidden",
          position: "fixed",
          left: "-9999px",
          top: 0,
          zIndex: -1,
          width: "600px", // Larger size for A4
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ fontFamily: "Arial, sans-serif" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2
              style={{ fontSize: "28px", fontWeight: "bold", color: "#EA580C" }}
            >
              MOVIE TICKET
            </h2>
            <div style={{ fontSize: "14px", color: "#6B7280" }}>
              Booking ID: #
              {Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, "0")}
            </div>
          </div>

          {/* Movie Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "25px",
              paddingBottom: "15px",
              borderBottom: "1px dashed #D1D5DB",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                {movieName}
              </h3>
              <p style={{ fontSize: "16px", color: "#4B5563" }}>
                {theatreName}
              </p>
              <p style={{ fontSize: "14px", color: "#6B7280" }}>
                Showtime: {showTime}
              </p>
            </div>
          </div>

          {/* Seats Info */}
          <div style={{ marginBottom: "20px" }}>
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Seat Details
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: "10px",
                marginBottom: "15px",
              }}
            >
              {selectedSeats.map((seat) => (
                <div
                  key={seat}
                  style={{
                    backgroundColor: "#FEE2E2",
                    color: "#B91C1C",
                    padding: "8px",
                    borderRadius: "4px",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {seat}
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div
            style={{
              marginBottom: "25px",
              borderTop: "1px dashed #D1D5DB",
              borderBottom: "1px dashed #D1D5DB",
              padding: "15px 0",
            }}
          >
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "15px",
              }}
            >
              Payment Details
            </h4>

            <div style={{ marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#4B5563" }}>
                  Seats ({selectedSeats.length} × ₹{seatPrice}):
                </span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#4B5563" }}>GST (18%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: "#EA580C", fontSize: "18px" }}>
                  ₹{calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#F3F4F6",
                padding: "15px 30px",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  marginBottom: "5px",
                }}
              >
                SCAN AT ENTRANCE
              </div>
              <div
                style={{
                  height: "80px",
                  backgroundColor: "#E5E7EB",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#6B7280",
                  letterSpacing: "2px",
                }}
              >
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  marginTop: "10px",
                }}
              >
                Valid for {selectedSeats.length} person(s)
              </div>
            </div>
            <p
              style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "20px" }}
            >
              Please arrive at least 30 minutes before showtime
            </p>
          </div>
        </div>
      </div>
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
                onClick={generateTicketPDF}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Download PDF
              </button>
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
    </>
  );
};

export default BookingPopup;
