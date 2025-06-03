import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
    // If Firebase auth is not available, use mock data for development
    if (!auth) {
      setFirebaseUser(null);
      refreshUser();
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Load user data from localStorage
        refreshUser();
      } else {
        setUser(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
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
