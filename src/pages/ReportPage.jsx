import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Notification";
import { FileText, Calculator, CreditCard, Printer, ChevronDown } from "lucide-react";

const ReportPage = () => {
  const [reportData, setReportData] = useState({
    // Show Collection Report fields
    date: "",
    showTime: "",
    totalTicketsSold: "",
    pass: "",
    netTickets: "",
    
    // Counter Collection fields
    counterTotalTickets: "",
    counterPass: "",
    counterNetTickets: "",
    denomination500: "",
    denomination200: "",
    denomination100: "",
    denomination50: "",
    denomination20: "",
    denomination10: "",
    userReturn: "",
    balanceCounterAmount: "",
    actualAmount: "",
    perTicketPrice: "",
    passesAmount: "",
    totalCounterCollection: "",
    
    // Online Collection fields
    onlineTotalTickets: "",
    onlineAmount: "",
    
    // Final Amount
    finalAmount: ""
  });

  // State for showtime dropdown
  const [isShowTimeDropdownOpen, setIsShowTimeDropdownOpen] = useState(false);
  const showTimeOptions = ["10:30 AM", "2:00 PM", "6:00 PM", "10:00 PM"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isShowTimeDropdownOpen && !event.target.closest('.showtime-dropdown')) {
        setIsShowTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShowTimeDropdownOpen]);

  // Prevent wheel events on number inputs to avoid accidental value changes during scroll
  useEffect(() => {
    const preventWheelOnNumberInputs = (e) => {
      // Check if the target is a focused number input
      if (e.target.type === 'number' && document.activeElement === e.target) {
        e.preventDefault();
      }
    };

    // Add event listener to prevent wheel events on focused number inputs
    document.addEventListener('wheel', preventWheelOnNumberInputs, { passive: false });

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('wheel', preventWheelOnNumberInputs);
    };
  }, []);

  const handleInputChange = (field, value) => {
    setReportData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate Show Collection fields from Counter and Online data
      if (field === 'counterTotalTickets' || field === 'onlineTotalTickets' || field === 'counterPass') {
        const counterSold = parseInt(updated.counterTotalTickets) || 0;
        const onlineSold = parseInt(updated.onlineTotalTickets) || 0;
        const counterPasses = parseInt(updated.counterPass) || 0;
        
        // Total Tickets Sold = Counter Sold + Online Sold
        updated.totalTicketsSold = (counterSold + onlineSold).toString();
        
        // Pass = Counter Pass (online doesn't have passes)
        updated.pass = counterPasses.toString();
        
        // Net Tickets = Total Sold - Total Passes
        updated.netTickets = (counterSold + onlineSold - counterPasses).toString();
      }
      
      // Auto-calculate Counter Net Tickets (Counter Sold - Counter Passes)
      if (field === 'counterTotalTickets' || field === 'counterPass') {
        const counterSold = parseInt(updated.counterTotalTickets) || 0;
        const counterPasses = parseInt(updated.counterPass) || 0;
        updated.counterNetTickets = (counterSold - counterPasses).toString();
      }
      
      // Auto-calculate Passes Amount (Per Ticket Price × Number of Passes)
      if (field === 'perTicketPrice' || field === 'counterPass') {
        const perTicketPrice = parseInt(updated.perTicketPrice) || 0;
        const numberOfPasses = parseInt(updated.counterPass) || 0;
        updated.passesAmount = (perTicketPrice * numberOfPasses).toString();
      }
      
      // Auto-calculate Counter Collection totals
      if (field.startsWith('denomination') || field === 'userReturn' || field === 'balanceCounterAmount' || field === 'perTicketPrice' || field === 'counterPass') {
        const d500 = parseInt(updated.denomination500) || 0;
        const d200 = parseInt(updated.denomination200) || 0;
        const d100 = parseInt(updated.denomination100) || 0;
        const d50 = parseInt(updated.denomination50) || 0;
        const d20 = parseInt(updated.denomination20) || 0;
        const d10 = parseInt(updated.denomination10) || 0;
        
        const denominationTotal = (d500 * 500) + (d200 * 200) + (d100 * 100) + (d50 * 50) + (d20 * 20) + (d10 * 10);
        const userReturn = parseInt(updated.userReturn) || 0;
        const balanceCounter = parseInt(updated.balanceCounterAmount) || 0;
        const passesAmount = parseInt(updated.passesAmount) || 0;
        
        updated.actualAmount = (denominationTotal - userReturn - balanceCounter).toString();
        updated.totalCounterCollection = (denominationTotal - userReturn - balanceCounter - passesAmount).toString();
      }
      
      // Auto-calculate Final Amount (Counter + Online)
      const counterTotal = parseInt(updated.totalCounterCollection) || 0;
      const onlineTotal = parseInt(updated.onlineAmount) || 0;
      updated.finalAmount = (counterTotal + onlineTotal).toString();
      
      return updated;
    });
  };

  const handlePrint = () => {
    // Generate filename based on date and show time
    const generateFilename = () => {
      if (reportData.date && reportData.showTime) {
        // Convert date from YYYY-MM-DD to DD.MM.YYYY format
        const dateObj = new Date(reportData.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        
        // Convert show time to format without spaces and colons
        const timeFormatted = reportData.showTime.replace(/:/g, '.').replace(/ /g, '');
        
        return `${day}.${month}.${year}-${timeFormatted}`;
      }
      
      // If date or showTime is missing, use current date/time as fallback
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      const hour12 = now.getHours() % 12 || 12;
      
      return `${day}.${month}.${year}-${hour12}.${minutes}${ampm}`;
    };
    
    // Store original title and set new one
    const originalTitle = document.title;
    document.title = generateFilename();
    
    // Add print styles
    const printStyles = `
      <style>
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            transform: scale(1.0);
            transform-origin: 0 0;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 5mm;
          }
          body {
            font-size: 15px;
            line-height: 1.2;
            margin: 0;
            padding: 0;
          }
          table {
            font-size: 14px;
            border-collapse: collapse;
            page-break-inside: avoid;
          }
          .text-3xl {
            font-size: 26px !important;
          }
          .text-2xl {
            font-size: 22px !important;
          }
          .text-xl {
            font-size: 20px !important;
          }
          .p-6 {
            padding: 4px !important;
          }
          .p-4 {
            padding: 3px !important;
          }
          .p-3 {
            padding: 3px !important;
          }
          .mt-8 {
            margin-top: 6px !important;
          }
          .mt-4 {
            margin-top: 3px !important;
          }
          .mb-6 {
            margin-bottom: 3px !important;
          }
          .mb-4 {
            margin-bottom: 3px !important;
          }
          .mb-2 {
            margin-bottom: 2px !important;
          }
          .space-y-6 > * + * {
            margin-top: 3px !important;
          }
          .gap-2 {
            gap: 2px !important;
          }
          .rounded-lg {
            border-radius: 3px !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border-width: 0.75px !important;
          }
          th, td {
            padding: 3px 4px !important;
            font-size: 14px !important;
          }
          h2, h3 {
            margin: 3px 0 !important;
            page-break-after: avoid;
            font-size: 16px !important;
          }
          .flex.items-center.gap-2 svg {
            width: 16px !important;
            height: 16px !important;
          }
          div[class*="border border-gray-300 rounded-lg"] {
            page-break-inside: avoid;
            margin-bottom: 2px !important;
          }
          .bg-emerald-50 {
            page-break-inside: avoid;
          }
          .bg-emerald-50 td {
            padding: 4px 3px !important;
            height: auto !important;
          }
          .bg-orange-50 td {
            padding: 4px 3px !important;
            height: auto !important;
          }
          tbody tr:nth-last-child(2) td {
            padding: 4px 3px !important;
            height: auto !important;
          }
          .bg-orange-50 td {
            padding: 4px 3px !important;
            height: auto !important;
          }
          h3.text-xl.font-bold.text-teal-600 {
            margin-top: 10px !important;
            margin-bottom: 3px !important;
          }
          /* Reduce denomination table font size specifically */
          table thead tr.bg-orange-50 th {
            font-size: 11px !important;
          }
          table tbody tr.bg-orange-50 td {
            font-size: 11px !important;
          }
          /* Target all table cells in denomination table (override general 14px rule) */
          table thead tr.bg-orange-50 ~ tbody tr td {
            font-size: 11px !important;
          }
          /* Target denomination table by structure */
          table thead tr.bg-orange-50 + tbody td,
          table thead tr.bg-orange-50 + tbody th {
            font-size: 11px !important;
          }
          /* Fallback for browsers without :has() support */
          thead tr.bg-orange-50 + tbody tr td,
          thead tr.bg-orange-50 th {
            font-size: 11px !important;
          }
          /* Most direct approach - target any table cell that contains denomination values */
          table thead tr.bg-orange-50 ~ tbody td,
          table thead tr.bg-orange-50 ~ tbody th {
            font-size: 11px !important;
          }
          /* Make Final Amount label font size equal to its value */
          .border.border-emerald-500.rounded-lg.overflow-hidden.bg-emerald-50 h3.text-2xl {
            font-size: 24px !important;
          }
          .border.border-emerald-500.rounded-lg.overflow-hidden.bg-emerald-50 .text-3xl {
            font-size: 24px !important;
          }
          .border.border-emerald-500.rounded-lg.overflow-hidden.bg-emerald-50 .text-sm {
            font-size: 12px !important;
          }
          
          /* Add top margin, increase font size, center align and underline Show Collection Report title in print */
          h2.text-2xl.font-bold.text-teal-700 {
            margin-top: 30px !important;
            font-size: 28px !important;
            justify-content: center !important;
            text-align: center !important;
            text-decoration: underline !important;
            display: flex !important;
            align-items: center !important;
          }
          
          /* Increase icon size for Show Collection Report title in print */
          h2.text-2xl.font-bold.text-teal-700 svg {
            width: 32px !important;
            height: 32px !important;
          }
          
          /* Add left and right side padding for print */
          .print-area {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }
          
          /* Add equal top margin before Counter Collection and Online Collection titles */
          h3.text-xl.font-bold.text-teal-600 {
            margin-top: 15px !important;
          }
          
          /* Add extra top margin specifically for Counter Collection title */
          .mt-8 h3.text-xl.font-bold.text-teal-600 {
            margin-top: 25px !important;
          }
          
          /* Side-by-side layout for denomination and counter summary tables */
          .counter-collection-container {
            display: flex !important;
            gap: 8px !important;
            align-items: flex-start !important;
          }
          .denomination-table-container {
            flex: 0 0 40% !important;
            width: 40% !important;
          }
          .counter-summary-table-container {
            flex: 0 0 58% !important;
            width: 58% !important;
          }
          
          /* Adjust denomination table font size to be smaller */
          .denomination-table-container table {
            font-size: 11px !important;
          }
          .denomination-table-container th,
          .denomination-table-container td {
            padding: 2px 3px !important;
            font-size: 11px !important;
            height: 28px !important;
            vertical-align: middle !important;
          }
          
          /* Keep counter summary table normal size */
          .counter-summary-table-container table {
            font-size: 13px !important;
          }
          .counter-summary-table-container th,
          .counter-summary-table-container td {
            padding: 3px 4px !important;
            font-size: 13px !important;
            height: 45px !important;
            vertical-align: middle !important;
          }
          
          /* Ensure consistent cell heights for all tables in print */
          .counter-collection-container table th,
          .counter-collection-container table td {
            box-sizing: border-box !important;
          }
          
          /* Override any existing height styles for inputs within tables */
          .denomination-table-container input {
            height: 20px !important;
            min-height: 20px !important;
            padding: 1px 2px !important;
          }
          
          .counter-summary-table-container input {
            height: 30px !important;
            min-height: 30px !important;
            padding: 2px 3px !important;
          }
        }
      </style>
    `;
    
    // Create a temporary style element
    const styleElement = document.createElement('div');
    styleElement.innerHTML = printStyles;
    document.head.appendChild(styleElement);
    
    // Trigger print
    window.print();
    
    // Clean up the style element and restore original title after printing
    setTimeout(() => {
      document.head.removeChild(styleElement);
      document.title = originalTitle;
    }, 1000);
    
    notify.success("Print dialog opened!");
  };

  const handleReset = () => {
    setReportData({
      date: "",
      showTime: "",
      totalTicketsSold: "",
      pass: "",
      netTickets: "",
      counterTotalTickets: "",
      counterPass: "",
      counterNetTickets: "",
      denomination500: "",
      denomination200: "",
      denomination100: "",
      denomination50: "",
      denomination20: "",
      denomination10: "",
      userReturn: "",
      balanceCounterAmount: "",
      actualAmount: "",
      perTicketPrice: "",
      passesAmount: "",
      totalCounterCollection: "",
      onlineTotalTickets: "",
      onlineAmount: "",
      finalAmount: ""
    });
    notify.info("Form reset successfully!");
  };

  return (
    <div className="p-2 lg:p-4 min-h-screen">
      <style>
        {`
          .border.border-gray-300.rounded-lg.overflow-visible {
            margin-bottom: 5px;
          }
          
          .border.border-gray-300.rounded-lg.overflow-hidden {
            margin-bottom: 5px;
          }
          
          /* Consistent cell heights for denomination and counter collection tables */
          .counter-collection-container table th,
          .counter-collection-container table td {
            vertical-align: middle;
          }
          
          .denomination-table-container th,
          .denomination-table-container td {
            height: 44px;
          }
          
          .counter-summary-table-container th,
          .counter-summary-table-container td {
            height: 70px;
          }
          
          /* Ensure inputs within tables have consistent height */
          .denomination-table-container input[type="number"] {
            min-height: 32px;
          }
          
          .counter-summary-table-container input[type="number"] {
            min-height: 40px;
          }
        `}
      </style>
      <div className="no-print">
        <PageHeader title="" />
      </div>

      <div className="flex justify-center items-start mt-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-visible">
            <div className="print-area overflow-visible">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                <FileText size={28} />
                Show Collection Report
              </h2>
            </div>
            <form className="space-y-6 overflow-visible">
              {/* Show Collection Report Section */}
              {/* Date and Show Time Section */}
              <div className="border border-gray-300 rounded-lg overflow-visible">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">Date</td>
                      <td className="border-r border-gray-300 p-3 w-1/4">
                        <input
                          type="date"
                          value={reportData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </td>
                      <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">Show Time</td>
                      <td className="p-3 w-1/4 relative">
                        <div className="relative showtime-dropdown">
                          <div
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer flex items-center justify-between"
                            onClick={() => setIsShowTimeDropdownOpen(!isShowTimeDropdownOpen)}
                          >
                            <span className={reportData.showTime ? "text-gray-900" : "text-gray-500"}>
                              {reportData.showTime || "Select Show Time"}
                            </span>
                            <ChevronDown 
                              size={18} 
                              className={`text-gray-500 transition-transform duration-200 ${
                                isShowTimeDropdownOpen ? "transform rotate-180" : ""
                              }`}
                            />
                          </div>
                          
                          {/* Dropdown Menu */}
                          {isShowTimeDropdownOpen && (
                            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl">
                              <div className="py-1">
                                <div
                                  className="px-3 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer text-sm"
                                  onClick={() => {
                                    handleInputChange('showTime', '');
                                    setIsShowTimeDropdownOpen(false);
                                  }}
                                >
                                  Select Show Time
                                </div>
                                {showTimeOptions.map((time) => (
                                  <div
                                    key={time}
                                    className={`px-3 py-2 cursor-pointer text-sm ${
                                      reportData.showTime === time
                                        ? "bg-teal-100 text-teal-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() => {
                                      handleInputChange('showTime', time);
                                      setIsShowTimeDropdownOpen(false);
                                    }}
                                  >
                                    {time}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Tickets Sold and Pass Section */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">Total Tickets Sold</td>
                      <td className="border-r border-gray-300 p-3 w-1/4">
                        <input
                          type="number"
                          value={reportData.totalTicketsSold}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </td>
                      <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">Pass</td>
                      <td className="p-3 w-1/4">
                        <input
                          type="number"
                          value={reportData.pass}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Tickets Section */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">Net Tickets (Sold - Passes)</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={reportData.netTickets}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Counter Collection Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
                  <Calculator size={24} />
                  Counter Collection
                </h3>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">Tickets Sold</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={reportData.counterTotalTickets}
                            onChange={(e) => handleInputChange('counterTotalTickets', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter tickets sold at counter"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">Pass</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={reportData.counterPass}
                            onChange={(e) => handleInputChange('counterPass', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter number of passes"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">Net Tickets (Sold - Passes)</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={reportData.counterNetTickets}
                            readOnly
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                            placeholder="Auto-calculated"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Flex container for side-by-side layout in print */}
                <div className="counter-collection-container">
                  {/* Denomination Table - Left Side */}
                  <div className="denomination-table-container">
                    <div className="border border-gray-300 rounded-lg overflow-hidden mt-4">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-orange-50 border-b border-gray-300">
                            <th className="border-r border-gray-300 p-3 text-left font-bold text-orange-700 w-1/3">Denomination</th>
                            <th className="border-r border-gray-300 p-3 text-left font-bold text-orange-700 w-1/3">Count</th>
                            <th className="p-3 text-left font-bold text-orange-700 w-1/3">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[500, 200, 100, 50, 20, 10].map((denom) => (
                            <tr key={denom} className="border-b border-gray-300">
                              <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/3">{denom}</td>
                              <td className="border-r border-gray-300 p-3 w-1/3">
                                <input
                                  type="number"
                                  value={reportData[`denomination${denom}`]}
                                  onChange={(e) => handleInputChange(`denomination${denom}`, e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-3 font-medium text-emerald-600 w-1/3">
                                ₹{((parseInt(reportData[`denomination${denom}`]) || 0) * denom).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-orange-50">
                            <td className="border-r border-gray-300 p-3 font-bold w-1/3">Total</td>
                            <td className="border-r border-gray-300 p-3 font-bold w-1/3">
                              {[500, 200, 100, 50, 20, 10].reduce((sum, denom) => 
                                sum + (parseInt(reportData[`denomination${denom}`]) || 0), 0
                              )}
                            </td>
                            <td className="p-3 font-bold text-black w-1/3">
                              ₹{[500, 200, 100, 50, 20, 10].reduce((sum, denom) => 
                                sum + ((parseInt(reportData[`denomination${denom}`]) || 0) * denom), 0
                              ).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Counter Collection Summary - Right Side */}
                  <div className="counter-summary-table-container">
                    <div className="border border-gray-300 rounded-lg overflow-hidden mt-4">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">User Return (-)</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span>₹</span>
                                <input
                                  type="number"
                                  value={reportData.userReturn}
                                  onChange={(e) => handleInputChange('userReturn', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="0"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">Balance Counter Amount (-)</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span>₹</span>
                                <input
                                  type="number"
                                  value={reportData.balanceCounterAmount}
                                  onChange={(e) => handleInputChange('balanceCounterAmount', e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="0"
                                />
                              </div>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 font-bold">Actual Amount</td>
                            <td className="p-3 font-bold">
                              ₹{(parseInt(reportData.actualAmount) || 0).toLocaleString()}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">
                              <div className="flex items-center gap-2">
                                <span>₹</span>
                                <input
                                  type="number"
                                  value={reportData.perTicketPrice}
                                  onChange={(e) => handleInputChange('perTicketPrice', e.target.value)}
                                  className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  placeholder="0"
                                />
                                <span>x {reportData.counterPass || 0} passes (-)</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-red-600">
                                ₹{(parseInt(reportData.passesAmount) || 0).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                          <tr className="bg-emerald-50">
                            <td className="border-r border-gray-300 p-3 font-bold text-emerald-700">Total Counter Collection</td>
                            <td className="p-3 font-bold text-emerald-600">
                              ₹{(parseInt(reportData.totalCounterCollection) || 0).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Online Collection Section */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
                  <CreditCard size={24} />
                  Online Collection
                </h3>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">Tickets Sold</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={reportData.onlineTotalTickets}
                            onChange={(e) => handleInputChange('onlineTotalTickets', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter online tickets count"
                          />
                        </td>
                      </tr>
                      <tr className="bg-emerald-50">
                        <td className="border-r border-gray-300 p-3 font-bold text-emerald-700">Total Online Collection</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={reportData.onlineAmount}
                            onChange={(e) => handleInputChange('onlineAmount', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-emerald-600 font-bold"
                            placeholder="Enter online collection amount"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Final Amount Section */}
              <div className="mt-8">
                <div className="border border-emerald-500 rounded-lg overflow-hidden bg-emerald-50">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-emerald-700">Final Amount:</h3>
                      <div className="text-3xl font-bold text-emerald-600">
                        ₹{(parseInt(reportData.finalAmount) || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      Counter (₹{(parseInt(reportData.totalCounterCollection) || 0).toLocaleString()}) + Online (₹{(parseInt(reportData.onlineAmount) || 0).toLocaleString()})
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end mt-8 no-print">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition duration-200"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition duration-200 flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print Report
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;

