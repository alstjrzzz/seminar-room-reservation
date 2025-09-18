package com.alstjrzzz.srr.entity;

import com.alstjrzzz.srr.domain.Reservation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservation")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ReservationEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private RoomEntity room;

    @Column(name = "nickname", nullable = false)
    private String nickname;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "purpose", nullable = false)
    private String purpose;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public static ReservationEntity from(Reservation reservation, RoomEntity roomEntity) {

        return ReservationEntity.builder()
                .id(reservation.getId())
                .room(roomEntity)
                .nickname(reservation.getNickname())
                .studentName(reservation.getStudentName())
                .studentId(reservation.getStudentId())
                .phoneNumber(reservation.getPhoneNumber())
                .purpose(reservation.getPurpose())
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .createdAt(reservation.getCreatedAt())
                .build();
    }

    public Reservation toReservation() {

        return Reservation.builder()
                .id(id)
                .roomId(room.getId())
                .nickname(nickname)
                .studentName(studentName)
                .studentId(studentId)
                .phoneNumber(phoneNumber)
                .purpose(purpose)
                .startTime(startTime)
                .endTime(endTime)
                .createdAt(createdAt)
                .build();
    }
}
