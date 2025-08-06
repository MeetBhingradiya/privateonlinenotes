'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';

export function ClientHeader() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    isAnonymous: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            isAnonymous: false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Update user state immediately
        setUser(null);
        // Redirect to home page
        window.location.href = '/';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear user state and reload
      setUser(null);
      window.location.reload();
    }
  };

  return <Header user={user} onLogout={handleLogout} />;
}
