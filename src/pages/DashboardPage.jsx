import { Calendar, DollarSign, Film, Percent, TrendingUp } from "lucide-react";
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

const DashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Sample data - replace with your actual data
  const ticketRevenue = 1234;
  const snacksRevenue = 5678;
  const totalBookings = 1234;
  const occupancyRate = 78;
  const upcomingShows = 5;

  // Pie chart data
  const pieData = [
    { name: "Ticket Revenue", value: ticketRevenue, color: "#3b82f6" },
    { name: "Snacks Revenue", value: snacksRevenue, color: "#10b981" },
  ];

  // Bar chart data - sample data for screens
  const barData = [
    {
      name: "S1",
      date: "Aug 2",
      tickets: 45,
      snacks: 32,
    },
    {
      name: "S2",
      date: "Aug 2",
      tickets: 38,
      snacks: 28,
    },
    {
      name: "S3",
      date: "Aug 2",
      tickets: 52,
      snacks: 41,
    },
    {
      name: "S4",
      date: "Aug 2",
      tickets: 29,
      snacks: 22,
    },
    {
      name: "S1",
      date: "Aug 1",
      tickets: 40,
      snacks: 30,
    },
    {
      name: "S2",
      date: "Aug 1",
      tickets: 35,
      snacks: 25,
    },
    {
      name: "S3",
      date: "Aug 1",
      tickets: 48,
      snacks: 38,
    },
    {
      name: "S4",
      date: "Aug 1",
      tickets: 25,
      snacks: 20,
    },
  ];

  // Filter bar data by selected date
  const filteredBarData = barData.filter((item) => item.date === "Aug 2"); // In real app, filter by selectedDate

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center space-x-2">
        <PageHeader title="Theatre Dashboard" />

        <div className="flex items-center space-x-2 mb-2">
          {/* <label
            htmlFor="date-filter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Date:
          </label> */}
          <input
            type="date"
            id="date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Ticket Revenue</h3>
              <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                ₹{ticketRevenue.toLocaleString()}
              </p>
            </div>
            <Film className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Snacks Revenue</h3>
              <p className="text-2xl lg:text-3xl font-bold text-green-600">
                ₹{snacksRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
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
              <p className="text-2xl lg:text-3xl font-bold text-purple-600">
                ₹{occupancyRate}
              </p>
            </div>
            <Percent className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Upcoming Shows</h3>
              <p className="text-2xl lg:text-3xl font-bold text-orange-600">
                {upcomingShows}
              </p>
            </div>
            <Calendar className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-3">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Sales</span>
              <span className="font-bold text-green-600">₹12,450</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Tickets Sold</span>
              <span className="font-bold">89</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Snacks Sold</span>
              <span className="font-bold">156</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Active Shows</span>
              <span className="font-bold">3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Screen Performance</h2>
        <div className="h-64 overflow-x-auto">
          <div className="min-w-[600px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredBarData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    value,
                    value === "tickets" ? "Tickets" : "Snacks",
                  ]}
                />
                <Legend />
                <Bar dataKey="tickets" fill="#3b82f6" name="Tickets" />
                <Bar dataKey="snacks" fill="#10b981" name="Snacks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex justify-center mt-2 space-x-4 overflow-x-auto py-2">
          {["Aug 2", "Aug 1"].map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedDate === date
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;