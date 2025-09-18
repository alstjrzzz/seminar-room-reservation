package com.alstjrzzz.srr.controller;

import com.alstjrzzz.srr.domain.Reservation;
import com.alstjrzzz.srr.dto.reservation.*;
import com.alstjrzzz.srr.service.ReservationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * 예약하기
     * @param requestDTO
     * @param bindingResult
     * @return
     */
    @PostMapping("/api/reservation")
    public ResponseEntity<String> createReservation(@Valid @RequestBody CreateReservationRequestDTO requestDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("입력값이 잘못되었습니다.");
        }

        Reservation reservation = Reservation.builder()
//              .id()
                .roomId(requestDTO.getRoomId())
                .nickname(requestDTO.getNickname())
                .studentName(requestDTO.getStudentName())
                .studentId(requestDTO.getStudentId())
                .phoneNumber(requestDTO.getPhoneNumber())
                .purpose(requestDTO.getPurpose())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
//              .createdAt()
                .build();

        reservationService.reservation(reservation);

        return ResponseEntity.ok("예약이 완료되었습니다.");
    }

    /**
     * 예약 취소하기
     * @param requestDTO
     * @param bindingResult
     * @return
     */
    @DeleteMapping("/api/reservation")
    public ResponseEntity<String> cancelReservation(@Valid @RequestBody CancelReservationRequestDTO requestDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("입력값이 잘못되었습니다.");
        }

        reservationService.cancelReservation(requestDTO);

        return ResponseEntity.ok("예약이 취소되었습니다.");
    }

    /**
     * 예약 현황 확인하기
     * @param roomId
     * @return
     */
    @GetMapping("/api/reservation/{roomId}")
    public ResponseEntity<GetReservationsResponseDTO> getReservations(@NotNull @PathVariable("roomId") Long roomId) {

        List<ReservationResponseDTO> reservationList = reservationService.findReservationsByRoomForNextWeek(roomId)
                .stream()
                .map(ReservationResponseDTO::from)
                .collect(Collectors.toList());

        GetReservationsResponseDTO getReservationsResponseDTO = GetReservationsResponseDTO.builder()
                .reservationList(reservationList)
                .build();

        return ResponseEntity.ok().body(getReservationsResponseDTO);
    }
}
