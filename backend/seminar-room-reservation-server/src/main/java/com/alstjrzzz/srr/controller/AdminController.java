package com.alstjrzzz.srr.controller;

import com.alstjrzzz.srr.domain.Room;
import com.alstjrzzz.srr.dto.admin.*;
import com.alstjrzzz.srr.dto.room.CreateRoomRequestDTO;
import com.alstjrzzz.srr.dto.room.UpdateRoomRequestDTO;
import com.alstjrzzz.srr.service.AdminService;
import com.alstjrzzz.srr.service.ReservationService;
import com.alstjrzzz.srr.service.RoomService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReservationService reservationService;
    private final RoomService roomService;

    /**
     * 관리자 로그인
     * @param requestDTO
     * @param bindingResult
     * @return
     */
    @PostMapping("/api/admin/access")
    public ResponseEntity<Void> adminAccess(@Valid @RequestBody AdminAccessRequestDTO requestDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().build();
        }

        adminService.access(requestDTO.getPassword());

        return ResponseEntity.ok().build();
    }

    /**
     * 예약 현황 확인(관리자용)
     * @return
     */
    @GetMapping("/api/admin/reservation")
    public ResponseEntity<GetAdminReservationsResponseDTO> getAdminReservations() {

        List<AdminReservationResponseDTO> reservations = reservationService.findAllReservations()
                .stream()
                .map(AdminReservationResponseDTO::from)
                .collect(Collectors.toList());

        GetAdminReservationsResponseDTO getAllReservationsResponseDTO = GetAdminReservationsResponseDTO.builder()
                .reservations(reservations)
                .build();

        return ResponseEntity.ok().body(getAllReservationsResponseDTO);
    }

    /**
     * 예약 강제 삭제(관리자용)
     * @param requestDTO
     * @param bindingResult
     * @return
     */
    @DeleteMapping("/api/admin/reservation")
    public ResponseEntity<String> deleteReservation(@Valid @RequestBody DeleteReservationRequestDTO requestDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("입력값이 잘못되었습니다.");
        }

        reservationService.deleteReservation(requestDTO.getReservationId());

        return ResponseEntity.ok("예약이 취소되었습니다.");
    }

    /**
     * 방 생성(관리자용)
     * @param requestDTO
     * @param bindingResult
     * @return
     */
    @PostMapping("/api/admin/room")
    public ResponseEntity<Void> createRoom(@Valid @RequestBody CreateRoomRequestDTO requestDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().build();
        }

        Room room = Room.builder()
//              .id()
                .name(requestDTO.getName())
                .location(requestDTO.getLocation())
                .capacity(requestDTO.getCapacity())
                .equipment(requestDTO.getEquipment())
                .description(requestDTO.getDescription())
                .available(requestDTO.isAvailable())
//              .images()
//              .createdAt()
//              .updatedAt()
                .build();

        roomService.createRoom(room, requestDTO.getImages());

        return ResponseEntity.ok().build();
    }

    /**
     * 방 정보 업데이트(관리자용)
     * @param requestDTO
     * @param bindingResult
     * @return
     */
    @PatchMapping("/api/admin/room")
    public ResponseEntity<Void> updateRoom(@Valid @RequestBody UpdateRoomRequestDTO requestDTO, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().build();
        }

        Room room = Room.builder()
                .id(requestDTO.getId())
                .name(requestDTO.getName())
                .location(requestDTO.getLocation())
                .capacity(requestDTO.getCapacity())
                .equipment(requestDTO.getEquipment())
                .description(requestDTO.getDescription())
                .available(requestDTO.isAvailable())
//              .images()
//              .createdAt()
//              .updatedAt()
                .build();

        roomService.updateRoom(room, requestDTO.getImages());

        return ResponseEntity.ok().build();
    }

    /**
     * 방 삭제(관리자용)
     * @param roomId
     * @return
     */
    @DeleteMapping("/api/admin/room/{roomId}")
    public ResponseEntity<Void> deleteRoom(@NotNull @PathVariable("roomId") Long roomId) {

        roomService.deleteRoom(roomId);

        return ResponseEntity.ok().build();
    }

    /**
     * 방 현황 확인(관리자용)
     * @return
     */
    @GetMapping("/api/admin/room")
    public ResponseEntity<GetAdminRoomsResponseDTO> getAdminRooms() {

        List<Room> rooms = roomService.getAllRooms();

        List<AdminRoomResponseDTO> adminRoomResponseDTOs = new ArrayList<>();
        for (Room room : rooms) {

            adminRoomResponseDTOs.add(AdminRoomResponseDTO.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .location(room.getLocation())
                    .capacity(room.getCapacity())
                    .equipment(room.getEquipment())
                    .description(room.getDescription())
                    .available(room.isAvailable())
                    .images(room.getImages())
                    .createdAt(room.getCreatedAt())
                    .updatedAt(room.getUpdatedAt())
                    .build());
        }

        GetAdminRoomsResponseDTO getAdminRoomsResponseDTO = GetAdminRoomsResponseDTO.builder()
                .rooms(adminRoomResponseDTOs)
                .build();

        return ResponseEntity.ok().body(getAdminRoomsResponseDTO);
    }

    /**
     * 로그 다운로드
     * @param response
     * @return
     * @throws IOException
     */
    @GetMapping("/api/admin/log")
    public ResponseEntity<byte[]> downloadLog(HttpServletResponse response) throws IOException {

        byte[] excelBytes = adminService.downloadLog();

        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String fileName = "log_" + now + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(excelBytes.length);

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }
}
