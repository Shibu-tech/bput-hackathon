import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { PassType, ComplaintCategory, ComplaintPriority } from '../../types';
import {
  QrCode,
  DoorClosed,
  Wrench,
  Utensils,
  GraduationCap,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ThumbsUp,
  ShoppingBag,
  Send,
  Star,
  ShieldCheck,
  Building,
  User,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import cafeteriaMealImg from '../../assets/images/cafeteria_meal_tray_1790190017280.jpg';

export const StudentPortal: React.FC = () => {
  const {
    language,
    lowDataMode,
    gatePasses,
    requestGatePass,
    issueGatePassQr,
    complaints,
    createComplaint,
    upvoteComplaint,
    messMenu,
    rateMealItem,
    mealRatings,
    cafeteriaOrders,
    placeCafeteriaOrder,
    rooms,
    bookBed,
  } = useCampusOps();

  const t = translations[language];

  // Active sub-tab for student portal
  const [activeTab, setActiveTab] = useState<'passes' | 'rooms' | 'complaints' | 'mess' | 'academics'>('passes');

  // Gate Pass Form State
  const [showPassModal, setShowPassModal] = useState(false);
  const [passType, setPassType] = useState<PassType>('late_night');
  const [purpose, setPurpose] = useState('Central Library Research & Lab Assignment');
  const [destination, setDestination] = useState('Campus Central Library');
  const [outTime, setOutTime] = useState('21:00');
  const [expectedInTime, setExpectedInTime] = useState('00:30');
  const [parentPhone, setParentPhone] = useState('+91 98451 22910');
  const [passSuccessMessage, setPassSuccessMessage] = useState('');

  // Complaint Form State
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState<ComplaintCategory>('electrical');
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPriority, setComplaintPriority] = useState<ComplaintPriority>('medium');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  // Cafeteria Ordering State
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const { user } = useAuth();
  const studentDisplayName = user?.fullName || 'Student';
  const studentRoll = user?.phoneNumber ? `STU-${user.phoneNumber.slice(-4)}` : 'STU-1001';
  const studentPhone = user?.phoneNumber || '+91 98451 22910';
  const studentInitials = studentDisplayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  // Roommate preferences for booking
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedBedLabel, setSelectedBedLabel] = useState<'A' | 'B' | null>(null);
  const [habitTags, setHabitTags] = useState<string[]>(['Night Owl (Coding)', 'Clean Desk']);
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Random QR generation state
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const handleRefreshQr = async (passId: string) => {
    if (!passId) return;
    setIsGeneratingQr(true);
    try {
      await issueGatePassQr(passId);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // Filter student passes for current logged-in student
  const myPasses = gatePasses.filter(
    (p) => p.rollNumber === studentRoll || p.studentName === studentDisplayName
  );
  const activePass = myPasses.find((p) => p.status === 'approved' || p.status === 'checked_out' || p.status === 'pending');

  const myComplaints = complaints.filter(
    (c) => c.rollNumber === studentRoll || c.studentName === studentDisplayName
  );

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await requestGatePass({
      studentName: studentDisplayName,
      rollNumber: studentRoll,
      roomNumber: user?.roomNumber || '101',
      hostelBlock: user?.hostel || 'Hostel A',
      passType,
      purpose,
      destination,
      outTime,
      expectedInTime,
      parentConsentVerified: true,
      parentPhone: parentPhone || studentPhone,
    });
    setPassSuccessMessage(`Gate pass requested successfully! Pass code: ${created.passCode}`);
    setTimeout(() => {
      setShowPassModal(false);
      setPassSuccessMessage('');
    }, 1800);
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintTitle.trim()) return;

    createComplaint({
      category: complaintCategory,
      title: complaintTitle,
      description: complaintDesc || 'Direct complaint logged from hostel room.',
      studentName: studentDisplayName,
      rollNumber: studentRoll,
      roomNumber: user?.roomNumber || '101',
      hostelBlock: user?.hostel || 'Hostel A',
      priority: complaintPriority,
    });

    setComplaintSuccess('Complaint logged! Bypassed warden & assigned directly to technician.');
    setComplaintTitle('');
    setComplaintDesc('');
    setTimeout(() => {
      setShowComplaintModal(false);
      setComplaintSuccess('');
    }, 1800);
  };

  const handleAddToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[itemId] > 1) {
        copy[itemId] -= 1;
      } else {
        delete copy[itemId];
      }
      return copy;
    });
  };

  const handlePlaceOrder = () => {
    const items = Object.entries(cart).map(([itemId, qty]) => {
      const item = [
        { id: 'c-1', name: 'Paneer Tikka Kathi Roll', price: 90, category: 'quick_bites' as const, veg: true, prepTimeMinutes: 15, available: true },
        { id: 'c-3', name: 'Cheese Maggi Noodles with Veggies', price: 65, category: 'snacks' as const, veg: true, prepTimeMinutes: 10, available: true },
        { id: 'c-4', name: 'Iced Cold Coffee with Vanilla Scoop', price: 75, category: 'beverages' as const, veg: true, prepTimeMinutes: 5, available: true },
        { id: 'c-6', name: 'Midnight Veg Biryani Bowl', price: 130, category: 'meals' as const, veg: true, prepTimeMinutes: 20, available: true },
      ].find((i) => i.id === itemId)!;
      return { item, quantity: qty };
    });

    const total = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const newOrder = placeCafeteriaOrder(items, total);
    setCart({});
    const assignedRoom = user?.roomNumber || '101';
    setOrderSuccess(`Order placed! Delivery to Room ${assignedRoom}. OTP: ${newOrder.deliveryOtp}`);
    setTimeout(() => setOrderSuccess(null), 4000);
  };

  const handleConfirmRoomBooking = () => {
    if (!selectedRoomId || !selectedBedLabel) return;
    const targetRoom = rooms.find((r) => r.id === selectedRoomId);
    const ok = bookBed(selectedRoomId, selectedBedLabel, studentDisplayName, studentRoll, habitTags);
    if (ok) {
      setBookingSuccess(
        `Room switched to ${targetRoom?.roomNumber || ''} (Bed ${selectedBedLabel}) in ${targetRoom?.block || ''}!`
      );
      setTimeout(() => {
        setSelectedRoomId(null);
        setSelectedBedLabel(null);
        setBookingSuccess('');
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Quick Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {studentInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{studentDisplayName}</h1>
              <span className="text-xs text-slate-500 font-mono">{studentRoll}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{user?.hostel || 'Hostel A'} · Room {user?.roomNumber || '101'} (Bed {user?.bedLabel || 'A'})</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 font-medium">Verified Student Account</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {[
            { id: 'passes', label: 'Gate Pass', icon: QrCode },
            { id: 'rooms', label: 'Room & Roommate', icon: DoorClosed },
            { id: 'complaints', label: 'Maintenance', icon: Wrench },
            { id: 'mess', label: 'Mess & Dining', icon: Utensils },
            { id: 'academics', label: 'Academics & Dues', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: GATE PASS WORKFLOW */}
      {activeTab === 'passes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Pass Card / Dynamic QR Code */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Current Pass Status
              </span>
              <button
                onClick={() => setShowPassModal(true)}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Request
              </button>
            </div>

            {activePass ? (
              <div className="space-y-4">
                <div className="bg-slate-900 text-white rounded-xl p-5 text-center relative overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-2xs font-mono bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 rounded text-indigo-200">
                      Issue #{activePass.issueCount || 1}
                    </span>
                    <span className="text-2xs font-mono bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="text-2xs uppercase tracking-widest text-slate-300 font-semibold mb-0.5">
                    {activePass.passType.replace('_', ' ')} PASS
                  </div>
                  <div className="text-xl font-bold font-mono tracking-wider text-indigo-300">
                    {activePass.qrCode || activePass.passCode}
                  </div>

                  {/* Real QR Display (Backend Generated Base64 Data URL) */}
                  <div className="my-3 mx-auto w-40 h-40 bg-white p-2 rounded-xl flex flex-col items-center justify-center shadow-lg border border-slate-200 relative group">
                    {activePass.qrImage ? (
                      <img
                        src={activePass.qrImage}
                        alt="Gate Pass QR Code"
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded items-center justify-center">
                        <QrCode className="w-10 h-10 text-white animate-pulse mx-auto col-span-6" />
                      </div>
                    )}
                  </div>

                  {/* Re-Issue Fresh Random QR Button */}
                  <div className="flex justify-center mb-3">
                    <button
                      onClick={() => handleRefreshQr(activePass.id)}
                      disabled={isGeneratingQr || activePass.status === 'completed' || activePass.status === 'rejected'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-lg text-2xs font-medium cursor-pointer transition-all border border-white/20 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Issue a fresh, random QR code and update database"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingQr ? 'animate-spin' : ''}`} />
                      {isGeneratingQr ? 'Updating DB...' : 'Re-issue Fresh QR'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-200 font-medium">
                    Show this QR at Campus Gate 1 or 2
                  </div>
                  <div className="text-2xs text-slate-400 mt-1">
                    Valid Return Deadline: <strong>{activePass.expectedInTime}</strong>
                  </div>
                </div>

                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-medium text-slate-900">{activePass.destination}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Scheduled Out:</span>
                    <span className="font-medium text-slate-900">{activePass.outTime}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Parent Verified:</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SMS Sent
                    </span>
                  </div>
                  {activePass.approvedBy && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Approved By:</span>
                      <span className="font-medium text-slate-900 text-right">{activePass.approvedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <DoorClosed className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-700">No Active Pass</div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Planning an outing or weekend leave? Submit a digital request to skip warden physical signatures.
                </p>
                <button
                  onClick={() => setShowPassModal(true)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Request Gate Pass
                </button>
              </div>
            )}
          </div>

          {/* Pass History Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Gate Clearance & Movement History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-2.5">Pass ID</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">Purpose & Destination</th>
                    <th className="pb-2.5">Timing</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gatePasses.map((p) => {
                    const isMyPass = p.rollNumber === studentRoll;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/80 ${isMyPass ? 'bg-indigo-50/30' : ''}`}>
                        <td className="py-3 font-mono font-medium text-slate-900">
                          {p.passCode}
                          {isMyPass && <span className="text-2xs text-indigo-600 block">You</span>}
                        </td>
                        <td className="py-3 capitalize text-slate-700">
                          {p.passType.replace('_', ' ')}
                        </td>
                        <td className="py-3 max-w-xs truncate text-slate-600">
                          <span className="font-medium text-slate-800">{p.destination}</span>
                          <span className="block text-2xs text-slate-400">{p.purpose}</span>
                        </td>
                        <td className="py-3 font-mono text-slate-600 text-2xs">
                          Out: {p.actualOutTime || p.outTime}
                          <br />
                          In: {p.actualInTime || p.expectedInTime}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${
                              p.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : p.status === 'checked_out'
                                ? 'bg-blue-50 text-blue-700'
                                : p.status === 'completed'
                                ? 'bg-slate-100 text-slate-600'
                                : p.status === 'overdue'
                                ? 'bg-red-50 text-red-700 font-bold'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {p.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: SMART ROOM & ROOMMATE SELECTION */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Smart Hostel Room & Roommate Selection
                </h2>
                <p className="text-xs text-slate-500">
                  Choose your room and see prospective roommates habits before confirming. Zero physical queues at admission.
                </p>
              </div>
              <div className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                Current Assigned: Room {user?.roomNumber || '101'}, Bed {user?.bedLabel || 'A'} ({user?.hostel || 'Hostel A'})
              </div>
            </div>

            {bookingSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                {bookingSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const vacantBeds = room.beds.filter((b) => !b.isOccupied);

                return (
                  <div
                    key={room.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-50 bg-indigo-50/10'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-bold text-slate-900">Room {room.roomNumber}</span>
                        <span className="text-xs text-slate-500 ml-2">{room.block} · Floor {room.floor}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-600 capitalize">
                        {vacantBeds.length} Vacant {vacantBeds.length === 1 ? 'Bed' : 'Beds'}
                      </span>
                    </div>

                    {/* Amenities list */}
                    <div className="flex flex-wrap gap-1.5 my-3 text-2xs text-slate-500">
                      {room.amenities.map((a, i) => (
                        <span key={i} className="bg-slate-100 px-2 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                    </div>

                    {/* Beds and Roommates details */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`p-2.5 rounded-lg border text-xs ${
                            bed.isOccupied
                              ? 'bg-slate-50 border-slate-200 text-slate-600'
                              : isSelected && selectedBedLabel === bed.bedLabel
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:border-emerald-400 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!bed.isOccupied) {
                              setSelectedRoomId(room.id);
                              setSelectedBedLabel(bed.bedLabel);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>Bed {bed.bedLabel}</span>
                            <span className="text-2xs font-normal">
                              {bed.isOccupied ? 'Occupied' : 'Vacant (Select)'}
                            </span>
                          </div>

                          {bed.occupant ? (
                            <div className="mt-1.5 space-y-1">
                              <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{studentDisplayName}</span>
                                <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                  (You)
                                </span>
                              </div>
                              <div className="text-2xs text-slate-500">
                                {bed.occupant.branch || 'Computer Science'} · {bed.occupant.year || '1st Year'}
                              </div>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {(bed.occupant.habits || habitTags).map((h, i) => (
                                  <span key={i} className="text-3xs bg-white/80 border border-slate-200 px-1 rounded text-slate-600">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-2xs text-emerald-700">
                              Click to claim Bed {bed.bedLabel}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Bed Booking CTA */}
                    {isSelected && selectedBedLabel && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-indigo-900">
                          Selected: Room {room.roomNumber} (Bed {selectedBedLabel})
                        </span>
                        <button
                          onClick={handleConfirmRoomBooking}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                        >
                          Lock & Confirm Bed
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: DIRECT COMPLAINT TICKETING */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Direct Maintenance Ticketing (No Middleman Warden)
                </h2>
                <p className="text-xs text-slate-500">
                  Tickets route straight to duty technicians. Recurring issues auto-grouped via intelligent deduplication.
                </p>
              </div>
              <button
                onClick={() => setShowComplaintModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Maintenance Issue
              </button>
            </div>

            {/* Complaints List */}
            <div className="space-y-3">
              {complaints.map((c) => {
                const isMine = c.rollNumber === studentRoll;
                return (
                  <div
                    key={c.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isMine ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{c.ticketNumber}</span>
                        <span className="text-xs uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {c.category}
                        </span>
                        {c.masterTicketId && (
                          <span className="text-2xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" />
                            Grouped with Wing Outage
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${
                            c.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => upvoteComplaint(c.id)}
                          title="I also experience this problem"
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2 py-1 rounded border border-slate-200 cursor-pointer transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span className="font-mono tabular-nums text-xs">{c.upvotes}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 mt-2">{c.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{c.description}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-slate-100 text-2xs text-slate-500">
                      <span>Room {c.roomNumber} ({c.hostelBlock})</span>
                      <span aria-hidden="true">·</span>
                      <span>Assigned Trade: <strong>{c.assignedTrade || c.category}</strong></span>
                      {c.assignedTo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Duty Technician: <strong>{c.assignedTo}</strong></span>
                        </>
                      )}
                      {c.resolutionNotes && (
                        <div className="w-full text-emerald-700 font-medium bg-emerald-50 p-2 rounded mt-1">
                          Resolution: {c.resolutionNotes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: MESS MENU & IN-ROOM CAFETERIA DELIVERY */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          {/* Today's Mess Menu */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Hostel Central Dining Hall Menu ({messMenu.day})
                </h2>
                <p className="text-xs text-slate-500">
                  Early menu visibility so you can plan meals, prevent wastage, and submit instant feedback.
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded">
                Mess Token: #2024CS0842 (Auto-verified)
              </span>
            </div>

            {!lowDataMode && (
              <div className="relative h-36 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                <img
                  src={cafeteriaMealImg}
                  alt="Hostel Fresh Balanced Meal Tray"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent flex items-center p-5">
                  <div className="text-white max-w-sm">
                    <div className="text-2xs uppercase tracking-wider font-semibold text-amber-300">
                      Standard Nutrient Balanced Thali
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      Hot Fresh Meals Prepared in Hygienic Central Kitchen
                    </div>
                    <div className="text-2xs text-slate-200 mt-1">
                      Pure Ghee Phulkas, Paneer Butter Masala, Yellow Tadka Dal & Fresh Mint Chaas
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'Breakfast (07:30 - 09:30)', items: messMenu.breakfast },
                { title: 'Lunch (12:30 - 14:30)', items: messMenu.lunch },
                { title: 'Evening Snacks (17:00 - 18:00)', items: messMenu.snacks },
                { title: 'Dinner (19:30 - 21:45)', items: messMenu.dinner },
              ].map((slot, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                    {slot.title}
                  </div>
                  <div className="space-y-2">
                    {slot.items.map((item) => {
                      const ratingData = mealRatings[item.id] || { rating: 4.2, count: 18 };
                      return (
                        <div key={item.id} className="text-xs bg-white p-2 rounded border border-slate-100 space-y-1">
                          <div className="font-medium text-slate-900 leading-snug">
                            {item.name}
                          </div>
                          {item.nameRegional && (
                            <div className="text-3xs text-slate-400">
                              {item.nameRegional}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-3xs text-slate-500 pt-1">
                            <span className="capitalize">{item.type} · {item.calories} kcal</span>
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span className="font-mono">{ratingData.rating}</span>
                              <button
                                onClick={() => rateMealItem(item.id, 5)}
                                title="Rate 5 stars"
                                className="text-indigo-600 hover:underline cursor-pointer ml-1"
                              >
                                Rate
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In-Room Cafeteria Delivery (Commercial food app experience) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Midnight & In-Room Cafeteria Delivery</span>
                  <span className="text-2xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Open till 02:00 AM
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Delivered directly to {user?.hostel || 'Hostel A'}, Room {user?.roomNumber || '101'} with secure OTP delivery handoff.
                </p>
              </div>

              {Object.keys(cart).length > 0 && (
                <button
                  onClick={handlePlaceOrder}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Place Delivery Order ({Object.values(cart).reduce((a, b) => a + b, 0)} items)
                </button>
              )}
            </div>

            {orderSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                {orderSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'c-1', name: 'Paneer Tikka Kathi Roll', price: 90, prep: '15m', tag: 'Chef Special' },
                { id: 'c-3', name: 'Cheese Maggi Noodles', price: 65, prep: '10m', tag: 'Midnight Favorite' },
                { id: 'c-4', name: 'Iced Cold Coffee with Scoop', price: 75, prep: '5m', tag: 'Chilled' },
                { id: 'c-6', name: 'Midnight Veg Biryani Bowl', price: 130, prep: '20m', tag: 'Filling' },
              ].map((food) => {
                const count = cart[food.id] || 0;
                return (
                  <div key={food.id} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                    <div className="flex items-center justify-between text-2xs text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                        {food.tag}
                      </span>
                      <span>{food.prep}</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900">{food.name}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-xs font-bold text-slate-900">₹{food.price}</span>
                      <div className="flex items-center gap-1.5">
                        {count > 0 && (
                          <>
                            <button
                              onClick={() => handleRemoveFromCart(food.id)}
                              className="w-6 h-6 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono font-medium px-1">{count}</span>
                          </>
                        )}
                        <button
                          onClick={() => handleAddToCart(food.id)}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Delivery Orders */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-700 mb-2">Live In-Room Delivery Orders</h3>
              <div className="space-y-2">
                {cafeteriaOrders.map((o) => (
                  <div key={o.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                        <span className="text-2xs font-semibold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {o.status.replace('_', ' ')}
                        </span>
                        <span className="text-slate-500">Room {o.roomNumber} ({o.hostelBlock})</span>
                      </div>
                      <div className="text-2xs text-slate-500 mt-1">
                        {o.items.map((it) => `${it.quantity}x ${it.item.name}`).join(', ')} · Total ₹{o.totalAmount}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xs text-slate-500">Handoff OTP:</div>
                      <div className="font-mono font-bold text-sm text-indigo-600 tracking-wider">
                        {o.deliveryOtp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: ACADEMICS & NO-DUES CLEARANCES */}
      {activeTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Academic Attendance & Schedule Visibility
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-2xs uppercase text-slate-500 font-semibold">
                  Cumulative Semester Attendance
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                  88.5%
                </div>
                <div className="text-2xs text-slate-500 mt-0.5">Above mandatory 75% threshold</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-700 bg-white">
                Safe
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-slate-700">Today's Class Timetable</div>
              {[
                { time: '09:00 - 10:30', course: 'CS301: Advanced Data Structures & Algorithms', hall: 'Lecture Hall 102' },
                { time: '11:00 - 12:30', course: 'CS304: Computer Networks & Socket Programming', hall: 'Lab 4 (Systems Wing)' },
                { time: '14:30 - 16:00', course: 'CS309: Cloud & Distributed Operating Systems', hall: 'Seminar Room B' },
              ].map((c, i) => (
                <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-900">{c.course}</div>
                    <div className="text-2xs text-slate-500">{c.hall}</div>
                  </div>
                  <span className="font-mono text-2xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {c.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Zero-Queue Clearance & No-Dues Certificate
            </h2>
            <p className="text-xs text-slate-500">
              Digital automated reconciliation across hostel, central library, laboratory, and accounts departments.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { dept: 'Hostel Maintenance & Mess Fee', status: 'Cleared (Nil)', verified: true },
                { dept: 'Central University Library', status: 'Cleared (0 Books Overdue)', verified: true },
                { dept: 'Computer Science Department Lab', status: 'Equipment Returned', verified: true },
                { dept: 'Sports Equipment & Gym Store', status: 'No Active Borrows', verified: true },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">{d.dept}</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1 text-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {d.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Digital Signed No-Dues Certificate verified! PDF generated with university cryptographic seal.')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer text-center"
            >
              Download Provisional No-Dues Certificate (PDF)
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST GATE PASS */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Request Digital Gate Pass</h3>
              <button onClick={() => setShowPassModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            </div>

            {passSuccessMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg text-center">
                {passSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleCreatePass} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pass Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'late_night', label: 'Late Night' },
                      { id: 'weekend_leave', label: 'Weekend Leave' },
                      { id: 'day', label: 'Day Pass' },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setPassType(t.id as PassType)}
                        className={`py-2 text-center rounded border cursor-pointer ${
                          passType === t.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Central City Library, Pune Hometown, etc."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Brief description for security records"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Out Time</label>
                    <input
                      type="text"
                      value={outTime}
                      onChange={(e) => setOutTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expected In Time</label>
                    <input
                      type="text"
                      value={expectedInTime}
                      onChange={(e) => setExpectedInTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone (SMS Verification)</label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono"
                  />
                  <span className="text-3xs text-slate-400 mt-0.5 block">
                    Automated SMS consent link will be dispatched immediately.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow-xs"
                  >
                    Submit Gate Pass
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: LOG MAINTENANCE COMPLAINT */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Log Maintenance Issue</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            </div>

            {complaintSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg text-center">
                {complaintSuccess}
              </div>
            ) : (
              <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trade Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'electrical', label: '⚡ Electrical' },
                      { id: 'plumbing', label: '🚰 Plumbing' },
                      { id: 'wifi', label: '📶 Wi-Fi / IT' },
                      { id: 'carpentry', label: '🪑 Carpentry' },
                      { id: 'ac', label: '❄️ AC / HVAC' },
                      { id: 'cleaning', label: '🧹 Housekeeping' },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setComplaintCategory(cat.id as ComplaintCategory)}
                        className={`py-2 px-1 text-center rounded border cursor-pointer ${
                          complaintCategory === cat.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Summary</label>
                  <input
                    type="text"
                    required
                    value={complaintTitle}
                    onChange={(e) => setComplaintTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                    placeholder="e.g. Broken switch socket, leaking washroom tap"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                    placeholder="Provide specific details to help the duty technician bring proper replacement parts..."
                  />
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600 text-2xs flex items-center justify-between">
                  <span>Location: Room {user?.roomNumber || '101'} · {user?.hostel || 'Hostel A'}</span>
                  <span className="text-indigo-600 font-semibold">Auto-routed to trade</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComplaintModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded"
                  >
                    Assign Directly to Technician
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
