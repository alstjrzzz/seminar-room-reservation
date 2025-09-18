// 관리자 인증 관련 유틸리티 함수들

const AUTH_KEY = 'admin_auth_status';

export const adminAuth = {
  // 관리자 인증 상태 확인
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_KEY) === 'authenticated';
  },

  // 관리자 인증 상태 설정
  setAuth: (status: 'authenticated' | 'unauthenticated') => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEY, status);
  },

  // 관리자 인증 정보 삭제
  clearAuth: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEY);
  },

  // API 요청에 사용할 헤더를 반환
  getAuthHeader: () => {
    return {};
  }
}; 