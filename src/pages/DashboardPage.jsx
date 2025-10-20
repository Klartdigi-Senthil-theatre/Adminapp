import {
  Percent,
  Popcorn,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MdOutlineLocalMovies } from "react-icons/md";
import { BiCameraMovie } from "react-icons/bi";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { ImPieChart } from "react-icons/im";
import api from "../config/api";
import { notify } from "../components/Notification";

const PageHeader = ({ title, className }) => (
  <h1 className={`text-sm sm:text-xl md:text-2xl font-bold text-gray-800 ${className}`}>{title}</h1>
);

const DashboardPage = () => {
  const datePickerRef = useRef(null);

  // State for API data
  const [dashboardSummary, setDashboardSummary] = useState({
    ticketRevenue: 0,
    snacksRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    upcomingShows: 0,
  });

  const [revenueSummary, setRevenueSummary] = useState({
    totalTickets: 0,
    totalSnacks: 0,
    avgTicketsPerDay: 0,
    avgSnacksPerDay: 0,
  });

  const [screenPerformance, setScreenPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLifetime, setIsLifetime] = useState(false);

  // Helper functions for date operations
  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.split("/");
    return new Date(year, month - 1, day);
  };

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if the date is today
    if (date.getTime() === today.getTime()) {
      return "Today";
    }

    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const formatFullDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month.toString().padStart(2, "0")}/${day
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  const formatDateForAPI = (date) => {
    // Get the date components in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Return date in YYYY-MM-DD format with time set to 00:00:00 UTC
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const isDateInRange = (date, startDate, endDate) => {
    const dateTime = date.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    return dateTime >= startTime && dateTime <= endTime;
  };

  // API fetch functions
  const fetchDashboardData = async (scope = 'lifetime', startDate = null, endDate = null) => {
    try {
      setLoading(true);

      const params = { scope };
      if (scope === 'range' && startDate && endDate) {
        params.startDate = formatDateForAPI(startDate);
        // For end date, set time to end of day (23:59:59)
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        params.endDate = `${year}-${month}-${day}T23:59:59.999Z`;

        console.log('API Date Range:', {
          startDate: params.startDate,
          endDate: params.endDate,
          originalStartDate: startDate.toDateString(),
          originalEndDate: endDate.toDateString()
        });
      }

      // Fetch all three endpoints in parallel
      const [summaryResponse, revenueResponse, performanceResponse] = await Promise.all([
        api.get('/dashboard/summary', { params }),
        api.get('/dashboard/revenue-summary', { params }),
        api.get('/dashboard/screen-performance', { params })
      ]);

      setDashboardSummary(summaryResponse);
      setRevenueSummary(revenueResponse);
      setScreenPerformance(performanceResponse);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      notify.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Set reasonable date range for the date picker (current year)
  const today = new Date();
  const minAvailableDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
  const maxAvailableDate = new Date(today.getFullYear() + 1, 11, 31); // December 31st of next year

  // Date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: today,
      endDate: today,
      key: "selection",
    },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  // Process screen performance data for charts
  const processedScreenData = useMemo(() => {
    if (!screenPerformance || screenPerformance.length === 0) return [];

    const processed = [];
    screenPerformance.forEach(dateItem => {
      dateItem.items.forEach(showItem => {
        processed.push({
          name: showItem.show,
          date: dateItem.date,
          fullDate: dateItem.date,
          tickets: showItem.tickets,
          snacks: showItem.snacks,
        });
      });
    });
    return processed;
  }, [screenPerformance]);

  // Get unique dates from processed screen data
  const uniqueFilteredDates = useMemo(() => {
    const dates = [...new Set(processedScreenData.map((item) => item.fullDate))].sort(
      (a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB - dateA; // Sort in descending order (newest to oldest)
      }
    );
    return dates;
  }, [processedScreenData]);

  // Reset currentDateIndex when filtered dates change
  useEffect(() => {
    setCurrentDateIndex(0);
  }, [uniqueFilteredDates]);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const scope = isLifetime ? 'lifetime' : 'range';
    const startDate = isLifetime ? null : dateRange[0].startDate;
    const endDate = isLifetime ? null : dateRange[0].endDate;

    fetchDashboardData(scope, startDate, endDate);
  }, [isLifetime, dateRange]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData('lifetime');
  }, []);

  //DateRange EventListener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Data for the current date in navigation
  const currentDateData = useMemo(() => {
    if (isLifetime) {
      // For lifetime view, aggregate data by show time
      const showMap = {};

      processedScreenData.forEach(item => {
        if (!showMap[item.name]) {
          showMap[item.name] = {
            name: item.name,
            tickets: 0,
            snacks: 0
          };
        }
        showMap[item.name].tickets += item.tickets;
        showMap[item.name].snacks += item.snacks;
      });
      
      return Object.values(showMap);
    }
    
    if (uniqueFilteredDates.length === 0) return [];
    const currentDate = uniqueFilteredDates[currentDateIndex];
    return processedScreenData.filter((item) => item.fullDate === currentDate);
  }, [processedScreenData, uniqueFilteredDates, currentDateIndex, isLifetime]);

  // Use API data directly for metrics
  const rangeTicketRevenue = dashboardSummary.ticketRevenue || 0;
  const rangeSnacksRevenue = dashboardSummary.snacksRevenue || 0;
  const totalBookings = dashboardSummary.totalBookings || 0;
  const occupancyRate = dashboardSummary.occupancyRate || 0;
  const upcomingShows = dashboardSummary.upcomingShows || 0;

  // Use API revenue summary data
  const rangeStats = useMemo(() => {
    const uniqueDates = [...new Set(processedScreenData.map((item) => item.fullDate))];
    return {
      totalTickets: revenueSummary.totalTickets || 0,
      totalSnacks: revenueSummary.totalSnacks || 0,
      avgTicketsPerDay: revenueSummary.avgTicketsPerDay || 0,
      avgSnacksPerDay: revenueSummary.avgSnacksPerDay || 0,
      totalDays: uniqueDates.length,
      selectedDate:
        uniqueDates.length === 1 ? formatDate(new Date(uniqueDates[0])) : null,
    };
  }, [revenueSummary, processedScreenData]);

  // Prepare day-wise data groups for scrollable charts when multiple dates selected
  const groupedDataByDate = useMemo(() => {
    if (isLifetime) return {};
    const groups = {};
    uniqueFilteredDates.forEach((dateStr) => {
      groups[dateStr] = processedScreenData.filter((item) => item.fullDate === dateStr);
    });
    return groups;
  }, [processedScreenData, uniqueFilteredDates, isLifetime]);

  const handleDateRangeChange = (item) => {
    setIsLifetime(false);
    setDateRange([item.selection]);
  };

  const formatDateRangeDisplay = () => {
    if (isLifetime) return "Lifetime";
    
    const start = formatDate(dateRange[0].startDate);
    const end = formatDate(dateRange[0].endDate);

    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const formatCalendarDisplay = () => {
    const start = formatDate(dateRange[0].startDate);
    const end = formatDate(dateRange[0].endDate);

    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const handlePrevDate = () => {
    setCurrentDateIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextDate = () => {
    setCurrentDateIndex((prev) =>
      Math.min(uniqueFilteredDates.length - 1, prev + 1)
    );
  };

  const handleLifetime = () => {
    if (isLifetime) {
      // Switch to Today
      setIsLifetime(false);
      const today = new Date();
      setDateRange([
        {
          startDate: today,
          endDate: today,
          key: "selection",
        },
      ]);
    } else {
      // Switch to Lifetime
      setIsLifetime(true);
      setDateRange([
        {
          startDate: minAvailableDate,
          endDate: maxAvailableDate,
          key: "selection",
        },
      ]);
    }
  };

  return (
    <div className="p-3">
      {loading && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              <span>Loading dashboard...</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center space-x-2">
        <PageHeader title="Theatre Dashboard" className="mb-2" />

        <div className="flex items-center gap-2">
          <button
            onClick={handleLifetime}
            className={`border rounded-md px-3 py-1 text-sm flex items-center gap-2 text-orange-600 hover:border-gray-600 hover:text-black ${isLifetime ? "bg-gray-100" : ""
            }`}          >
            {isLifetime ? "Today" : "Lifetime"}
          </button>

          <div className="relative" ref={datePickerRef}>
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setShowDatePicker(!showDatePicker)
              }}
              className="border rounded-md px-3 py-1 text-sm flex items-center gap-2 hover:border-blue-600"
            >
              <Calendar size={16} />
              <span>{formatCalendarDisplay()}</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1 z-10 shadow-lg bg-white rounded-md">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleDateRangeChange}
                  ranges={dateRange}
                  moveRangeOnFirstSelection={false}
                  showDateDisplay={false}
                  minDate={minAvailableDate}
                  maxDate={maxAvailableDate}
                  rangeColors={["#3b82f6"]}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-2">
        <div className="bg-white p-3 lg:p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Ticket Revenue</h3>
              <p className="text-xl lg:text-xl font-bold text-blue-600">
                ₹{rangeTicketRevenue.toLocaleString()}
              </p>
            </div>
            <MdOutlineLocalMovies className="text-blue-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-3 lg:p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Snacks Revenue</h3>
              <p className="text-xl lg:text-xl font-bold text-orange-600">
                ₹{rangeSnacksRevenue.toLocaleString()}
              </p>
            </div>
            <Popcorn className="text-orange-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-3 lg:p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-xl lg:text-xl font-bold text-green-600">
                {totalBookings.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-3 lg:p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Occupancy Rate</h3>
              <p className="text-xl lg:text-xl font-bold text-purple-600">
                {occupancyRate}%
              </p>
            </div>
            <Percent className="text-purple-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-3 lg:p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Upcoming Shows</h3>
              <p className="text-xl lg:text-xl font-bold text-yellow-600">
                {upcomingShows}
              </p>
            </div>
            <BiCameraMovie className="text-yellow-600" size={25} />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-4">
        <div className="bg-white p-2 lg:p-2 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Revenue Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Ticket Revenue",
                      value: rangeTicketRevenue,
                      color: "#1f54e4ff",
                    },
                    {
                      name: "Snacks Revenue",
                      value: rangeSnacksRevenue,
                      color: "#1ca71cff",
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#2F65F7" />
                  <Cell fill="#FF6C38" />
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const total = rangeTicketRevenue + rangeSnacksRevenue;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return [
                      `₹${value.toLocaleString()} (${percentage}%)`,
                      name,
                    ];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-2 lg:p-2 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {rangeStats.totalDays === 1 ? (
              <span>Revenue Summary ({rangeStats.selectedDate})</span>
            ) : (
              <span>
                Revenue Summary ({rangeStats.totalDays} day
                {rangeStats.totalDays > 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Tickets</span>
              <span className="font-bold text-blue-600">
                {rangeStats.totalTickets}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Snacks</span>
              <span className="font-bold text-orange-600">
                {rangeStats.totalSnacks}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Avg Tickets/Day</span>
              <span className="font-bold">{rangeStats.avgTicketsPerDay}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Avg Snacks/Day</span>
              <span className="font-bold">{rangeStats.avgSnacksPerDay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Performance Section */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isLifetime ? "Lifetime Performance" : "Screen Performance"}
          </h2>

          {!isLifetime && uniqueFilteredDates.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {uniqueFilteredDates.length} day{uniqueFilteredDates.length > 1 ? 's' : ''} selected
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Scroll horizontally to view all days
              </span>
            </div>
          )}
        </div>

        {isLifetime ? (
          <div className="h-80">
            {currentDateData && currentDateData.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm">
                    Lifetime Performance
                  </span>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={currentDateData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="tickets"
                        fill="#2F65F7"
                        name="Tickets"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                      <Bar
                        dataKey="snacks"
                        fill="#FF6C38"
                        name="Snacks"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No data available</div>
                </div>
              </div>
            )}
          </div>
        ) : uniqueFilteredDates.length <= 1 ? (
          <div className="h-80">
            {currentDateData && currentDateData.length > 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg h-full">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm">
                    {uniqueFilteredDates.length > 0 ? formatDate(new Date(uniqueFilteredDates[0])) : 'Today'}
                  </span>
                </div>
                <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                      data={currentDateData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                />
                <Legend />
                <Bar
                  dataKey="tickets"
                  fill="#2F65F7"
                  name="Tickets"
                  radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                />
                <Bar
                  dataKey="snacks"
                  fill="#FF6C38"
                  name="Snacks"
                  radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No data available</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-80 overflow-x-auto">
            <div className="flex space-x-8 min-w-max h-full pb-4">
              {uniqueFilteredDates.map((dateStr) => (
                <div key={dateStr} className="min-w-[500px] h-full flex-shrink-0">
                  <div className="bg-gray-50 p-3 rounded-lg h-full">
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-lg font-bold text-gray-800 bg-white px-4 py-2 rounded-lg shadow-sm">
                        {formatDate(new Date(dateStr))}
                      </span>
                    </div>
                    {(groupedDataByDate[dateStr] && groupedDataByDate[dateStr].length > 0) ? (
                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={groupedDataByDate[dateStr] || []}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              formatter={(value, name) => [value, name]}
                              labelStyle={{ color: '#374151' }}
                              contentStyle={{
                                backgroundColor: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar
                              dataKey="tickets"
                              fill="#2F65F7"
                              name="Tickets"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={60}
                            />
                            <Bar
                              dataKey="snacks"
                              fill="#FF6C38"
                              name="Snacks"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={60}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-500 bg-white rounded-lg">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📊</div>
                          <div>No data available</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center items-center mt-4">
          <div className="text-md font-semibold">
            {isLifetime ? (
              "Lifetime Data"
            ) : uniqueFilteredDates.length > 0 ? (
              `${formatDate(new Date(uniqueFilteredDates[0]))}${uniqueFilteredDates.length > 1 ? ` - ${formatDate(new Date(uniqueFilteredDates[uniqueFilteredDates.length - 1]))}` : ""}`
            ) : (
              formatDateRangeDisplay()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
