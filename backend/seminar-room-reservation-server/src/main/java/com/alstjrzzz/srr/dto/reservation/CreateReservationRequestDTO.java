package com.alstjrzzz.srr.dto.reservation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CreateReservationRequestDTO {

//  private Long id;

    @NotNull
    private Long roomId;

    @NotBlank
    private String nickname;

    @NotBlank
    private String studentName;

    @NotNull
    private Integer studentId;

    @NotBlank
    @Pattern(regexp = "^(010|011|016|017|018|019)-\\d{3,4}-\\d{4}$")
    private String phoneNumber;

    @NotBlank
    private String purpose;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

//  private LocalDateTime createdAt;
}
