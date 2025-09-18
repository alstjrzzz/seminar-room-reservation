package com.alstjrzzz.srr.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GetAdminRoomsResponseDTO {

    private List<AdminRoomResponseDTO> rooms;
}
