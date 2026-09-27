import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { ComplaintCategory } from '../../types';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  AlertCircle,
  Check,
} from 'lucide-react';

export const TechnicianPortal: React.FC = () => {
  const { user } = useAuth();
  const techDisplayName = user?.fullName || 'Duty Technician Team';
  const {
    language,
    complaints,
    deduplicatedTickets,
    resolveComplaint,
    resolveDeduplicatedTicket,
    simulateOutageSurge,
  } = useCampusOps();

  const t = translations[language];

  const [selectedTrade, setSelectedTrade] = useState<ComplaintCategory | 'all'>('all');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [activeResolvingId, setActiveResolvingId] = useState<string | null>(null);
  const [isResolvingMaster, setIsResolvingMaster] = useState(false);

  // Filter complaints by trade
  const filteredComplaints = complaints.filter(
    (c) => selectedTrade === 'all' || c.category === selectedTrade,
  );

  const activeMasterTickets = deduplicatedTickets.filter(
    (dt) => (selectedTrade === 'all' || dt.category === selectedTrade) && dt.status !== 'resolved',
  );

  const handleOpenResolveModal = (id: string, isMaster: boolean = false) => {
    setActiveResolvingId(id);
    setIsResolvingMaster(isMaster);
    setResolutionNotes(
      isMaster
        ? 'Replaced rack core switch fiber transceiver and power cycled PoE injector. All student room connections restored.'
        : 'Replaced faulty regulator and tested current draw with multimeter. Working nominally.',
    );
  };

  const handleConfirmResolution = () => {
    if (!activeResolvingId) return;

    if (isResolvingMaster) {
      resolveDeduplicatedTicket(activeResolvingId, resolutionNotes);
    } else {
      resolveComplaint(activeResolvingId, resolutionNotes);
    }

    setActiveResolvingId(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Technician Portal Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-indigo-600 font-semibold">
              Field Operations & Maintenance Desk
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{techDisplayName}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            Direct Technician Queue & Deduplication Engine
          </h1>
          <p className="text-xs text-slate-500">
            No warden middleman delay · Multi-room failures grouped automatically into single actionable jobs.
          </p>
        </div>

        {/* Live Simulation Button for Hackathon Evaluators */}
        <button
          onClick={simulateOutageSurge}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
        >
          <Zap className="w-4 h-4" />
          Simulate Wi-Fi Outage Surge (+6 Reports)
        </button>
      </div>

      {/* Trade Category Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {[
          { id: 'all', label: 'All Open Trades' },
          { id: 'wifi', label: 'Network & Wi-Fi' },
          { id: 'electrical', label: 'Electrical' },
          { id: 'plumbing', label: 'Plumbing' },
          { id: 'carpentry', label: 'Carpentry' },
          { id: 'ac', label: 'HVAC / AC' },
        ].map((trade) => (
          <button
            key={trade.id}
            onClick={() => setSelectedTrade(trade.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${selectedTrade === trade.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {trade.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: MASTER DEDUPLICATED TICKETS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Master Deduplicated Tickets ({activeMasterTickets.length} active clusters)
            </h2>
          </div>
          <span className="text-2xs text-slate-500">
            Resolving one master ticket automatically updates all affected students.
          </span>
        </div>

        {activeMasterTickets.length === 0 ? (
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl text-xs text-purple-900 text-center">
            No recurring multi-room outages detected currently. Try clicking "Simulate Wi-Fi Outage Surge" above to test!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeMasterTickets.map((dt) => (
              <div
                key={dt.id}
                className="border-2 border-purple-400 bg-purple-50/30 rounded-xl p-4 space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded">
                      {dt.masterCode}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{dt.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-purple-600 text-white px-2.5 py-0.5 rounded-full">
                      {dt.affectedCount} Complaints Grouped
                    </span>
                    <button
                      onClick={() => handleOpenResolveModal(dt.id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolve All {dt.affectedCount} Students
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-purple-200 space-y-1.5">
                  <div className="font-medium text-slate-900">
                    Suspected Root Cause: <span className="font-normal text-slate-600">{dt.rootCauseCandidate}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center pt-1 text-2xs text-slate-500">
                    <span className="font-semibold text-slate-700">Affected Rooms:</span>
                    {dt.reportedRooms.map((rm, i) => (
                      <span key={i} className="bg-slate-100 font-mono px-1.5 py-0.5 rounded text-slate-700">
                        {rm}
                      </span>
                    ))}
                    <span className="ml-auto font-mono text-purple-700">{dt.detectedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ALL INDIVIDUAL DIRECT COMPLAINTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Individual Student Direct Ticket Queue ({filteredComplaints.length} tickets)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="pb-2.5">Ticket #</th>
                <th className="pb-2.5">Trade</th>
                <th className="pb-2.5">Location</th>
                <th className="pb-2.5">Student Issue</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Duty Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3 font-mono font-medium text-slate-900">
                    {c.ticketNumber}
                    {c.masterTicketId && (
                      <span className="text-3xs text-purple-600 font-semibold block">Clustered</span>
                    )}
                  </td>
                  <td className="py-3 uppercase font-medium text-slate-700">
                    {c.category}
                  </td>
                  <td className="py-3 text-slate-600">
                    Room {c.roomNumber}
                    <span className="block text-2xs text-slate-400">{c.hostelBlock}</span>
                  </td>
                  <td className="py-3 max-w-sm">
                    <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                    <div className="text-2xs text-slate-500 truncate">{c.description}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${c.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {c.status !== 'resolved' ? (
                      <button
                        onClick={() => handleOpenResolveModal(c.id, false)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-2xs rounded cursor-pointer transition-colors"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-2xs text-emerald-600 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLUTION WORK LOG MODAL */}
      {activeResolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              {isResolvingMaster ? 'Master Group Ticket Resolution' : 'Technician Repair Work Log'}
            </h3>
            <p className="text-slate-500 text-xs">
              {isResolvingMaster
                ? 'This note will automatically resolve all clustered student tickets and dispatch notification.'
                : 'Document repair action taken before closing ticket.'}
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Repair Details & Parts Used</label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveResolvingId(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded cursor-pointer transition-colors"
              >
                Complete & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
