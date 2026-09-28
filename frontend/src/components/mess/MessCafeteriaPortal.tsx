import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import { CafeteriaItem } from '../../types';
import {
  Utensils,
  CheckCircle2,
  Clock,
  ShoppingBag,
  TrendingUp,
  Star,
  ChefHat,
  Search,
  Check,
  Plus,
  Pencil,
  Trash2,
  X,
  XCircle,
  AlertCircle,
  Filter,
  Package,
} from 'lucide-react';

export const MessCafeteriaPortal: React.FC = () => {
  const {
    language,
    messMenu,
    mealRatings,
    cafeteriaOrders,
    updateOrderStatus,
    cafeteriaMenu,
    addCafeteriaItem,
    updateCafeteriaItem,
    deleteCafeteriaItem,
    toggleCafeteriaItemStock,
  } = useCampusOps();

  const t = translations[language];

  // Active sub-tab: 'orders' | 'menu'
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  // Menu Search & Filter
  const [menuSearch, setMenuSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'quick_bites' | 'snacks' | 'beverages' | 'meals'>('all');

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CafeteriaItem | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>(80);
  const [formCategory, setFormCategory] = useState<'quick_bites' | 'snacks' | 'beverages' | 'meals'>('quick_bites');
  const [formVeg, setFormVeg] = useState(true);
  const [formPrepTime, setFormPrepTime] = useState<number | ''>(15);
  const [formTag, setFormTag] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ratings calculation
  const reviewedOrders = cafeteriaOrders.filter((o) => typeof o.rating === 'number');
  const avgCafeteriaRating =
    reviewedOrders.length > 0
      ? (
          reviewedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / reviewedOrders.length
        ).toFixed(1)
      : '5.0';

  const activeOrdersCount = cafeteriaOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const inStockCount = cafeteriaMenu.filter((i) => i.available).length;
  const outOfStockCount = cafeteriaMenu.filter((i) => !i.available).length;

  // Handlers for Menu Management
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormPrice(80);
    setFormCategory('quick_bites');
    setFormVeg(true);
    setFormPrepTime(15);
    setFormTag('Chef Special');
    setFormAvailable(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CafeteriaItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormVeg(item.veg);
    setFormPrepTime(item.prepTimeMinutes);
    setFormTag(item.tag || '');
    setFormAvailable(item.available);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice === '') return;

    if (editingItem) {
      updateCafeteriaItem(editingItem.id, {
        name: formName.trim(),
        price: Number(formPrice),
        category: formCategory,
        veg: formVeg,
        prepTimeMinutes: Number(formPrepTime) || 10,
        tag: formTag.trim() || undefined,
        available: formAvailable,
      });
      setToastMessage(`"${formName}" updated successfully! Changes reflected in student portal.`);
    } else {
      addCafeteriaItem({
        name: formName.trim(),
        price: Number(formPrice),
        category: formCategory,
        veg: formVeg,
        prepTimeMinutes: Number(formPrepTime) || 10,
        tag: formTag.trim() || undefined,
        available: formAvailable,
      });
      setToastMessage(`"${formName}" added to delivery menu! Ready for student orders.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the cafeteria menu? It will no longer appear in the student portal.`)) {
      deleteCafeteriaItem(id);
      setToastMessage(`"${name}" removed from cafeteria menu.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleToggleStock = (id: string, currentAvailable: boolean, name: string) => {
    toggleCafeteriaItemStock(id);
    const newStatus = !currentAvailable ? 'In Stock (Stock In)' : 'Out of Stock (Stock Out)';
    setToastMessage(`"${name}" marked as ${newStatus}. Reflected directly in Student Portal.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered menu
  const filteredMenu = cafeteriaMenu.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.tag && item.tag.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Sub-Tab Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-amber-600 font-semibold">
              Hostel Central Mess & Cafeteria Operations
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Chef Anand (Kitchen Staff)</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            Cafeteria Operations, Menu Management & In-Room Delivery
          </h1>
          <p className="text-xs text-slate-500">
            Real-time menu editing · Live Stock In/Out controls · Direct sync with Student Portal ordering.
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Delivery Orders</span>
            {activeOrdersCount > 0 && (
              <span className="ml-1 text-3xs font-mono font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span>Menu & Stock Control</span>
            <span className="ml-1 text-3xs font-mono font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-full">
              {cafeteriaMenu.length}
            </span>
            {outOfStockCount > 0 && (
              <span className="text-3xs font-mono font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-full" title="Items currently Stock Out">
                {outOfStockCount} out
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: LIVE DELIVERY ORDERS */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Meal Satisfaction & Cafeteria Reviews */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Menu Stock Overview Pill */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Cafeteria Menu Status</div>
                <div className="text-2xs text-slate-500 mt-0.5">
                  {inStockCount} In Stock · {outOfStockCount} Stock Out
                </div>
              </div>
              <button
                onClick={() => setActiveTab('menu')}
                className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors"
              >
                Manage Menu →
              </button>
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

            {/* Cafeteria Delivery Food Reviews Feed */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Cafeteria Food Reviews</span>
                </span>
                <span className="text-amber-600 font-mono text-xs font-bold">
                  {avgCafeteriaRating} ★ ({reviewedOrders.length})
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                {reviewedOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">
                    No delivery reviews submitted yet.
                  </p>
                ) : (
                  reviewedOrders.slice(0, 4).map((rev) => (
                    <div key={rev.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-2xs">
                          {rev.studentName} · Room {rev.roomNumber}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 font-mono font-bold text-2xs">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      {rev.review && (
                        <p className="text-2xs text-slate-600 italic">
                          "{rev.review}"
                        </p>
                      )}
                      <div className="text-3xs text-slate-400 font-mono">
                        {rev.items.map((i) => i.item.name).join(', ')} · {rev.reviewedAt || rev.placedAt}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* In-Room Cafeteria Delivery Fulfillment Board */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    <span>Cafeteria In-Room Delivery Orders</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Late-night kitchen fulfillment for student rooms. Verify handoff with student OTP.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>Manage Menu</span>
                  </button>
                  <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">
                    {cafeteriaOrders.length} Total Orders
                  </span>
                </div>
              </div>

              {/* Satisfaction Summary Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Cafeteria Food Satisfaction & Rating:</span>
                      <span className="font-mono font-extrabold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                        ★ {avgCafeteriaRating} / 5.0
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      Based on {reviewedOrders.length} student delivery feedback{reviewedOrders.length === 1 ? '' : 's'} · Verified room handoff reviews
                    </p>
                  </div>
                </div>

                <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live Student Reviews Active
                </span>
              </div>

              <div className="space-y-3">
                {cafeteriaOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No orders placed yet. Orders from the Student Portal will appear here in real time.
                  </p>
                ) : (
                  cafeteriaOrders.map((ord) => (
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
                                : ord.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
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
                          <span>Total Amount:</span>
                          <span className="font-mono text-sm">₹{ord.totalAmount}</span>
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
                          {ord.status === 'cancelled' && (
                            <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                              Cancelled by Student
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delivered Order Food Rating & Review Display */}
                      {ord.status === 'delivered' && (
                        <div className="pt-2 border-t border-slate-100">
                          {ord.rating ? (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex text-amber-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${
                                          i < ord.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-bold text-xs text-amber-950 font-mono">
                                    Student Food Rating: {ord.rating} / 5.0
                                  </span>
                                  <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                    Verified Feedback
                                  </span>
                                </div>
                                {ord.reviewedAt && (
                                  <span className="text-3xs text-slate-400 font-mono">Reviewed at {ord.reviewedAt}</span>
                                )}
                              </div>
                              {ord.review ? (
                                <div className="text-xs text-slate-800 bg-white p-2.5 rounded border border-amber-100/90 italic">
                                  "{ord.review}"
                                </div>
                              ) : (
                                <div className="text-2xs text-slate-400 italic">Rated {ord.rating} stars without written comments.</div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2 bg-slate-100/70 border border-slate-200 rounded text-2xs text-slate-500 flex items-center gap-1.5 italic">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Delivered to student · Awaiting food rating & review submission</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MENU & STOCK MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Menu Overview Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase text-slate-500 tracking-wider">
                  Total Menu Items
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {cafeteriaMenu.length}
                </div>
                <span className="text-3xs text-slate-400">Available across all categories</span>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Utensils className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase text-slate-500 tracking-wider">
                  In Stock (Stock In)
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                  {inStockCount}
                </div>
                <span className="text-3xs text-emerald-600 font-medium">Active in Student Portal</span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase text-slate-500 tracking-wider">
                  Stock Out (Sold Out)
                </span>
                <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                  {outOfStockCount}
                </div>
                <span className="text-3xs text-rose-600 font-medium">Disabled for ordering</span>
              </div>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase text-slate-500 tracking-wider">
                  Dietary Breakdown
                </span>
                <div className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {cafeteriaMenu.filter((i) => i.veg).length} Veg
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {cafeteriaMenu.filter((i) => !i.veg).length} Non-Veg
                  </span>
                </div>
                <span className="text-3xs text-slate-400 mt-1 block">Live kitchen inventory</span>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item by name or tag..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-52 sm:w-64"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'quick_bites', label: 'Quick Bites' },
                  { id: 'snacks', label: 'Snacks' },
                  { id: 'beverages', label: 'Beverages' },
                  { id: 'meals', label: 'Meals' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-1 text-2xs font-semibold rounded-md transition-colors cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                No menu items found matching "{menuSearch}".
              </div>
            ) : (
              filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs space-y-3 transition-all ${
                    !item.available ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            item.veg ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
                          }`}
                          title={item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                        />
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-slate-500">
                        <span className="capitalize">{item.category.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>⏱️ {item.prepTimeMinutes}m prep</span>
                        {item.tag && (
                          <>
                            <span>·</span>
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              {item.tag}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-sm font-extrabold text-slate-900">₹{item.price}</span>
                    </div>
                  </div>

                  {/* Stock Status & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Stock In / Stock Out Toggle Button */}
                    <button
                      onClick={() => handleToggleStock(item.id, item.available, item.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        item.available
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                      title={item.available ? 'Click to mark Stock Out (Sold Out)' : 'Click to mark Stock In (Available)'}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <span>{item.available ? 'Stock In' : 'Stock Out'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="px-2.5 py-1.5 text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Edit Item Details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT ITEM MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Food Item Details' : 'Add New Cafeteria Food Item'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Changes directly update the student midnight delivery menu in real time.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cheese Paneer Kathi Roll"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="90"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="15"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 font-medium"
                  >
                    <option value="quick_bites">Quick Bites</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                    <option value="meals">Meals</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dietary Type</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setFormVeg(true)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border cursor-pointer transition-colors ${
                        formVeg
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormVeg(false)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border cursor-pointer transition-colors ${
                        !formVeg
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Highlight Tag / Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Chef Special, Midnight Favorite, Best Seller"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Chef Special', 'Midnight Favorite', 'Best Seller', 'Chilled', 'Crispy'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormTag(tag)}
                      className="text-3xs px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 text-slate-600 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status in Modal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Stock Availability</span>
                  <span className="text-3xs text-slate-500">
                    {formAvailable ? 'Available for student orders' : 'Marked as Sold Out in portal'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFormAvailable(!formAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                    formAvailable
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {formAvailable ? '🟢 Stock In' : '🔴 Stock Out'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Add to Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
