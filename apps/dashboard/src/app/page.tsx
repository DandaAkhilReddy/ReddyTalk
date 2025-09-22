'use client';

import { useState, useEffect } from 'react';
import {
  Phone,
  Users,
  TrendingUp,
  Clock,
  Activity,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: 'Active Calls',
      value: 0,
      change: 0,
      icon: Phone,
      color: 'text-green-600',
    },
    {
      label: 'Total Patients',
      value: '2,847',
      change: 12.5,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Response Time',
      value: '1.2s',
      change: -8.3,
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      label: 'Success Rate',
      value: '99.9%',
      change: 0.2,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ]);

  const [recentCalls, setRecentCalls] = useState([
    {
      id: '1',
      patient: 'John Smith',
      type: 'Appointment',
      duration: '3:24',
      status: 'completed',
      time: '2 mins ago',
    },
    {
      id: '2',
      patient: 'Sarah Johnson',
      type: 'Prescription',
      duration: '5:12',
      status: 'completed',
      time: '5 mins ago',
    },
    {
      id: '3',
      patient: 'Michael Brown',
      type: 'General Inquiry',
      duration: '2:45',
      status: 'active',
      time: 'Now',
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) =>
          metric.label === 'Active Calls'
            ? { ...metric, value: Math.floor(Math.random() * 15) }
            : metric
        )
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="w-4 h-4 text-green-500" />
                System Healthy
              </span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                  <span
                    className={`text-sm font-medium ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm text-gray-500">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{call.patient}</div>
                      <div className="text-sm text-gray-500">{call.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">{call.duration}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        call.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {call.status}
                    </span>
                    <span className="text-sm text-gray-500">{call.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Agents Status */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">AI Agents Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Virtual Receptionist', status: 'active', calls: 42 },
                { name: 'Callback Specialist', status: 'active', calls: 18 },
                { name: 'SMS Manager', status: 'active', messages: 156 },
                { name: 'Escalation Expert', status: 'idle', escalations: 3 },
                { name: 'Waitlist Optimizer', status: 'active', fills: 8 },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {agent.calls && `${agent.calls} calls`}
                    {agent.messages && `${agent.messages} messages`}
                    {agent.escalations && `${agent.escalations} escalations`}
                    {agent.fills && `${agent.fills} fills`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">All systems operational</div>
                  <div className="text-sm text-green-700">Last checked 1 minute ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Scheduled maintenance</div>
                  <div className="text-sm text-blue-700">Tonight at 2:00 AM EST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}