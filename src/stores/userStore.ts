import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

export interface UserProfile {
  id: string;
  username: string;
  title: string;
  bio: string;
  avatar_url: string;
  profile_image_url: string | null;
  theme: string;
  template_id: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  birthday: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  location: string | null;
  show_view_count: boolean;
  show_latest_posts: boolean;
  contains_sensitive_content: boolean;
  theme_color: string | null;
  background_color: string | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updateProfile: async (updates) => {
    const { user } = get();
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ profile: data, isLoading: false });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  fetchProfile: async () => {
    const { user } = get();
    
    if (!user) {
      set({ isLoading: false });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      set({ profile: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, profile: null });
    } catch (error) {
      console.error('Error logging out:', error);
      set({ error: (error as Error).message });
    }
  },
}));