import {
  GatePass,
  Complaint,
  DeduplicatedTicket,
  DailyMessMenu,
  CafeteriaItem,
  CafeteriaOrder,
  HostelRoom,
  RollCallRecord,
  BroadcastNotification,
} from '../types';

export const initialGatePasses: GatePass[] = [];

export const initialComplaints: Complaint[] = [];

export const initialDeduplicatedTickets: DeduplicatedTicket[] = [];

export const dailyMessMenu: DailyMessMenu = {
  day: 'Daily Campus Menu',
  breakfast: [
    { id: 'm-1', name: 'Steamed Idli with Coconut Chutney', nameRegional: 'इडली और नारियल चटनी', type: 'veg', calories: 280 },
    { id: 'm-2', name: 'Medhu Vada & Sambar', nameRegional: 'मेदू वड़ा और सांभर', type: 'veg', calories: 340 },
    { id: 'm-3', name: 'Boiled Eggs (2 pcs)', nameRegional: 'उबले अंडे', type: 'non-veg', calories: 155 },
    { id: 'm-4', name: 'Fresh Banana & Seasonal Papaya', nameRegional: 'ताज़ा फल', type: 'veg', calories: 110 },
    { id: 'm-5', name: 'Filter Coffee & Masala Chai', nameRegional: 'चाय व कॉफ़ी', type: 'veg', calories: 95 },
  ],
  lunch: [
    { id: 'm-6', name: 'Paneer Butter Masala', nameRegional: 'पनीर बटर मसाला', type: 'veg', calories: 380, isSpecial: true },
    { id: 'm-7', name: 'Dal Tadka (Yellow Lentil Tempered)', nameRegional: 'दाल तड़का', type: 'veg', calories: 190 },
    { id: 'm-8', name: 'Jeera Rice & Tawa Roti', nameRegional: 'जीरा राइस और रोटी', type: 'veg', calories: 290 },
    { id: 'm-9', name: 'Chicken Curry (Homestyle)', nameRegional: 'चिकन करी', type: 'non-veg', calories: 420 },
    { id: 'm-10', name: 'Boondi Raita & Salad', nameRegional: 'बूंदी रायता व सलाद', type: 'veg', calories: 85 },
  ],
  snacks: [
    { id: 'm-12', name: 'Aloo Samosa with Mint Chutney', nameRegional: 'समोसा', type: 'veg', calories: 260 },
    { id: 'm-13', name: 'Hot Ginger Chai & Biscuits', nameRegional: 'अदरक वाली चाय', type: 'veg', calories: 120 },
  ],
  dinner: [
    { id: 'm-14', name: 'Kadhai Paneer / Soya Chaap', nameRegional: 'कढ़ाई पनीर', type: 'veg', calories: 320 },
    { id: 'm-15', name: 'Mixed Veg dry sabzi', nameRegional: 'मिक्स वेज', type: 'veg', calories: 160 },
    { id: 'm-16', name: 'Mung Dal Khichdi with Pure Ghee', nameRegional: 'मूंग दाल खिचड़ी', type: 'jain', calories: 240 },
    { id: 'm-17', name: 'Egg Bhurji', nameRegional: 'अंडा भुर्जी', type: 'non-veg', calories: 280 },
    { id: 'm-18', name: 'Steamed Rice, Rasam & Curd', nameRegional: 'रसम-भात व दही', type: 'veg', calories: 210 },
  ],
};

export const cafeteriaItems: CafeteriaItem[] = [
  { id: 'c-1', name: 'Paneer Tikka Kathi Roll', price: 90, category: 'quick_bites', veg: true, prepTimeMinutes: 15, available: true },
  { id: 'c-2', name: 'Double Egg Chicken Roll', price: 120, category: 'quick_bites', veg: false, prepTimeMinutes: 15, available: true },
  { id: 'c-3', name: 'Cheese Maggi Noodles with Veggies', price: 65, category: 'snacks', veg: true, prepTimeMinutes: 10, available: true },
  { id: 'c-4', name: 'Iced Cold Coffee with Vanilla Scoop', price: 75, category: 'beverages', veg: true, prepTimeMinutes: 5, available: true },
  { id: 'c-5', name: 'Grilled Corn & Cheese Sandwich', price: 80, category: 'snacks', veg: true, prepTimeMinutes: 12, available: true },
  { id: 'c-6', name: 'Midnight Veg Biryani Bowl', price: 130, category: 'meals', veg: true, prepTimeMinutes: 20, available: true },
];

export const initialOrders: CafeteriaOrder[] = [];

export const hostelRooms: HostelRoom[] = [
  {
    id: 'rm-101',
    roomNumber: '101',
    block: 'Hostel A',
    floor: 1,
    type: 'double',
    gender: 'boys',
    amenities: ['Attached Washroom', 'Wi-Fi 6 AP Adjacent', 'Balcony', 'Study Desks'],
    beds: [
      { id: 'b-101-a', bedLabel: 'A', isOccupied: false },
      { id: 'b-101-b', bedLabel: 'B', isOccupied: false },
    ],
  },
  {
    id: 'rm-102',
    roomNumber: '102',
    block: 'Hostel A',
    floor: 1,
    type: 'double',
    gender: 'boys',
    amenities: ['Dual Study Lamps', 'Corner Room', 'Wardrobes'],
    beds: [
      { id: 'b-102-a', bedLabel: 'A', isOccupied: false },
      { id: 'b-102-b', bedLabel: 'B', isOccupied: false },
    ],
  },
  {
    id: 'rm-201',
    roomNumber: '201',
    block: 'Hostel A',
    floor: 2,
    type: 'double',
    gender: 'boys',
    amenities: ['Balcony View', 'Dual LAN Ports', 'Quiet Zone'],
    beds: [
      { id: 'b-201-a', bedLabel: 'A', isOccupied: false },
      { id: 'b-201-b', bedLabel: 'B', isOccupied: false },
    ],
  },
  {
    id: 'rm-202',
    roomNumber: '202',
    block: 'Hostel A',
    floor: 2,
    type: 'double',
    gender: 'boys',
    amenities: ['Corner Room', 'Attached Washroom', 'High-Speed Wi-Fi'],
    beds: [
      { id: 'b-202-a', bedLabel: 'A', isOccupied: false },
      { id: 'b-202-b', bedLabel: 'B', isOccupied: false },
    ],
  },
  {
    id: 'rm-b-101',
    roomNumber: '101',
    block: 'Hostel B',
    floor: 1,
    type: 'double',
    gender: 'girls',
    amenities: ['Attached Washroom', 'Terrace View', 'Dual Wardrobes'],
    beds: [
      { id: 'b-b101-a', bedLabel: 'A', isOccupied: false },
      { id: 'b-b101-b', bedLabel: 'B', isOccupied: false },
    ],
  },
  {
    id: 'rm-b-102',
    roomNumber: '102',
    block: 'Hostel B',
    floor: 1,
    type: 'double',
    gender: 'girls',
    amenities: ['Quiet Study Quad', 'Study Lamp Sockets', 'Balcony'],
    beds: [
      { id: 'b-b102-a', bedLabel: 'A', isOccupied: false },
      { id: 'b-b102-b', bedLabel: 'B', isOccupied: false },
    ],
  },
];

export const rollCallRoster: RollCallRecord[] = [];

export const initialBroadcasts: BroadcastNotification[] = [];
