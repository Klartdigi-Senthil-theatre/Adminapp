import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { notify } from "../components/Notification";
import {
  FileText,
  Calculator,
  CreditCard,
  Printer,
  ChevronDown,
} from "lucide-react";
import api from "../config/api";
import moment from "moment/moment";

const ReportPage = () => {
  const [reportData, setReportData] = useState({
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
    finalAmount: "",
  });

  const [showTimeOptions, setShowTimeOptions] = useState([]);
  const [isShowTimeDropdownOpen, setIsShowTimeDropdownOpen] = useState(false);
  const [showTimePlannerId, setShowTimePlannerId] = useState(null);

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
            totalTicketsSold: "",
            pass: "",
            netTickets: "",
            counterTotalTickets: "",
            counterPass: "",
            counterNetTickets: "",
            onlineTotalTickets: "",
            onlineAmount: "",
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

  // Fetch booking data when showTimePlannerId changes
  useEffect(() => {
    const fetchBookingData = async () => {
      if (showTimePlannerId) {
        try {
          // Fetch booked seats
          const seatsResponse = await api.get(
            `/movie-seat-bookings/show-time-planner/${showTimePlannerId}`
          );
          const bookings = seatsResponse;

          // Fetch report data
          const reportResponse = await api.get(
            `/reports/bookings/${showTimePlannerId}`
          );
          const { online, offline } = reportResponse;

          // Update report data
          setReportData((prev) => {
            const perTicketPrice =
              showTimeOptions.find((opt) => opt.id === showTimePlannerId)
                ?.price || 0;
            const counterPass = 0; // Assuming passes are not provided in API, default to 0
            const counterTotalTickets = offline.totalSeats;
            const onlineTotalTickets = online.totalSeats;
            const totalTicketsSold = counterTotalTickets + onlineTotalTickets;
            const netTickets = totalTicketsSold - counterPass;
            const onlineAmount = online.totalAmount;
            const totalCounterCollection = offline.totalAmount;
            const actualAmount = totalCounterCollection; // Assuming no userReturn or balanceCounterAmount from API
            const passesAmount = perTicketPrice * counterPass;
            const finalAmount = totalCounterCollection + onlineAmount;

            return {
              ...prev,
              perTicketPrice: perTicketPrice.toString(),
              counterPass: counterPass.toString(),
              counterTotalTickets: counterTotalTickets.toString(),
              counterNetTickets: (counterTotalTickets - counterPass).toString(),
              onlineTotalTickets: onlineTotalTickets.toString(),
              onlineAmount: onlineAmount.toString(),
              totalTicketsSold: totalTicketsSold.toString(),
              pass: counterPass.toString(),
              netTickets: netTickets.toString(),
              actualAmount: actualAmount.toString(),
              passesAmount: passesAmount.toString(),
              totalCounterCollection: totalCounterCollection.toString(),
              finalAmount: finalAmount.toString(),
            };
          });
        } catch (error) {
          notify.error("Failed to fetch booking data");
          console.error(error);
        }
      }
    };
    fetchBookingData();
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

  // Prevent wheel events on number inputs
  useEffect(() => {
    const preventWheelOnNumberInputs = (e) => {
      if (e.target.type === "number" && document.activeElement === e.target) {
        e.preventDefault();
      }
    };
    document.addEventListener("wheel", preventWheelOnNumberInputs, {
      passive: false,
    });
    return () =>
      document.removeEventListener("wheel", preventWheelOnNumberInputs);
  }, []);

  const handleInputChange = (field, value) => {
    setReportData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate Show Collection fields
      if (
        field === "counterTotalTickets" ||
        field === "onlineTotalTickets" ||
        field === "counterPass"
      ) {
        const counterSold = parseInt(updated.counterTotalTickets) || 0;
        const onlineSold = parseInt(updated.onlineTotalTickets) || 0;
        const counterPasses = parseInt(updated.counterPass) || 0;
        updated.totalTicketsSold = (counterSold + onlineSold).toString();
        updated.pass = counterPasses.toString();
        updated.netTickets = (
          counterSold +
          onlineSold -
          counterPasses
        ).toString();
      }

      // Auto-calculate Counter Net Tickets
      if (field === "counterTotalTickets" || field === "counterPass") {
        const counterSold = parseInt(updated.counterTotalTickets) || 0;
        const counterPasses = parseInt(updated.counterPass) || 0;
        updated.counterNetTickets = (counterSold - counterPasses).toString();
      }

      // Auto-calculate Passes Amount
      if (field === "perTicketPrice" || field === "counterPass") {
        const perTicketPrice = parseInt(updated.perTicketPrice) || 0;
        const numberOfPasses = parseInt(updated.counterPass) || 0;
        updated.passesAmount = (perTicketPrice * numberOfPasses).toString();
      }

      // Auto-calculate Counter Collection totals
      if (
        field.startsWith("denomination") ||
        field === "userReturn" ||
        field === "balanceCounterAmount" ||
        field === "perTicketPrice" ||
        field === "counterPass"
      ) {
        const d500 = parseInt(updated.denomination500) || 0;
        const d200 = parseInt(updated.denomination200) || 0;
        const d100 = parseInt(updated.denomination100) || 0;
        const d50 = parseInt(updated.denomination50) || 0;
        const d20 = parseInt(updated.denomination20) || 0;
        const d10 = parseInt(updated.denomination10) || 0;

        const denominationTotal =
          d500 * 500 + d200 * 200 + d100 * 100 + d50 * 50 + d20 * 20 + d10 * 10;
        const userReturn = parseInt(updated.userReturn) || 0;
        const balanceCounter = parseInt(updated.balanceCounterAmount) || 0;
        const passesAmount = parseInt(updated.passesAmount) || 0;

        updated.actualAmount = (
          denominationTotal -
          userReturn -
          balanceCounter
        ).toString();
        updated.totalCounterCollection = (
          denominationTotal -
          userReturn -
          balanceCounter
        ).toString();
      }

      // Auto-calculate Final Amount
      const counterTotal = parseInt(updated.totalCounterCollection) || 0;
      const onlineTotal = parseInt(updated.onlineAmount) || 0;
      updated.finalAmount = (counterTotal + onlineTotal).toString();

      return updated;
    });
  };

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
        return `${day}.${month}.${year}-${timeFormatted}`;
      }
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      const hour12 = now.getHours() % 12 || 12;
      return `${day}.${month}.${year}-${hour12}.${minutes}${ampm}`;
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
      finalAmount: "",
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
                                handleInputChange("date", e.target.value)
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
                                        handleInputChange("showTime", "");
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
                            handleInputChange("date", e.target.value)
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
                                    handleInputChange("showTime", "");
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

                {/* Total Tickets Sold and Pass Section */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">
                            Total Tickets Sold
                          </td>
                          <td className="border-r border-gray-300 p-3 w-1/4">
                            <input
                              type="number"
                              value={reportData.totalTicketsSold}
                              readOnly
                              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                              placeholder="Auto-calculated"
                            />
                          </td>
                          <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/4">
                            Pass
                          </td>
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

                  {/* Mobile View */}
                  <div className="md:hidden">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          Total Tickets Sold
                        </label>
                        <input
                          type="number"
                          value={reportData.totalTicketsSold}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          Pass
                        </label>
                        <input
                          type="number"
                          value={reportData.pass}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Tickets Section */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">
                            Net Tickets (Sold - Passes)
                          </td>
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

                  {/* Mobile View */}
                  <div className="md:hidden">
                    <div className="p-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          Net Tickets (Sold - Passes)
                        </label>
                        <input
                          type="number"
                          value={reportData.netTickets}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                          placeholder="Auto-calculated"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Counter Collection Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
                    <Calculator size={24} />
                    Counter Collection
                  </h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">
                              Tickets Sold
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={reportData.counterTotalTickets}
                                onChange={(e) =>
                                  handleInputChange(
                                    "counterTotalTickets",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Enter tickets sold at counter"
                              />
                            </td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">
                              Pass
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={reportData.counterPass}
                                onChange={(e) =>
                                  handleInputChange(
                                    "counterPass",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Enter number of passes"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">
                              Net Tickets (Sold - Passes)
                            </td>
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

                    {/* Mobile View */}
                    <div className="md:hidden">
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            Tickets Sold
                          </label>
                          <input
                            type="number"
                            value={reportData.counterTotalTickets}
                            onChange={(e) =>
                              handleInputChange(
                                "counterTotalTickets",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter tickets sold at counter"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            Pass
                          </label>
                          <input
                            type="number"
                            value={reportData.counterPass}
                            onChange={(e) =>
                              handleInputChange("counterPass", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter number of passes"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            Net Tickets (Sold - Passes)
                          </label>
                          <input
                            type="number"
                            value={reportData.counterNetTickets}
                            readOnly
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700 font-semibold"
                            placeholder="Auto-calculated"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View - Side by side layout */}
                  <div className="hidden md:block">
                    <div className="counter-collection-container">
                      <div className="denomination-table-container">
                        <div className="border border-gray-300 rounded-lg overflow-hidden mt-4">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-orange-50 border-b border-gray-300">
                                <th className="border-r border-gray-300 p-3 text-left font-bold text-orange-700 w-1/3">
                                  Denomination
                                </th>
                                <th className="border-r border-gray-300 p-3 text-left font-bold text-orange-700 w-1/3">
                                  Count
                                </th>
                                <th className="p-3 text-left font-bold text-orange-700 w-1/3">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {[500, 200, 100, 50, 20, 10].map((denom) => (
                                <tr
                                  key={denom}
                                  className="border-b border-gray-300"
                                >
                                  <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/3">
                                    {denom}
                                  </td>
                                  <td className="border-r border-gray-300 p-3 w-1/3">
                                    <input
                                      type="number"
                                      value={reportData[`denomination${denom}`]}
                                      onChange={(e) =>
                                        handleInputChange(
                                          `denomination${denom}`,
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="p-3 font-medium text-orange-600 w-1/3">
                                    ₹
                                    {(
                                      (parseInt(
                                        reportData[`denomination${denom}`]
                                      ) || 0) * denom
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-orange-50">
                                <td className="border-r border-gray-300 p-3 font-bold w-1/3">
                                  Total
                                </td>
                                <td className="border-r border-gray-300 p-3 font-bold w-1/3">
                                  {[500, 200, 100, 50, 20, 10].reduce(
                                    (sum, denom) =>
                                      sum +
                                      (parseInt(
                                        reportData[`denomination${denom}`]
                                      ) || 0),
                                    0
                                  )}
                                </td>
                                <td className="p-3 font-bold text-black w-1/3">
                                  ₹
                                  {[500, 200, 100, 50, 20, 10]
                                    .reduce(
                                      (sum, denom) =>
                                        sum +
                                        (parseInt(
                                          reportData[`denomination${denom}`]
                                        ) || 0) *
                                          denom,
                                      0
                                    )
                                    .toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="counter-summary-table-container">
                        <div className="border border-gray-300 rounded-lg overflow-hidden mt-4">
                          <table className="w-full">
                            <tbody>
                              <tr className="border-b border-gray-300">
                                <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">
                                  User Return (-)
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span>₹</span>
                                    <input
                                      type="number"
                                      value={reportData.userReturn}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "userReturn",
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                      placeholder="0"
                                    />
                                  </div>
                                </td>
                              </tr>
                              <tr className="border-b border-gray-300">
                                <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium">
                                  Balance Counter Amount (-)
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span>₹</span>
                                    <input
                                      type="number"
                                      value={reportData.balanceCounterAmount}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "balanceCounterAmount",
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                      placeholder="0"
                                    />
                                  </div>
                                </td>
                              </tr>
                              <tr className="bg-emerald-50">
                                <td className="border-r border-gray-300 p-3 font-bold text-emerald-700">
                                  Total Counter Collection
                                </td>
                                <td className="p-3 font-bold text-emerald-600">
                                  ₹
                                  {(
                                    parseInt(
                                      reportData.totalCounterCollection
                                    ) || 0
                                  ).toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile View - Stacked layout */}
                  <div className="md:hidden mt-4 space-y-4">
                    {/* Denomination Section */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-orange-50 p-3 border-b border-gray-300">
                        <h4 className="font-bold text-orange-700">
                          Cash Denominations
                        </h4>
                      </div>
                      <div className="p-4 space-y-3">
                        {[500, 200, 100, 50, 20, 10].map((denom) => (
                          <div
                            key={denom}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex-1">
                              <label className="block font-medium text-gray-700 text-sm">
                                ₹{denom}
                              </label>
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={reportData[`denomination${denom}`]}
                                onChange={(e) =>
                                  handleInputChange(
                                    `denomination${denom}`,
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
                                placeholder="0"
                              />
                            </div>
                            <div className="flex-1 text-right">
                              <span className="font-medium text-orange-600">
                                ₹
                                {(
                                  (parseInt(
                                    reportData[`denomination${denom}`]
                                  ) || 0) * denom
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-gray-300 pt-3 mt-3 bg-orange-50 -mx-4 px-4 py-3">
                          <div className="flex justify-between items-center font-bold">
                            <span>
                              Total Count:{" "}
                              {[500, 200, 100, 50, 20, 10].reduce(
                                (sum, denom) =>
                                  sum +
                                  (parseInt(
                                    reportData[`denomination${denom}`]
                                  ) || 0),
                                0
                              )}
                            </span>
                            <span className="text-black">
                              ₹
                              {[500, 200, 100, 50, 20, 10]
                                .reduce(
                                  (sum, denom) =>
                                    sum +
                                    (parseInt(
                                      reportData[`denomination${denom}`]
                                    ) || 0) *
                                      denom,
                                  0
                                )
                                .toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Counter Summary Section */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            User Return (-)
                          </label>
                          <div className="flex items-center gap-2">
                            <span>₹</span>
                            <input
                              type="number"
                              value={reportData.userReturn}
                              onChange={(e) =>
                                handleInputChange("userReturn", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-gray-700 mb-2">
                            Balance Counter Amount (-)
                          </label>
                          <div className="flex items-center gap-2">
                            <span>₹</span>
                            <input
                              type="number"
                              value={reportData.balanceCounterAmount}
                              onChange={(e) =>
                                handleInputChange(
                                  "balanceCounterAmount",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="bg-emerald-50 p-3 -mx-4 -mb-4 mt-4 rounded-b-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-700">
                              Total Counter Collection
                            </span>
                            <span className="font-bold text-emerald-600">
                              ₹
                              {(
                                parseInt(reportData.totalCounterCollection) || 0
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
                    <CreditCard size={24} />
                    Online Collection
                  </h3>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="border-r border-gray-300 p-3 bg-gray-50 font-medium w-1/2">
                              Tickets Sold
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={reportData.onlineTotalTickets}
                                onChange={(e) =>
                                  handleInputChange(
                                    "onlineTotalTickets",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Enter online tickets count"
                              />
                            </td>
                          </tr>
                          <tr className="bg-emerald-50">
                            <td className="border-r border-gray-300 p-3 font-bold text-emerald-700">
                              Total Online Collection
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span>₹</span>
                                <input
                                  type="number"
                                  value={reportData.onlineAmount}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "onlineAmount",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-emerald-600 font-bold"
                                  placeholder="Enter online collection amount"
                                />
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
                            Tickets Sold
                          </label>
                          <input
                            type="number"
                            value={reportData.onlineTotalTickets}
                            onChange={(e) =>
                              handleInputChange(
                                "onlineTotalTickets",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter online tickets count"
                          />
                        </div>
                        <div className="bg-emerald-50 p-3 -mx-4 -mb-4 mt-4 rounded-b-lg">
                          <div>
                            <label className="block font-bold text-emerald-700 mb-2">
                              Total Online Collection
                            </label>
                            <div className="flex items-center gap-2">
                              <span>₹</span>
                              <input
                                type="number"
                                value={reportData.onlineAmount}
                                onChange={(e) =>
                                  handleInputChange(
                                    "onlineAmount",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-emerald-600 font-bold"
                                placeholder="Enter online collection amount"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="border border-emerald-500 rounded-lg overflow-hidden bg-emerald-50">
                    <div className="p-4">
                      {/* Desktop View */}
                      <div className="hidden md:flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-emerald-700">
                          Final Amount:
                        </h3>
                        <div className="text-3xl font-bold text-emerald-600">
                          ₹
                          {(
                            parseInt(reportData.finalAmount) || 0
                          ).toLocaleString()}
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className="md:hidden text-center mb-2">
                        <h3 className="text-xl font-bold text-emerald-700 mb-2">
                          Final Amount
                        </h3>
                        <div className="text-2xl font-bold text-emerald-600">
                          ₹
                          {(
                            parseInt(reportData.finalAmount) || 0
                          ).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 font-semibold text-center md:text-left">
                        Counter (₹
                        {(
                          parseInt(reportData.totalCounterCollection) || 0
                        ).toLocaleString()}
                        ) + Online (₹
                        {(
                          parseInt(reportData.onlineAmount) || 0
                        ).toLocaleString()}
                        )
                      </div>
                    </div>
                  </div>
                </div>

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
                    className="w-full sm:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center gap-2"
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

            /* Additional mobile-specific button hiding */
            @media print and (max-width: 768px) {
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
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
              }
            }

            /* Webkit browser specific button hiding */
            @media print and (-webkit-min-device-pixel-ratio: 1) {
              .no-print,
              .no-print *,
              .print-area .no-print,
              .print-area .no-print *,
              .flex.flex-col.sm\\:flex-row.gap-4.justify-end.mt-8,
              .flex.flex-col.sm\\:flex-row.gap-4.justify-end.mt-8 * {
                -webkit-appearance: none !important;
                appearance: none !important;
                display: none !important;
                visibility: hidden !important;
              }
            }

            @page {
              size: A4;
              margin: 5mm;
            }

            /* Mobile-specific print overrides */
            @media print and (max-width: 768px) {
              .print-area {
                transform: none !important;
                scale: 1 !important;
                zoom: 1 !important;
                min-width: 100% !important;
                max-width: none !important;
                width: 100% !important;
              }

              /* Force all elements to respect desktop sizing */
              .print-area * {
                min-width: auto !important;
                max-width: none !important;
                flex-wrap: nowrap !important;
              }

              /* Override mobile browser print optimizations */
              .print-area table,
              .print-area .overflow-x-auto,
              .print-area .border {
                -webkit-transform: none !important;
                transform: none !important;
                scale: 1 !important;
                zoom: 1 !important;
              }

              /* Force table cells to maintain desktop layout */
              .print-area td,
              .print-area th {
                white-space: nowrap !important;
                overflow: visible !important;
                text-overflow: clip !important;
                word-break: normal !important;
                word-wrap: normal !important;
              }

              /* Prevent mobile print from stacking elements */
              .print-area .flex {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
              }

              /* Force horizontal layout for headers */
              .print-area .items-center {
                align-items: center !important;
              }
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
            h3.text-xl.font-bold.text-teal-600 {
              margin-top: 10px !important;
              margin-bottom: 3px !important;
            }
            table thead tr.bg-orange-50 th {
              font-size: 11px !important;
            }
            table tbody tr.bg-orange-50 td {
              font-size: 11px !important;
            }
            table thead tr.bg-orange-50 ~ tbody tr td {
              font-size: 11px !important;
            }
            thead tr.bg-orange-50 + tbody tr td,
            thead tr.bg-orange-50 th {
              font-size: 11px !important;
            }
            table thead tr.bg-orange-50 ~ tbody td,
            table thead tr.bg-orange-50 ~ tbody th {
              font-size: 11px !important;
            }
            .border.border-emerald-500.rounded-lg.overflow-hidden.bg-emerald-50 h3.text-2xl {
              font-size: 24px !important;
            }
            .border.border-emerald-500.rounded-lg.overflow-hidden.bg-emerald-50 .text-3xl {
              font-size: 24px !important;
            }
            .border.border-emerald-500.rounded-lg.overflow-hidden.bg-emerald-50 .text-sm {
              font-size: 12px !important;
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

            /* MOBILE-FRIENDLY COUNTER COLLECTION LAYOUT */
            .print-area .counter-collection-container {
              display: flex !important;
              flex-direction: row !important;
              gap: 8px !important;
              align-items: flex-start !important;
            }
            .print-area .denomination-table-container {
              flex: 0 0 40% !important;
              width: 40% !important;
              display: block !important;
            }
            .print-area .counter-summary-table-container {
              flex: 0 0 58% !important;
              width: 58% !important;
              display: block !important;
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
            .counter-collection-container table th,
            .counter-collection-container table td {
              box-sizing: border-box !important;
            }
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

            /* Force left alignment for Counter + Online text in Final Amount section */
            .print-area .text-center.md\\:text-left,
            .print-area .text-center {
              text-align: left !important;
            }

            /* Webkit mobile browser overrides */
            @media print and (-webkit-min-device-pixel-ratio: 1) {
              .print-area {
                -webkit-text-size-adjust: 100% !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              /* Prevent iOS Safari from applying responsive print layout */
              .print-area table,
              .print-area .overflow-x-auto {
                -webkit-overflow-scrolling: auto !important;
                overflow-scrolling: auto !important;
              }

              /* Force layout stability on mobile webkit */
              .print-area * {
                -webkit-box-sizing: border-box !important;
                box-sizing: border-box !important;
              }
            }

            /* Override any mobile-specific print styles */
            @media print and (max-width: 768px) {
              .print-area .hidden.md\\:block,
              .print-area .hidden,
              .print-area .md\\:block {
                display: block !important;
                visibility: visible !important;
              }

              .print-area .md\\:hidden,
              .print-area .sm\\:hidden,
              .print-area .lg\\:hidden {
                display: none !important;
                visibility: hidden !important;
              }
            }

            /* Force desktop table layout on all devices */
            @media print {
              .print-area .responsive-table,
              .print-area .overflow-x-auto,
              .print-area table {
                display: table !important;
                width: 100% !important;
                table-layout: fixed !important;
              }

              .print-area tr {
                display: table-row !important;
              }

              .print-area td,
              .print-area th {
                display: table-cell !important;
              }

              /* Override viewport scaling for print */
              html {
                -webkit-text-size-adjust: none !important;
                -moz-text-size-adjust: none !important;
                -ms-text-size-adjust: none !important;
                text-size-adjust: none !important;
              }

              /* Force print area to ignore any responsive constraints */
              .print-area {
                min-width: 210mm !important;
                width: 210mm !important;
                max-width: 210mm !important;
                overflow: visible !important;
              }

              /* Ensure all tables maintain their desktop structure */
              .print-area table {
                border-collapse: collapse !important;
                table-layout: fixed !important;
                width: 100% !important;
              }

              /* Prevent any responsive table behavior */
              .print-area .overflow-x-auto {
                overflow: visible !important;
                overflow-x: visible !important;
                -webkit-overflow-scrolling: auto !important;
              }

              /* Force exact column widths */
              .print-area .w-1\\/2 {
                width: 50% !important;
              }

              .print-area .w-1\\/4 {
                width: 25% !important;
              }
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReportPage;
