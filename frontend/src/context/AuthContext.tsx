import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { UserRole } from '../types';

export const mapBackendRoleToFrontend = (backendRole?: string | null): UserRole => {
  switch (backendRole?.toUpperCase()) {
    case 'STUDENT':
      return 'student';
    case 'WARDEN':
      return 'warden';
    case 'TECHNICIAN':
      return 'technician';
    case 'SECURITY':
    case 'GUARD':
      return 'guard';
    case 'MESS':
      return 'mess';
    case 'KIOSK':
      return 'kiosk';
    case 'ADMIN':
      return 'admin';
    case 'FACULTY':
    case 'HOD':
    case 'EXAM_CELL':
    case 'ACCOUNTS':
      return 'faculty';
    default:
      return 'student';
  }
};

interface AuthContextType {
  user: {
    id: string;
    fullName: string;
    role: UserRole;
    phoneNumber: string;
    email?: string;
    designation?: string;
    employeeId?: string;
    department?: string;
    cabin?: string;
    officeHours?: string;
    bio?: string;
    status?: string;
    hostel?: string;
    roomNumber?: string;
    bedLabel?: string;
    batch?: string;
  } | null;

  backendRole: string | null;
  token: string | null;
  loading: boolean;

  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  updateUserRoom: (roomData: { hostel: string; roomNumber: string; bedLabel: string }) => Promise<void>;
  updateUserProfile: (profileData: Partial<{
    fullName: string;
    email: string;
    designation: string;
    department: string;
    cabin: string;
    officeHours: string;
    bio: string;
  }>) => Promise<void>;

  login: (phoneNumber: string, password: string, overrideRole?: UserRole) => Promise<void>;

  register: (userData: {
    fullName: string;
    phoneNumber: string;
    password: string;
    role: string;
    email?: string;
    designation?: string;
    employeeId?: string;
    offerLetter?: string;
    offerLetterName?: string;
    locationId?: string;
    hostel?: string;
    batch?: string;
    shifts?: any[];
  }) => Promise<{ isPending?: boolean; message?: string; user?: any; data?: any } | void>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [backendRole, setBackendRole] = useState<string | null>(null);
  const [token, setToken] = useState<AuthContextType['token']>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRole, setActiveRoleState] = useState<UserRole>('student');

  // Restore authentication from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
      localStorage.removeItem('token');
      setLoading(false);
      return;
    }

    setToken(storedToken);

    const restoreUser = async () => {
      try {
        let res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!res.ok) {
          res = await fetch('/api/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
        }

        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }

        const data = await res.json();
        const rawUser = data.data?.user || data.user;
        const backendRoleFromData = rawUser.role;

        setBackendRole(backendRoleFromData);
        const frontendRole = mapBackendRoleToFrontend(backendRoleFromData);
        const storedRole = localStorage.getItem('active_role') as UserRole | null;
        const validRoles: UserRole[] = ['student', 'warden', 'technician', 'guard', 'mess', 'kiosk', 'admin', 'faculty'];

        // Ensure user active role matches their registered role (unless Super Admin using switcher)
        let resolvedRole: UserRole = frontendRole;
        if (backendRoleFromData === 'ADMIN' && storedRole && validRoles.includes(storedRole)) {
          resolvedRole = storedRole;
        } else {
          resolvedRole = frontendRole;
        }

        const storedRoom = localStorage.getItem('student_assigned_room');
        let parsedRoom: { hostel?: string; roomNumber?: string; bedLabel?: string } | null = null;
        if (storedRoom) {
          try {
            parsedRoom = JSON.parse(storedRoom);
          } catch {}
        }

        const userHostel = parsedRoom?.hostel || rawUser.hostel || rawUser.locationId?.buildingName || 'Hostel A';
        const userRoom = parsedRoom?.roomNumber || rawUser.roomNumber || rawUser.locationId?.roomNumber || '101';
        const userBed = parsedRoom?.bedLabel || rawUser.bedLabel || 'A';

        setUser({
          id: rawUser.id || rawUser._id,
          fullName: rawUser.fullName,
          role: resolvedRole,
          phoneNumber: rawUser.phoneNumber,
          email: rawUser.email || '',
          designation: rawUser.designation || (frontendRole === 'faculty' ? 'Assistant Professor / Faculty' : ''),
          employeeId: rawUser.employeeId || '',
          department: rawUser.department || (frontendRole === 'faculty' ? 'Computer Science & Engineering' : ''),
          cabin: rawUser.cabin || (frontendRole === 'faculty' ? 'Academic Block B, Room 304' : ''),
          officeHours: rawUser.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
          bio: rawUser.bio || '',
          status: rawUser.status || 'ACTIVE',
          hostel: userHostel,
          roomNumber: userRoom,
          bedLabel: userBed,
          batch: rawUser.batch,
        });
        setActiveRoleState(resolvedRole);
        localStorage.setItem('active_role', resolvedRole);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('active_role');
        setToken(null);
        setUser(null);
        setBackendRole(null);
        setActiveRoleState('student');
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  // Login
  const login = async (
    phoneNumber: string,
    password: string,
    overrideRole?: UserRole
  ): Promise<void> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        password,
        role: overrideRole,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detailedMsg =
        (Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
        errorData.message ||
        'Login failed';
      const err: any = new Error(detailedMsg);
      if (errorData.correctRole) {
        err.correctRole = errorData.correctRole;
      }
      throw err;
    }

    const data = await res.json();
    const rawUser = data.data?.user || data.user;
    const backendRoleFromData = rawUser.role;
    setBackendRole(backendRoleFromData);
    const frontendRole = mapBackendRoleToFrontend(backendRoleFromData);

    const roleDisplayNames: Record<UserRole, string> = {
      student: 'Student',
      faculty: 'Faculty / Staff',
      warden: 'Hostel Warden',
      guard: 'Security Guard',
      admin: 'Campus Admin',
      technician: 'Maintenance Tech',
      mess: 'Mess Manager',
      kiosk: 'Self-Service Kiosk',
    };

    // Strict role matching check
    if (overrideRole && overrideRole !== frontendRole) {
      localStorage.removeItem('token');
      localStorage.removeItem('active_role');
      setToken(null);
      setUser(null);
      const actualName = roleDisplayNames[frontendRole] || frontendRole;
      const requestedName = roleDisplayNames[overrideRole] || overrideRole;
      const err: any = new Error(
        `Role mismatch: This account is registered as "${actualName}", not "${requestedName}". Please select "${actualName}" to sign in.`
      );
      err.correctRole = frontendRole;
      throw err;
    }

    const authToken = data.data?.token || data.token;
    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }

    const resolvedRole = frontendRole;
    localStorage.setItem('active_role', resolvedRole);

    const storedRoom = localStorage.getItem('student_assigned_room');
    let parsedRoom: { hostel?: string; roomNumber?: string; bedLabel?: string } | null = null;
    if (storedRoom) {
      try {
        parsedRoom = JSON.parse(storedRoom);
      } catch {}
    }

    const userHostel = parsedRoom?.hostel || rawUser.hostel || rawUser.locationId?.buildingName || 'Hostel A';
    const userRoom = parsedRoom?.roomNumber || rawUser.roomNumber || rawUser.locationId?.roomNumber || '101';
    const userBed = parsedRoom?.bedLabel || rawUser.bedLabel || 'A';

    setUser({
      id: rawUser.id || rawUser._id,
      fullName: rawUser.fullName,
      role: resolvedRole,
      phoneNumber: rawUser.phoneNumber,
      email: rawUser.email || '',
      designation: rawUser.designation || (frontendRole === 'faculty' ? 'Assistant Professor / Faculty' : ''),
      employeeId: rawUser.employeeId || '',
      department: rawUser.department || (frontendRole === 'faculty' ? 'Computer Science & Engineering' : ''),
      cabin: rawUser.cabin || (frontendRole === 'faculty' ? 'Academic Block B, Room 304' : ''),
      officeHours: rawUser.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
      bio: rawUser.bio || '',
      status: rawUser.status || 'ACTIVE',
      hostel: userHostel,
      roomNumber: userRoom,
      bedLabel: userBed,
      batch: rawUser.batch,
    });
    setActiveRoleState(resolvedRole);
  };

  // Update User Assigned Room
  const updateUserRoom = async (roomData: { hostel: string; roomNumber: string; bedLabel: string }) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            hostel: roomData.hostel,
            roomNumber: roomData.roomNumber,
            bedLabel: roomData.bedLabel,
          }
        : null
    );

    localStorage.setItem('student_assigned_room', JSON.stringify(roomData));

    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      try {
        await fetch('/api/auth/room', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(roomData),
        });
      } catch (err) {
        console.warn('Could not sync room update to server:', err);
      }
    }
  };

  // Update Profile (Faculty / Staff / Student)
  const updateUserProfile = async (profileData: Partial<{
    fullName: string;
    email: string;
    designation: string;
    department: string;
    cabin: string;
    officeHours: string;
    bio: string;
  }>) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...profileData,
          }
        : null
    );

    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update profile');
      }

      const data = await res.json();
      const updatedUser = data.data?.user || data.user;
      if (updatedUser) {
        setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      }
    }
  };

  // Register
  const register = async (userData: {
    fullName: string;
    phoneNumber: string;
    password: string;
    role: string;
    email?: string;
    designation?: string;
    employeeId?: string;
    offerLetter?: string;
    offerLetterName?: string;
    locationId?: string;
    hostel?: string;
    batch?: string;
    shifts?: any[];
  }): Promise<{ isPending?: boolean; message?: string; user?: any; data?: any } | void> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detailedMsg =
        (Array.isArray(errorData.errors) && errorData.errors[0]?.message) ||
        errorData.message ||
        'Registration failed';
      throw new Error(detailedMsg);
    }

    const data = await res.json();
    if (data.isPending) {
      return { isPending: true, message: data.message, user: data.data?.user || data.user, data: data.data };
    }

    const authToken = data.data?.token || data.token;
    const rawUser = data.data?.user || data.user;

    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }

    const backendRoleFromData = rawUser?.role || userData.role;
    setBackendRole(backendRoleFromData);
    const frontendRole = mapBackendRoleToFrontend(backendRoleFromData);

    if (rawUser) {
      setUser({
        id: rawUser.id || rawUser._id,
        fullName: rawUser.fullName,
        role: frontendRole,
        phoneNumber: rawUser.phoneNumber,
        email: rawUser.email || userData.email || '',
        designation: rawUser.designation || userData.designation || '',
        employeeId: rawUser.employeeId || userData.employeeId || '',
        department: rawUser.department || 'Computer Science & Engineering',
        cabin: rawUser.cabin || 'Academic Block B, Room 304',
        officeHours: rawUser.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
        bio: rawUser.bio || '',
        status: rawUser.status || 'ACTIVE',
        hostel: rawUser.hostel || userData.hostel,
        roomNumber: rawUser.roomNumber,
        bedLabel: rawUser.bedLabel || 'A',
        batch: rawUser.batch || userData.batch,
      });
    }
    setActiveRoleState(frontendRole);
    localStorage.setItem('active_role', frontendRole);
  };

  const setActiveRole = (newRole: UserRole) => {
    localStorage.setItem('active_role', newRole);
    setActiveRoleState(newRole);
    if (user) {
      setUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('active_role');
    localStorage.removeItem('student_assigned_room');
    setToken(null);
    setUser(null);
    setBackendRole(null);
    setActiveRoleState('student');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        backendRole,
        token,
        loading,
        activeRole,
        setActiveRole,
        updateUserRoom,
        updateUserProfile,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};