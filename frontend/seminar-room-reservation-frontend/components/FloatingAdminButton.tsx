'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { AdminAuthModal } from './AdminAuthModal';
import { adminAuth } from '@/utils/adminAuth';

export function FloatingAdminButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // 기본 페이지에서만 로컬스토리지 초기화
    if (pathname === '/') {
      adminAuth.clearAuth();
    }
  }, [pathname]);

  const handleClick = () => {
    if (!mounted) return;

    if (pathname === '/admin') {
      router.push('/');
    } else if (adminAuth.isAuthenticated()) {
      router.push('/admin');
    } else {
      setIsModalOpen(true);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
          pathname === '/admin' 
            ? 'bg-white hover:bg-gray-100' 
            : 'bg-gray-900 hover:bg-gray-800'
        }`}
        size="icon"
      >
        <Settings className={`h-6 w-6 ${pathname === '/admin' ? 'text-gray-900' : 'text-white'}`} />
      </Button>
      <AdminAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
} 