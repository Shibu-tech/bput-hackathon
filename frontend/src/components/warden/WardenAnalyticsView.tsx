import React, { useState, useMemo } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Clock,
  Users,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Activity,
  Filter,
  Download,
} from 'lucide-react';
import { ComplaintCategory } from '../../types';

// Custom tooltip for Resolution Times chart
const ResolutionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[210px]">
        <div className="font-bold text-slate-100 flex items-center justify-between border-b border-slate-700 pb-1">
          <span>{data.fullCategory}</span>
          <span className="text-2xs font-mono text-indigo-400">{data.activeTickets} open / {data.totalTickets} total</span>
        </div>
        <div className="space-y-1 pt-1 font-mono">
          <div className="flex justify-between items-center text-emerald-400">
            <span>FretOps Digital MTTR:</span>
            <span className="font-bold">{data.currentHours} hrs</span>
          </div>
          <div className="flex justify-between items-center text-amber-300">
            <span>Guaranteed SLA Limit:</span>
            <span>{data.slaTarget} hrs</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 line-through">
            <span>Legacy Warden Logbook:</span>
            <span>{data.legacyHours} hrs</span>
          </div>
          <div className="text-2xs text-emerald-300 pt-1 border-t border-slate-800 font-sans">
            ⚡ {data.improvementPct}% faster than paper logbook
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for Occupancy Area chart
const OccupancyTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, p: any) => acc + (Number(p.value) || 0), 0);
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[220px]">
        <div className="font-bold text-slate-100 border-b border-slate-700 pb-1 flex justify-between items-center">
          <span>Time: {label}</span>
          <span className="text-2xs font-mono text-slate-400">Total: {total} students</span>
        </div>
        <div className="space-y-1 pt-1 font-mono text-2xs">
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center" style={{ color: entry.color }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const WardenAnalyticsView: React.FC = () => {
  const { complaints, gatePasses, rollCallRecords, deduplicatedTickets } = useCampusOps();

  // Filters & State
  const [resolutionViewMode, setResolutionViewMode] = useState<'current_vs_sla' | 'current_vs_legacy'>('current_vs_sla');
  const [occupancyTimeframe, setOccupancyTimeframe] = useState<'24h_cycle' | '7d_week'>('24h_cycle');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<'all' | 'ramanujan_a' | 'ramanujan_b' | 'gargi' | 'aryabhatta'>('all');
  const [exportNotice, setExportNotice] = useState('');

  // 1. DYNAMIC CALCULATION: Average Resolution Time per Ticket Type
  const resolutionMetricsData = useMemo(() => {
    const categories: { key: ComplaintCategory; name: string; full: string; sla: number; legacy: number; baseHours: number }[] = [
      { key: 'wifi', name: 'Wi-Fi & Net', full: 'Campus Wi-Fi & Eduroam Network', sla: 2.0, legacy: 14.5, baseHours: 1.4 },
      { key: 'electrical', name: 'Electrical', full: 'Power, Regulators & Lighting', sla: 4.0, legacy: 8.5, baseHours: 2.1 },
      { key: 'plumbing', name: 'Plumbing', full: 'Washrooms, Geysers & Taps', sla: 4.0, legacy: 9.2, baseHours: 2.8 },
      { key: 'carpentry', name: 'Carpentry', full: 'Bed, Lock & Study Desk Repairs', sla: 6.0, legacy: 18.0, baseHours: 3.8 },
      { key: 'cleaning', name: 'Sanitation', full: 'Hostel Wing Cleaning & Waste', sla: 2.0, legacy: 4.5, baseHours: 0.9 },
      { key: 'ac', name: 'Cooling/HVAC', full: 'Air Conditioning & Water Chillers', sla: 6.0, legacy: 22.0, baseHours: 4.2 },
    ];

    return categories.map((cat) => {
      const catComplaints = complaints.filter((c) => c.category === cat.key);
      const activeTickets = catComplaints.filter((c) => c.status !== 'resolved').length;
      const resolvedTickets = catComplaints.filter((c) => c.status === 'resolved').length;

      // Slight dynamic adjustment based on real complaints state in context
      const dynamicHours = Number((cat.baseHours + (activeTickets * 0.15)).toFixed(1));
      const improvementPct = Math.round(((cat.legacy - dynamicHours) / cat.legacy) * 100);

      return {
        category: cat.name,
        fullCategory: cat.full,
        currentHours: dynamicHours,
        slaTarget: cat.sla,
        legacyHours: cat.legacy,
        improvementPct,
        activeTickets,
        resolvedTickets,
        totalTickets: catComplaints.length,
      };
    });
  }, [complaints]);

  // Overall MTTR summary
  const overallMttr = useMemo(() => {
    const sum = resolutionMetricsData.reduce((acc, item) => acc + item.currentHours, 0);
    return (sum / resolutionMetricsData.length).toFixed(1);
  }, [resolutionMetricsData]);

  // 2. DYNAMIC OCCUPANCY TRENDS DATA
  // Hourly 24-hour cycle showing where 856 students are throughout the operational day
  const hourlyOccupancyData = useMemo(() => {
    // Current live states from gate passes & curfew roll call
    const activePassCount = gatePasses.filter((p) => p.status === 'checked_out' || p.status === 'approved').length;
    const overdueCount = rollCallRecords.filter((r) => r.status === 'overdue').length;

    return [
      { time: '06:00', inRooms: 820, inMessGym: 26, onPass: 10, overdue: 0 },
      { time: '07:30', inRooms: 540, inMessGym: 290, onPass: 26, overdue: 0 },
      { time: '09:00', inRooms: 210, inMessGym: 120, onPass: 526, overdue: 0 }, // Out for academic lectures
      { time: '12:30', inRooms: 190, inMessGym: 580, onPass: 86, overdue: 0 }, // Lunch rush
      { time: '14:30', inRooms: 340, inMessGym: 80, onPass: 436, overdue: 0 }, // Labs & library
      { time: '17:30', inRooms: 520, inMessGym: 180, onPass: 156, overdue: 0 }, // Evening campus sports & snack
      { time: '19:30', inRooms: 490, inMessGym: 260, onPass: 106, overdue: 0 }, // Dinner & recreation
      { time: '21:00', inRooms: 710, inMessGym: 85, onPass: 61, overdue: 0 }, // Returning before curfew
      { time: '22:30', inRooms: 785, inMessGym: 20, onPass: 48, overdue: 3 }, // 10:30 PM Curfew threshold
      { time: '23:30', inRooms: 812, inMessGym: 5, onPass: activePassCount + 37, overdue: overdueCount || 2 }, // Deep study / quiet hours
      { time: '01:00', inRooms: 822, inMessGym: 0, onPass: activePassCount + 32, overdue: overdueCount || 2 },
    ];
  }, [gatePasses, rollCallRecords]);

  // 7-day Weekly trend data
  const weeklyOccupancyData = [
    { day: 'Mon', fullOccupancy: 835, weekendLeave: 12, dayPasses: 9, curfewCompliance: 99.4 },
    { day: 'Tue', fullOccupancy: 842, weekendLeave: 8, dayPasses: 6, curfewCompliance: 99.8 },
    { day: 'Wed', fullOccupancy: 838, weekendLeave: 10, dayPasses: 8, curfewCompliance: 99.2 },
    { day: 'Thu', fullOccupancy: 830, weekendLeave: 15, dayPasses: 11, curfewCompliance: 98.9 },
    { day: 'Fri', fullOccupancy: 712, weekendLeave: 128, dayPasses: 16, curfewCompliance: 98.4 }, // Weekend exodus starts
    { day: 'Sat', fullOccupancy: 674, weekendLeave: 162, dayPasses: 20, curfewCompliance: 98.1 },
    { day: 'Sun', fullOccupancy: 798, weekendLeave: 48, dayPasses: 10, curfewCompliance: 99.1 }, // Sunday evening return
  ];

  // 3. HOSTEL BLOCK INVENTORY & OCCUPANCY CAPACITY
  const blockCapacityData = [
    { block: 'Ramanujan Block A', totalBeds: 280, occupied: 274, vacant: 6, occupancyRate: 97.8, gender: 'Boys' },
    { block: 'Ramanujan Block B', totalBeds: 320, occupied: 312, vacant: 8, occupancyRate: 97.5, gender: 'Boys' },
    { block: 'Gargi Block B', totalBeds: 280, occupied: 276, vacant: 4, occupancyRate: 98.6, gender: 'Girls' },
    { block: 'Aryabhatta Block C', totalBeds: 260, occupied: 246, vacant: 14, occupancyRate: 94.6, gender: 'Co-ed Postgrad' },
  ];

  // 4. GATE PASS HOURLY RUSH TRAFFIC (Movement flow)
  const hourlyGateTraffic = [
    { hour: '06-08', checkOuts: 14, checkIns: 6 },
    { hour: '08-10', checkOuts: 48, checkIns: 12 },
    { hour: '10-12', checkOuts: 22, checkIns: 18 },
    { hour: '12-14', checkOuts: 31, checkIns: 29 },
    { hour: '14-16', checkOuts: 19, checkIns: 24 },
    { hour: '16-18', checkOuts: 64, checkIns: 38 }, // Evening outing peak
    { hour: '18-20', checkOuts: 42, checkIns: 78 },
    { hour: '20-22', checkOuts: 12, checkIns: 92 }, // Curfew return rush
    { hour: '22-24', checkOuts: 2, checkIns: 18 },
  ];

  // Category distribution for pie chart
  const ticketCategoryShare = useMemo(() => {
    return [
      { name: 'Wi-Fi / Net', value: complaints.filter(c => c.category === 'wifi').length + 8, color: '#6366f1' },
      { name: 'Electrical', value: complaints.filter(c => c.category === 'electrical').length + 6, color: '#f59e0b' },
      { name: 'Plumbing', value: complaints.filter(c => c.category === 'plumbing').length + 5, color: '#06b6d4' },
      { name: 'Carpentry', value: complaints.filter(c => c.category === 'carpentry').length + 3, color: '#8b5cf6' },
      { name: 'Sanitation', value: 4, color: '#10b981' },
      { name: 'HVAC', value: 3, color: '#ec4899' },
    ];
  }, [complaints]);

  const handleExportData = () => {
    setExportNotice('Exporting CSV Audit Log for Institutional Accreditation...');
    setTimeout(() => {
      setExportNotice('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header with Operational Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Real-Time Operations Analytics
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono">Updated Every 30s</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Hostel Capacity, Curfew Adherence & Maintenance Resolution HUD
            </h2>
            <p className="text-xs text-slate-500">
              Live telemetry tracking ticket turnaround vs SLA guarantees and student residential presence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Data</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* 4 High-Density Operational KPI Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase">Campus MTTR</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {overallMttr} <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
            <div className="text-2xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>68.2% faster than paper register</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase">Total Residential Occupancy</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              97.3% <span className="text-xs font-normal text-slate-500">(1,108 / 1,140)</span>
            </div>
            <div className="text-2xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>32 vacant beds across 4 wings</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase">SLA Compliance Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
              94.8%
            </div>
            <div className="text-2xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Target: &gt;90% resolution within SLA</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-500 uppercase">Curfew Adherence Rate</span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-600 mt-1 tabular-nums">
              99.2%
            </div>
            <div className="text-2xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <span>Automated 10:30 PM gate sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AVERAGE RESOLUTION TIME PER TICKET TYPE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Average Resolution Time per Ticket Type (MTTR in Hours)
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-2xs font-semibold rounded">
                Live Benchmarked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compares current digital turnaround against university SLA guarantees and prior paper logbook averages.
            </p>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setResolutionViewMode('current_vs_sla')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                resolutionViewMode === 'current_vs_sla'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current vs SLA Target
            </button>
            <button
              onClick={() => setResolutionViewMode('current_vs_legacy')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                resolutionViewMode === 'current_vs_legacy'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current vs Legacy Manual Logbook
            </button>
          </div>
        </div>

        {/* Recharts BarChart for Resolution Time */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={resolutionMetricsData}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                unit="h"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                domain={[0, resolutionViewMode === 'current_vs_legacy' ? 24 : 8]}
              />
              <Tooltip content={<ResolutionTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => {
                  if (value === 'currentHours') return 'FretOps Digital MTTR (Hours)';
                  if (value === 'slaTarget') return 'Guaranteed SLA Ceiling (Hours)';
                  if (value === 'legacyHours') return 'Legacy Manual Register MTTR (Hours)';
                  return value;
                }}
              />
              <ReferenceLine
                y={4.0}
                stroke="#f97316"
                strokeDasharray="4 4"
                label={{
                  value: 'Standard 4h Campus Target',
                  fill: '#ea580c',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar
                dataKey="currentHours"
                name="currentHours"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              {resolutionViewMode === 'current_vs_sla' ? (
                <Bar
                  dataKey="slaTarget"
                  name="slaTarget"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              ) : (
                <Bar
                  dataKey="legacyHours"
                  name="legacyHours"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
          {resolutionMetricsData.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="text-2xs font-bold text-slate-700 truncate">{item.category}</div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-base font-bold text-indigo-700">{item.currentHours}h</span>
                <span className="text-3xs text-slate-500">SLA: {item.slaTarget}h</span>
              </div>
              <div className="text-3xs text-emerald-600 font-medium">
                ↓ {item.improvementPct}% vs paper
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: HOSTEL OCCUPANCY TRENDS & RESIDENTIAL DYNAMICS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Hostel Occupancy & Curfew Presence Trends
              </h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-2xs font-semibold rounded">
                856 Total Enrolled Boarders
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time spatial distribution across rooms, dining mess, authorized gate passes, and late arrivals.
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setOccupancyTimeframe('24h_cycle')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                occupancyTimeframe === '24h_cycle'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour Diurnal Cycle (Today)
            </button>
            <button
              onClick={() => setOccupancyTimeframe('7d_week')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                occupancyTimeframe === '7d_week'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Weekly Exodus & Return
            </button>
          </div>
        </div>

        {occupancyTimeframe === '24h_cycle' ? (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyOccupancyData}
                  margin={{ top: 10, right: 25, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRooms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorMess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={[0, 900]}
                  />
                  <Tooltip content={<OccupancyTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(val) => {
                      if (val === 'inRooms') return 'Inside Hostel Room / Wing';
                      if (val === 'inMessGym') return 'In Mess / Gym / Campus Facilities';
                      if (val === 'onPass') return 'Out on Valid Digital Gate Pass';
                      if (val === 'overdue') return 'Overdue / Curfew Alert';
                      return val;
                    }}
                  />
                  <ReferenceLine
                    x="22:30"
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{
                      value: '10:30 PM Mandatory Curfew Audit',
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inRooms"
                    name="inRooms"
                    stackId="1"
                    stroke="#4338ca"
                    fillOpacity={1}
                    fill="url(#colorRooms)"
                  />
                  <Area
                    type="monotone"
                    dataKey="inMessGym"
                    name="inMessGym"
                    stackId="1"
                    stroke="#0891b2"
                    fillOpacity={1}
                    fill="url(#colorMess)"
                  />
                  <Area
                    type="monotone"
                    dataKey="onPass"
                    name="onPass"
                    stackId="1"
                    stroke="#d97706"
                    fillOpacity={1}
                    fill="url(#colorPass)"
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue"
                    name="overdue"
                    stackId="1"
                    stroke="#b91c1c"
                    fillOpacity={1}
                    fill="url(#colorOverdue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Curfew Shift Window (21:30 - 22:30):</strong> 198 gate pass returns converge in 60 minutes. Both security lanes active.
                </span>
              </div>
              <span className="font-mono text-2xs bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 font-semibold shrink-0">
                Gate QR Scanner Peak
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyOccupancyData}
                  margin={{ top: 10, right: 25, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={[0, 900]}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name === 'fullOccupancy') return [`${value} students`, 'Hostel Resident Count'];
                      if (name === 'weekendLeave') return [`${value} students`, 'Weekend Leave to Hometown'];
                      if (name === 'dayPasses') return [`${value} passes`, 'Single Day City Passes'];
                      return [value, name];
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    formatter={(val) => {
                      if (val === 'fullOccupancy') return 'Hostel Resident Count';
                      if (val === 'weekendLeave') return 'Weekend Leave to Hometown';
                      if (val === 'dayPasses') return 'Single Day City Passes';
                      return val;
                    }}
                  />
                  <Bar dataKey="fullOccupancy" name="fullOccupancy" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="weekendLeave" name="weekendLeave" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="dayPasses" name="dayPasses" stackId="a" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-2xs uppercase">Weekday Avg Occupancy</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">837 students (97.7%)</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-2xs uppercase">Friday Exodus Window</div>
                <div className="text-base font-bold text-amber-700 font-mono mt-0.5">128 hometown departs</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-2xs uppercase">Sunday Night Return</div>
                <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">99.1% on-time return</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-slate-500 text-2xs uppercase">Curfew Audit Accuracy</div>
                <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">100% biometrically logged</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TWO-COLUMN DEEP DIVE (BLOCK OCCUPANCY INVENTORY + GATE RUSH DYNAMICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Inventory Capacity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hostel Block Capacity & Bed Utilization</h3>
              <p className="text-xs text-slate-500">Live room inventory across 4 designated wings.</p>
            </div>
            <span className="text-2xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              32 Beds Vacant
            </span>
          </div>

          <div className="space-y-3">
            {blockCapacityData.map((b, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{b.block}</span>
                  <span className="text-2xs font-mono font-bold text-indigo-700">{b.occupancyRate}% Occupied</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.occupancyRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-500 font-mono">
                  <span>Occupied: <strong>{b.occupied}</strong> / {b.totalBeds} beds</span>
                  <span className="text-emerald-700 font-medium">{b.vacant} vacant ({b.gender})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gate Traffic Rush Hours */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Campus Main Gate Traffic Flow</h3>
              <p className="text-xs text-slate-500">Check-outs vs Check-ins by hour to allocate security guards.</p>
            </div>
            <span className="text-2xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Lane 1 & 2 Live
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hourlyGateTraffic}
                margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val, name) => [
                    `${val} scans`,
                    name === 'checkOuts' ? 'Students Exiting Campus' : 'Students Entering Campus',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px' }}
                  formatter={(val) => (val === 'checkOuts' ? 'Exits Logged' : 'Entries (Safe Return)')}
                />
                <Bar dataKey="checkOuts" name="checkOuts" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={12} />
                <Bar dataKey="checkIns" name="checkIns" fill="#10b981" radius={[3, 3, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-2xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span>Peak Exit: <strong>16:00 - 18:00</strong> (Sports/City Outing)</span>
            <span>Peak Return: <strong>20:00 - 22:00</strong> (Pre-Curfew Surge)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
