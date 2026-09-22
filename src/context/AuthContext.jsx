// Authentication Context (Firebase Auth + LocalStorage Mirror)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  saveUserProfile, 
  getUserProfile, 
  getChildProfiles, 
  saveChildProfile, 
  updateChildProfile 
} from '../services/sessionStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const LOCAL_USER_KEY = 'brightminds_active_user';
const ACTIVE_CHILD_KEY = 'brightminds_active_child_id';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [activeChild, setActiveChildState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set active child and save selection to localStorage
  const setActiveChild = useCallback((child) => {
    setActiveChildState(child);
    if (child?.childId) {
      try {
        localStorage.setItem(ACTIVE_CHILD_KEY, child.childId);
      } catch (e) {}
    }
  }, []);

  // Fetch children for a given user ID
  const loadChildren = useCallback(async (userId) => {
    if (!userId) {
      setChildrenList([]);
      setActiveChildState(null);
      return [];
    }

    try {
      const list = await getChildProfiles(userId);
      setChildrenList(list);

      // Restore previously selected child or default to first child
      const savedChildId = localStorage.getItem(ACTIVE_CHILD_KEY);
      const matched = list.find(c => c.childId === savedChildId);
      if (matched) {
        setActiveChildState(matched);
      } else if (list.length > 0) {
        setActiveChildState(list[0]);
      } else {
        setActiveChildState(null);
      }
      return list;
    } catch (err) {
      console.warn("loadChildren error:", err);
      return [];
    }
  }, []);

  // Add child profile
  const addChildProfile = async (name, age, notes = '') => {
    const userId = currentUser?.uid || userProfile?.userId || 'guest_user';
    const savedChild = await saveChildProfile(userId, { name, age, notes });
    
    setChildrenList(prev => {
      const updated = [savedChild, ...prev.filter(c => c.childId !== savedChild.childId)];
      return updated;
    });
    setActiveChild(savedChild);
    return savedChild;
  };

  // Update existing child profile
  const updateChild = async (childId, updates) => {
    const updated = await updateChildProfile(childId, updates);
    if (updated) {
      setChildrenList(prev => prev.map(c => c.childId === childId ? updated : c));
      if (activeChild?.childId === childId) {
        setActiveChildState(updated);
      }
    }
    return updated;
  };

  // Initialize auth state
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          const profile = await getUserProfile(user.uid);
          const activeProfile = profile || {
            userId: user.uid,
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            role: 'Parent'
          };
          setUserProfile(activeProfile);
          await loadChildren(user.uid);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setChildrenList([]);
          setActiveChildState(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local demo mode state initialization
      try {
        const storedUser = localStorage.getItem(LOCAL_USER_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser({ uid: parsed.userId, email: parsed.email, displayName: parsed.name });
          setUserProfile(parsed);
          loadChildren(parsed.userId);
        }
      } catch (e) {}
      setLoading(false);
    }
  }, [loadChildren]);

  // Signup
  const signup = async (email, password, name, role = 'Parent', childInfo = null) => {
    let uid = 'user_' + Date.now();
    let newUser = { uid, email, displayName: name };

    if (isFirebaseConfigured && auth) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      newUser = res.user;
      await updateProfile(newUser, { displayName: name });
    }

    const profileData = {
      userId: newUser.uid,
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    };

    await saveUserProfile(profileData);
    
    if (!isFirebaseConfigured) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profileData));
    }

    setCurrentUser(newUser);
    setUserProfile(profileData);

    // If child info was provided on signup, create child profile immediately
    if (childInfo && childInfo.name && childInfo.age) {
      try {
        await addChildProfile(childInfo.name, childInfo.age);
      } catch (childErr) {
        console.warn("Signup child profile creation warning:", childErr);
      }
    }

    return profileData;
  };

  // Login
  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(res.user.uid);
      setCurrentUser(res.user);
      setUserProfile(profile);
      await loadChildren(res.user.uid);
      return profile;
    } else {
      // Demo authentication validation
      const localUsers = JSON.parse(localStorage.getItem('brightminds_users_db') || '{}');
      const foundUser = Object.values(localUsers).find(u => u.email === email);

      const profileData = foundUser || {
        userId: 'user_demo_' + Date.now(),
        name: email.split('@')[0],
        email: email,
        role: 'Parent',
        createdAt: new Date().toISOString()
      };

      const demoUserObj = { uid: profileData.userId, email: profileData.email, displayName: profileData.name };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profileData));
      setCurrentUser(demoUserObj);
      setUserProfile(profileData);
      await loadChildren(profileData.userId);
      return profileData;
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(ACTIVE_CHILD_KEY);
    setCurrentUser(null);
    setUserProfile(null);
    setChildrenList([]);
    setActiveChildState(null);
  };

  const value = {
    currentUser,
    userProfile,
    childrenList,
    activeChild,
    setActiveChild,
    addChildProfile,
    updateChild,
    refreshChildren: () => loadChildren(currentUser?.uid || userProfile?.userId),
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
