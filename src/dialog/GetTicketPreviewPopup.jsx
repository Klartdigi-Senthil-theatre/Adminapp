import { Printer, X } from "lucide-react";
import { useState } from "react";

// Mock notify function for demo
const notify = {
  info: (msg) => console.log("Info:", msg),
  success: (msg) => console.log("Success:", msg),
  error: (msg) => console.log("Error:", msg),
};

const GetTicketPreviewPopup = ({
  selectedSeats,
  currentShow,
  onClose,
  bookingId,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const poster = currentShow?.movieDetails?.poster;

  // Ticket data
  const movieName = currentShow?.movieName || "Movie Title";
  const theatreName = "Senthil Cinemas A/C";
  const showTime = currentShow?.time || null;
  const showDate = currentShow?.date || null;
  const pricePerSeat = currentShow?.price || null; // Now using price per seat

  const generateQRCodeURL = (data) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      data
    )}`;
  };

  const handlePrint = () => {
    // Block printing for past dates
    try {
      const selected = showDate ? new Date(showDate) : null;
      if (selected) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);
        if (selected < today) {
          notify.error("Cannot print for a past date.");
          return;
        }
      }
    } catch (_) { }
    setIsPrinting(true);
    notify.info("Preparing for printing...");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* 3-inch thermal paper optimized styles */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .thermal-ticket {
            width: 100%; /* 3 inches for thermal paper */
            max-width: 100vw;
            margin: 0 2mm 2mm 0; /* Increased gap between tickets */
            padding: 2mm;
            background: white;
            border: 1px dashed #ccc; /* Visual separator */
            page-break-inside: avoid; /* Prevent page breaks inside tickets */
            break-inside: avoid; /* Modern CSS equivalent */
          }
          
          .thermal-ticket:last-child {
            margin-bottom: 0;
          }
          
          .ticket-header {
            background: #000 !important;
            color: white !important;
            padding: 1mm;
            text-align: center;
            margin-bottom: 1mm;
          }
          
          .cinema-name {
            font-size: 1.25rem;
            font-weight: bold;
            line-height: calc(2/1.25);
            margin-bottom: 0.5mm;
          }
          
          .movie-title {
            font-size: 1.5rem;
            font-weight: bold;
            line-height: calc(2/1.5);
            margin-bottom: 0.5mm;
            word-wrap: break-word;
          }
          
          .ticket-body {
            padding: 2mm;
            font-size: 1.3rem;
            font-weight: bold;
            line-height: calc(2/1.5);
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            font-size: 1rem;
            font-weight: bold;
            line-height: calc(1.75/0.875);
          }
          
          .label {
            font-weight: bold;
          }
          
          .value {
            text-align: right;
            max-width: 35mm;
            word-wrap: break-word;
          }
          
          .divider {
            border-top: 1px dashed #000;
            margin: 1.5mm 0;
          }
          
          .center {
            text-align: center;
          }
          
          .large-text {
            font-size: 22px !important;
            font-weight: bold;
            line-height: 1.2;
          }
          
          @media print {
            body {
              margin: 2mm !important;
              padding: 0 !important;
              orphans: 3; /* Minimum lines at bottom of page */
              widows: 3; /* Minimum lines at top of page */
            }
            
            @page {
              size: 80mm auto;
              margin: 0;
            }
            
            .thermal-ticket {
              margin: 0 2mm 2mm 0 !important; /* Small gap between tickets in print */
              border: 1px dashed #999 !important; /* Visible cut lines */
              page-break-inside: avoid !important; /* Critical: Prevent splitting tickets */
              break-inside: avoid !important; /* Modern CSS equivalent */
              page-break-before: auto; /* Allow breaks before tickets if needed */
              orphans: 1; /* Allow single lines if necessary */
              widows: 1; /* Allow single lines if necessary */
            }
            
            .thermal-ticket:last-child {
              margin-bottom: 0 !important;
            }
            
            /* Ensure ticket content doesn't split */
            .ticket-header, .ticket-body, .info-row .value, .info-row .label, .large-text {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              font-size: inherit !important;
            }
          }
        </style>
      </head>
      <body>
        ${selectedSeats
        .map((seat) => {
          return `
              <div class="thermal-ticket">
                <div class="ticket-header">
                  <div class="cinema-name">SENTHIL CINEMAS A/C</div>
                  <div class="movie-title">${movieName}</div>
                </div>
                
                <div class="ticket-body">
                  <div class="info-row">
                    <span class="label">Booking ID:</span>
                    <span class="value">ST-${bookingId}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value large-text">${new Date(showDate).toLocaleDateString(
            "en-GB"
          )}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="label">Time:</span>
                    <span class="value large-text">${showTime}</span>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="info-row">
                    <span class="label large-text">SEAT:</span>
                    <span class="value large-text">${seat}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="label">Amount:</span>
                    <span class="value">₹${pricePerSeat.toFixed(0)}</span>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <div class="center" style="font-size: 0.875rem; margin-top: 1.5mm;">
                    <div>GST: 33CMMPP7822B1Z2</div>
                    <div style="margin-top: 0.5mm;">Premium Cinema Experience</div>
                    <div style="margin-top: 1mm;">Thank You!</div>
                    <div style="margin-top: 0.5mm; font-size: 0.75rem;">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
                     <div class="divider"></div>
                    ${currentShow.userId ? `<div style="font-size: 0.275rem; margin-top: 1.5mm; text-align: center; color: gray;">User ID: ${currentShow.userId}</div>` : ''}
                  </div>
                </div>
              </div>
            `;
        })
        .join("")}
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
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg sm:text-xl font-bold">Ticket Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 touch-manipulation"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Visible content - 3-inch thermal paper preview */}
        <div className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {selectedSeats.map((seat) => {
              return (
                <div
                  key={seat}
                  className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300 w-full max-w-xs sm:max-w-sm"
                  style={{ maxWidth: "280px" }} // Simulates 3-inch width
                >
                  {/* Ticket Header */}
                  <div className="bg-black text-white text-center py-2 px-3">
                    <div className="text-sm font-bold mb-1">
                      SENTHIL CINEMAS A/C
                    </div>
                    <div className="text-sm font-bold truncate">
                      {movieName}
                    </div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Booking ID:</span>
                      <span>ST-{bookingId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Date:</span>
                      <span className="font-bold text-lg">
                        {new Date(showDate).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Time:</span>
                      <span className="font-bold text-lg">{showTime}</span>
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2"></div>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">SEAT:</span>
                      <span className="font-bold text-lg">{seat}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold">Amount:</span>
                      <span>₹{pricePerSeat.toFixed(0)}</span>
                    </div>

                    <div className="border-t border-dashed border-gray-400 my-2"></div>

                    <div className="text-center text-xs text-gray-600 space-y-1">
                      <div>GST: 33CMMPP7822B1Z2</div>
                      <div>Premium Cinema Experience</div>
                      <div className="font-semibold">Thank You!</div>
                      <div className="text-xs text-gray-500">
                        மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும்
                        அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.
                      </div>
                    </div>
                    <div className="border-t border-dashed border-gray-400 my-2"></div>
                    {currentShow.userId && (
                      <div className="text-center text-[8px] text-gray-500">
                        User ID: {currentShow.userId}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 sm:p-4 border-t sticky bottom-0 bg-white flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base sm:text-sm touch-manipulation"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-3 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-base sm:text-sm touch-manipulation"
          >
            <Printer size={18} />
            {isPrinting ? "Printing..." : "Print"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetTicketPreviewPopup;
