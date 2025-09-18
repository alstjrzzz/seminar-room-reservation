export interface TimeBlock {
  time: string
  label: string
}

export interface Reservation {
  id: string
  date: string
  nickname: string
  studentName: string
  studentId: string
  phoneNumber: string
  purpose: string
  startTime: string
  endTime: string
}

export interface ReservationCancellationDTO {
  reservationId: number
  studentName: string
  studentId: number
}

export interface ApiReservation {
  nickname: string
  reservationId: number
  purpose: string
  startTime: string
  endTime: string
}

export interface ApiReservationResponse {
  reservationList: ApiReservation[]
}
