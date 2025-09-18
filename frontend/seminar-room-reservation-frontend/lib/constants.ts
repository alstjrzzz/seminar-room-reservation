// 개발 환경과 프로덕션 환경에 따라 API URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  RESERVATION: `${API_BASE_URL}/api/reservation`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  ADMIN_LOG: `${API_BASE_URL}/api/admin/log`,
} as const;

export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || '세미나실 예약 시스템',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || '세미나실 예약 관리 시스템',
} as const; 