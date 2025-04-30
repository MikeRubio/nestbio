import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_adult_content: boolean;
  link_type: 'custom' | 'x' | 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'github' | 'tiktok';
  share_count: number;
}

interface LinkState {
  links: Link[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLinks: () => Promise<void>;
  createLink: (link: Omit<Link, 'id' | 'created_at' | 'updated_at'>) => Promise<Link | null>;
  updateLink: (id: string, changes: Partial<Omit<Link, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Link | null>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (linkIds: string[]) => Promise<void>;
}

export const useLinkStore = create<LinkState>((set, get) => ({
  links: [],
  isLoading: false,
  error: null,
  
  fetchLinks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      
      set({ links: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching links:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  createLink: async (link) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('links')
        .insert([link])
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ links: [...state.links, data], isLoading: false }));
      return data;
    } catch (error) {
      console.error('Error creating link:', error);
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },
  
  updateLink: async (id, changes) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('links')
        .update(changes)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({
        links: state.links.map((link) => (link.id === id ? data : link)),
        isLoading: false,
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating link:', error);
      set({ error: (error as Error).message, isLoading: false });
      return null;
    }
  },
  
  deleteLink: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        links: state.links.filter((link) => link.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting link:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  
  reorderLinks: async (linkIds) => {
    try {
      set({ isLoading: true, error: null });
      
      const updates = linkIds.map((id, index) => ({
        id,
        order: index,
      }));
      
      const { error } = await supabase.from('links').upsert(updates);
      
      if (error) throw error;
      
      // Re-fetch links to ensure we have the latest order
      await get().fetchLinks();
    } catch (error) {
      console.error('Error reordering links:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));