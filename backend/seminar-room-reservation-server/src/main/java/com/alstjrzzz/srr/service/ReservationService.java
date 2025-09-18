package com.alstjrzzz.srr.service;

import com.alstjrzzz.srr.domain.Reservation;
import com.alstjrzzz.srr.dto.reservation.CancelReservationRequestDTO;
import com.alstjrzzz.srr.entity.ReservationEntity;
import com.alstjrzzz.srr.entity.RoomEntity;
import com.alstjrzzz.srr.exception.*;
import com.alstjrzzz.srr.repository.ReservationRepository;
import com.alstjrzzz.srr.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public void reservation(Reservation reservation) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime maxReservationTime = now.plusDays(7);
        LocalDateTime minAllowedStartTime = now.minusHours(1);

        if (reservation.getEndTime().isBefore(reservation.getStartTime()) ||
                reservation.getStartTime().isBefore(minAllowedStartTime) ||
                reservation.getEndTime().isBefore(now) ||
                reservation.getStartTime().isAfter(maxReservationTime) ||
                reservation.getEndTime().isAfter(maxReservationTime)) {

            throw new InvalidReservationTimeException("예약 시간이 올바르지 않습니다.");
        }

        if (!isReservationTimeAvailable(reservation.getRoomId(), reservation.getStartTime(), reservation.getEndTime())) {
            throw new DuplicateReservationException("이미 예약된 시간입니다.");
        }

        RoomEntity roomEntity = roomRepository.findById(reservation.getRoomId())
                .orElseThrow(() -> new RoomNotFoundException("존재하지 않는 방 ID 입니다."));

        reservationRepository.save(ReservationEntity.from(reservation, roomEntity));
    }

    @Transactional
    public void cancelReservation(CancelReservationRequestDTO requestDTO) {

        Long reservationId = requestDTO.getReservationId();
        Integer studentId = requestDTO.getStudentId();
        String studentName = requestDTO.getStudentName();

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new InvalidReservationIdException("존재하지 않는 예약 ID입니다."))
                .toReservation();

        if (reservation.getStudentId().equals(studentId) &&
                reservation.getStudentName().equals(studentName)) {

            RoomEntity roomEntity = roomRepository.findById(reservation.getRoomId())
                    .orElseThrow(() -> new RoomNotFoundException("존재하지 않는 방 ID 입니다."));

            reservationRepository.delete(ReservationEntity.from(reservation, roomEntity));
        }
        else {
            throw new InvalidStudentInfoException("입력하신 학번 또는 암호가 올바르지 않습니다.");
        }
    }

    @Transactional
    public void deleteReservation(Long reservationId) {

        ReservationEntity reservationEntity = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new InvalidReservationIdException("존재하지 않는 예약 ID입니다."));

        reservationRepository.delete(reservationEntity);
    }

    public List<Reservation> findReservationsByRoomForNextWeek(Long roomId) {

        if (!roomRepository.existsById(roomId)) {
            throw new RoomNotFoundException("존재하지 않는 방 ID 입니다.");
        }

        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(7);

        return reservationRepository.findReservationsByRoomAndDateRange(roomId, start, end)
                .stream()
                .map(ReservationEntity::toReservation)
                .collect(Collectors.toList());
    }

    public List<ReservationEntity> findAllReservations() {

        // Room까지 한 번에 보내기 위해 entity를 그대로 반환. domain은 room_id만 갖고 있다.
        return reservationRepository.findAllWithRoom();
    }

    public boolean isReservationTimeAvailable(Long roomId, LocalDateTime startTime, LocalDateTime endTime) {

        return reservationRepository.findConflictingReservations(roomId, startTime, endTime).isEmpty();
    }
}
