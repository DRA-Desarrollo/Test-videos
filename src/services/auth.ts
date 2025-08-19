import { supabase } from '../utils/supabaseClient';
import type { AuthUser } from '../types/auth';

export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error('No user data after sign in.');
  await ensurePublicUser(data.user.id, data.user.email ?? undefined);
  return data.user as AuthUser;
};

export const signUp = async (email: string, password: string): Promise<AuthUser> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error('No user data after sign up.');
  return data.user as AuthUser;
};

export const ensurePublicUser = async (id: string, email?: string | null): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .upsert([{ id, email }], { onConflict: 'id' });
  if (error) throw error;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user as AuthUser | null;
};
