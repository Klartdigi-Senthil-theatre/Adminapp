import { Calendar, MapPin, Printer, Users, X } from "lucide-react";
import { useState } from "react";

// Mock notify function for demo
const notify = {
  info: (msg) => console.log("Info:", msg),
  success: (msg) => console.log("Success:", msg),
  error: (msg) => console.log("Error:", msg),
};

const TicketPreviewPopup = ({
  selectedSeats,
  currentShow,
  onClose,
  bookingId,
  onPrintComplete,
  movie,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const poster = currentShow?.movieDetails?.poster;

  // Ticket data
  const movieName = currentShow?.movie || "Movie Title";
  const theatreName = "Senthil Cinemas A/C";
  const showTime = currentShow?.time || "10:00 AM";
  const showDate = currentShow?.date || new Date().toISOString().split("T")[0];
  const pricePerSeat = currentShow?.price || null; // Now using price per seat

  const generateQRCodeURL = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      data
    )}`;
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    notify.info("Generating PDF...");

    try {
      // Create a new window for PDF generation
      const printWindow = window.open("", "_blank");

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Movie Tickets - ${movieName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              padding: 20px;
            }
            
            .ticket-container {
              display: flex;
              flex-direction: column;
              gap: 30px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .ticket {
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              page-break-inside: avoid;
              margin-bottom: 30px;
            }
            
            .ticket-header {
              background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
              color: white;
              padding: 18px;
              position: relative;
            }
            
            .ticket-header::after {
              content: '';
              position: absolute;
              bottom: -10px;
              left: 0;
              right: 0;
              height: 20px;
              background: radial-gradient(circle at 50% 0%, transparent 10px, white 10px);
              background-size: 20px 20px;
            }
            
            .movie-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            
            .movie-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            
            .cinema-experience {
              color: #fbbf24;
              font-size: 14px;
            }
            
            .ticket-icon {
              background: rgba(255, 255, 255, 0.2);
              padding: 8px;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .booking-info {
              text-align: left;
            }
            
            .booking-label {
              font-size: 12px;
              opacity: 0.8;
              margin-bottom: 4px;
            }
            
            .booking-id {
              font-family: 'Courier New', monospace;
              font-size: 22px;
              font-weight: bold;
            }
            
            .ticket-body {
              padding: 24px;
              background: white;
            }
            
            .ticket-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 24px;
              margin-bottom: 24px;
            }
            
            .detail-item {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            }
            
            .detail-icon {
              color: #f97316;
              width: 20px;
              height: 20px;
            }
            
            .detail-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 2px;
            }
            
            .detail-value {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
            }
            
            .ticket-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 20px;
              border-top: 2px dashed #ddd;
            }
            
            .qr-code {
              width: 80px;
              height: 80px;
              border-radius: 8px;
              overflow: hidden;
            }
            
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .price-info {
              text-align: right;
            }
            
            .price-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            
            .price-amount {
              font-size: 24px;
              font-weight: bold;
              color: #f97316;
            }
            
            .watermark {
              position: fixed;
              bottom: 20px;
              right: 20px;
              font-size: 10px;
              color: #ccc;
              z-index: 1000;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .ticket {
                page-break-after: always;
                margin: 0;
                box-shadow: none;
              }
              
              .ticket:last-child {
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark">Generated by Cinema Booking System</div>
          <div class="ticket-container">
            ${selectedSeats
              .map((seat) => {
                const qrCodeData = `Movie: ${movieName}\nDate: ${new Date(
                  showDate
                ).toLocaleDateString()}\nTime: ${showTime}\nSeat: ${seat}\nBooking ID: ${bookingId}\nAmount: ₹${pricePerSeat.toFixed(
                  2
                )}`;

                return `
                  <div class="ticket">
                    <div class="ticket-header">
                      <div class="movie-info">
                        <div>
                          <div class="movie-title">${movieName}</div>
                          <div class="cinema-experience">Premium Cinema Experience</div>
                        </div>
                        <div class="ticket-icon">🎬</div>
                      </div>
                      <div class="booking-info">
                        <div class="booking-label">Booking ID</div>
                        <div class="booking-id">${bookingId}</div>
                      </div>
                    </div>
                    
                    <div class="ticket-body">
                      <div class="ticket-details">
                        <div>
                          <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div>
                              <div class="detail-label">Date & Time</div>
                              <div class="detail-value">${new Date(
                                showDate
                              ).toLocaleDateString()} • ${showTime}</div>
                            </div>
                          </div>
                          
                          <div class="detail-item">
                            <div class="detail-icon">👥</div>
                            <div>
                              <div class="detail-label">Seat</div>
                              <div class="detail-value">${seat}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div class="detail-item">
                            <div class="detail-icon">📍</div>
                            <div>
                              <div class="detail-label">Theatre</div>
                              <div class="detail-value">${theatreName}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="ticket-footer">
                        <div class="qr-code">
                          <img src="${generateQRCodeURL(
                            qrCodeData
                          )}" alt="QR Code" />
                        </div>
                        <div class="price-info">
                          <div class="price-label">Amount Paid</div>
                          <div class="price-amount">₹${pricePerSeat.toFixed(
                            2
                          )}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(pdfContent);
      printWindow.document.close();

      // Wait for images to load
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        // Close the window after printing
        setTimeout(() => {
          printWindow.close();
          setIsGeneratingPDF(false);
          notify.success("PDF generated successfully!");
          onPrintComplete();
        }, 1000);
      }, 1500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      notify.error("Failed to generate PDF");
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    notify.info("Preparing for printing...");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Movie Tickets - ${movieName}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          .ticket-header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 20px;
            background: radial-gradient(circle at 50% 0%, transparent 10px, white 10px);
            background-size: 20px 20px;
          }
          
          /* Force background colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @media print {
            body {
              background: white !important;
              padding: 0 !important;
            }
            
            .ticket {
              page-break-after: always;
              margin: 0 !important;
              box-shadow: none !important;
            }
            
            .ticket:last-child {
              page-break-after: auto;
            }
            
            /* Ensure header background prints */
            .ticket-header {
              background: #1a1a1a !important;
              color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body class="font-sans bg-gray-100 p-5">
        <div class="fixed bottom-5 right-5 text-xs text-gray-300 z-50">Generated by Cinema Booking System</div>
        <div class="flex flex-col gap-8 max-w-4xl mx-auto">
          ${selectedSeats
            .map((seat) => {
              return `
                <div class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4 print:mb-0 print:shadow-none border border-gray-300">
                  <div class="bg-gray-900 text-white p-2 relative ticket-header" style="background: #1a1a1a !important; -webkit-print-color-adjust: exact; color-adjust: exact; print-color-adjust: exact;">
                    <div class="ticket-header"></div>
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <div class="text-2xl font-bold mb-1">${movieName}</div>
                        <div class="text-amber-300 text-sm">Premium Cinema Experience</div>
                      </div>
                      <div class="w-16 h-16 rounded-full overflow-hidden mr-2">
                          <img src=${poster} className= "w-16 h-16 rounded-full" />
                      </div>
                    </div>
                    <div class="grid grid-cols-2">
                      <div class="text-left">
                        <div class="text-xs opacity-80 mb-1">Booking ID</div>
                        <div class="font-mono text-xl font-bold">ST - ${bookingId}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-xs opacity-80 mb-1">Amount Paid</div>
                        <div class="text-2xl font-bold text-orange-300">₹${pricePerSeat.toFixed(
                          2
                        )}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="p-6 bg-white">
                    <div class="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <div class="flex items-center gap-3 mb-4">
                          📅
                          <div>
                            <div class="text-xs text-gray-600 mb-0.5">Date & Time</div>
                            <div class="font-semibold text-lg text-gray-900">${new Date(
                              showDate
                            ).toLocaleDateString()} • ${showTime}</div>
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-3 mb-4">
                          👥
                          <div>
                            <div class="text-xs text-gray-600 mb-0.5">Seat</div>
                            <div class="font-semibold text-md text-gray-900">${seat}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div class="flex items-center gap-3 mb-4">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <div>
                            <div class="text-xs text-gray-600 mb-0.5">📍 Theatre</div>
                            <div class="font-semibold text-gray-900 text-lg">${theatreName}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </body>
      </html>
    `;

    document.write(printContent);
    document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      window.print();
      window.location.reload(); // go back to your app
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-2 z-10">
          <h3 className="text-xl font-bold">Ticket Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Visible content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedSeats.map((seat) => {
              const qrCodeData = `Movie: ${movieName}\nDate: ${new Date(
                showDate
              ).toLocaleDateString()}\nTime: ${showTime}\nSeat: ${seat}\nBooking ID: ${bookingId}\nAmount: ₹${pricePerSeat.toFixed(
                2
              )}`;

              return (
                <div
                  key={seat}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-6 text-white relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-xl font-bold mb-1">{movieName}</h2>
                        <p className="text-sm text-orange-200">
                          Premium Cinema Experience
                        </p>
                      </div>
                      <div className="p-2 rounded-full">
                        <img src={poster} alt="" className="w-16 h-16 rounded-full" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="text-left">
                        <div className="text-xs opacity-80">Booking ID</div>
                        <div className="font-mono text-lg font-bold">
                          ST - {bookingId}
                        </div>
                      </div>

                      {/* QR Code and Price Section */}
                      <div className="border-gray-200 col-span-2">
                        <div className="text-right">
                          <div className="text-xs text-white">Amount Paid</div>
                          <div className="text-xl font-bold text-orange-600">
                            ₹{pricePerSeat.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Decorative border */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-white">
                      <div className="flex justify-center">
                        <div className="w-full h-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-b-full transform scale-x-150"></div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-6 bg-white mt-2">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-orange-500" />
                          <div>
                            <div className="text-xs text-gray-500">
                              Date & Time
                            </div>
                            <div className="font-medium text-sm">
                              {new Date(showDate).toLocaleDateString()} •{" "}
                              {showTime}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-orange-500" />
                          <div>
                            <div className="text-xs text-gray-500">Seat</div>
                            <div className="font-medium text-md">{seat}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          <div>
                            <div className="text-xs text-gray-500">Theatre</div>
                            <div className="font-medium text-xs">
                              {theatreName}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t sticky bottom-0 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Printer size={18} />
            {isPrinting ? "Printing..." : "Print"}
          </button>
          {/* <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            {isGeneratingPDF ? "Generating..." : "Save as PDF"}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewPopup;
