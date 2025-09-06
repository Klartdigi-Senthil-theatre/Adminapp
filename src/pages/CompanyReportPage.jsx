import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { FileText } from "lucide-react";
import api from "../config/api";
import moment from "moment/moment";

const CompanyReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    date: "",
    shows: [],
  });

  // Fetch data when date changes
  useEffect(() => {
    if (!reportData.date) return;

    const fetchReports = async () => {
      try {
        setLoading(true);

        const startDate = reportData.date;
        const endDate = reportData.date;

        // 1. Get Company Summary
        const dailyData = await api.get(
          `/reports/bookings/date?startDate=${startDate}&endDate=${endDate}`
        );

        // 2. Get Show-wise Data
        const showData = await api.get(
          `/reports/bookings/showtime/date?startDate=${startDate}&endDate=${endDate}`
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

        // Map showData to create shows array dynamically
        const showsMapped = showData
          .filter((apiShow) => apiShow.showTime)
          .map((apiShow) => ({
            counter: {
              totalTickets: apiShow.offlineReport?.totalSeats || 0,
              amount: apiShow.offlineReport?.totalAmount || 0,
            },
            online: {
              totalTickets: apiShow.onlineReport?.totalSeats || 0,
              amount: apiShow.onlineReport?.totalAmount || 0,
            },
            showTime: normalizeTime(apiShow.showTime),
          }))
          .sort((a, b) => {
            const timeA = moment(a.showTime, "hh:mm A", true);
            const timeB = moment(b.showTime, "hh:mm A", true);

            if (timeA.isValid() && timeB.isValid()) {
              return timeA.diff(timeB); // Chronological sort
            }

            console.warn(
              `sort: Fallback to string comparison for times: ${a.showTime} vs ${b.showTime}`
            );
            return (a.showTime || "").localeCompare(b.showTime || "");
          });

        setReportData((prev) => ({
          ...prev,
          shows: showsMapped,
        }));
      } catch (error) {
        console.error("Error fetching reports:", error);
        alert("Failed to fetch report data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [reportData.date]);

  // Handle date change
  const handleInputChange = (field, value) => {
    setReportData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShowChange = (showIndex, type, field, value) => {
    setReportData((prev) => ({
      ...prev,
      shows: prev.shows.map((show, index) =>
        index === showIndex
          ? { ...show, [type]: { ...show[type], [field]: value } }
          : show
      ),
    }));
  };

  const calculateTotal = (showIndex, field) => {
    const show = reportData.shows[showIndex];
    const counter = parseInt(show.counter[field]) || 0;
    let online;
    if (field === "amount") {
      online = calculateOnlineAmount(showIndex);
    } else {
      online = parseInt(show.online[field]) || 0;
    }
    return counter + online;
  };

  const calculateSummary = (type, field) => {
    return reportData.shows.reduce((total, show, index) => {
      if (type === "online" && field === "amount") {
        return total + calculateOnlineAmount(index);
      }
      return total + (parseInt(show[type][field]) || 0);
    }, 0);
  };

  const calculateOnlineAmount = (showIndex) => {
    const show = reportData.shows[showIndex];
    const baseAmount = parseInt(show.online.amount) || 0;
    const totalTickets = parseInt(show.online.totalTickets) || 0;
    const deductionPerTicket = 20; // Fixed deduction per ticket
    const totalDeduction = totalTickets * deductionPerTicket;
    return baseAmount - totalDeduction;
  };

  return (
    <div className="p-2 sm:p-3 lg:p-4 min-h-screen bg-gray-50">
      <div className="no-print">
        <PageHeader title="" />
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading reports...</p>
      )}

      {!loading && reportData.shows.length === 0 && reportData.date && (
        <p className="text-center text-gray-500">
          No show data available for the selected date.
        </p>
      )}

      <div className="flex justify-center items-start mt-4">
        <div className="w-full max-w-5xl">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 print-area">
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

            {/* Report Header */}
            <div className="text-left mb-4 sm:mb-6">
              <h2
                className="font-bold tracking-wide flex items-center gap-2 text-lg sm:text-xl lg:text-2xl"
                style={{
                  color: "var(--color-teal-700)",
                }}
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                Company Collection Report
              </h2>
            </div>

            {/* Date */}
            <div className="border border-gray-300 rounded-lg overflow-visible mb-4 sm:mb-6">
              {/* Desktop View */}
              <div className="hidden md:block">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td
                        className="border-r border-gray-300 p-3 bg-green-50 font-bold w-1/2"
                        style={{
                          fontSize: "16px",
                          color: "var(--color-teal-700)",
                          textTransform: "uppercase",
                        }}
                      >
                        Date
                      </td>
                      <td className="p-3 w-1/2">
                        <input
                          type="date"
                          value={reportData.date}
                          onChange={(e) =>
                            handleInputChange("date", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    <label
                      className="block font-bold mb-2"
                      style={{
                        fontSize: "16px",
                        color: "var(--color-teal-700)",
                        textTransform: "uppercase",
                      }}
                    >
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
                </div>
              </div>
            </div>

            {/* Shows Table */}
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              {reportData.shows.map((show, index) => (
                <div
                  key={index}
                  className={`border border-gray-300 rounded-lg overflow-hidden show-${
                    index + 1
                  }`}
                >
                  {/* Show Header */}
                  <div className="bg-orange-50 p-3 border-b border-gray-300 flex items-center">
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--color-orange-700)" }}
                    >
                      SHOW {index + 1} ( {show.showTime} )
                    </h2>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-3 text-left font-bold text-gray-700 w-1/4"></th>
                          <th className="border border-gray-300 p-3 text-center font-bold text-gray-700 w-1/4">
                            COUNTER
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-bold text-gray-700 w-1/4">
                            ONLINE
                          </th>
                          <th className="border border-gray-300 p-3 text-center font-bold text-gray-700 w-1/4">
                            TOTAL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-3 font-bold text-gray-700 bg-gray-50">
                            TICKETS
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            <input
                              type="number"
                              value={show.counter.totalTickets}
                              onChange={(e) =>
                                handleShowChange(
                                  index,
                                  "counter",
                                  "totalTickets",
                                  e.target.value
                                )
                              }
                              className="w-full text-center border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                              placeholder="0"
                            />
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            <input
                              type="number"
                              value={show.online.totalTickets}
                              onChange={(e) =>
                                handleShowChange(
                                  index,
                                  "online",
                                  "totalTickets",
                                  e.target.value
                                )
                              }
                              className="w-full text-center border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                              placeholder="0"
                            />
                          </td>
                          <td className="border border-gray-300 p-3 text-center font-bold text-gray-800 bg-orange-50">
                            {calculateTotal(index, "totalTickets")}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-3 font-bold text-gray-700 bg-gray-50">
                            AMOUNT
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            <div className="flex items-center justify-center">
                              <span className="mr-1">₹</span>
                              <input
                                type="number"
                                value={show.counter.amount}
                                onChange={(e) =>
                                  handleShowChange(
                                    index,
                                    "counter",
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="w-full text-center border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            <div className="flex items-center justify-center">
                              <span className="mr-1">₹</span>
                              <input
                                type="number"
                                value={calculateOnlineAmount(index)}
                                onChange={(e) =>
                                  handleShowChange(
                                    index,
                                    "online",
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="w-full text-center border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                                placeholder="0"
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3 text-center font-bold text-gray-800 bg-orange-50">
                            ₹ {calculateTotal(index, "amount").toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    <div className="space-y-4 p-4">
                      {/* Tickets Row */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b border-gray-300">
                          <h4 className="font-bold text-gray-700">TICKETS</h4>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-600">
                              Counter:
                            </label>
                            <input
                              type="number"
                              value={show.counter.totalTickets}
                              onChange={(e) =>
                                handleShowChange(
                                  index,
                                  "counter",
                                  "totalTickets",
                                  e.target.value
                                )
                              }
                              className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-600">
                              Online:
                            </label>
                            <input
                              type="number"
                              value={show.online.totalTickets}
                              onChange={(e) =>
                                handleShowChange(
                                  index,
                                  "online",
                                  "totalTickets",
                                  e.target.value
                                )
                              }
                              className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center justify-between bg-orange-50 p-2 rounded">
                            <label className="font-bold text-gray-700">
                              Total:
                            </label>
                            <span className="font-bold text-gray-800">
                              {calculateTotal(index, "totalTickets")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount Row */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b border-gray-300">
                          <h4 className="font-bold text-gray-700">AMOUNT</h4>
                        </div>
                        <div className="p-3 space-y-3">
                          <div classNameName="flex items-center justify-between">
                            <label className="font-medium text-gray-600">
                              Counter:
                            </label>
                            <div className="flex items-center gap-1">
                              <span>₹</span>
                              <input
                                type="number"
                                value={show.counter.amount}
                                onChange={(e) =>
                                  handleShowChange(
                                    index,
                                    "counter",
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-600">
                              Online:
                            </label>
                            <div className="flex items-center gap-1">
                              <span>₹</span>
                              <input
                                type="number"
                                value={calculateOnlineAmount(index)}
                                onChange={(e) =>
                                  handleShowChange(
                                    index,
                                    "online",
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-orange-50 p-2 rounded">
                            <label className="font-bold text-gray-700">
                              Total:
                            </label>
                            <span className="font-bold text-gray-800">
                              ₹{" "}
                              {calculateTotal(index, "amount").toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Company Summary */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-green-50 p-3 border-b border-gray-300">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--color-teal-700)" }}
                >
                  SUMMARY
                </h2>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-bold text-gray-700 w-1/4"></th>
                      <th className="border border-gray-300 p-3 text-center font-bold text-gray-700 w-1/4">
                        COUNTER
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-bold text-gray-700 w-1/4">
                        ONLINE
                      </th>
                      <th className="border border-gray-300 p-3 text-center font-bold text-gray-700 w-1/4">
                        TOTAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-bold text-gray-700 bg-gray-50">
                        TOTAL TICKETS
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">
                        {calculateSummary("counter", "totalTickets")}
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">
                        {calculateSummary("online", "totalTickets")}
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold text-gray-800 bg-green-50">
                        {calculateSummary("counter", "totalTickets") +
                          calculateSummary("online", "totalTickets")}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-bold text-gray-700 bg-gray-50">
                        TOTAL AMOUNT
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">
                        ₹{" "}
                        {calculateSummary("counter", "amount").toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold text-gray-800">
                        ₹{" "}
                        {calculateSummary("online", "amount").toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold text-gray-800 bg-green-50">
                        ₹{" "}
                        {(
                          calculateSummary("counter", "amount") +
                          calculateSummary("online", "amount")
                        ).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="space-y-4 p-4">
                  {/* Total Tickets */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-300">
                      <h4 className="font-bold text-gray-700">TOTAL TICKETS</h4>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-600">
                          Counter:
                        </label>
                        <span className="font-bold text-gray-800">
                          {calculateSummary("counter", "totalTickets")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-600">
                          Online:
                        </label>
                        <span className="font-bold text-gray-800">
                          {calculateSummary("online", "totalTickets")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <label className="font-bold text-gray-700">
                          Total:
                        </label>
                        <span className="font-bold text-gray-800">
                          {calculateSummary("counter", "totalTickets") +
                            calculateSummary("online", "totalTickets")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-300">
                      <h4 className="font-bold text-gray-700">TOTAL AMOUNT</h4>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-600">
                          Counter:
                        </label>
                        <span className="font-bold text-gray-800">
                          ₹{" "}
                          {calculateSummary(
                            "counter",
                            "amount"
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-600">
                          Online:
                        </label>
                        <span className="font-bold text-gray-800">
                          ₹{" "}
                          {calculateSummary(
                            "online",
                            "amount"
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <label className="font-bold text-gray-700">
                          Total:
                        </label>
                        <span className="font-bold text-gray-800">
                          ₹{" "}
                          {(
                            calculateSummary("counter", "amount") +
                            calculateSummary("online", "amount")
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-6 sm:mt-8 no-print">
              <button
                type="button"
                onClick={() =>
                  setReportData({
                    date: "",
                    shows: [],
                  })
                }
                className="w-full sm:w-auto px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition duration-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  const formatDateForFilename = (dateString) => {
                    if (!dateString) return "Company Report";
                    const date = new Date(dateString);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();
                    return `Company Report (${day}-${month}-${year})`;
                  };
                  document.title = formatDateForFilename(reportData.date);
                  window.print();
                }}
                className="w-full sm:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Print Report
              </button>
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
            .flex.gap-4.justify-end.mt-8,
            .flex.gap-4.justify-end.mt-8 * {
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
              .flex.gap-4.justify-end.mt-8,
              .flex.gap-4.justify-end.mt-8 * {
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
              .flex.gap-4.justify-end.mt-8,
              .flex.gap-4.justify-end.mt-8 * {
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

              .print-area * {
                min-width: auto !important;
                max-width: none !important;
                flex-wrap: nowrap !important;
              }

              .print-area table,
              .print-area .overflow-x-auto,
              .print-area .border {
                -webkit-transform: none !important;
                transform: none !important;
                scale: 1 !important;
                zoom: 1 !important;
              }

              .print-area td,
              .print-area th {
                white-space: nowrap !important;
                overflow: visible !important;
                text-overflow: clip !important;
                word-break: normal !important;
                word-wrap: normal !important;
              }

              .print-area .flex {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
              }

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

            .print-area h2 {
              font-size: 22px !important;
              margin-bottom: 15px !important;
              margin-top: 10px !important;
              color: #0f766e !important;
              font-weight: bold !important;
              text-decoration: underline !important;
            }

            table {
              font-size: 14px;
              border-collapse: collapse;
              page-break-inside: avoid;
            }

            th, td {
              padding: 3px 4px !important;
              font-size: 14px !important;
            }

            .border {
              border-width: 0.75px !important;
            }

            .p-3 {
              padding: 3px !important;
            }

            .mb-6 {
              margin-bottom: 3px !important;
            }

            .mb-4 {
              margin-bottom: 3px !important;
            }

            .rounded-lg {
              border-radius: 3px !important;
            }

            .shadow-lg {
              box-shadow: none !important;
            }

            div[class*="border border-gray-300 rounded-lg"] {
              page-break-inside: avoid;
              margin-bottom: 2px !important;
            }

            h2, h3 {
              margin: 3px 0 !important;
              page-break-after: avoid;
              font-size: 16px !important;
            }

            .print-area .bg-orange-50.flex {
              display: flex !important;
              align-items: center !important;
            }

            .space-y-6 > * + * {
              margin-top: 3px !important;
            }

            .print-area .space-y-6 > * + * {
              margin-top: 8px !important;
            }

            .print-area .space-y-6 {
              margin-top: 8px !important;
              margin-bottom: 10px !important;
            }

            .mt-8 {
              margin-top: 6px !important;
            }

            .mt-4 {
              margin-top: 3px !important;
            }

            .mb-8 {
              margin-bottom: 6px !important;
            }

            .print-area .space-y-6 > div {
              margin-top: 10px !important;
              margin-bottom: 10px !important;
              page-break-inside: avoid;
            }

            .print-area .space-y-6 .border.border-gray-300.rounded-lg.overflow-hidden {
              margin-top: 10px !important;
              margin-bottom: 10px !important;
              page-break-inside: avoid;
            }

            .print-area .space-y-6 table td,
            .print-area .space-y-6 table th {
              padding: 8px 3px !important;
              height: 40px !important;
              vertical-align: middle !important;
            }

            .print-area .space-y-6 input {
              min-height: 24px !important;
              padding: 4px 2px !important;
              vertical-align: middle !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-hidden:last-child {
              margin-top: 12px !important;
            }

            .print-area .bg-green-50 + .overflow-x-auto table td,
            .print-area .bg-green-50 + .overflow-x-auto table th {
              padding: 8px 3px !important;
              height: 40px !important;
              vertical-align: middle !important;
            }

            .bg-green-50 {
              background-color: #ecfdf5 !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible .bg-green-50 {
              background-color: #ecfdf5 !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              font-weight: bold !important;
              font-size: 16px !important;
              color: #0f766e !important;
              text-transform: uppercase !important;
            }

            .bg-orange-50 {
              background-color: #fff7ed !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            .bg-gray-50 {
              background-color: #f9fafb !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            .bg-orange-50 td {
              padding: 8px 3px !important;
              height: 40px !important;
              vertical-align: middle !important;
            }

            .bg-green-50 td {
              padding: 8px 3px !important;
              height: 40px !important;
              vertical-align: middle !important;
            }

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

            @media print and (-webkit-min-device-pixel-ratio: 1) {
              .print-area {
                -webkit-text-size-adjust: 100% !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .print-area table,
              .print-area .overflow-x-auto {
                -webkit-overflow-scrolling: auto !important;
                overflow-scrolling: auto !important;
              }

              .print-area * {
                -webkit-box-sizing: border-box !important;
                box-sizing: border-box !important;
              }
            }

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

              html {
                -webkit-text-size-adjust: none !important;
                -moz-text-size-adjust: none !important;
                -ms-text-size-adjust: none !important;
                text-size-adjust: none !important;
              }

              .print-area {
                min-width: 210mm !important;
                width: 210mm !important;
                max-width: 210mm !important;
                overflow: visible !important;
              }

              .print-area table {
                border-collapse: collapse !important;
                table-layout: fixed !important;
                width: 100% !important;
              }

              .print-area .overflow-x-auto {
                overflow: visible !important;
                overflow-x: visible !important;
                -webkit-overflow-scrolling: auto !important;
              }

              .print-area .w-1\\/2 {
                width: 50% !important;
                min-width: 50% !important;
                max-width: 50% !important;
              }

              .print-area .w-1\\/4 {
                width: 25% !important;
                min-width: 25% !important;
                max-width: 25% !important;
              }
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible {
              display: block !important;
              width: 100% !important;
              margin-bottom: 2px !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible table {
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible table tr {
              display: table-row !important;
              width: 100% !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible table td {
              display: table-cell !important;
              width: 50% !important;
              min-width: 50% !important;
              max-width: 50% !important;
              vertical-align: middle !important;
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              box-sizing: border-box !important;
              padding: 8px 3px !important;
              height: 40px !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible table td:nth-child(1) {
              width: 50% !important;
              padding: 8px 3px !important;
              height: 40px !important;
              font-weight: bold !important;
              font-size: 16px !important;
              color: #0f766e !important;
              text-transform: uppercase !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible table td:nth-child(2) {
              width: 50% !important;
              padding: 8px 3px !important;
              height: 40px !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible input {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              border: none !important;
              padding: 4px 4px !important;
              border-radius: 0 !important;
              margin: 0 !important;
              overflow: hidden !important;
              min-height: 24px !important;
              vertical-align: middle !important;
            }

            .print-area .border.border-gray-300.rounded-lg.overflow-visible table td * {
              max-width: 100% !important;
              overflow: hidden !important;
            }

            .print-area h1[style*="color: var(--color-teal-700)"] {
              color: #0f766e !important;
            }

            .print-area h2[style*="color: var(--color-orange-700)"] {
              color: #c2410c !important;
            }

            .print-area span[style*="color: var(--color-orange-700)"] {
              color: #c2410c !important;
            }

            .print-area h2[style*="color: var(--color-teal-700)"] {
              color: #0f766e !important;
            }

            .print-area td[style*="color: var(--color-teal-700)"] {
              color: #0f766e !important;
            }

            .print-area label[style*="color: var(--color-teal-700)"] {
              color: #0f766e !important;
            }

            /* Dynamic show margins */
            .print-area .show-1,
            .print-area .show-2,
            .print-area .show-3,
            .print-area .show-4,
            .print-area .show-5,
            .print-area .show-6 {
              margin-bottom: 20px !important;
              margin-top: 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CompanyReportPage;
