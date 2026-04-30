import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar, 
  Ticket,
  Activity,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const HostAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchHostAnalysis();
  }, []);

  const fetchHostAnalysis = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/events/host-analysis`);
      setAnalysis(res.data.analysis);
    } catch (error) {
      console.error('Error fetching host analysis:', error);
      setError(error.response?.data?.message || 'Failed to fetch analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 rounded-xl text-center">
        <p className="text-red-400 text-lg">{error}</p>
        <button 
          onClick={fetchHostAnalysis}
          className="mt-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis || analysis.totalEvents === 0) {
    return (
      <div className="glass p-8 rounded-xl text-center">
        <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Events Yet</h2>
        <p className="text-blue-200">Create your first event to see analytics</p>
      </div>
    );
  }

  // Calculate growth metrics
  const previousMonthRevenue = analysis.revenueTrend.length > 1 
    ? analysis.revenueTrend[analysis.revenueTrend.length - 2]?.revenue || 0 
    : 0;
  const currentMonthRevenue = analysis.revenueTrend.length > 0 
    ? analysis.revenueTrend[analysis.revenueTrend.length - 1]?.revenue || 0 
    : 0;
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-400" />
          Host Analysis
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'events' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'trends' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Trends
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                {revenueGrowth >= 0 ? (
                  <div className="flex items-center text-green-400 text-sm">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {Math.abs(revenueGrowth)}%
                  </div>
                ) : (
                  <div className="flex items-center text-red-400 text-sm">
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    {Math.abs(revenueGrowth)}%
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-white">₹{analysis.totalRevenue.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">Total Revenue</p>
            </div>

            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Ticket className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analysis.totalBookings}</p>
              <p className="text-blue-200 text-sm">Total Bookings</p>
            </div>

            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analysis.totalAttendees}</p>
              <p className="text-blue-200 text-sm">Unique Attendees</p>
            </div>

            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{analysis.totalEvents}</p>
              <p className="text-blue-200 text-sm">Total Events</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <h3 className="text-lg font-semibold text-white mb-4">Event Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Upcoming</span>
                  <span className="text-white font-semibold">{analysis.eventStatusBreakdown.upcoming}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(analysis.eventStatusBreakdown.upcoming / analysis.totalEvents) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Active</span>
                  <span className="text-white font-semibold">{analysis.eventStatusBreakdown.active}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${(analysis.eventStatusBreakdown.active / analysis.totalEvents) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Completed</span>
                  <span className="text-white font-semibold">{analysis.eventStatusBreakdown.completed}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${(analysis.eventStatusBreakdown.completed / analysis.totalEvents) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <h3 className="text-lg font-semibold text-white mb-4">Capacity Utilization</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${analysis.capacityUtilization * 3.52} 352`}
                      className="text-blue-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{analysis.capacityUtilization}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-blue-200 mt-4">Average seat utilization</p>
            </div>

            <div className="glass p-6 rounded-xl border border-blue-400/20">
              <h3 className="text-lg font-semibold text-white mb-4">Average Ticket Price</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">₹{analysis.averageTicketPrice}</p>
                <p className="text-blue-200 text-sm">Per booking</p>
              </div>
            </div>
          </div>

          {/* Top/Bottom Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.topPerformingEvent && (
              <div className="glass p-6 rounded-xl border border-green-400/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Top Performing Event</h3>
                </div>
                <p className="text-xl font-bold text-white mb-2">{analysis.topPerformingEvent.title}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Revenue</p>
                    <p className="text-white font-semibold">₹{analysis.topPerformingEvent.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Bookings</p>
                    <p className="text-white font-semibold">{analysis.topPerformingEvent.bookings}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis.lowestPerformingEvent && analysis.lowestPerformingEvent.eventId !== analysis.topPerformingEvent?.eventId && (
              <div className="glass p-6 rounded-xl border border-red-400/30">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Lowest Performing Event</h3>
                </div>
                <p className="text-xl font-bold text-white mb-2">{analysis.lowestPerformingEvent.title}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Revenue</p>
                    <p className="text-white font-semibold">₹{analysis.lowestPerformingEvent.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Bookings</p>
                    <p className="text-white font-semibold">{analysis.lowestPerformingEvent.bookings}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="glass p-6 rounded-xl border border-blue-400/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Revenue by Event
          </h3>
          <div className="space-y-4">
            {analysis.revenueByEvent.map((event, index) => (
              <div key={event.eventId} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-400">#{index + 1}</span>
                    <span className="text-white font-medium">{event.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">₹{event.revenue.toLocaleString()}</p>
                    <p className="text-blue-200 text-sm">{event.bookings} bookings</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${analysis.totalRevenue > 0 ? (event.revenue / analysis.totalRevenue) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="glass p-6 rounded-xl border border-blue-400/20">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Revenue Trend (Last 6 Months)
          </h3>
          {analysis.revenueTrend.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.revenueTrend.map((month, index) => (
                <div 
                  key={month.month} 
                  className={`p-4 rounded-lg border ${
                    index === analysis.revenueTrend.length - 1 
                      ? 'border-blue-400/50 bg-blue-500/10' 
                      : 'border-gray-700 bg-gray-800/30'
                  }`}
                >
                  <p className="text-blue-200 text-sm mb-1">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-2xl font-bold text-white">₹{month.revenue.toLocaleString()}</p>
                  <p className="text-blue-200 text-sm">{month.bookings} bookings</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-blue-200">No trend data available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HostAnalysis;