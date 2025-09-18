'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { adminAuth } from '@/utils/adminAuth';
import { API_ENDPOINTS } from '@/lib/constants';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminAuthModal({ isOpen, onClose }: AdminAuthModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!password) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "비밀번호를 입력해주세요.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        adminAuth.setAuth('authenticated');
        toast({
          title: "로그인 성공",
          description: "관리자 페이지로 이동합니다.",
        });
        onClose();
        router.push('/admin');
      } else {
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: "비밀번호가 올바르지 않습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "서버와의 통신 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>관리자 로그인</DialogTitle>
          <DialogDescription>
            관리자 비밀번호를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              type="password"
              placeholder="관리자 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 