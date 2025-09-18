package com.alstjrzzz.srr.service;

import com.alstjrzzz.srr.domain.Room;
import com.alstjrzzz.srr.entity.RoomEntity;
import com.alstjrzzz.srr.exception.RoomNotFoundException;
import com.alstjrzzz.srr.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final S3Service s3Service;

    @Transactional
    public void createRoom(Room room, List<MultipartFile> images) {

        RoomEntity roomEntity = RoomEntity.builder()
//              .id()
                .name(room.getName())
                .location(room.getLocation())
                .capacity(room.getCapacity())
                .equipment(room.getEquipment())
                .description(room.getDescription())
                .available(room.isAvailable())
//              .images(urlList) // room을 저장해서 id를 생성한 후 주소 저장
//              .createdAt()
//              .updatedAt()
                .build();

        roomRepository.save(roomEntity);

        String path = "room/" + roomEntity.getId() + "/";
        List<String> urlList = s3Service.uploadFiles(images, path);

        roomEntity.updateImages(urlList);
    }

    @Transactional
    public void updateRoom(Room room, List<MultipartFile> images) {

        RoomEntity roomEntity = roomRepository.findById(room.getId())
                .orElseThrow(() -> new RoomNotFoundException("존재하지 않는 방 ID 입니다."));

        roomEntity.updateDetails(
                room.getName(),
                room.getLocation(),
                room.getCapacity(),
                room.getEquipment(),
                room.getDescription(),
                room.isAvailable());

        String prefix = "room/" + roomEntity.getId() + "/";
        //s3Service.deleteFolder(prefix);

        //List<String> urlList = s3Service.uploadFiles(images, prefix);
        //roomEntity.updateImages(urlList);
    }

    @Transactional
    public void deleteRoom(Long roomId) {

        RoomEntity roomEntity = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException("존재하지 않는 방 ID 입니다."));

        String prefix = "room/" + roomEntity.getId() + "/";
        //s3Service.deleteFolder(prefix);

        roomRepository.delete(roomEntity);
    }

    public List<Room> getAllRooms() {

        return roomRepository.findAllWithImages().stream()
                .map(RoomEntity::toRoom)
                .toList();
    }
}
