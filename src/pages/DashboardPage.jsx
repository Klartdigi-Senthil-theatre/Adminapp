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

const PageHeader = ({ title, className }) => (
  <h1 className={`text-sm sm:text-xl md:text-2xl font-bold text-gray-800 ${className}`}>{title}</h1>
);

const DashboardPage = () => {
  const datePickerRef = useRef(null);

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

  const isDateInRange = (date, startDate, endDate) => {
    const dateTime = date.getTime();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    return dateTime >= startTime && dateTime <= endTime;
  };

  // Generate dynamic data for the dashboard
  const generateScreenData = () => {
    const data = [];
    const screens = ["S1", "S2", "S3", "S4"];
    const today = new Date();
    
    // Generate data for 60 days (30 days in the past and 30 days in the future)
    for (let i = -30; i <= 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const month = currentDate.toLocaleString("default", { month: "short" });
      const day = currentDate.getDate();
      const displayDate = `${month} ${day}`;
      
      const fullDate = formatFullDate(currentDate);
      
      screens.forEach(screenName => {
        // Generate random but realistic data
        const tickets = Math.floor(Math.random() * 80) + 20; // 20-100 tickets
        const snacks = Math.floor(Math.random() * 50) + 10; // 10-60 snacks
        
        data.push({
          name: screenName,
          date: displayDate,
          fullDate: fullDate,
          tickets: tickets,
          snacks: snacks,
        });
      });
    }
    
    return data;
  };

  const staticData = {
    ticketRevenue: 1234,
    snacksRevenue: 5678,
    totalBookings: 1234,
    occupancyRate: 78,
    upcomingShows: 5,
    todaySummary: {
      totalSales: 12450,
      ticketsSold: 89,
      snacksSold: 156,
      activeShows: 3,
    },
    screenData: generateScreenData(),
  };

  const [isLifetime, setIsLifetime] = useState(false);

  // Get unique dates from screenData
  const allDates = [
    ...new Set(
      staticData.screenData
        .filter((item) => item.fullDate)
        .map((item) => item.fullDate)
    ),
  ].sort((a, b) => {
    const dateA = parseDate(a);
    const dateB = parseDate(b);
    return dateA - dateB;
  });

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

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (isLifetime) {
      return staticData.screenData;
    }
    
    const startDate = new Date(dateRange[0].startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange[0].endDate);
    endDate.setHours(23, 59, 59, 999);

    return staticData.screenData.filter((item) => {
      const itemDate = parseDate(item.fullDate);
      return isDateInRange(itemDate, startDate, endDate);
    });
  }, [dateRange, isLifetime]);

  // Get unique dates in the filtered data for navigation
  const uniqueFilteredDates = useMemo(() => {
    const dates = [...new Set(filteredData.map((item) => item.fullDate))].sort(
      (a, b) => {
        const dateA = parseDate(a);
        const dateB = parseDate(b);
        return dateB - dateA; // Sort in descending order (newest to oldest)
      }
    );
    return dates;
  }, [filteredData]);

  // Reset currentDateIndex when filtered dates change
  useEffect(() => {
    setCurrentDateIndex(0);
  }, [uniqueFilteredDates]);

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
      // For lifetime view, aggregate data by screen name
      const screenMap = {};
      
      filteredData.forEach(item => {
        if (!screenMap[item.name]) {
          screenMap[item.name] = {
            name: item.name,
            tickets: 0,
            snacks: 0
          };
        }
        screenMap[item.name].tickets += item.tickets;
        screenMap[item.name].snacks += item.snacks;
      });
      
      return Object.values(screenMap);
    }
    
    if (uniqueFilteredDates.length === 0) return [];
    const currentDate = uniqueFilteredDates[currentDateIndex];
    return filteredData.filter((item) => item.fullDate === currentDate);
  }, [filteredData, uniqueFilteredDates, currentDateIndex, isLifetime]);

  // Calculate revenue and other metrics
  const rangeTicketRevenue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.tickets * 100, 0);
  }, [filteredData]);

  const rangeSnacksRevenue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.snacks * 50, 0);
  }, [filteredData]);

  const totalBookings = filteredData.length;
  const rangeStats = useMemo(() => {
    const totalTickets = filteredData.reduce(
      (sum, item) => sum + item.tickets,
      0
    );
    const totalSnacks = filteredData.reduce(
      (sum, item) => sum + item.snacks,
      0
    );
    const uniqueDates = [...new Set(filteredData.map((item) => item.fullDate))];
    const avgTicketsPerDay =
      uniqueDates.length > 0
        ? Math.round(totalTickets / uniqueDates.length)
        : 0;
    const avgSnacksPerDay =
      uniqueDates.length > 0 ? Math.round(totalSnacks / uniqueDates.length) : 0;

    return {
      totalTickets,
      totalSnacks,
      avgTicketsPerDay,
      avgSnacksPerDay,
      totalDays: uniqueDates.length,
      selectedDate:
        uniqueDates.length === 1 ? formatDate(parseDate(uniqueDates[0])) : null,
    };
  }, [filteredData]);

  const occupancyRate = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const totalTickets = rangeStats.totalTickets;
    const totalCapacity = filteredData.length * 100;
    return Math.round((totalTickets / totalCapacity) * 100);
  }, [filteredData, rangeStats]);

  const upcomingShows = filteredData.length;

  // Data for bar chart (always shows current date's data when navigating)
  const barChartData = useMemo(() => {
    if (isLifetime) {
      return currentDateData;
    }
    
    if (uniqueFilteredDates.length <= 1) {
      return currentDateData;
    }
    return currentDateData;
  }, [currentDateData, uniqueFilteredDates, isLifetime]);

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

  const handlePrevDate = () => {
    setCurrentDateIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextDate = () => {
    setCurrentDateIndex((prev) =>
      Math.min(uniqueFilteredDates.length - 1, prev + 1)
    );
  };

  const handleLifetime = () => {
    setIsLifetime(true);
    setDateRange([
      {
        startDate: minAvailableDate,
        endDate: maxAvailableDate,
        key: "selection",
      },
    ]);
  };

  return (
    <div className="p-2 lg:p-6">
      <div className="flex justify-between items-center space-x-2">
        <PageHeader title="Theatre Dashboard" className="mb-2" />

        <div className="flex items-center gap-2">
          <button
            onClick={handleLifetime}
            className={`border rounded-md px-3 py-1 text-sm flex items-center gap-2 text-orange-600 hover:border-gray-600 hover:text-black ${
              isLifetime ? "bg-gray-100" : ""
            }`}          >
            Lifetime
          </button>

          <div className="relative" ref={datePickerRef}>
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setShowDatePicker(!showDatePicker)}}
              className="border rounded-md px-3 py-1 text-sm flex items-center gap-2 hover:border-blue-600"
            >
              <Calendar size={16} />
              <span>{formatDateRangeDisplay()}</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4">
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

          {!isLifetime && uniqueFilteredDates.length > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevDate}
                disabled={currentDateIndex === 0}
                className={`p-1 rounded-md ${
                  currentDateIndex === 0
                    ? "text-gray-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm">
                {formatDate(parseDate(uniqueFilteredDates[currentDateIndex]))}
              </span>
              <button
                onClick={handleNextDate}
                disabled={currentDateIndex === uniqueFilteredDates.length - 1}
                className={`p-1 rounded-md ${
                  currentDateIndex === uniqueFilteredDates.length - 1
                    ? "text-gray-400"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={20} />
              </button>
              <span className="text-sm text-gray-500">
                ({currentDateIndex + 1}/{uniqueFilteredDates.length})
              </span>
            </div>
          )}
        </div>

        <div className="h-64 overflow-x-auto">
          <div className="min-w-[600px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="tickets"
                  fill="#2F65F7"
                  name="Tickets"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="snacks"
                  fill="#FF6C38"
                  name="Snacks"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex justify-center items-center mt-4">
          <div className="text-md font-semibold">
            {isLifetime ? (
              "Lifetime Data"
            ) : uniqueFilteredDates.length > 0 ? (
              formatDate(parseDate(uniqueFilteredDates[currentDateIndex]))
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
