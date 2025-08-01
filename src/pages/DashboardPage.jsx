import { Calendar, DollarSign, Percent, TrendingUp } from 'lucide-react';
import React from 'react'
import PageHeader from '../components/PageHeader';

const DashboardPage = () => {
  return (
    <div className="p-4 lg:p-6">
      <PageHeader title="Theatre Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Bookings</h3>
              <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                1,234
              </p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Snacks Revenue</h3>
              <p className="text-2xl lg:text-3xl font-bold text-green-600">
                ₹5,678
              </p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Occupancy Rate</h3>
              <p className="text-2xl lg:text-3xl font-bold text-purple-600">
                78%
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
                5
              </p>
            </div>
            <Calendar className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New booking for Screen 1</p>
                <p className="text-xs text-gray-500">
                  Show 7:00 PM - 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Snack order completed</p>
                <p className="text-xs text-gray-500">
                  2x Popcorn, 1x Coke - 5 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Inventory alert</p>
                <p className="text-xs text-gray-500">
                  Nachos running low - 10 minutes ago
                </p>
              </div>
            </div>
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
    </div>
  );
};

export default DashboardPage