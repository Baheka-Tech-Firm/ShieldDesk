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
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = getCurrentUser() || {
          id: 1,
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || 'user@shielddesk.com',
          name: firebaseUser.displayName || 'User',
          role: 'admin',
          companyId: 1
        };
        
        const companyData = getCurrentCompany() || {
          id: 1,
          name: 'ShieldDesk Enterprise',
          industry: 'Cybersecurity',
          size: 'Enterprise',
          country: 'United States'
        };
        
        setUser(userData);
        setCompany(companyData);
      } else {
        setUser(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
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
