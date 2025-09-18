package com.alstjrzzz.srr.dto.reservation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class CancelReservationRequestDTO {

    @NotNull
    private Long reservationId;

    @NotBlank
    private String studentName;

    @NotNull
    private Integer studentId;
}
