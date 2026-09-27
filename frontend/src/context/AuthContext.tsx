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
    hostel?: string;
    roomNumber?: string;
    batch?: string;
  } | null;

  backendRole: string | null;
  token: string | null;
  loading: boolean;

  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;

  login: (phoneNumber: string, password: string) => Promise<void>;

  register: (userData: {
    fullName: string;
    phoneNumber: string;
    password: string;
    role: string;
    locationId?: string;
    hostel?: string;
    batch?: string;
    shifts?: any[];
  }) => Promise<void>;

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

        setUser({
          id: rawUser.id || rawUser._id,
          fullName: rawUser.fullName,
          role: frontendRole,
          phoneNumber: rawUser.phoneNumber,
          hostel: rawUser.hostel || rawUser.locationId?.buildingName,
          roomNumber: rawUser.roomNumber || rawUser.locationId?.roomNumber,
          batch: rawUser.batch,
        });
        setActiveRoleState(frontendRole);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
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
    password: string
  ): Promise<void> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        password,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Login failed'
      );
    }

    const data = await res.json();
    const authToken = data.data?.token || data.token;
    const rawUser = data.data?.user || data.user;

    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }

    const backendRoleFromData = rawUser.role;
    setBackendRole(backendRoleFromData);
    const frontendRole = mapBackendRoleToFrontend(backendRoleFromData);

    setUser({
      id: rawUser.id || rawUser._id,
      fullName: rawUser.fullName,
      role: frontendRole,
      phoneNumber: rawUser.phoneNumber,
      hostel: rawUser.hostel || rawUser.locationId?.buildingName,
      roomNumber: rawUser.roomNumber || rawUser.locationId?.roomNumber,
      batch: rawUser.batch,
    });
    setActiveRoleState(frontendRole);
  };

  // Register
  const register = async (userData: {
    fullName: string;
    phoneNumber: string;
    password: string;
    role: string;
    locationId?: string;
    hostel?: string;
    batch?: string;
    shifts?: any[];
  }): Promise<void> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Registration failed'
      );
    }

    const data = await res.json();
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
        hostel: rawUser.hostel || userData.hostel,
        roomNumber: rawUser.roomNumber,
        batch: rawUser.batch || userData.batch,
      });
    }
    setActiveRoleState(frontendRole);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
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
        setActiveRole: setActiveRoleState,
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