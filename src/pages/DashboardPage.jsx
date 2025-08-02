import { Percent, Popcorn, TrendingUp, Calendar } from "lucide-react";
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
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
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format, parse } from 'date-fns';

const DashboardPage = () => {
  // Static data with multiple dates
  const staticData = {
    stats: {
      ticketRevenue: 1234,
      snacksRevenue: 5678,
      totalBookings: 1234,
      occupancyRate: 78,
      upcomingShows: 5
    },
    todaySummary: {
      totalSales: 12450,
      ticketsSold: 89,
      snacksSold: 156,
      activeShows: 3
    },
    screenData: [
      // August data
      { name: "S1", date: "Aug 2", fullDate: "08/02/2025", tickets: 45, snacks: 32 },
      { name: "S2", date: "Aug 2", fullDate: "08/02/2025", tickets: 38, snacks: 28 },
      { name: "S3", date: "Aug 2", fullDate: "08/02/2025", tickets: 52, snacks: 41 },
      { name: "S4", date: "Aug 2", fullDate: "08/02/2025", tickets: 29, snacks: 22 },
      { name: "S1", date: "Aug 1", fullDate: "08/01/2025", tickets: 40, snacks: 30 },
      { name: "S2", date: "Aug 1", fullDate: "08/01/2025", tickets: 35, snacks: 25 },
      { name: "S3", date: "Aug 1", fullDate: "08/01/2025", tickets: 48, snacks: 38 },
      { name: "S4", date: "Aug 1", fullDate: "08/01/2025", tickets: 25, snacks: 20 },
      // July data
      { name: "S1", date: "Jul 31", fullDate: "07/31/2025", tickets: 35, snacks: 25 },
      { name: "S2", date: "Jul 31", fullDate: "07/31/2025", tickets: 30, snacks: 20 },
      { name: "S3", date: "Jul 31", fullDate: "07/31/2025", tickets: 42, snacks: 35 },
      { name: "S4", date: "Jul 31", fullDate: "07/31/2025", tickets: 20, snacks: 15 },
      { name: "S1", date: "Jul 30", fullDate: "07/30/2025", tickets: 32, snacks: 22 },
      { name: "S2", date: "Jul 30", fullDate: "07/30/2025", tickets: 28, snacks: 18 },
      { name: "S3", date: "Jul 30", fullDate: "07/30/2025", tickets: 38, snacks: 30 },
      { name: "S4", date: "Jul 30", fullDate: "07/30/2025", tickets: 18, snacks: 12 }
    ]
  };

  // Get unique dates from screenData
  const allDates = [...new Set(staticData.screenData.map(item => item.fullDate))].sort((a, b) =>
    new Date(b) - new Date(a) // Sort dates in descending order (newest first)
  );

  // Initialize with Aug 2 selected
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter screen data for the currently viewed date
  const filteredBarData = staticData.screenData.filter(item =>
    item.fullDate === allDates[currentDateIndex]
  );

  const goToPreviousDate = () => {
    if (currentDateIndex < allDates.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1); // Move to older date
    }
  };

  const goToNextDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1); // Move to newer date
    }
  };

  const handleDateSelect = (date) => {
    const dateStr = format(date, 'MM/dd/yyyy');
    const foundIndex = allDates.findIndex(d => d === dateStr);
    if (foundIndex >= 0) {
      setCurrentDateIndex(foundIndex);
    }
    setShowDatePicker(false);
  };

  return (
    <div className="p-2 lg:p-4">
      <div className="flex justify-between items-center space-x-2">
        <PageHeader title="Theatre Dashboard" />

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="border rounded-md px-3 py-1 text-sm flex items-center gap-2"
          >
            <Calendar size={16} />
            <span>{staticData.screenData.find(item => item.fullDate === allDates[currentDateIndex]).date}</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-1 z-10 shadow-lg">
              <DateRange
                editableDateInputs={true}
                onChange={item => handleDateSelect(item.selection.startDate)}
                ranges={[{
                  startDate: parse(allDates[currentDateIndex], 'MM/dd/yyyy', new Date()),
                  endDate: parse(allDates[currentDateIndex], 'MM/dd/yyyy', new Date()),
                  key: 'selection'
                }]}
                moveRangeOnFirstSelection={false}
                showDateDisplay={false}
                minDate={parse('07/30/2025', 'MM/dd/yyyy', new Date())}
                maxDate={parse('08/02/2025', 'MM/dd/yyyy', new Date())}
                disabledDay={(date) => !allDates.includes(format(date, 'MM/dd/yyyy'))}
                rangeColors={['#3b82f6']}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-4">
        <div className="bg-white p-4 lg:p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Ticket Revenue</h3>
              <p className="text-2xl lg:text-2xl font-bold text-blue-600">
                ₹{staticData.stats.ticketRevenue.toLocaleString()}
              </p>
            </div>
            <MdOutlineLocalMovies className="text-blue-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Snacks Revenue</h3>
              <p className="text-2xl lg:text-2xl font-bold text-green-600">
                ₹{staticData.stats.snacksRevenue.toLocaleString()}
              </p>
            </div>
            <Popcorn className="text-green-600" size={25} />
          </div >
        </div >

        <div className="bg-white p-4 lg:p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-2xl lg:text-2xl font-bold text-yellow-600">
                ₹{staticData.stats.totalBookings.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-yellow-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-2xl lg:text-3xl font-bold text-yellow-600">
                ₹{totalBookings.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Occupancy Rate</h3>
              <p className="text-2xl lg:text-2xl font-bold text-purple-600">
                {staticData.stats.occupancyRate}%
              </p>
            </div>
            <Percent className="text-purple-600" size={25} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Upcoming Shows</h3>
              <p className="text-2xl lg:text-2xl font-bold text-orange-600">
                {staticData.stats.upcomingShows}
              </p>
            </div>
            <BiCameraMovie className="text-orange-600" size={25} />
          </div>
        </div>
      </div >

      {/* Revenue Breakdown Section */}
      < div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4" >
        <div className="bg-white p-2 lg:p-2 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Revenue Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Ticket Revenue", value: staticData.stats.ticketRevenue, color: "#1f54e4ff" },
                    { name: "Snacks Revenue", value: staticData.stats.snacksRevenue, color: "#1ca71cff" },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#1f54e4ff" />
                  <Cell fill="#1ca71cff" />
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-2 lg:p-2 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Sales</span>
              <span className="font-bold text-green-600">₹{staticData.todaySummary.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Tickets Sold</span>
              <span className="font-bold">{staticData.todaySummary.ticketsSold}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Snacks Sold</span>
              <span className="font-bold">{staticData.todaySummary.snacksSold}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Active Shows</span>
              <span className="font-bold">{staticData.todaySummary.activeShows}</span>
            </div>
          </div>
        </div>
      </div >

      {/* Screen Performance Section */}
      < div className="bg-white p-4 lg:p-6 rounded-lg shadow-md" >
        <h2 className="text-xl font-semibold mb-4">Screen Performance</h2>

        <div className="h-64 overflow-x-auto">
          <div className="min-w-[600px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredBarData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, value === "tickets" ? "Tickets" : "Snacks"]} />
                <Legend />
                <Bar dataKey="tickets" fill="#1f54e4ff" name="Tickets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="snacks" fill="#1ca71cff" name="Snacks" radius={[4, 4, 0, 0]} />
              </BarChart >
            </ResponsiveContainer >
          </div >
        </div >

        {/* Date Navigation - Right button shows previous day */}
        < div className="flex justify-center items-center mt-4 gap-4" >
          <button
            onClick={goToNextDate}
            disabled={currentDateIndex >= allDates.length - 1}
            className={`p-1 rounded-full ${currentDateIndex >= allDates.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <span className="font-medium">
            {staticData.screenData.find(item => item.fullDate === allDates[currentDateIndex]).date}
          </span>

          <button
            onClick={goToPreviousDate}
            disabled={currentDateIndex <= 0}
            className={`p-1 rounded-full ${currentDateIndex <= 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div >
      </div >
    </div >
  );
};

export default DashboardPage;