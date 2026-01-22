import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string,username:string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const email = await SecureStore.getItemAsync('user_email');
      if (email) {
        // We have a stored session. Let's try to fetch the user details.
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('email', email)
          .single();

        if (data && !error) {
          setUser(data);
        } else {
          await SecureStore.deleteItemAsync('user_email');
        }
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Invalid email or password');
      }

      setUser(data);
      await SecureStore.setItemAsync('user_email', email);
      return { success: true };
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string,username:string, password: string) => {
    try {
      setLoading(true);
      // Check if user exists
      const { data: existing } = await supabase.from('User').select('email').eq('email', email).single();
      if (existing) {
        throw new Error('User already exists');
      }

      // Using dummy values for fields not provided by user but required by the problem statement/schema if any.
      // Problem says "User table which contains four fields: email,password,stress_level,day_number"
      const { error } = await supabase.from('User').insert([{
        email,
        password,
        stress_level: 0,
        day_number: 1,
        username
      }]);

      if (error) throw error;

      // Auto sign in
      setUser({ email, password, stress_level: 0, day_number: 1,username });
      await SecureStore.setItemAsync('user_email', email);
      return { success: true };

    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user_email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
