import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
  Utensils,
  Sparkles,
  BarChart3,
  Mail,
  LayoutDashboard,
  Loader2,
  ChevronRight,
  Bell,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    gatePasses,
    complaints,
    rollCallRecords,
    broadcasts,
    cafeteriaOrders,
  } = useCampusOps();

  // Stats calculations
  const pendingGatePasses = gatePasses.filter(
    (p) => p.status === 'pending'
  ).length;

  const openComplaints = complaints.filter(
    (c) => c.status !== 'resolved'
  ).length;

  const overdueRollCall = rollCallRecords.filter(
    (r) => r.status === 'overdue'
  ).length;

  const totalBroadcasts = broadcasts.length;

  const totalCafeteriaOrders = cafeteriaOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  // Active tab state
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'operations' | 'reports' | 'settings'
  >('overview');

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-widest text-indigo-400 font-semibold">
                System Administration
              </span>

              <span className="text-slate-400 text-xs">·</span>

              <span className="text-xs text-slate-300">
                Super Admin Dashboard
              </span>
            </div>

            <h1 className="text-xl font-bold text-white mt-1">
              FretOps Central Administration
            </h1>

            <p className="text-xs text-slate-300 mt-0.5">
              Complete oversight and control of all campus operations, user
              management, and system configuration
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Overview"
            />

            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={<Users className="w-4 h-4" />}
              label="User Management"
            />

            <TabButton
              active={activeTab === 'operations'}
              onClick={() => setActiveTab('operations')}
              icon={<Sparkles className="w-4 h-4" />}
              label="Operations"
            />

            <TabButton
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
              icon={<BarChart3 className="w-4 h-4" />}
              label="Reports & Analytics"
            />

            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<Wrench className="w-4 h-4" />}
              label="Settings"
            />
          </div>
        </div>
      </div>

      {/* =========================
          OVERVIEW
      ========================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Status */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    System Status
                  </h3>

                  <p className="text-xs text-slate-500">
                    All operational systems online
                  </p>
                </div>

                <div className="text-2xl font-bold font-mono text-emerald-600">
                  OPERATIONAL
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  <span>Security Systems</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>User Management</span>
                </div>

                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-500" />
                  <span>Maintenance</span>
                </div>

                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-indigo-500" />
                  <span>Food Services</span>
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    User Activity (24h)
                  </h3>

                  <p className="text-xs text-slate-500">
                    Total logins and operations
                  </p>
                </div>

                <div className="text-2xl font-bold font-mono text-blue-600">
                  1,247
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div>
                  <span className="font-medium">Gate Passes: </span>
                  <span className="font-mono">{pendingGatePasses}</span>
                </div>

                <div>
                  <span className="font-medium">Complaints: </span>
                  <span className="font-mono">{openComplaints}</span>
                </div>

                <div>
                  <span className="font-medium">Mess Orders: </span>
                  <span className="font-mono">89</span>
                </div>

                <div>
                  <span className="font-medium">Cafeteria: </span>
                  <span className="font-mono">
                    ₹{totalCafeteriaOrders}
                  </span>
                </div>
              </div>
            </div>

            {/* Safety */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Safety & Security
                  </h3>

                  <p className="text-xs text-slate-500">
                    Campus safety metrics
                  </p>
                </div>

                <div className="text-2xl font-bold font-mono text-red-600">
                  {overdueRollCall}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div>
                  <span className="font-medium">Overdue Check-ins: </span>
                  <span className="font-mono text-red-600">
                    {overdueRollCall}
                  </span>
                </div>

                <div>
                  <span className="font-medium">Emergency Alerts: </span>
                  <span className="font-mono">0</span>
                </div>

                <div>
                  <span className="font-medium">Broadcasts Sent: </span>
                  <span className="font-mono">{totalBroadcasts}</span>
                </div>

                <div>
                  <span className="font-medium">Security Incidents: </span>
                  <span className="font-mono">0</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    System Performance
                  </h3>

                  <p className="text-xs text-slate-500">
                    Response times and uptime
                  </p>
                </div>

                <div className="text-2xl font-bold font-mono text-indigo-600">
                  99.8%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div>
                  <span className="font-medium">Avg Response: </span>
                  <span className="font-mono">120ms</span>
                </div>

                <div>
                  <span className="font-medium">Uptime: </span>
                  <span className="font-mono">99.8%</span>
                </div>

                <div>
                  <span className="font-medium">Data Sync: </span>
                  <span className="font-mono">Real-time</span>
                </div>

                <div>
                  <span className="font-medium">Backup Status: </span>
                  <span className="font-mono">Current</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Recent System Activity
              </h2>

              <button
                onClick={() => alert('Exporting activity log...')}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Mail className="w-3.5 h-3.5" />
                Export Log
              </button>
            </div>

            <div className="space-y-3">
              <ActivityItem
                icon={<LayoutDashboard className="w-5 h-5 text-indigo-400" />}
                title="System backup completed"
                description="Daily backup to secure cloud storage"
                time="2 hours ago"
              />

              <ActivityItem
                icon={<ShieldAlert className="w-5 h-5 text-indigo-400" />}
                title="Security policy updated"
                description="New password complexity requirements"
                time="4 hours ago"
              />

              <ActivityItem
                icon={<Users className="w-5 h-5 text-indigo-400" />}
                title="New technician onboarded"
                description="HVAC specialist added to maintenance team"
                time="6 hours ago"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================
          USER MANAGEMENT
      ========================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                User Management & Role Administration
              </h2>

              <button
                onClick={() => alert('Opening user management interface...')}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Users className="w-3.5 h-3.5" />
                Manage Users
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* User Statistics */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">
                  Total Users
                </div>

                <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  1247
                </div>

                <div className="text-2xs text-emerald-600 mt-0.5">
                  ↑ 12% vs last month
                </div>
              </div>

              {/* Role Distribution */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">
                  Role Distribution
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs mt-3">
                  <RoleStat label="Students" value="856" />
                  <RoleStat label="Wardens" value="24" />
                  <RoleStat label="Technicians" value="18" />
                  <RoleStat label="Security" value="12" />
                  <RoleStat label="Mess Staff" value="35" />
                  <RoleStat label="Kiosk Operators" value="8" />
                  <RoleStat label="Administrators" value="4" />
                </div>
              </div>

              {/* Recent Registrations */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs text-slate-500 font-medium">
                  Recent Registrations
                </div>

                <div className="space-y-2 mt-3">
                  <RegistrationItem
                    name="Priya Sharma"
                    role="Student"
                  />

                  <RegistrationItem
                    name="Rajesh Kumar"
                    role="Technician"
                  />

                  <RegistrationItem
                    name="Amit Patel"
                    role="Security Guard"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Role Permissions Matrix
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-2.5">Module</th>
                    <th className="pb-2.5 text-center">Student</th>
                    <th className="pb-2.5 text-center">Warden</th>
                    <th className="pb-2.5 text-center">Technician</th>
                    <th className="pb-2.5 text-center">Guard</th>
                    <th className="pb-2.5 text-center">Mess</th>
                    <th className="pb-2.5 text-center">Kiosk</th>
                    <th className="pb-2.5 text-center">Admin</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  <PermissionRow
                    module="Gate Passes"
                    permissions={[true, true, false, false, false, false, true]}
                  />

                  <PermissionRow
                    module="Maintenance"
                    permissions={[true, false, true, false, false, false, true]}
                  />

                  <PermissionRow
                    module="Food Services"
                    permissions={[true, false, false, false, true, true, true]}
                  />

                  <PermissionRow
                    module="Broadcasts"
                    permissions={[false, true, false, false, false, false, true]}
                  />

                  <PermissionRow
                    module="System Settings"
                    permissions={[false, false, false, false, false, false, true]}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          OPERATIONS
      ========================= */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Controls */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">
                System Controls
              </h2>

              <div className="space-y-4">
                <ControlItem
                  icon={<ShieldAlert className="w-4 h-4 text-indigo-400" />}
                  title="Emergency Broadcast System"
                  description="Test campus-wide alert capabilities"
                  buttonText="Test Emergency Alert"
                  buttonIcon={<Bell className="w-3.5 h-3.5 text-indigo-500" />}
                  onClick={() => {
                    if (confirm('Send test emergency broadcast to all users?')) {
                      alert('Test emergency broadcast sent!');
                    }
                  }}
                />

                <ControlItem
                  icon={<BarChart3 className="w-4 h-4 text-indigo-400" />}
                  title="Data Export & Backup"
                  description="Export logs or trigger system backup"
                  buttonText="Backup System"
                  buttonIcon={
                    <Loader2 className="w-3.5 h-3.5 text-indigo-500" />
                  }
                  onClick={() => {
                    if (confirm('Trigger full system backup now?')) {
                      alert('System backup initiated!');
                    }
                  }}
                />

                <ControlItem
                  icon={<Users className="w-4 h-4 text-indigo-400" />}
                  title="Maintenance Mode"
                  description="Put system in maintenance mode for updates"
                  buttonText="Maintenance Mode"
                  buttonIcon={<Wrench className="w-3.5 h-3.5 text-indigo-500" />}
                  onClick={() => {
                    if (
                      confirm(
                        'Enable maintenance mode? Users will see maintenance page.'
                      )
                    ) {
                      alert('Maintenance mode enabled!');
                    }
                  }}
                />

                <ControlItem
                  icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
                  title="Security Audit"
                  description="Run comprehensive security scan"
                  buttonText="Security Audit"
                  buttonIcon={
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                  }
                  onClick={() => {
                    if (
                      confirm(
                        'Run full security audit? This may take several minutes.'
                      )
                    ) {
                      alert('Security audit started!');
                    }
                  }}
                />
              </div>
            </div>

            {/* Service Monitoring */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">
                Service Level Monitoring
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                  title="Gate Pass Processing"
                  value="2.3s"
                  description="↓ 35% improvement"
                  positive
                />

                <MetricCard
                  title="Complaint Resolution"
                  value="4.2 hrs"
                  description="Target: < 6 hrs"
                />

                <MetricCard
                  title="Food Service Delivery"
                  value="98.4%"
                  description="On-time delivery"
                  positive
                />

                <MetricCard
                  title="System Uptime"
                  value="99.8%"
                  description="Monthly SLA"
                  positive
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          REPORTS
      ========================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Analytics & Reports
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Usage Statistics */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Usage Statistics
                </h3>

                <div className="space-y-3 mt-3">
                  <ReportStat
                    label="Daily Active Users"
                    value="1,124"
                  />

                  <ReportStat
                    label="Gate Passes Issued"
                    value="89"
                  />

                  <ReportStat
                    label="Complaints Filed"
                    value="23"
                  />

                  <ReportStat
                    label="Meals Served"
                    value="2,156"
                  />

                  <ReportStat
                    label="Cafeteria Orders"
                    value="142"
                  />
                </div>
              </div>

              {/* Performance Trends */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Performance Trends
                </h3>

                <div className="h-36 w-full bg-slate-50 rounded-lg border border-slate-200 mt-3">
                  <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                    System Performance Charts
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  System Health
                </h3>

                <div className="space-y-3 mt-3">
                  <ReportStat label="Database Size" value="2.4 GB" />
                  <ReportStat label="Cache Hit Ratio" value="87.3%" />
                  <ReportStat label="Error Rate" value="0.02%" />
                  <ReportStat label="API Latency" value="120ms" />
                  <ReportStat label="Storage Usage" value="65%" />
                </div>
              </div>
            </div>
          </div>

          {/* Available Reports */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Available Reports
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ReportCard
                icon={<LayoutDashboard className="w-5 h-5 text-indigo-500" />}
                title="Daily Operations Report"
                description="Summary of all system activities"
              />

              <ReportCard
                icon={<BarChart3 className="w-5 h-5 text-indigo-500" />}
                title="Performance Analytics"
                description="Trends and optimization insights"
              />

              <ReportCard
                icon={<ShieldAlert className="w-5 h-5 text-indigo-500" />}
                title="Security & Compliance"
                description="Audit trails and compliance reports"
              />

              <ReportCard
                icon={<Users className="w-5 h-5 text-indigo-500" />}
                title="User Management"
                description="User activity and role usage"
              />

              <ReportCard
                icon={<Utensils className="w-5 h-5 text-indigo-500" />}
                title="Food Services Report"
                description="Meal consumption and waste metrics"
              />

              <ReportCard
                icon={<Wrench className="w-5 h-5 text-indigo-500" />}
                title="Maintenance Operations"
                description="Work order completion and SLA tracking"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================
          SETTINGS
      ========================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* System Configuration */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              System Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* General Settings */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  General Settings
                </h3>

                <div className="space-y-3 mt-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      System Name
                    </span>

                    <input
                      defaultValue="FretOps Central"
                      className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      Time Zone
                    </span>

                    <select className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="IST">
                        India Standard Time (IST)
                      </option>
                      <option value="UTC">
                        Coordinated Universal Time (UTC)
                      </option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      Date Format
                    </span>

                    <select className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      Language
                    </span>

                    <select className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="te">Telugu</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Feature Flags
                </h3>

                <div className="space-y-3 mt-3">
                  <FeatureToggle
                    label="Emergency Alerts"
                    checked
                  />

                  <FeatureToggle
                    label="Maintenance Mode"
                    checked={false}
                  />

                  <FeatureToggle
                    label="API Rate Limiting"
                    checked
                  />

                  <FeatureToggle
                    label="Data Retention Policies"
                    checked
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Database Management */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Database Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Backup */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Backup & Recovery
                </h3>

                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium">
                      Last Backup:
                    </span>

                    <span className="font-mono text-indigo-600">
                      2 hours ago
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium">
                      Backup Frequency:
                    </span>

                    <span className="font-mono">Hourly</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium">
                      Retention Period:
                    </span>

                    <span className="font-mono">30 days</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Trigger immediate backup?')) {
                        alert('Backup initiated!');
                      }
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                  >
                    Backup Now
                  </button>
                </div>
              </div>

              {/* Data Export */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Data Export
                </h3>

                <div className="space-y-3 mt-3">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-700">
                      Export Format
                    </span>

                    <select className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="JSON">JSON</option>
                      <option value="CSV">CSV</option>
                      <option value="XML">XML</option>
                    </select>
                  </label>

                  <div>
                    <span className="text-xs font-medium">
                      Data Types
                    </span>

                    <div className="flex flex-wrap gap-3 mt-2">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        Gate Passes
                      </label>

                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        Complaints
                      </label>

                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        Users
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Export selected data?')) {
                        alert('Export initiated!');
                      }
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   HELPER COMPONENTS
========================================================= */

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border shadow-xs ${active
        ? 'bg-indigo-600 text-white border-indigo-500'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ActivityItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}> = ({ icon, title, description, time }) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
    {icon}

    <div className="space-y-1 flex-1">
      <div className="font-medium text-slate-900">{title}</div>

      <p className="text-xs text-slate-500">{description}</p>
    </div>

    <span className="text-2xs text-slate-400 font-mono whitespace-nowrap">
      {time}
    </span>
  </div>
);

const RoleStat: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span>{label}:</span>
    <span className="font-mono">{value}</span>
  </div>
);

const RegistrationItem: React.FC<{
  name: string;
  role: string;
}> = ({ name, role }) => (
  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
    <span className="font-medium text-slate-900">{name}</span>
    <span className="text-indigo-600 font-medium">{role}</span>
  </div>
);

const PermissionRow: React.FC<{
  module: string;
  permissions: boolean[];
}> = ({ module, permissions }) => (
  <tr className="hover:bg-slate-50">
    <td className="py-3 font-medium text-slate-900">{module}</td>

    {permissions.map((allowed, index) => (
      <td key={index} className="py-2 text-center">
        {allowed ? (
          <CheckCircle2 className="w-4 h-4 text-indigo-500 mx-auto" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-400 mx-auto" />
        )}
      </td>
    ))}
  </tr>
);

const ControlItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  onClick: () => void;
}> = ({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  onClick,
}) => (
    <div className="flex flex-col gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        {icon}

        <div>
          <div className="font-medium text-slate-900">{title}</div>

          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded"
      >
        <span>{buttonText}</span>
        {buttonIcon}
      </button>
    </div>
  );

const MetricCard: React.FC<{
  title: string;
  value: string;
  description: string;
  positive?: boolean;
}> = ({ title, value, description, positive }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
    <div className="text-xs text-slate-500 font-medium">{title}</div>

    <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
      {value}
    </div>

    <div
      className={`text-2xs mt-0.5 ${positive ? 'text-emerald-600' : 'text-slate-500'
        }`}
    >
      {description}
    </div>
  </div>
);

const ReportStat: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-xs font-medium">{label}:</span>

    <span className="font-mono text-indigo-600">{value}</span>
  </div>
);

const ReportCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:bg-slate-50 cursor-pointer transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}

        <div>
          <div className="font-medium text-slate-900">{title}</div>

          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-indigo-400" />
    </div>
  </div>
);

const FeatureToggle: React.FC<{
  label: string;
  checked: boolean;
}> = ({ label, checked }) => (
  <label className="flex items-center justify-between py-2 cursor-pointer">
    <span className="text-xs font-medium">{label}</span>

    <div className="relative">
      <input
        type="checkbox"
        defaultChecked={checked}
        className="sr-only peer"
      />

      <div className="w-10 h-5 bg-slate-300 rounded-full peer-checked:bg-indigo-500 transition-colors" />

      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
    </div>
  </label>
);

export default AdminPortal;