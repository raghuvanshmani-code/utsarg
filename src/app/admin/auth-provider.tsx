
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';
import { AdminLoginForm } from '@/components/admin-login-form';
import { Loader2 } from 'lucide-react';

interface AdminAuthContextType {
  isAdmin: boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, auth } = useUser();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLoginForm />;
  }

  return (
    <AdminAuthContext.Provider value={{ isAdmin, logout: handleLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
