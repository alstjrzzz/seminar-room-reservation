package com.alstjrzzz.srr.dto.reservation;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetReservationsResponseDTO {

    private List<ReservationResponseDTO> reservationList;
}
