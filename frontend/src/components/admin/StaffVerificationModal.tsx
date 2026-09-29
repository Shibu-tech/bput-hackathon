import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { StaffRegistrationRequest } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ExternalLink,
  Clock,
  Mail,
  Phone,
  Building,
  UserCheck,
  AlertCircle,
  X,
  Eye,
  Download,
  Filter,
} from 'lucide-react';

interface StaffVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffVerificationModal: React.FC<StaffVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { staffRequests, approveStaffRequest, rejectStaffRequest } = useCampusOps();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<{ name: string; url?: string } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCount = staffRequests.length;
  const pendingCount = staffRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = staffRequests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = staffRequests.filter((r) => r.status === 'REJECTED').length;

  const filteredRequests = staffRequests.filter((req) => {
    if (activeFilter !== 'ALL' && req.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.fullName.toLowerCase().includes(q) ||
        req.employeeId.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.phoneNumber.includes(q) ||
        req.role.toLowerCase().includes(q) ||
        (req.designation && req.designation.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleApprove = async (id: string, name: string) => {
    await approveStaffRequest(id, 'Approved & verified by Super Admin');
    setActionSuccessMsg(`Staff member ${name} has been successfully verified & approved.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    const target = staffRequests.find((r) => r.id === rejectingId);
    await rejectStaffRequest(rejectingId, rejectionReason.trim() || 'Criteria not met');
    setActionSuccessMsg(`Staff application for ${target?.fullName || 'candidate'} was marked as rejected.`);
    setRejectingId(null);
    setRejectionReason('');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Staff Registration Verification</h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Verify employee credentials, authenticate attached offer letters, and approve portal access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback toast */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Toolbar: Stats & Filters */}
        <div className="p-4 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter('PENDING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter('APPROVED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setActiveFilter('REJECTED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, EMP ID, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Main List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No staff requests found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeFilter !== 'ALL'
                  ? `There are currently no staff registration requests in the "${activeFilter}" category.`
                  : 'New staff registrations will appear here for verification and approval.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row: Info & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                      {req.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">{req.fullName}</h3>
                        <span className="font-mono text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {req.employeeId}
                        </span>
                        <span className="text-2xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {req.roleLabel || req.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {req.designation || 'Staff Member'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {req.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Verification Pending
                      </span>
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified & Approved
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Contact & Document Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Contact Info */}
                  <div className="space-y-2 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email:</span>
                      <strong className="text-slate-800">{req.email || 'N/A'}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone:</span>
                      <strong className="text-slate-800">{req.phoneNumber}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Submitted:</span>
                      <span className="text-slate-700">{req.createdAt || 'Recent'}</span>
                    </div>
                    {req.verificationNotes && (
                      <div className="pt-1 border-t border-slate-200 text-slate-500 text-2xs italic">
                        Note: {req.verificationNotes}
                      </div>
                    )}
                  </div>

                  {/* Offer Letter Box */}
                  <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                          Attached Offer Letter
                        </span>
                        <span className="text-2xs text-emerald-600 font-medium">Uploaded</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200">
                        <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {req.offerLetterName || `${req.fullName.replace(/\s+/g, '_')}_Offer_Letter.pdf`}
                          </p>
                          <p className="text-2xs text-slate-400">Official Employment Appointment Letter</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedDocument({
                            name: req.offerLetterName || 'Offer Letter',
                            url: req.offerLetterUrl,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Document
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                {req.status === 'PENDING' && (
                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      onClick={() => setRejectingId(req.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id, req.fullName)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-xs rounded-lg cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept & Verify Staff
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rejection Modal Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Reject Staff Registration</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to reject this registration request? You may provide a reason.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Offer letter unverified, designation mismatch..."
                rows={3}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason('');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">{selectedDocument.name}</h3>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[350px] max-h-[500px] overflow-auto">
              {selectedDocument.url && selectedDocument.url.startsWith('data:image') ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-h-[460px] object-contain rounded-lg shadow-xs"
                />
              ) : selectedDocument.url && selectedDocument.url.startsWith('http') ? (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-h-[460px] object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{selectedDocument.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Official Employment Contract & Offer Document</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                    Digital Seal & Signature Verified
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Done Viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
