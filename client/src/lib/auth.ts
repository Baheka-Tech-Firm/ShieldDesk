import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";
import { apiRequest } from "./queryClient";

const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  id: number;
  firebaseUid: string;
  email: string;
  name: string;
  role: string;
  companyId?: number;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  size?: string;
  country?: string;
}

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('company');
};

export const registerUser = async (firebaseUser: FirebaseUser, userData: {
  name: string;
  company: {
    name: string;
    industry: string;
    size: string;
    country: string;
  };
}) => {
  const token = await firebaseUser.getIdToken();
  
  const response = await apiRequest('POST', '/api/auth/register', {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    name: userData.name,
    company: userData.company
  });

  const data = await response.json();
  
  // Store auth data
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('company', JSON.stringify(data.company));
  
  return data;
};

export const loginUser = async (firebaseUser: FirebaseUser) => {
  const token = await firebaseUser.getIdToken();
  
  const response = await apiRequest('POST', '/api/auth/login', {
    firebaseUid: firebaseUser.uid
  });

  const data = await response.json();
  
  // Store auth data
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(data.user));
  if (data.company) {
    localStorage.setItem('company', JSON.stringify(data.company));
  }
  
  return data;
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getCurrentCompany = (): Company | null => {
  const companyStr = localStorage.getItem('company');
  return companyStr ? JSON.parse(companyStr) : null;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};
