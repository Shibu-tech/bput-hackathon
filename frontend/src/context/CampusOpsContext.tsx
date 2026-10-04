import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Language,
  GatePass,
  Complaint,
  DeduplicatedTicket,
  DailyMessMenu,
  CafeteriaOrder,
  CafeteriaItem,
  HostelRoom,
  RollCallRecord,
  BroadcastNotification,
  EmergencyAlert,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  StaffRegistrationRequest,
  PassStatus,
} from '../types';
import {
  initialGatePasses,
  initialComplaints,
  initialDeduplicatedTickets,
  dailyMessMenu as initialMessMenu,
  initialOrders,
  cafeteriaItems as initialCafeteriaMenu,
  hostelRooms as initialRooms,
  rollCallRoster as initialRoster,
  initialBroadcasts,
} from '../data/mockData';
import { emergencySound } from '../utils/audioAlert';
import { formatTaskTime, getCurrentFormattedTime } from '../utils/timeFormat';
import { useAuth } from './AuthContext';

interface CampusOpsContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  lowDataMode: boolean;
  setLowDataMode: (enabled: boolean | ((prev: boolean) => boolean)) => void;

  // Gate Passes
  gatePasses: GatePass[];
  requestGatePass: (pass: Omit<GatePass, 'id' | 'passCode' | 'status'>) => Promise<GatePass>;
  approveGatePass: (id: string, approverName?: string) => Promise<void>;
  rejectGatePass: (id: string, reason: string) => void;
  issueGatePassQr: (id: string) => Promise<GatePass | null>;
  logGateExit: (passCode: string) => { success: boolean; message: string; pass?: GatePass };
  logGateEntry: (passCode: string) => { success: boolean; message: string; pass?: GatePass };

  // Complaints & Deduplication
  complaints: Complaint[];
  deduplicatedTickets: DeduplicatedTicket[];
  createComplaint: (complaint: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'upvotes'>) => Complaint;
  assignComplaint: (id: string, techName: string, category?: ComplaintCategory, wardenNotes?: string, priority?: ComplaintPriority, assignedBy?: string) => Promise<void>;
  resolveComplaint: (id: string, notes: string, techName?: string) => Promise<void>;
  rejectComplaint: (id: string, reason: string, techName?: string) => Promise<void>;
  reopenComplaint: (id: string, notes?: string) => Promise<void>;
  resolveDeduplicatedTicket: (masterId: string, notes: string, techName?: string) => void;
  rejectDeduplicatedTicket: (masterId: string, reason: string, techName?: string) => void;
  upvoteComplaint: (id: string) => void;
  simulateOutageSurge: () => void;

  // Mess & Cafeteria
  messMenu: DailyMessMenu;
  mealRatings: Record<string, { rating: number; count: number }>;
  rateMealItem: (mealId: string, rating: number) => void;
  cafeteriaOrders: CafeteriaOrder[];
  cafeteriaMenu: CafeteriaItem[];
  addCafeteriaItem: (item: Omit<CafeteriaItem, 'id'>) => CafeteriaItem;
  updateCafeteriaItem: (id: string, updates: Partial<CafeteriaItem>) => void;
  deleteCafeteriaItem: (id: string) => void;
  toggleCafeteriaItemStock: (id: string) => void;
  placeCafeteriaOrder: (
    items: CafeteriaOrder['items'],
    total: number,
    studentDetails?: {
      studentName?: string;
      roomNumber?: string;
      hostelBlock?: string;
    }
  ) => CafeteriaOrder;
  updateOrderStatus: (orderId: string, status: CafeteriaOrder['status']) => void;
  cancelCafeteriaOrder: (orderId: string) => void;
  submitOrderReview: (orderId: string, rating: number, review: string) => void;
  messCheckIn: (rollNumber: string) => { success: boolean; studentName?: string };

  // Hostel Rooms
  rooms: HostelRoom[];
  bookBed: (roomId: string, bedLabel: 'A' | 'B', studentName: string, rollNumber: string, habits: string[]) => boolean;

  // Roll call
  rollCallRecords: RollCallRecord[];
  nightCurfewReportTime: string | null;
  triggerNightCurfewReport: () => void;

  // Broadcast & Emergency
  broadcasts: BroadcastNotification[];
  sendBroadcast: (broadcast: Omit<BroadcastNotification, 'id' | 'sentAt' | 'readCount'>) => void;
  activeEmergency: EmergencyAlert | null;
  triggerEmergencyAlert: (type: EmergencyAlert['type'], title: string, message: string, musterPoint: string) => void;
  dismissEmergencyAlert: () => void;
  checkInMuster: (studentName?: string) => void;

  // Staff Verification (Super Admin)
  staffRequests: StaffRegistrationRequest[];
  approveStaffRequest: (id: string, notes?: string) => Promise<void>;
  rejectStaffRequest: (id: string, reason?: string) => Promise<void>;
  addStaffRequest: (request: StaffRegistrationRequest) => void;
  refreshStaffRequests: () => Promise<void>;

  // Reset to demo initial
  resetDemoData: () => void;
}

const CampusOpsContext = createContext<CampusOpsContextType | undefined>(undefined);

// Helper to construct room state dynamically based on authenticated user
const buildRoomsForUser = (currentUser: any): HostelRoom[] => {
  const baseRooms: HostelRoom[] = JSON.parse(JSON.stringify(initialRooms));
  if (!currentUser) return baseRooms;

  const targetRoomNum = currentUser.roomNumber;
  const targetBlock = currentUser.hostel;
  const targetBed = currentUser.bedLabel || 'A';
  const studentName = currentUser.fullName || 'Student';
  const rollNumber = currentUser.phoneNumber ? `STU-${currentUser.phoneNumber.slice(-4)}` : 'STU';

  if (!targetRoomNum) return baseRooms;

  return baseRooms.map((room) => {
    const blockMatch = !targetBlock || room.block.toLowerCase().trim() === targetBlock.toLowerCase().trim();
    const roomMatch = room.roomNumber.trim() === targetRoomNum.trim();

    if (roomMatch && blockMatch) {
      return {
        ...room,
        beds: room.beds.map((b) => {
          if (b.bedLabel === targetBed) {
            return {
              ...b,
              isOccupied: true,
              occupant: {
                name: `${studentName} (You)`,
                rollNumber,
                branch: 'Computer Science',
                year: '1st Year',
                habits: ['Early Riser', 'Studious'],
              },
            };
          }
          return b;
        }),
      };
    }
    return room;
  });
};

export const CampusOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeRole, setActiveRole, updateUserRoom } = useAuth();
  const [role, setRoleState] = useState<UserRole>(activeRole || 'student');

  useEffect(() => {
    if (activeRole) {
      setRoleState(activeRole);
    }
  }, [activeRole]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (setActiveRole) {
      setActiveRole(newRole);
    }
  };
  const [language, setLanguage] = useState<Language>('en');
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);

  // Helper to test if an item is a mock demo item
  const isMockPerson = (item: any) => {
    const name = item.studentName || item.name || item.fullName || '';
    return (
      name.includes('Aarav') ||
      name.includes('Sneha') ||
      name.includes('Vikram') ||
      name.includes('Kunal') ||
      name.includes('Tanvi') ||
      name.includes('Priya') ||
      name.includes('Devansh') ||
      name.includes('Manish') ||
      name.includes('Rhea') ||
      item.id === 'bc-1' ||
      item.id === 'bc-2'
    );
  };

  // Data states with clean initialization
  const [gatePasses, setGatePasses] = useState<GatePass[]>(() => {
    const saved = localStorage.getItem('fretops_gatepasses');
    if (saved) {
      try {
        const parsed: GatePass[] = JSON.parse(saved);
        return parsed.filter((p) => !isMockPerson(p) && !p.id?.startsWith('gp-10'));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('fretops_complaints');
    if (saved) {
      try {
        const parsed: Complaint[] = JSON.parse(saved);
        const filtered = parsed.filter((c) => !isMockPerson(c));
        if (filtered.length > 0) return filtered;
      } catch {
        return initialComplaints;
      }
    }
    return initialComplaints;
  });

  const [deduplicatedTickets, setDeduplicatedTickets] = useState<DeduplicatedTicket[]>(() => {
    const saved = localStorage.getItem('fretops_dedup');
    if (saved) {
      try {
        const parsed: DeduplicatedTicket[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch {
        return initialDeduplicatedTickets;
      }
    }
    return initialDeduplicatedTickets;
  });

  const [messMenu] = useState<DailyMessMenu>(initialMessMenu);
  const [mealRatings, setMealRatings] = useState<Record<string, { rating: number; count: number }>>({
    'm-6': { rating: 4.6, count: 182 },
    'm-1': { rating: 4.3, count: 95 },
  });

  const [cafeteriaOrders, setCafeteriaOrders] = useState<CafeteriaOrder[]>(() => {
    const saved = localStorage.getItem('fretops_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cafeteriaMenu, setCafeteriaMenu] = useState<CafeteriaItem[]>(() => {
    const saved = localStorage.getItem('fretops_cafeteria_menu');
    return saved ? JSON.parse(saved) : initialCafeteriaMenu;
  });

  // Helper to build clean rooms with only the logged-in student in their assigned room
  const buildRoomsForUser = (currentUser: typeof user) => {
    const studentName = currentUser?.fullName || 'Anish Kumar';
    const studentRoll = currentUser?.phoneNumber ? `STU-${currentUser.phoneNumber.slice(-4)}` : 'STU-9090';
    const assignedHostel = currentUser?.hostel || 'Hostel A';
    const assignedRoomNumber = currentUser?.roomNumber || '101';
    const assignedBedLabel = currentUser?.bedLabel || 'A';

    return initialRooms.map((rm) => {
      const isAssignedRoom =
        rm.roomNumber === assignedRoomNumber &&
        (rm.block.toLowerCase().includes(assignedHostel.toLowerCase()) ||
          assignedHostel.toLowerCase().includes(rm.block.toLowerCase()));

      return {
        ...rm,
        beds: rm.beds.map((b) => {
          if (isAssignedRoom && b.bedLabel === assignedBedLabel) {
            return {
              ...b,
              isOccupied: true,
              occupant: {
                name: `${studentName} (You)`,
                rollNumber: studentRoll,
                branch: 'Computer Science',
                year: '1st Year',
                habits: ['Night Owl (Coding)', 'Clean Desk'],
              },
            };
          }
          // All other beds are strictly vacant — no dummy roommates
          return {
            ...b,
            isOccupied: false,
            occupant: undefined,
          };
        }),
      };
    });
  };

  const [rooms, setRooms] = useState<HostelRoom[]>(() => {
    return buildRoomsForUser(user);
  });

  // Re-sync rooms whenever logged-in user changes (including room or bed)
  useEffect(() => {
    setRooms(buildRoomsForUser(user));
  }, [user?.fullName, user?.phoneNumber, user?.hostel, user?.roomNumber, user?.bedLabel]);

  const [rollCallRecords, setRollCallRecords] = useState<RollCallRecord[]>(() => {
    const saved = localStorage.getItem('fretops_rollcall');
    if (saved) {
      try {
        const parsed: RollCallRecord[] = JSON.parse(saved);
        return parsed.filter((r) => !isMockPerson(r));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [nightCurfewReportTime, setNightCurfewReportTime] = useState<string | null>('22:30');

  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(() => {
    const saved = localStorage.getItem('fretops_broadcasts');
    if (saved) {
      try {
        const parsed: BroadcastNotification[] = JSON.parse(saved);
        return parsed.filter((b) => !isMockPerson(b));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeEmergency, setActiveEmergency] = useState<EmergencyAlert | null>(null);

  // Staff Registration Requests (for Super Admin verification)
  const [staffRequests, setStaffRequests] = useState<StaffRegistrationRequest[]>(() => {
    const saved = localStorage.getItem('fretops_staff_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { }
    }
    return [
      {
        id: 'sr-1001',
        fullName: 'Dr. Ramesh Chandra',
        email: 'ramesh.chandra@campus.edu.in',
        phoneNumber: '9845012345',
        role: 'FACULTY',
        roleLabel: 'Faculty / Staff',
        designation: 'Associate Professor, Computer Science',
        employeeId: 'EMP-2026-104',
        offerLetterName: 'Faculty_Offer_Letter_Ramesh.pdf',
        offerLetterUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        status: 'PENDING',
        createdAt: 'Today, 09:30 AM',
      },
      {
        id: 'sr-1002',
        fullName: 'Dr. Sunita Deshmukh',
        email: 'sunita.deshmukh@campus.edu.in',
        phoneNumber: '9876123456',
        role: 'HOD',
        roleLabel: 'Head of Department (HOD)',
        designation: 'Head of Department, Electrical Engg',
        employeeId: 'EMP-2026-218',
        offerLetterName: 'HOD_Appointment_Sunita.pdf',
        offerLetterUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
        status: 'PENDING',
        createdAt: 'Yesterday, 04:15 PM',
      },
      {
        id: 'sr-1003',
        fullName: 'Praveen Kumar Verma',
        email: 'praveen.verma@campus.edu.in',
        phoneNumber: '9811223344',
        role: 'ACCOUNTS',
        roleLabel: 'Accounts / Finance Cell',
        designation: 'Chief Finance Officer',
        employeeId: 'EMP-2026-349',
        offerLetterName: 'Finance_Offer_Praveen.pdf',
        offerLetterUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        status: 'PENDING',
        createdAt: '2 days ago',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('fretops_staff_requests', JSON.stringify(staffRequests));
  }, [staffRequests]);

  const refreshStaffRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/staff-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.data) && data.data.length > 0) {
          setStaffRequests((prev) => {
            const serverMap = new Map(data.data.map((item: any) => [item.id, item]));
            const merged = [...data.data];
            prev.forEach((p) => {
              if (!serverMap.has(p.id)) {
                merged.push(p);
              }
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Could not fetch server staff requests:', err);
    }
  };

  useEffect(() => {
    refreshStaffRequests();
  }, []);

  const approveStaffRequest = async (id: string, notes?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
            ...req,
            status: 'APPROVED',
            verifiedAt: timeStr,
            verificationNotes: notes || 'Verified & approved by Super Admin',
          }
          : req
      )
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/auth/staff-requests/${id}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'APPROVED', notes }),
        });
      } catch (err) {
        console.warn('Could not sync approve to server:', err);
      }
    }
  };

  const rejectStaffRequest = async (id: string, reason?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStaffRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
            ...req,
            status: 'REJECTED',
            verifiedAt: timeStr,
            verificationNotes: reason || 'Application rejected by Super Admin',
          }
          : req
      )
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`/api/auth/staff-requests/${id}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'REJECTED', notes: reason }),
        });
      } catch (err) {
        console.warn('Could not sync reject to server:', err);
      }
    }
  };

  const addStaffRequest = (newReq: StaffRegistrationRequest) => {
    setStaffRequests((prev) => [newReq, ...prev]);
  };

  // Auto-clean any stale mock demo keys from localStorage on mount
  useEffect(() => {
    // Always clear old rooms with dummy Aarav/Rohan
    localStorage.removeItem('fretops_rooms');

    const checkAndClean = (key: string) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.some(isMockPerson)) {
            const cleaned = parsed.filter((item) => !isMockPerson(item));
            localStorage.setItem(key, JSON.stringify(cleaned));
            return cleaned;
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
      return null;
    };

    const cleanedP = checkAndClean('fretops_gatepasses');
    if (cleanedP !== null) setGatePasses(cleanedP);

    const cleanedC = checkAndClean('fretops_complaints');
    if (cleanedC !== null) setComplaints(cleanedC);

    const cleanedR = checkAndClean('fretops_rollcall');
    if (cleanedR !== null) setRollCallRecords(cleanedR);

    const cleanedB = checkAndClean('fretops_broadcasts');
    if (cleanedB !== null) setBroadcasts(cleanedB);
  }, []);

  // Fetch real database records from backend APIs
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. Fetch tickets
    fetch('/api/tickets', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const serverComplaints: Complaint[] = res.data.map((t: any) => ({
            id: t._id,
            ticketNumber: `TKT-${t._id.slice(-4).toUpperCase()}`,
            category: (t.category || 'other').toLowerCase() as ComplaintCategory,
            title: t.title || t.description?.slice(0, 50) || 'Complaint',
            description: t.description || '',
            studentName: t.creatorId?.fullName || 'Student',
            rollNumber: t.creatorId?.phoneNumber ? `STU-${t.creatorId.phoneNumber.slice(-4)}` : 'STU',
            roomNumber: t.roomNumber || (t.locationId?.roomNumber || '101'),
            hostelBlock: t.building || (t.locationId?.buildingName || 'Hostel A'),
            priority: 'medium',
            status:
              t.status === 'RESOLVED'
                ? 'resolved'
                : t.status === 'REJECTED'
                  ? 'rejected'
                  : t.status === 'ASSIGNED'
                    ? 'assigned'
                    : t.status === 'IN_PROGRESS'
                      ? 'in_progress'
                      : 'open',
            createdAt: t.createdAt ? formatTaskTime(t.createdAt) : 'Just now',
            assignedTo: t.assignedTechId?.fullName || t.assignedTo,
            assignedTrade: t.category,
            assignedBy: t.assignedByName,
            assignedAt: (() => {
              const assignedHist = t.statusHistory?.find((h: any) => h.status === 'ASSIGNED');
              if (assignedHist?.changedAt) {
                return formatTaskTime(assignedHist.changedAt);
              }
              if (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS' || t.status === 'RESOLVED') {
                return t.updatedAt ? formatTaskTime(t.updatedAt) : undefined;
              }
              return undefined;
            })(),
            resolvedAt: t.resolvedAt
              ? formatTaskTime(t.resolvedAt)
              : (() => {
                const resolvedHist = t.statusHistory?.find((h: any) => h.status === 'RESOLVED');
                return resolvedHist?.changedAt ? formatTaskTime(resolvedHist.changedAt) : undefined;
              })(),
            rejectedAt: (() => {
              const rejectedHist = t.statusHistory?.find((h: any) => h.status === 'REJECTED');
              return rejectedHist?.changedAt
                ? formatTaskTime(rejectedHist.changedAt)
                : t.status === 'REJECTED' && t.updatedAt
                  ? formatTaskTime(t.updatedAt)
                  : undefined;
            })(),
            wardenNotes: t.wardenNotes,
            resolutionNotes: t.resolutionNotes,
            rejectionReason: t.rejectionReason,
            upvotes: t.duplicateCount || 0,
          }));
          setComplaints(serverComplaints);
        }
      })
      .catch((err) => console.warn('Could not sync tickets:', err));

    // 2. Fetch gate passes
    fetch('/api/gate-passes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const serverPasses: GatePass[] = res.data.map((p: any) => ({
            id: p._id,
            passCode: p.qrCode || `GP-${p._id.slice(-4).toUpperCase()}`,
            qrCode: p.qrCode,
            qrImage: p.qrImage,
            qrToken: p.qrToken,
            qrIssuedAt: p.qrIssuedAt,
            qrExpiresAt: p.qrExpiresAt,
            issueCount: p.issueCount || 1,
            studentName: p.studentId?.fullName || 'Student',
            rollNumber: p.studentId?.phoneNumber ? `STU-${p.studentId.phoneNumber.slice(-4)}` : 'STU',
            roomNumber: '101',
            hostelBlock: p.hostel || 'Hostel A',
            passType: 'day',
            purpose: p.reason,
            destination: p.reason,
            outTime: p.requestedExitTime
              ? new Date(p.requestedExitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '20:00',
            expectedInTime: p.expectedReturnTime
              ? new Date(p.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '22:30',
            leaveDate: p.leaveDate,
            returnDate: p.returnDate,
            actualOutTime: p.actualExitTime
              ? new Date(p.actualExitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : undefined,
            actualInTime: p.actualReturnTime
              ? new Date(p.actualReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : undefined,
            status:
              p.status === 'APPROVED'
                ? 'approved'
                : p.status === 'REJECTED'
                  ? 'rejected'
                  : p.status === 'EXITED'
                    ? 'checked_out'
                    : p.status === 'RETURNED'
                      ? 'completed'
                      : 'pending',
            parentConsentVerified: true,
            parentPhone: p.studentId?.phoneNumber || '',
            approvedBy: p.approvedBy?.fullName,
          }));
          setGatePasses(serverPasses);
        }
      })
      .catch((err) => console.warn('Could not sync gate passes:', err));

    // 3. Fetch notices
    fetch('/api/notices', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const serverBroadcasts: BroadcastNotification[] = res.data.map((n: any) => ({
            id: n._id,
            title: n.title,
            content: n.body,
            target: 'all',
            targetValue: n.targetAudience?.hostel || 'All Campus Students',
            sender: n.createdBy?.fullName || 'Warden Office',
            sentAt: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            priority: n.isEmergency ? 'emergency' : 'normal',
            readCount: n.readCount || 0,
            totalRecipients: 50,
          }));
          setBroadcasts(serverBroadcasts);
        }
      })
      .catch((err) => console.warn('Could not sync notices:', err));
  }, [user]);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('fretops_gatepasses', JSON.stringify(gatePasses));
  }, [gatePasses]);

  useEffect(() => {
    localStorage.setItem('fretops_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('fretops_dedup', JSON.stringify(deduplicatedTickets));
  }, [deduplicatedTickets]);

  useEffect(() => {
    localStorage.setItem('fretops_orders', JSON.stringify(cafeteriaOrders));
  }, [cafeteriaOrders]);

  useEffect(() => {
    localStorage.setItem('fretops_cafeteria_menu', JSON.stringify(cafeteriaMenu));
  }, [cafeteriaMenu]);

  useEffect(() => {
    localStorage.setItem('fretops_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('fretops_rollcall', JSON.stringify(rollCallRecords));
  }, [rollCallRecords]);

  useEffect(() => {
    localStorage.setItem('fretops_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);

  // Helper to ensure an authenticated token exists for MongoDB operations
  const getValidToken = async (): Promise<string | null> => {
    let token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
    // Auto-acquire student session so MongoDB operations never silently fail
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9090909090', password: 'anish123' }),
      });
      const data = await res.json();
      const acquired = data.data?.token || data.token;
      if (acquired) {
        localStorage.setItem('token', acquired);
        return acquired;
      }
    } catch (e) {
      console.warn('Auto-login session acquisition error:', e);
    }
    return null;
  };

  // Gate Pass Actions
  const requestGatePass = async (
    passData: Omit<GatePass, 'id' | 'passCode' | 'status'>,
  ): Promise<GatePass> => {
    const randomCode = `GP-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempId = `gp-${Date.now()}`;
    const isDayPass = passData.passType === 'day';
    const status: PassStatus = isDayPass ? 'approved' : 'pending';
    const approvedBy = isDayPass ? 'Institutional Day Pass Policy (Auto-Approved)' : undefined;
    const approvedAt = isDayPass
      ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined;

    let newPass: GatePass = {
      ...passData,
      id: tempId,
      passCode: randomCode,
      status,
      approvedBy,
      approvedAt,
    };
    setGatePasses((prev) => [newPass, ...prev]);

    // Send to backend database
    try {
      const token = await getValidToken();
      if (token) {
        const exitTime = passData.outTime?.trim() || '20:00';
        const returnTime = passData.expectedInTime?.trim() || '22:30';

        const res = await fetch('/api/gate-passes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hostel: passData.hostelBlock || 'Hostel A',
            reason: passData.purpose
              ? `${passData.purpose}${passData.destination ? ` (${passData.destination})` : ''}`
              : (passData.destination || 'Campus Leave'),
            purpose: passData.purpose,
            destination: passData.destination,
            requestedExitTime: exitTime,
            expectedReturnTime: returnTime,
            leaveDate: passData.leaveDate,
            returnDate: passData.returnDate,
            rollNumber: passData.rollNumber,
            studentName: passData.studentName,
            phoneNumber: passData.parentPhone,
          }),
        });

        const data = await res.json();
        if (data.success && data.data?._id) {
          newPass = {
            ...newPass,
            id: data.data._id,
            passCode: data.data.qrCode || newPass.passCode,
            qrCode: data.data.qrCode,
            qrImage: data.data.qrImage,
            qrToken: data.data.qrToken,
            qrIssuedAt: data.data.qrIssuedAt,
            qrExpiresAt: data.data.qrExpiresAt,
            issueCount: data.data.issueCount || 1,
            status: isDayPass ? 'approved' : (data.data.status?.toLowerCase() === 'approved' ? 'approved' : 'pending'),
          };
          setGatePasses((prev) =>
            prev.map((p) => (p.id === tempId ? newPass : p)),
          );
        } else {
          console.error('Database failed to create gate pass:', data);
        }
      }
    } catch (err) {
      console.error('Error sending gate pass to database:', err);
    }

    return newPass;
  };

  const approveGatePass = async (id: string, approverName: string = 'Hostel Warden') => {
    setGatePasses((prev) =>
      prev.map((pass) =>
        pass.id === id
          ? {
            ...pass,
            status: 'approved',
            approvedBy: approverName,
            approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
          : pass,
      ),
    );

    try {
      const token = await getValidToken();
      if (token && /^[0-9a-fA-F]{24}$/.test(id)) {
        const res = await fetch(`/api/gate-passes/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'APPROVED' }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setGatePasses((prev) =>
            prev.map((pass) =>
              pass.id === id
                ? {
                  ...pass,
                  passCode: data.data.qrCode || pass.passCode,
                  qrCode: data.data.qrCode,
                  qrImage: data.data.qrImage,
                  qrToken: data.data.qrToken,
                  issueCount: data.data.issueCount || pass.issueCount,
                }
                : pass,
            ),
          );
        }
      }
    } catch (err) {
      console.error('Failed to sync gate pass approval to DB:', err);
    }
  };

  const rejectGatePass = (id: string, reason: string) => {
    setGatePasses((prev) =>
      prev.map((pass) =>
        pass.id === id
          ? {
            ...pass,
            status: 'rejected',
            rejectionReason: reason,
          }
          : pass,
      ),
    );

    const token = localStorage.getItem('token');
    if (token && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetch(`/api/gate-passes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      }).catch(console.warn);
    }
  };

  const issueGatePassQr = async (id: string): Promise<GatePass | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const res = await fetch(`/api/gate-passes/${id}/issue-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        let updatedPass: GatePass | null = null;
        setGatePasses((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              updatedPass = {
                ...p,
                passCode: data.data.qrCode,
                qrCode: data.data.qrCode,
                qrImage: data.data.qrImage,
                qrToken: data.data.token,
                qrIssuedAt: data.data.qrIssuedAt,
                qrExpiresAt: data.data.qrExpiresAt,
                issueCount: data.data.issueCount,
              };
              return updatedPass;
            }
            return p;
          })
        );
        return updatedPass;
      }
    } catch (err) {
      console.warn('Failed to issue fresh QR code:', err);
    }
    return null;
  };

  const logGateExit = (passCode: string) => {
    const raw = (passCode || '').trim();
    const cleanCode = raw.toUpperCase();

    let rollToMatch = cleanCode;
    let studentName = '';
    let hostel = 'Hostel A';
    let room = '101';

    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.rollNumber) rollToMatch = parsed.rollNumber.toUpperCase();
        if (parsed.studentName || parsed.name) studentName = parsed.studentName || parsed.name;
        if (parsed.roomNumber || parsed.room) room = parsed.roomNumber || parsed.room;
        if (parsed.hostelBlock || parsed.hostel) hostel = parsed.hostelBlock || parsed.hostel;
      } catch { }
    } else if (cleanCode.startsWith('PERM-')) {
      rollToMatch = cleanCode.replace('PERM-', '');
    } else if (raw.includes(':')) {
      const parts = raw.split(':');
      if (parts.length >= 3) {
        rollToMatch = parts[2].toUpperCase();
        if (parts[3]) studentName = parts[3];
        if (parts[4]) hostel = parts[4];
        if (parts[5]) room = parts[5];
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const existingPass = gatePasses.find(
      (p) =>
        p.id === raw ||
        p.passCode.toUpperCase() === cleanCode ||
        p.qrCode?.toUpperCase() === cleanCode ||
        p.qrToken?.toUpperCase() === cleanCode ||
        p.rollNumber.toUpperCase() === rollToMatch ||
        p.rollNumber.toUpperCase() === cleanCode,
    );

    let updatedPass: GatePass;

    if (existingPass) {
      updatedPass = {
        ...existingPass,
        status: 'checked_out',
        actualOutTime: timeStr,
        clearedAt: now.getTime(),
      };
      setGatePasses((prev) =>
        prev.map((p) => (p.id === existingPass.id ? updatedPass : p)),
      );
    } else {
      // Dynamic Day Pass clearance with student's permanent admission pass
      const matchedRoster = rollCallRecords.find((r) => r.rollNumber.toUpperCase() === rollToMatch);
      updatedPass = {
        id: `gp-perm-${Date.now()}`,
        passCode: `DP-${rollToMatch.slice(-4) || '9090'}`,
        studentName: studentName || matchedRoster?.name || `Student (${rollToMatch})`,
        rollNumber: rollToMatch,
        roomNumber: room || matchedRoster?.room || '101',
        hostelBlock: hostel || matchedRoster?.block || 'Hostel A',
        passType: 'day',
        purpose: 'Daily Campus Outing (Permanent Day Pass)',
        destination: 'Campus Vicinity / City',
        outTime: timeStr,
        expectedInTime: '22:30',
        actualOutTime: timeStr,
        clearedAt: now.getTime(),
        status: 'checked_out',
        parentConsentVerified: true,
        parentPhone: '+91 98451 22910',
        approvedBy: 'Institutional Permanent Day Pass',
        isPermanentPass: true,
      };
      setGatePasses((prev) => [updatedPass, ...prev]);
    }

    // Sync to backend DB
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/gate-passes/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scanData: updatedPass.qrCode || updatedPass.passCode || cleanCode }),
      }).catch(console.warn);
    }

    // Update Roll call roster
    setRollCallRecords((prev) =>
      prev.map((r) =>
        r.rollNumber.toUpperCase() === updatedPass.rollNumber.toUpperCase()
          ? { ...r, status: 'on_gate_pass', lastSeenTime: `${timeStr} (Main Gate Out)` }
          : r,
      ),
    );

    return {
      success: true,
      message: `Exit verified for ${updatedPass.studentName} (${updatedPass.rollNumber}) at ${timeStr}. Out time registered.`,
      pass: updatedPass,
    };
  };

  const logGateEntry = (passCode: string) => {
    const raw = (passCode || '').trim();
    const cleanCode = raw.toUpperCase();

    let rollToMatch = cleanCode;
    let studentName = '';
    let hostel = 'Hostel A';
    let room = '101';

    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.rollNumber) rollToMatch = parsed.rollNumber.toUpperCase();
        if (parsed.studentName || parsed.name) studentName = parsed.studentName || parsed.name;
        if (parsed.roomNumber || parsed.room) room = parsed.roomNumber || parsed.room;
        if (parsed.hostelBlock || parsed.hostel) hostel = parsed.hostelBlock || parsed.hostel;
      } catch { }
    } else if (cleanCode.startsWith('PERM-')) {
      rollToMatch = cleanCode.replace('PERM-', '');
    } else if (raw.includes(':')) {
      const parts = raw.split(':');
      if (parts.length >= 3) {
        rollToMatch = parts[2].toUpperCase();
        if (parts[3]) studentName = parts[3];
        if (parts[4]) hostel = parts[4];
        if (parts[5]) room = parts[5];
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Look for active/checked_out pass first
    const existingPass = gatePasses.find(
      (p) =>
        (p.id === raw ||
          p.passCode.toUpperCase() === cleanCode ||
          p.qrCode?.toUpperCase() === cleanCode ||
          p.qrToken?.toUpperCase() === cleanCode ||
          p.rollNumber.toUpperCase() === rollToMatch ||
          p.rollNumber.toUpperCase() === cleanCode) &&
        p.status === 'checked_out',
    ) || gatePasses.find(
      (p) =>
        p.id === raw ||
        p.passCode.toUpperCase() === cleanCode ||
        p.qrCode?.toUpperCase() === cleanCode ||
        p.qrToken?.toUpperCase() === cleanCode ||
        p.rollNumber.toUpperCase() === rollToMatch ||
        p.rollNumber.toUpperCase() === cleanCode,
    );

    let updatedPass: GatePass;

    if (existingPass) {
      updatedPass = {
        ...existingPass,
        status: 'completed',
        actualInTime: timeStr,
        actualOutTime: existingPass.actualOutTime || existingPass.outTime || timeStr,
        clearedAt: now.getTime(),
      };
      setGatePasses((prev) =>
        prev.map((p) => (p.id === existingPass.id ? updatedPass : p)),
      );
    } else {
      // Dynamic safe entry clearance with student's permanent admission pass
      const matchedRoster = rollCallRecords.find((r) => r.rollNumber.toUpperCase() === rollToMatch);
      updatedPass = {
        id: `gp-perm-${Date.now()}`,
        passCode: `DP-${rollToMatch.slice(-4) || '9090'}`,
        studentName: studentName || matchedRoster?.name || `Student (${rollToMatch})`,
        rollNumber: rollToMatch,
        roomNumber: room || matchedRoster?.room || '101',
        hostelBlock: hostel || matchedRoster?.block || 'Hostel A',
        passType: 'day',
        purpose: 'Daily Campus Entry (Permanent Day Pass)',
        destination: 'Campus',
        outTime: timeStr,
        expectedInTime: '22:30',
        actualOutTime: timeStr,
        actualInTime: timeStr,
        clearedAt: now.getTime(),
        status: 'completed',
        parentConsentVerified: true,
        parentPhone: '+91 98451 22910',
        approvedBy: 'Institutional Permanent Day Pass',
        isPermanentPass: true,
      };
      setGatePasses((prev) => [updatedPass, ...prev]);
    }

    // Sync to backend DB
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/gate-passes/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scanData: updatedPass.qrCode || updatedPass.passCode || cleanCode }),
      }).catch(console.warn);
    }

    // Update Roll call roster
    setRollCallRecords((prev) =>
      prev.map((r) =>
        r.rollNumber.toUpperCase() === updatedPass.rollNumber.toUpperCase()
          ? { ...r, status: 'inside', lastSeenTime: `${timeStr} (Returned to Campus)` }
          : r,
      ),
    );

    return {
      success: true,
      message: `Safe return logged for ${updatedPass.studentName} (${updatedPass.rollNumber}) at ${timeStr}. In time registered.`,
      pass: updatedPass,
    };
  };

  // Complaint Creation with Intelligent Deduplication
  const createComplaint = (
    data: Omit<Complaint, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'upvotes'>,
  ): Complaint => {
    const newId = `tc-${Date.now()}`;
    const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = getCurrentFormattedTime();

    // Check if an existing deduplicated ticket exists for this category & block
    const matchingMaster = deduplicatedTickets.find(
      (dt) => dt.category === data.category && dt.hostelBlock === data.hostelBlock && dt.status !== 'resolved',
    );

    let masterId = matchingMaster ? matchingMaster.id : undefined;

    // If there are already 2 complaints in this block and category without a master ticket, synthesize one
    if (!matchingMaster) {
      const similarOpen = complaints.filter(
        (c) => c.category === data.category && c.hostelBlock === data.hostelBlock && c.status !== 'resolved',
      );
      if (similarOpen.length >= 1) {
        // Auto-group into new master deduplicated ticket!
        const newMasterCode = `DT-${data.category.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
        const newMaster: DeduplicatedTicket = {
          id: `dt-${Date.now()}`,
          masterCode: newMasterCode,
          category: data.category,
          title: `Cluster Outage: ${data.category.toUpperCase()} in ${data.hostelBlock}`,
          hostelBlock: data.hostelBlock,
          affectedCount: similarOpen.length + 1,
          reportedRooms: Array.from(new Set([...similarOpen.map((c) => c.roomNumber), data.roomNumber])),
          complaintIds: [...similarOpen.map((c) => c.id), newId],
          status: 'open',
          detectedAt: `${timeStr} (Auto-grouped ${similarOpen.length + 1} recurring reports)`,
          rootCauseCandidate: `Repeated failure reported across multiple rooms (${data.roomNumber}, etc.). Common distribution line check recommended.`,
        };
        masterId = newMaster.id;
        setDeduplicatedTickets((prev) => [newMaster, ...prev]);

        // Mark previously open complaints with this master ID
        setComplaints((prev) =>
          prev.map((c) => (similarOpen.some((s) => s.id === c.id) ? { ...c, masterTicketId: newMaster.id } : c)),
        );
      }
    } else {
      // Update existing master ticket count & rooms
      setDeduplicatedTickets((prev) =>
        prev.map((dt) =>
          dt.id === matchingMaster.id
            ? {
              ...dt,
              affectedCount: dt.affectedCount + 1,
              reportedRooms: Array.from(new Set([...dt.reportedRooms, data.roomNumber])),
              complaintIds: [...dt.complaintIds, newId],
            }
            : dt,
        ),
      );
    }

    const newTicket: Complaint = {
      ...data,
      id: newId,
      ticketNumber,
      status: 'open',
      createdAt: timeStr,
      upvotes: 1,
      masterTicketId: masterId,
      assignedTrade: getTradeName(data.category),
    };

    setComplaints((prev) => [newTicket, ...prev]);

    // Send to backend database
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          building: data.hostelBlock || 'Hostel A',
          roomNumber: data.roomNumber || '101',
          category: data.category.toUpperCase(),
          title: data.title,
          description: data.description || data.title,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data?._id) {
            setComplaints((prev) =>
              prev.map((c) => (c.id === newId ? { ...c, id: res.data._id } : c))
            );
          }
        })
        .catch(console.warn);
    }

    return newTicket;
  };

  const assignComplaint = async (
    id: string,
    techName: string,
    category?: ComplaintCategory,
    wardenNotes?: string,
    priority?: ComplaintPriority,
    assignedBy: string = 'Hostel Warden',
  ) => {
    const timeStr = getCurrentFormattedTime();
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            category: category || c.category,
            assignedTrade: category ? getTradeName(category) : c.assignedTrade || getTradeName(c.category),
            assignedTo: techName,
            assignedBy,
            assignedAt: timeStr,
            wardenNotes: wardenNotes !== undefined ? wardenNotes : c.wardenNotes,
            priority: priority || c.priority,
            status: 'assigned',
          }
          : c,
      ),
    );

    const token = localStorage.getItem('token');
    if (token && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'ASSIGNED',
          assignedByName: assignedBy,
          wardenNotes,
          category: category ? category.toUpperCase() : undefined,
        }),
      }).catch(console.warn);
    }
  };

  const resolveComplaint = async (id: string, notes: string, techName?: string) => {
    const timeStr = getCurrentFormattedTime();
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            status: 'resolved',
            resolvedAt: timeStr,
            resolvedBy: techName || c.assignedTo || 'Duty Technician',
            resolutionNotes: notes,
          }
          : c,
      ),
    );

    const token = localStorage.getItem('token');
    if (token && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'RESOLVED', notes }),
      }).catch(console.warn);
    }
  };

  const rejectComplaint = async (id: string, reason: string, techName?: string) => {
    const timeStr = getCurrentFormattedTime();
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            status: 'rejected',
            rejectedAt: timeStr,
            rejectedBy: techName || c.assignedTo || 'Duty Technician',
            rejectionReason: reason,
          }
          : c,
      ),
    );

    const token = localStorage.getItem('token');
    if (token && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'REJECTED', reason }),
      }).catch(console.warn);
    }
  };

  const reopenComplaint = async (id: string, notes?: string) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
            ...c,
            status: 'open',
            wardenNotes: notes ? `[Reopened] ${notes}` : c.wardenNotes,
            rejectionReason: undefined,
            rejectedAt: undefined,
            rejectedBy: undefined,
            resolvedAt: undefined,
            resolvedBy: undefined,
            resolutionNotes: undefined,
          }
          : c,
      ),
    );

    const token = localStorage.getItem('token');
    if (token && /^[0-9a-fA-F]{24}$/.test(id)) {
      fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'OPEN', notes }),
      }).catch(console.warn);
    }
  };

  const resolveDeduplicatedTicket = (masterId: string, notes: string, techName?: string) => {
    const timeStr = getCurrentFormattedTime();
    const target = deduplicatedTickets.find((d) => d.id === masterId);
    if (!target) return;

    setDeduplicatedTickets((prev) =>
      prev.map((dt) => (dt.id === masterId ? { ...dt, status: 'resolved' } : dt)),
    );

    // Resolve all grouped child complaints simultaneously!
    setComplaints((prev) =>
      prev.map((c) =>
        c.masterTicketId === masterId || target.complaintIds.includes(c.id)
          ? {
            ...c,
            status: 'resolved',
            resolvedAt: timeStr,
            resolvedBy: techName || target.assignedTechnician,
            resolutionNotes: `[Group Resolution ${target.masterCode}] ${notes}`,
          }
          : c,
      ),
    );
  };

  const rejectDeduplicatedTicket = (masterId: string, reason: string, techName?: string) => {
    const timeStr = getCurrentFormattedTime();
    const target = deduplicatedTickets.find((d) => d.id === masterId);
    if (!target) return;

    setDeduplicatedTickets((prev) =>
      prev.map((dt) => (dt.id === masterId ? { ...dt, status: 'resolved' } : dt)),
    );

    // Reject all grouped child complaints
    setComplaints((prev) =>
      prev.map((c) =>
        c.masterTicketId === masterId || target.complaintIds.includes(c.id)
          ? {
            ...c,
            status: 'rejected',
            rejectedAt: timeStr,
            rejectedBy: techName || target.assignedTechnician,
            rejectionReason: `[Cluster Review ${target.masterCode}] ${reason}`,
          }
          : c,
      ),
    );
  };

  const upvoteComplaint = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c)),
    );
  };

  // Simulate Surge Outage (Demonstration helper for hackathon & client PRD)
  const simulateOutageSurge = () => {
    const timeStr = getCurrentFormattedTime();
    const sampleRooms = ['402', '405', '409', '414', '418', '422'];
    const newMasterCode = `DT-WIFI-${Math.floor(100 + Math.random() * 900)}`;

    const newComplaints: Complaint[] = sampleRooms.map((rm, idx) => ({
      id: `tc-surge-${Date.now()}-${idx}`,
      ticketNumber: `TKT-${8200 + idx}`,
      category: 'wifi',
      title: `Wi-Fi Dead Zone in Room ${rm}`,
      description: 'Hostel Wi-Fi signal not radiating. Cannot complete lab assignment.',
      studentName: `Student ${rm}`,
      rollNumber: `2024CS0${800 + idx}`,
      roomNumber: rm,
      hostelBlock: 'Ramanujan Block B',
      priority: 'high',
      status: 'in_progress',
      createdAt: timeStr,
      assignedTrade: 'Network',
      assignedTo: 'Suresh Menon (Network Admin)',
      upvotes: Math.floor(Math.random() * 5) + 1,
    }));

    const newMaster: DeduplicatedTicket = {
      id: `dt-surge-${Date.now()}`,
      masterCode: newMasterCode,
      category: 'wifi',
      title: `Surge Wi-Fi Disruption: Ramanujan Block B Wing 4`,
      hostelBlock: 'Ramanujan Block B',
      affectedCount: sampleRooms.length + 3,
      reportedRooms: ['401', '403', ...sampleRooms],
      complaintIds: newComplaints.map((c) => c.id),
      assignedTechnician: 'Suresh Menon (Network Admin)',
      status: 'in_progress',
      detectedAt: `${timeStr} (Grouped ${sampleRooms.length + 3} reports)`,
      rootCauseCandidate: 'AP Gateway B4-Switch POE Controller Trip - Grouped to prevent warden ticket spam.',
    };

    newComplaints.forEach((c) => (c.masterTicketId = newMaster.id));

    setDeduplicatedTickets((prev) => [newMaster, ...prev]);
    setComplaints((prev) => [...newComplaints, ...prev]);
  };

  // Mess & Cafeteria
  const rateMealItem = (mealId: string, rating: number) => {
    setMealRatings((prev) => {
      const current = prev[mealId] || { rating: 4.0, count: 1 };
      const newCount = current.count + 1;
      const newRating = Number(((current.rating * current.count + rating) / newCount).toFixed(1));
      return { ...prev, [mealId]: { rating: newRating, count: newCount } };
    });
  };

  const placeCafeteriaOrder = (
    items: CafeteriaOrder['items'],
    total: number,
    studentDetails?: {
      studentName?: string;
      roomNumber?: string;
      hostelBlock?: string;
    }
  ): CafeteriaOrder => {
    const orderNumber = `CF-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const currentStudentName =
      studentDetails?.studentName?.trim() ||
      user?.fullName?.trim() ||
      'Student';

    // Find student's booked room if available in the rooms system
    const bookedRoom = rooms.find((r) =>
      r.beds.some(
        (b) =>
          b.occupant?.name?.trim().toLowerCase() === currentStudentName.toLowerCase() ||
          (user?.phoneNumber && b.occupant?.rollNumber === `STU-${user.phoneNumber.slice(-4)}`)
      )
    );

    const resolvedRoom =
      studentDetails?.roomNumber?.trim() ||
      user?.roomNumber ||
      bookedRoom?.roomNumber ||
      '101';

    const resolvedBlock =
      studentDetails?.hostelBlock?.trim() ||
      user?.hostel ||
      bookedRoom?.block ||
      'Hostel A';

    const newOrder: CafeteriaOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      studentName: currentStudentName,
      roomNumber: resolvedRoom,
      hostelBlock: resolvedBlock,
      items,
      totalAmount: total,
      status: 'received',
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      deliveryOtp: otp,
    };
    setCafeteriaOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: CafeteriaOrder['status']) => {
    setCafeteriaOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
  };

  const cancelCafeteriaOrder = (orderId: string) => {
    setCafeteriaOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)),
    );
  };

  const submitOrderReview = (orderId: string, rating: number, review: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCafeteriaOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
            ...o,
            rating,
            review: review.trim(),
            reviewedAt: timeStr,
          }
          : o,
      ),
    );
  };

  const addCafeteriaItem = (itemData: Omit<CafeteriaItem, 'id'>): CafeteriaItem => {
    const newItem: CafeteriaItem = {
      ...itemData,
      id: `c-${Date.now()}`,
    };
    setCafeteriaMenu((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateCafeteriaItem = (id: string, updates: Partial<CafeteriaItem>) => {
    setCafeteriaMenu((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const deleteCafeteriaItem = (id: string) => {
    setCafeteriaMenu((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCafeteriaItemStock = (id: string) => {
    setCafeteriaMenu((prev) =>
      prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item)),
    );
  };

  const messCheckIn = (rollNumber: string) => {
    const student = rollCallRecords.find((r) => r.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase());
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (student) {
      setRollCallRecords((prev) =>
        prev.map((r) =>
          r.rollNumber === student.rollNumber
            ? { ...r, status: 'mess_checked_in', lastSeenTime: `${timeStr} (Dining Hall Token Validated)` }
            : r,
        ),
      );
      return { success: true, studentName: student.name };
    }
    return { success: false };
  };

  // Hostel Rooms
  const bookBed = (
    roomId: string,
    bedLabel: 'A' | 'B',
    studentName: string,
    rollNumber: string,
    habits: string[],
  ): boolean => {
    let success = false;
    const targetRoom = rooms.find((rm) => rm.id === roomId);

    if (targetRoom && updateUserRoom) {
      updateUserRoom({
        hostel: targetRoom.block,
        roomNumber: targetRoom.roomNumber,
        bedLabel,
      });
    }

    setRooms((prev) => {
      // First vacate any bed previously occupied by this student
      const cleared = prev.map((rm) => ({
        ...rm,
        beds: rm.beds.map((b) => {
          if (b.occupant?.name?.includes(studentName) || b.occupant?.name?.includes('(You)')) {
            return { ...b, isOccupied: false, occupant: undefined };
          }
          return b;
        }),
      }));

      const updated = cleared.map((rm) => {
        if (rm.id !== roomId) return rm;
        const updatedBeds = rm.beds.map((b) => {
          if (b.bedLabel === bedLabel && !b.isOccupied) {
            success = true;
            return {
              ...b,
              isOccupied: true,
              occupant: {
                name: `${studentName} (You)`,
                rollNumber,
                branch: 'Computer Science',
                year: '1st Year',
                habits,
              },
            };
          }
          return b;
        });
        return { ...rm, beds: updatedBeds };
      });
      return updated;
    });
    return success;
  };

  // Roll Call & Curfew
  const triggerNightCurfewReport = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNightCurfewReportTime(timeStr);

    // Post broadcast notice to Wardens
    const insideCount = rollCallRecords.filter((r) => r.status === 'inside' || r.status === 'mess_checked_in').length;
    const gatePassCount = rollCallRecords.filter((r) => r.status === 'on_gate_pass').length;
    const overdueCount = rollCallRecords.filter((r) => r.status === 'overdue').length;

    const newBroadcast: BroadcastNotification = {
      id: `bc-curfew-${Date.now()}`,
      title: `10:30 PM Night Roll Call Automated Report (${timeStr})`,
      content: `Hostel safety audit complete: ${insideCount} students verified inside/mess, ${gatePassCount} students checked out on approved gate passes, ${overdueCount} students overdue past curfew. Wardens can rest assured.`,
      target: 'all',
      targetValue: 'All Wardens & Supervisors',
      sender: 'Automated Curfew Engine',
      sentAt: timeStr,
      priority: overdueCount > 0 ? 'urgent' : 'normal',
      readCount: 1,
      totalRecipients: 8,
    };
    setBroadcasts((prev) => [newBroadcast, ...prev]);
  };

  // Broadcast
  const sendBroadcast = (data: Omit<BroadcastNotification, 'id' | 'sentAt' | 'readCount'>) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newBc: BroadcastNotification = {
      ...data,
      id: `bc-${Date.now()}`,
      sentAt: timeStr,
      readCount: 0,
    };
    setBroadcasts((prev) => [newBc, ...prev]);

    // Send to backend database
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          body: data.content,
          isEmergency: data.priority === 'emergency',
          targetAudience: {
            hostel: data.targetValue?.includes('Hostel') ? data.targetValue : 'ALL',
            batch: 'ALL',
          },
        }),
      }).catch(console.warn);
    }
  };

  // Emergency Alert Override with Web Audio API Ambulance Siren!
  const triggerEmergencyAlert = (
    type: EmergencyAlert['type'],
    title: string,
    message: string,
    musterPoint: string,
  ) => {
    const alert: EmergencyAlert = {
      id: `em-${Date.now()}`,
      type,
      title,
      message,
      musterPoint,
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triggeredBy: user?.fullName ? `${user.fullName} (Campus Safety)` : 'Emergency Coordinator',
      active: true,
      checkedInStudentsCount: 1,
    };
    setActiveEmergency(alert);

    // Play loud 6-second ambulance siren even if muted!
    emergencySound.playAmbulanceSiren(6);
  };

  const dismissEmergencyAlert = () => {
    emergencySound.stop();
    setActiveEmergency(null);
  };

  const checkInMuster = (studentName?: string) => {
    if (!activeEmergency) return;
    setActiveEmergency((prev) =>
      prev ? { ...prev, checkedInStudentsCount: prev.checkedInStudentsCount + 1 } : null,
    );
  };

  const resetDemoData = () => {
    localStorage.clear();
    setGatePasses(initialGatePasses);
    setComplaints(initialComplaints);
    setDeduplicatedTickets(initialDeduplicatedTickets);
    setCafeteriaOrders(initialOrders);
    setCafeteriaMenu(initialCafeteriaMenu);
    setRooms(initialRooms);
    setRollCallRecords(initialRoster);
    setBroadcasts(initialBroadcasts);
    setActiveEmergency(null);
  };

  return (
    <CampusOpsContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        lowDataMode,
        setLowDataMode,
        gatePasses,
        requestGatePass,
        approveGatePass,
        rejectGatePass,
        issueGatePassQr,
        logGateExit,
        logGateEntry,
        complaints,
        deduplicatedTickets,
        createComplaint,
        assignComplaint,
        resolveComplaint,
        rejectComplaint,
        reopenComplaint,
        resolveDeduplicatedTicket,
        rejectDeduplicatedTicket,
        upvoteComplaint,
        simulateOutageSurge,
        messMenu,
        mealRatings,
        rateMealItem,
        cafeteriaOrders,
        cafeteriaMenu,
        addCafeteriaItem,
        updateCafeteriaItem,
        deleteCafeteriaItem,
        toggleCafeteriaItemStock,
        placeCafeteriaOrder,
        updateOrderStatus,
        cancelCafeteriaOrder,
        submitOrderReview,
        messCheckIn,
        rooms,
        bookBed,
        rollCallRecords,
        nightCurfewReportTime,
        triggerNightCurfewReport,
        broadcasts,
        sendBroadcast,
        activeEmergency,
        triggerEmergencyAlert,
        dismissEmergencyAlert,
        checkInMuster,
        staffRequests,
        approveStaffRequest,
        rejectStaffRequest,
        addStaffRequest,
        refreshStaffRequests,
        resetDemoData,
      }}
    >
      {children}
    </CampusOpsContext.Provider>
  );
};

export const useCampusOps = () => {
  const context = useContext(CampusOpsContext);
  if (!context) {
    throw new Error('useCampusOps must be used within a CampusOpsProvider');
  }
  return context;
};

// Trade helpers
function getTradeName(cat: ComplaintCategory): string {
  switch (cat) {
    case 'electrical':
      return 'Electrical';
    case 'plumbing':
      return 'Plumbing';
    case 'wifi':
      return 'Network & IT';
    case 'carpentry':
      return 'Carpentry';
    case 'cleaning':
      return 'Housekeeping';
    case 'ac':
      return 'HVAC / Cooling';
  }
}

function getTechnicianForCategory(cat: ComplaintCategory): string {
  switch (cat) {
    case 'electrical':
      return 'Rajesh Kumar (Senior Electrician)';
    case 'plumbing':
      return 'Mohammed Arif (Plumber)';
    case 'wifi':
      return 'Suresh Menon (Network Admin)';
    case 'carpentry':
      return 'Hari Om (Carpenter)';
    case 'cleaning':
      return 'Radha Bai (Sanitation Supervisor)';
    case 'ac':
      return 'Manoj Verma (HVAC Tech)';
  }
}
