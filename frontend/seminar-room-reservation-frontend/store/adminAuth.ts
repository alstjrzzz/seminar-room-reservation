'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_ENDPOINTS } from '@/lib/constants';

interface AdminAuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  validatePassword: (password: string) => Promise<boolean>;
}

const AUTH_TIMEOUT = 24 * 60 * 60 * 1000; // 24시간

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      validatePassword: async (password: string) => {
        try {
          const response = await fetch(API_ENDPOINTS.ADMIN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
          });

          if (response.ok) {
            set({ isAuthenticated: true });
            return true;
          }
          set({ isAuthenticated: false });
          return false;
        } catch (error) {
          console.error('Password validation error:', error);
          set({ isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 