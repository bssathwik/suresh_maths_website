import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  userProfile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        const isAdminEmail = user.email?.toLowerCase().trim() === 'balabhadrasaisathwik@gmail.com';
        
        try {
          // Save or update user profile details in the users collection
          try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
              uid: user.uid,
              displayName: user.displayName || 'Suresh Maths Student',
              email: user.email || '',
              photoURL: user.photoURL || '',
              lastLogin: new Date().toISOString()
            }, { merge: true });

            // Subscribe to live profile changes (specialAccess, isBlocked, etc.)
            unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
              if (snapshot.exists()) {
                setUserProfile(snapshot.data());
              } else {
                setUserProfile(null);
              }
            });
          } catch (profileError) {
            console.error("Failed to update user profile in Firestore:", profileError);
          }

          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (!adminDoc.exists() && isAdminEmail) {
            console.log("Auto-bootstrapping admin user...");
            await setDoc(adminDocRef, {
              email: user.email,
              role: 'admin'
            });
            setIsAdmin(true);
          } else {
            setIsAdmin(adminDoc.exists() || isAdminEmail);
          }
        } catch (error) {
          console.error("Error checking/bootstrapping admin status:", error);
          setIsAdmin(isAdminEmail); // Fallback to email trust for this session
        }
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) {
        (unsubscribeProfile as () => void)();
      }
    };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Explicitly update cache/firestore for full sync immediately
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          displayName: name,
          email: email,
          photoURL: '',
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Sign up with email error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Sign in with email error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, userProfile, loading, signIn, signUpWithEmail, signInWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
