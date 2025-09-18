package com.alstjrzzz.srr.domain;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class Reservation {

    private Long id;
    private Long roomId;
    private String nickname;
    private String studentName;
    private Integer studentId;
    private String phoneNumber;
    private String purpose;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
}
