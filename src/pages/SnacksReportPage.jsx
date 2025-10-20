import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Notification";
import {
  FileText,
  Calculator,
  CreditCard,
  Printer,
  ChevronDown,
  Coffee,
} from "lucide-react";
import api from "../config/api";
import moment from "moment/moment";

const SnacksReportPage = () => {
  const [reportData, setReportData] = useState({
    date: "",
    showTime: "",
    totalAmount: 0,
    totalOrders: 0,
    totalQuantity: 0,
  });

  const [showTimeOptions, setShowTimeOptions] = useState([]);
  const [isShowTimeDropdownOpen, setIsShowTimeDropdownOpen] = useState(false);
  const [showTimePlannerId, setShowTimePlannerId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch show times when date changes
  useEffect(() => {
    const fetchShowTimes = async () => {
      if (reportData.date) {
        try {
          const formattedDate = reportData.date; // Already in YYYY-MM-DD format
          const response = await api.get(
            `/show-time-planner/date/${formattedDate}`
          );

          // Normalize time format to "hh:mm A" for consistent sorting
          const normalizeTime = (timeStr) => {
            if (!timeStr) {
              console.warn("normalizeTime: Empty or null time string received");
              return null;
            }
            let timeOnly = String(timeStr).trim();

            // Extract time if datetime string (e.g., "2025-08-14 14:30:00" -> "14:30:00")
            if (/\d{4}-\d{2}-\d{2}/.test(timeOnly)) {
              timeOnly = timeOnly.split(/\s+/).pop();
            }

            // Normalize spaces and AM/PM format
            timeOnly = timeOnly
              .replace(/\s+/g, " ") // Collapse multiple spaces
              .replace(/(\d+):(\d{1,2})\s*([AP]M)$/i, "$1:$2 $3") // Ensure "HH:mm AM/PM"
              .replace(/(\d+):(\d{1})\s*([AP]M)$/i, "$1:0$2 $3"); // Pad single-digit minutes

            // Try parsing with flexible formats, including non-strict mode as fallback
            let parsed = moment(timeOnly, ["hh:mm A", "h:mm A"], true);
            if (!parsed.isValid()) {
              parsed = moment(timeOnly, ["HH:mm:ss", "HH:mm"], true);
              if (parsed.isValid()) {
                timeOnly = parsed.format("hh:mm A");
              } else {
                parsed = moment(timeOnly);
                if (parsed.isValid()) {
                  timeOnly = parsed.format("hh:mm A");
                } else {
                  console.warn(
                    `normalizeTime: Failed to parse time string: ${timeOnly}`
                  );
                  return timeOnly; // Fallback to original string
                }
              }
            }
            return parsed.format("hh:mm A"); // Always return "hh:mm A" format
          };

          const showTimes = response
            .filter((item) => item.showTime && item.showTime.showTime)
            .map((item) => ({
              time: normalizeTime(item.showTime.showTime),
              id: item.id,
              price: item.price,
            }))
            .sort((a, b) => {
              const timeA = moment(a.time, "hh:mm A", true);
              const timeB = moment(b.time, "hh:mm A", true);

              if (timeA.isValid() && timeB.isValid()) {
                return timeA.diff(timeB); // Chronological sort
              }

              console.warn(
                `sort: Fallback to string comparison for times: ${a.time} vs ${b.time}`
              );
              return (a.time || "").localeCompare(b.time || "");
            });
            
          setShowTimeOptions(showTimes);
          // Reset show time and related fields if date changes
          setReportData((prev) => ({
            ...prev,
            showTime: "",
            totalAmount: 0,
            totalOrders: 0,
            totalQuantity: 0,
          }));
          setShowTimePlannerId(null);
        } catch (error) {
          notify.error("Failed to fetch show times");
          console.error(error);
        }
      }
    };
    fetchShowTimes();
  }, [reportData.date]);

  // Fetch snacks report data when showTimePlannerId changes
  useEffect(() => {
    const fetchSnacksReportData = async () => {
      if (showTimePlannerId) {
        try {
          setLoading(true);
          const response = await api.get(`/reports/snacks/${showTimePlannerId}`);
          
          // Update report data with API response
          setReportData((prev) => ({
            ...prev,
            totalAmount: response.totalAmount || 0,
            totalOrders: response.totalOrders || 0,
            totalQuantity: response.totalQuantity || 0,
          }));
        } catch (error) {
          notify.error("Failed to fetch snacks report data");
          console.error(error);
          // Reset to default values on error
          setReportData((prev) => ({
            ...prev,
            totalAmount: 0,
            totalOrders: 0,
            totalQuantity: 0,
          }));
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSnacksReportData();
  }, [showTimePlannerId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isShowTimeDropdownOpen &&
        !event.target.closest(".showtime-dropdown")
      ) {
        setIsShowTimeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShowTimeDropdownOpen]);

  const handleShowTimeSelect = (time, id) => {
    setReportData((prev) => ({ ...prev, showTime: time }));
    setShowTimePlannerId(id);
    setIsShowTimeDropdownOpen(false);
  };

  const handlePrint = () => {
    const generateFilename = () => {
      if (reportData.date && reportData.showTime) {
        const dateObj = new Date(reportData.date);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const timeFormatted = reportData.showTime
          .replace(/:/g, ".")
          .replace(/ /g, "");
        return `Snacks-${day}.${month}.${year}-${timeFormatted}`;
      }
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      const hour12 = now.getHours() % 12 || 12;
      return `Snacks-${day}.${month}.${year}-${hour12}.${minutes}${ampm}`;
    };

    const originalTitle = document.title;
    document.title = generateFilename();
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);

    notify.success("Print dialog opened!");
  };

  const handleReset = () => {
    setReportData({
      date: "",
      showTime: "",
      totalAmount: 0,
      totalOrders: 0,
      totalQuantity: 0,
    });
    setShowTimePlannerId(null);
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
          .snacks-summary-table-container th,
          .snacks-summary-table-container td {
            vertical-align: middle;
          }
          .snacks-summary-table-container th,
          .snacks-summary-table-container td {
            height: 70px;
          }
          .snacks-summary-table-container input[type="number"] {
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
              {/* Theater Name Header - Print Only */}
              <div className="hidden print:block text-center mb-4 sm:mb-6">
                <h1
                  className="font-bold text-2xl sm:text-3xl lg:text-4xl"
                  style={{
                    color: "var(--color-teal-700)",
                  }}
                >
                  Senthil Theater, Kattuputhur
                </h1>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
                  <Coffee size={28} />
                  Snacks Report
                </h2>
              </div>
              <form className="space-y-6 overflow-visible">
                {/* Snacks Report Section */}
                <div className="border border-gray-300 rounded-lg overflow-visible">
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">
                            Date
                          </td>
                          <td className="border-r border-gray-300 p-3 w-1/4">
                            <input
                              type="date"
                              value={reportData.date}
                              onChange={(e) =>
                                setReportData(prev => ({ ...prev, date: e.target.value }))
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </td>
                          <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">
                            Show Time
                          </td>
                          <td className="p-3 w-1/4 relative">
                            <div className="relative showtime-dropdown">
                              <div
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer flex items-center justify-between"
                                onClick={() =>
                                  setIsShowTimeDropdownOpen(
                                    !isShowTimeDropdownOpen
                                  )
                                }
                              >
                                <span
                                  className={
                                    reportData.showTime
                                      ? "text-gray-900"
                                      : "text-gray-500"
                                  }
                                >
                                  {reportData.showTime || "Select Show Time"}
                                </span>
                                <ChevronDown
                                  size={18}
                                  className={`text-gray-500 transition-transform duration-200 ${
                                    isShowTimeDropdownOpen
                                      ? "transform rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>
                              {isShowTimeDropdownOpen && (
                                <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl">
                                  <div className="py-1">
                                    <div
                                      className="px-3 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer text-sm"
                                      onClick={() => {
                                        setReportData(prev => ({ ...prev, showTime: "" }));
                                        setShowTimePlannerId(null);
                                        setIsShowTimeDropdownOpen(false);
                                      }}
                                    >
                                      Select Show Time
                                    </div>
                                    {showTimeOptions.map((option) => (
                                      <div
                                        key={option.id}
                                        className={`px-3 py-2 cursor-pointer text-sm ${
                                          reportData.showTime === option.time
                                            ? "bg-teal-100 text-teal-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                        onClick={() =>
                                          handleShowTimeSelect(
                                            option.time,
                                            option.id
                                          )
                                        }
                                      >
                                        {option.time}
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

                  {/* Mobile View */}
                  <div className="md:hidden">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={reportData.date}
                          onChange={(e) =>
                            setReportData(prev => ({ ...prev, date: e.target.value }))
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          Show Time
                        </label>
                        <div className="relative showtime-dropdown">
                          <div
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white cursor-pointer flex items-center justify-between"
                            onClick={() =>
                              setIsShowTimeDropdownOpen(!isShowTimeDropdownOpen)
                            }
                          >
                            <span
                              className={
                                reportData.showTime
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }
                            >
                              {reportData.showTime || "Select Show Time"}
                            </span>
                            <ChevronDown
                              size={18}
                              className={`text-gray-500 transition-transform duration-200 ${
                                isShowTimeDropdownOpen
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                          {isShowTimeDropdownOpen && (
                            <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl">
                              <div className="py-1">
                                <div
                                  className="px-3 py-2 text-gray-500 hover:bg-gray-100 cursor-pointer text-sm"
                                  onClick={() => {
                                    setReportData(prev => ({ ...prev, showTime: "" }));
                                    setShowTimePlannerId(null);
                                    setIsShowTimeDropdownOpen(false);
                                  }}
                                >
                                  Select Show Time
                                </div>
                                {showTimeOptions.map((option) => (
                                  <div
                                    key={option.id}
                                    className={`px-3 py-2 cursor-pointer text-sm ${
                                      reportData.showTime === option.time
                                        ? "bg-teal-100 text-teal-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                    onClick={() =>
                                      handleShowTimeSelect(
                                        option.time,
                                        option.id
                                      )
                                    }
                                  >
                                    {option.time}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Snacks Summary Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
                    <Calculator size={24} />
                    Snacks Summary
                  </h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block">
                      <div className="snacks-summary-table-container">
                        <table className="w-full">
                          <tbody>
                            <tr className="border-b border-gray-300">
                              <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">
                                Total Amount
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span>₹</span>
                                  <input
                                    type="number"
                                    value={reportData.totalAmount}
                                    readOnly
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                                    placeholder="Auto-calculated"
                                  />
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-300">
                              <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">
                                Total Orders
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={reportData.totalOrders}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                                  placeholder="Auto-calculated"
                                />
                              </td>
                            </tr>
                            <tr className="bg-emerald-50">
                              <td className="border-r border-gray-300 p-3 font-bold text-emerald-700">
                                Total Quantity
                              </td>
                              <td className="p-3 font-bold text-emerald-600">
                                {reportData.totalQuantity}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            Total Amount
                          </label>
                          <div className="flex items-center gap-2">
                            <span>₹</span>
                            <input
                              type="number"
                              value={reportData.totalAmount}
                              readOnly
                              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                              placeholder="Auto-calculated"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            Total Orders
                          </label>
                          <input
                            type="number"
                            value={reportData.totalOrders}
                            readOnly
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                            placeholder="Auto-calculated"
                          />
                        </div>
                        <div className="bg-emerald-50 p-3 -mx-4 -mb-4 mt-4 rounded-b-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-700">
                              Total Quantity
                            </span>
                            <span className="font-bold text-emerald-600">
                              {reportData.totalQuantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    <span className="ml-2 text-gray-600">Loading snacks data...</span>
                  </div>
                )}

                {/* No data message */}
                {showTimePlannerId && !loading && reportData.totalAmount === 0 && reportData.totalOrders === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🍿</div>
                      <div>No snacks data available for this show time</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8 no-print">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition duration-200"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    disabled={!reportData.date || !reportData.showTime}
                    className="w-full sm:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
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

      {/* Print Styles */}
      <style>
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
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
              background: white !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              padding-left: 15px !important;
              padding-right: 15px !important;
              margin: 0 !important;
              max-width: none !important;
            }
            .no-print,
            .no-print *,
            .print-area .no-print,
            .print-area .no-print *,
            .flex.flex-col.sm\\:flex-row.gap-4.justify-end.mt-8,
            .flex.flex-col.sm\\:flex-row.gap-4.justify-end.mt-8 * {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              height: 0 !important;
              width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              overflow: hidden !important;
              position: absolute !important;
              left: -9999px !important;
              top: -9999px !important;
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
            h3.text-xl.font-bold.text-teal-600 {
              margin-top: 10px !important;
              margin-bottom: 3px !important;
            }
            .print-area h1 {
              font-size: 32px !important;
              margin-bottom: 20px !important;
              margin-top: 20px !important;
              color: #0f766e !important;
              font-weight: bold !important;
              text-align: center !important;
              border: 3px solid #0f766e !important;
              background-color: #f0fdfa !important;
              padding: 15px 20px !important;
              border-radius: 8px !important;
              text-transform: uppercase !important;
              letter-spacing: 2px !important;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
              display: block !important;
            }

            h2.text-2xl.font-bold.text-teal-700 {
              margin-top: 30px !important;
              font-size: 28px !important;
              justify-content: center !important;
              text-align: center !important;
              text-decoration: underline !important;
              display: flex !important;
              align-items: center !important;
            }
            h2.text-2xl.font-bold.text-teal-700 svg {
              width: 32px !important;
              height: 32px !important;
            }
            .print-area {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            h3.text-xl.font-bold.text-teal-600 {
              margin-top: 15px !important;
            }
            .mt-8 h3.text-xl.font-bold.text-teal-600 {
              margin-top: 25px !important;
            }

            /* Force mobile sections to be hidden in print */
            .print-area .md\\:hidden {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Ensure desktop sections are visible */
            .print-area .hidden.md\\:block {
              display: block !important;
              visibility: visible !important;
            }
            
            .print-area .hidden.md\\:flex {
              display: flex !important;
              visibility: visible !important;
            }

            .snacks-summary-table-container table {
              font-size: 13px !important;
            }
            .snacks-summary-table-container th,
            .snacks-summary-table-container td {
              padding: 3px 4px !important;
              font-size: 13px !important;
              height: 45px !important;
              vertical-align: middle !important;
            }
            .snacks-summary-table-container input {
              height: 30px !important;
              min-height: 30px !important;
              padding: 2px 3px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default SnacksReportPage;
