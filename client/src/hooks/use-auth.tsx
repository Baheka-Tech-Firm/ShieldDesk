import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthUser, Company, getCurrentUser, getCurrentCompany, signOut } from "@/lib/auth";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: AuthUser | null;
  company: Company | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    setUser(getCurrentUser());
    setCompany(getCurrentCompany());
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setCompany(null);
  };

  useEffect(() => {
    let isMounted = true;

    // Set mock user data for development
    const mockUser: AuthUser = {
      id: 1,
      firebaseUid: 'mock-uid',
      email: 'admin@shielddesk.com',
      name: 'Admin User',
      role: 'admin',
      companyId: 1
    };
    
    const mockCompany: Company = {
      id: 1,
      name: 'ShieldDesk Enterprise',
      industry: 'Cybersecurity',
      size: 'Enterprise',
      country: 'United States'
    };

    if (isMounted) {
      setUser(mockUser);
      setCompany(mockCompany);
      setFirebaseUser(null);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      firebaseUser,
      user,
      company,
      loading,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
