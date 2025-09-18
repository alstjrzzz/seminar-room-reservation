import { useState } from 'react';

interface Reservation {
    nickname: string;
    reservationId: number;
    purpose: string;
    startTime: string;
    endTime: string;
}

interface ReservationResponse {
    reservationList: Reservation[];
}

export function useReservation() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReservations = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/reservation');
            if (!response.ok) {
                throw new Error('예약 목록을 가져오는데 실패했습니다.');
            }
            
            const data: ReservationResponse = await response.json();
            setReservations(data.reservationList);
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        reservations,
        isLoading,
        error,
        fetchReservations
    };
} 