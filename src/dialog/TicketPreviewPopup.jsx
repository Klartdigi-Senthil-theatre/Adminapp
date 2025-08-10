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
  bookingId
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

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

  const handlePrint = () => {
    setIsPrinting(true);
    notify.info("Preparing for printing...");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
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
        <div class="flex flex-col gap-8 max-w-4xl mx-auto">
          ${selectedSeats
            .map((seat) => {
              return `
                <div class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4 print:mb-0 print:shadow-none border border-gray-300">
                  <div class="bg-gray-900 text-white p-2 ticket-header flex flex-col gap-2">
                    <div class="flex justify-between items-center w-full">
                      <div class="text-xl font-bold">${movieName}</div>
                      <div class="font-mono text-sm text-orange-300 font-bold">
                        <span class="text-white text-xs font-semibold">Booking ID : </span> ST - ${bookingId}
                      </div>
                    </div>
                    <div class="flex justify-between items-center w-full">
                      <div class="text-amber-300 text-sm">Premium Cinema Experience</div>
                      <div class="text-sm font-bold text-orange-300">
                        <span class="text-white text-xs font-semibold">Amount Paid : </span>  ₹${pricePerSeat.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div class="p-4">
                  <div class="flex flex-col gap-2 bg-white">
                    <div class="flex justify-between items-center w-full">
                      <div class="text-sm font-semibold">
                        <span class="text-xs font-normal">Date & Time : </span>${new Date(showDate).toLocaleDateString()} • ${showTime}
                      </div>
                      <div class="text-sm font-semibold">
                        <span class="text-xs font-normal">Theatre : </span>${theatreName}
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 bg-white mt-2">
                    <div class="flex justify-between items-center w-full">
                      <div class="text-md font-semibold">
                        <span class="text-xs  font-normal">Seat : </span>${seat}
                      </div>
                      <div class="text-sm font-semibold">
                        <span class="text-xs font-normal">GST No : </span>33CMMPP7822B1Z2
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

  // const handlePrint = () => {
  //   setIsPrinting(true);
  //   notify.info("Preparing for printing...");

  //   const printContent = `
  //     <!DOCTYPE html>
  //     <html>
  //     <head>
  //       <title>Movie Tickets - ${movieName}</title>
  //       <script src="https://cdn.tailwindcss.com"></script>
  //       <style>
  //         .ticket-header::after {
  //           content: '';
  //           position: absolute;
  //           bottom: -10px;
  //           left: 0;
  //           right: 0;
  //           height: 20px;
  //           background: radial-gradient(circle at 50% 0%, transparent 10px, white 10px);
  //           background-size: 20px 20px;
  //         }
          
  //         /* Force background colors to print */
  //         * {
  //           -webkit-print-color-adjust: exact !important;
  //           color-adjust: exact !important;
  //           print-color-adjust: exact !important;
  //         }
          
  //         @media print {
  //           body {
  //             background: white !important;
  //             padding: 0 !important;
  //           }
            
  //           .ticket {
  //             page-break-after: always;
  //             margin: 0 !important;
  //             box-shadow: none !important;
  //           }
            
  //           .ticket:last-child {
  //             page-break-after: auto;
  //           }
            
  //           /* Ensure header background prints */
  //           .ticket-header {
  //             background: #1a1a1a !important;
  //             color: white !important;
  //             -webkit-print-color-adjust: exact !important;
  //             color-adjust: exact !important;
  //             print-color-adjust: exact !important;
  //           }
  //         }
  //       </style>
  //     </head>
  //     <body class="font-sans bg-gray-100 p-5">
  //       <div class="fixed bottom-5 right-5 text-xs text-gray-300 z-50">Generated by Cinema Booking System</div>
  //       <div class="flex flex-col gap-8 max-w-4xl mx-auto">
  //         ${selectedSeats
  //           .map((seat) => {
  //             return `
  //               <div class="bg-white rounded-xl shadow-2xl overflow-hidden mb-4 print:mb-0 print:shadow-none border border-gray-300">
  //                 <div class="bg-gray-900 text-white p-2 relative ticket-header" style="background: #1a1a1a !important; -webkit-print-color-adjust: exact; color-adjust: exact; print-color-adjust: exact;">
  //                   <div class="ticket-header"></div>
  //                   <div class="flex justify-between items-start mb-4">
  //                     <div>
  //                       <div class="text-2xl font-bold mb-1">${movieName}</div>
  //                       <div class="text-amber-300 text-sm">Premium Cinema Experience</div>
  //                     </div>
  //                     <div class="w-16 h-16 rounded-full overflow-hidden mr-2">
  //                       <img src="${poster}" class="w-16 h-16 object-cover rounded-full" />
  //                     </div>

  //                   </div>
  //                   <div class="grid grid-cols-2">
  //                     <div class="text-left">
  //                       <div class="text-xs opacity-80 mb-1">Booking ID</div>
  //                       <div class="font-mono text-xl font-bold">ST - ${bookingId}</div>
  //                     </div>
  //                     <div class="text-right">
  //                       <div class="text-xs opacity-80 mb-1">Amount Paid</div>
  //                       <div class="text-2xl font-bold text-orange-300">₹${pricePerSeat.toFixed(
  //                         2
  //                       )}</div>
  //                     </div>
  //                   </div>
  //                 </div>
                  
  //                 <div class="p-6 bg-white">
  //                   <div class="grid grid-cols-2 gap-6 mb-6">
  //                     <div>
  //                       <div class="flex items-center gap-3 mb-4">
  //                         📅
  //                         <div>
  //                           <div class="text-xs text-gray-600 mb-0.5">Date & Time</div>
  //                           <div class="font-semibold text-lg text-gray-900">${new Date(
  //                             showDate
  //                           ).toLocaleDateString()} • ${showTime}</div>
  //                         </div>
  //                       </div>
                        
  //                       <div class="flex items-center gap-3 mb-4">
  //                         👥
  //                         <div>
  //                           <div class="text-xs text-gray-600 mb-0.5">Seat</div>
  //                           <div class="font-semibold text-md text-gray-900">${seat}</div>
  //                         </div>
  //                       </div>
  //                     </div>
                      
  //                     <div>
  //                       <div class="flex items-center gap-3 mb-4">
  //                         <MapPin className="w-5 h-5 text-orange-500" />
  //                         <div>
  //                           <div class="text-xs text-gray-600 mb-0.5">📍 Theatre</div>
  //                           <div class="font-semibold text-gray-900 text-lg">${theatreName}</div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             `;
  //           })
  //           .join("")}
  //       </div>
  //     </body>
  //     </html>
  //   `;

  //   document.write(printContent);
  //   document.close();

  //   // Wait for content to load before printing
  //   setTimeout(() => {
  //     window.print();
  //     window.location.reload(); // go back to your app
  //   }, 500);
  // };

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
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewPopup;