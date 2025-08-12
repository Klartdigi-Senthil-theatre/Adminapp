import { Calendar, MapPin, Printer, Users, X } from "lucide-react";
import moment from "moment";
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
  bookingId
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  console.log(currentShow);
  
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
    setIsPrinting(true);
    notify.info("Preparing for printing...");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* 80mm x 297mm thermal paper optimized layout */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          
          html, body {
            width: 80mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          
          .print-container {
            width: 80mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            background: white !important;
          }
          
          .ticket-wrapper {
            width: 70mm !important;
            max-width: 70mm !important;
            margin: 0 auto 6mm auto !important;
            background: white !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            border: 2px solid #d1d5db !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          .ticket-header {
            background: #000 !important;
            color: white !important;
            text-align: center !important;
            padding: 8px 12px !important;
          }
          
          .header-main {
            font-size: 14px !important;
            font-weight: bold !important;
            margin-bottom: 4px !important;
          }
          
          .header-sub {
            font-size: 18px !important;
            font-weight: bold !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          .ticket-body {
            padding: 12px !important;
            font-size: 16px !important;
          }
          
          .info-line {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 8px !important;
          }
          
          .info-label {
            font-weight: 600 !important;
          }
          
          .info-value {
            text-align: right !important;
            word-wrap: break-word !important;
          }
          
          .seat-line {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 8px !important;
          }
          
          .seat-label, .seat-value {
            font-weight: bold !important;
            font-size: 18px !important;
          }
          
          .divider {
            border-top: 1px dashed #9ca3af !important;
            margin: 8px 0 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .footer {
            text-align: center !important;
            font-size: 14px !important;
            color: #6b7280 !important;
          }
          
          .footer-line {
            margin-bottom: 4px !important;
          }
          
          .footer-thank {
            font-weight: 600 !important;
          }
          
          @media print {
            @page {
              size: 80mm 297mm !important;
              margin: 0 !important;
            }
            
            html, body {
              width: 80mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .print-container {
              width: 80mm !important;
              padding: 5mm !important;
            }
            
            .ticket-wrapper {
              width: 70mm !important;
              border: 1px dashed #999 !important;
              box-shadow: none !important;
            }
            
            .divider {
              border-top: none !important;
              margin: 4px 0 !important;
            }
            
            /* Reliable dot divider for print */
            .divider::before {
              content: "• • • • • • • • • • • • • • • • • • • • • • • •" !important;
              display: block !important;
              text-align: center !important;
              font-size: 10px !important;
              line-height: 1 !important;
              color: #000 !important;
              letter-spacing: 2px !important;
              margin: 4px 0 !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${selectedSeats
            .map((seat) => {
              const formatTime = showTime ? moment(showTime, "HH:mm").format("h:mm A") : 'N/A';
              return `
                <div class="ticket-wrapper">
                  <div class="ticket-header">
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">SENTHIL CINEMAS A/C</div>
                    <div style="font-size: 18px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${movieName}</div>
                  </div>
                  
                  <div style="padding: 12px; font-size: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-weight: 600;">Booking ID:</span>
                      <span>ST-${bookingId}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-weight: 600;">Date:</span>
                      <span>${new Date(showDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-weight: 600;">Time:</span>
                      <span>${formatTime}</span>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-weight: bold; font-size: 18px;">SEAT:</span>
                      <span style="font-weight: bold; font-size: 18px;">${seat}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-weight: 600;">Amount:</span>
                      <span>₹${pricePerSeat.toFixed(0)}</span>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div style="text-align: center; font-size: 14px; color: #6b7280;">
                      <div style="margin-bottom: 4px;">GST: 33CMMPP7822B1Z2</div>
                      <div style="margin-bottom: 4px;">Premium Cinema Experience</div>
                      <div style="font-weight: 600;">Thank You!</div>
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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-2 z-10">
          <h3 className="text-xl font-bold">Ticket Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Visible content - 80mm thermal paper preview */}
        <div className="p-6">
          <div className="flex flex-col items-center gap-6">
            {selectedSeats.map((seat) => {
              const formatTime = showTime ? moment(showTime, "HH:mm").format("h:mm A") : 'N/A';
              
              return (
                <div
                  key={seat}
                  className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-300"
                  style={{ width: '262px', maxWidth: '262px' }} // Simulates 70mm width
                >
                  {/* Ticket Header */}
                  <div className="bg-black text-white text-center py-2 px-3">
                    <div className="text-xs font-bold mb-1">SENTHIL CINEMAS A/C</div>
                    <div className="text-base font-bold truncate">{movieName}</div>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Booking ID:</span>
                      <span>ST-{bookingId}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Date:</span>
                      <span>{new Date(showDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-semibold">Time:</span>
                      <span>{formatTime}</span>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-400 my-2"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base">SEAT:</span>
                      <span className="font-bold text-base">{seat}</span>
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
        </div>
      </div>
    </div>
  );
};

export default GetTicketPreviewPopup;