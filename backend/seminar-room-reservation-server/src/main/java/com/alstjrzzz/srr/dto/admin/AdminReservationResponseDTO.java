package com.alstjrzzz.srr.dto.admin;

import com.alstjrzzz.srr.entity.ReservationEntity;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminReservationResponseDTO {

    private Long id;
    //  private Long roomId;
    private String roomName;
    private String nickname;
    private String studentName;
    private Integer studentId;
    private String phoneNumber;
    private String purpose;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;

    public static AdminReservationResponseDTO from(ReservationEntity reservationEntity) {

        return AdminReservationResponseDTO.builder()
                .id(reservationEntity.getId())
                .roomName(reservationEntity.getRoom().getName())
                .nickname(reservationEntity.getNickname())
                .studentName(reservationEntity.getStudentName())
                .studentId(reservationEntity.getStudentId())
                .phoneNumber(reservationEntity.getPhoneNumber())
                .purpose(reservationEntity.getPurpose())
                .startTime(reservationEntity.getStartTime())
                .endTime(reservationEntity.getEndTime())
                .createdAt(reservationEntity.getCreatedAt())
                .build();
    }
}
