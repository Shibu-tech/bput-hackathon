import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import {
  Utensils,
  CheckCircle2,
  Clock,
  QrCode,
  ShoppingBag,
  TrendingUp,
  Star,
  ChefHat,
  Search,
  Check,
} from 'lucide-react';

export const MessCafeteriaPortal: React.FC = () => {
  const {
    language,
    messMenu,
    mealRatings,
    cafeteriaOrders,
    updateOrderStatus,
    messCheckIn,
  } = useCampusOps();

  const t = translations[language];

  const [scanRollNumber, setScanRollNumber] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [selectedMealSlot, setSelectedMealSlot] = useState<'lunch' | 'dinner' | 'breakfast'>('dinner');

  const handleValidateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanRollNumber.trim()) return;

    const res = messCheckIn(scanRollNumber);
    if (res.success) {
      setScanResult(`Token Validated! ${res.studentName || scanRollNumber} checked in for dinner.`);
    } else {
      setScanResult(`Token not found for roll number ${scanRollNumber}.`);
    }
    setScanRollNumber('');
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-amber-600 font-semibold">
              Hostel Central Mess & Cafeteria Operations
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Chef Anand (Central Dining Staff)</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            Mess Token Validation & In-Room Delivery Fulfillment
          </h1>
          <p className="text-xs text-slate-500">
            Zero paper meal tokens · Live satisfaction ratings · In-room orders dispatched like commercial delivery apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-amber-600" />
            Active Dinner Service (19:30 - 21:45)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Validation & Dining Check-in */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Mess Dining Hall Token Scan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan student ID to record meal and verify hostel night roll call presence.
              </p>
            </div>

            <form onSubmit={handleValidateToken} className="space-y-2">
              <input
                type="text"
                value={scanRollNumber}
                onChange={(e) => setScanRollNumber(e.target.value)}
                placeholder="Enter or scan Roll Number (e.g. 2024CS0842)"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md cursor-pointer transition-colors shadow-xs"
              >
                Validate Meal Token
              </button>
            </form>

            {scanResult && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                {scanResult}
              </div>
            )}

            {/* Quick pre-select buttons for demo */}
            <div className="pt-2 border-t border-slate-100 text-2xs text-slate-500">
              <span className="font-semibold text-slate-700">Test Dining Scan:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['2024CS0842', '2024CS0850', '2024ME0312'].map((roll) => (
                  <button
                    key={roll}
                    onClick={() => {
                      setScanRollNumber(roll);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-amber-100 font-mono rounded cursor-pointer"
                  >
                    {roll}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meal Satisfaction & Rating Feedback */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Today's Meal Satisfaction</span>
              <span className="text-amber-600 font-mono text-xs">4.4 ★ (380 votes)</span>
            </h3>

            <div className="space-y-2 text-xs">
              {messMenu.lunch.slice(0, 3).map((item) => {
                const rat = mealRatings[item.id] || { rating: 4.5, count: 48 };
                return (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-3xs text-slate-400 capitalize">{item.type} · {item.calories} kcal</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-600 font-mono">{rat.rating} ★</div>
                      <div className="text-3xs text-slate-400">{rat.count} reviews</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* In-Room Cafeteria Delivery Fulfillment Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>Cafeteria In-Room Delivery Orders</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Late-night kitchen fulfillment for student rooms. Verify handoff with student OTP.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">
                {cafeteriaOrders.length} Orders Active
              </span>
            </div>

            <div className="space-y-3">
              {cafeteriaOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {ord.studentName} · Room {ord.roomNumber} ({ord.hostelBlock})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 font-medium">Placed {ord.placedAt}</span>
                      <span
                        className={`text-2xs font-semibold uppercase px-2.5 py-0.5 rounded ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'out_for_delivery'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="text-slate-800">
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between py-0.5">
                          <span>{it.quantity}x {it.item.name}</span>
                          <span className="font-mono text-slate-600">₹{it.item.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                      <span>Total Amount Paid:</span>
                      <span className="font-mono">₹{ord.totalAmount}</span>
                    </div>
                  </div>

                  {/* Order Progress Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-slate-600">
                      Student OTP for handoff: <strong className="font-mono text-indigo-700">{ord.deliveryOtp}</strong>
                    </div>

                    <div className="flex gap-2">
                      {ord.status === 'received' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'preparing')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded cursor-pointer transition-colors"
                        >
                          Mark Preparing
                        </button>
                      )}
                      {ord.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded cursor-pointer transition-colors"
                        >
                          Dispatch to Room
                        </button>
                      )}
                      {ord.status === 'out_for_delivery' && (
                        <button
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Verify OTP & Complete
                        </button>
                      )}
                      {ord.status === 'delivered' && (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Delivered to Room {ord.roomNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
