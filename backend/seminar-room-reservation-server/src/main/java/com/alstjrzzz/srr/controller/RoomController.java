package com.alstjrzzz.srr.controller;

import com.alstjrzzz.srr.domain.Room;
import com.alstjrzzz.srr.dto.room.GetRoomsResponseDTO;
import com.alstjrzzz.srr.dto.room.RoomResponseDTO;
import com.alstjrzzz.srr.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    /**
     * 방 현황 확인
     * @return
     */
    @GetMapping("/api/room")
    public ResponseEntity<GetRoomsResponseDTO> getRooms() {

        List<Room> rooms = roomService.getAllRooms();

        List<RoomResponseDTO> roomResponseDTOs = new ArrayList<>();
        for (Room room : rooms) {

            if (!room.isAvailable()) {
                continue;
            }

            roomResponseDTOs.add(RoomResponseDTO.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .location(room.getLocation())
                    .capacity(room.getCapacity())
                    .equipment(room.getEquipment())
                    .description(room.getDescription())
                    .images(room.getImages())
                    .build());
        }

        GetRoomsResponseDTO getRoomsResponseDTO = GetRoomsResponseDTO.builder()
                .rooms(roomResponseDTOs)
                .build();

        return ResponseEntity.ok().body(getRoomsResponseDTO);
    }
}
