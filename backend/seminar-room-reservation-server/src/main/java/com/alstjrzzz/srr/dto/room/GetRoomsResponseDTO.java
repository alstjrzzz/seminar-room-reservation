package com.alstjrzzz.srr.dto.room;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetRoomsResponseDTO {

    private List<RoomResponseDTO> rooms;
}
