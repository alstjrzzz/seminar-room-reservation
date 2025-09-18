package com.alstjrzzz.srr.dto.reservation;

import com.alstjrzzz.srr.domain.Reservation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReservationResponseDTO {

    private Long id;
    private Long roomId;
    private String nickname;
    //  private String studentName;
//  private Integer studentId;
//  private String phoneNumber;
    private String purpose;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;

    public static ReservationResponseDTO from(Reservation reservation) {

        return ReservationResponseDTO.builder()
                .id(reservation.getId())
                .roomId(reservation.getRoomId())
                .nickname(reservation.getNickname())
                .purpose(reservation.getPurpose())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .createdAt(reservation.getCreatedAt())
                .build();
    }
}