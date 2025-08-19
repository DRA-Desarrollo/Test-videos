import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';
import type { AuthState } from '../types/store'; // Usamos import type
import { useVideoStore } from './videoStore';
import { ensurePublicUser } from '../services/auth';

// Definimos una interfaz para el tipo de error
interface SupabaseError {
  message: string;
  code: string;
  details: string;
  hint: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Lanzamos el error para que se capture en el catch
        throw error;
      }
      set({ user: data.user, session: data.session, loading: false });
      await useVideoStore.getState().determineAndSetCurrentVideo(data.user?.id);
    } catch (error) {
      // Usamos la interfaz SupabaseError para tipar el error
      const supabaseError = error as SupabaseError;
      console.error('Error al iniciar sesión:', supabaseError.message);
      set({ error: supabaseError.message, loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        // Lanzamos el error para que se capture en el catch
        throw error;
      }
      set({ user: data.user, session: data.session, loading: false });
      await useVideoStore.getState().determineAndSetCurrentVideo(data.user?.id);
    } catch (error) {
      // Usamos la interfaz SupabaseError para tipar el error
      const supabaseError = error as SupabaseError;
      console.error('Error al registrarse:', supabaseError.message);
      set({ error: supabaseError.message, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      set({ user: null, session: null, loading: false });
      useVideoStore.getState().setCurrentVideo(null);
    } catch (error) {
      const supabaseError = error as SupabaseError;
      console.error('Error al cerrar sesión:', supabaseError.message);
      set({ error: supabaseError.message, loading: false });
    }
  },

  initializeAuth: async () => {
    set({ loading: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      set({ session, user: session?.user || null, loading: false });
      if (session?.user) {
        try {
          await ensurePublicUser(session.user.id, session.user.email ?? undefined);
        } catch (e) {
          console.error('No se pudo sincronizar public.users:', (e as any)?.message || e);
        }
      }
      await useVideoStore.getState().determineAndSetCurrentVideo(session?.user?.id);
    } catch (error) {
      const supabaseError = error as SupabaseError;
      console.error('Error al inicializar la autenticación:', supabaseError.message);
      set({ error: supabaseError.message, loading: false });
    } finally {
      set({ loading: false });
    }
  },
}));