import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';

export interface GameReward {
  discount: number; // 0 to 1 (e.g., 0.1 for 10% off)
  multiplier: number; // 1 or more (e.g., 1.2 for 20% more impact)
  expiresAt: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  reward: GameReward | null;
  setReward: (reward: GameReward | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState<GameReward | null>(null);

  const createAnonymousUser = async () => {
    // Generate random username
    const username = `user_${Math.random().toString(36).substring(2, 10)}`;

    const { data, error } = await supabase
      .from('users')
      .insert({ username })
      .select()
      .single();

    if (error) throw error;

    // Store user ID in localStorage
    localStorage.setItem('userId', data.id);
    return data;
  };

  const fetchUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  };

  const initUser = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');

      if (storedUserId) {
        // Try to fetch existing user
        try {
          const userData = await fetchUser(storedUserId);
          setUser(userData);
        } catch {
          // User not found, create new one
          const newUser = await createAnonymousUser();
          setUser(newUser);
        }
      } else {
        // No stored user, create new one
        const newUser = await createAnonymousUser();
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const userData = await fetchUser(user.id);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    initUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, reward, setReward }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
