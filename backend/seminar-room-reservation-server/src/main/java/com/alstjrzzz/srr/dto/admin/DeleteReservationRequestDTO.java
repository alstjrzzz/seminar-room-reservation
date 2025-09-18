package com.alstjrzzz.srr.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class DeleteReservationRequestDTO {

    @NotNull
    private Long reservationId;
}
