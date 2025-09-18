package com.alstjrzzz.srr.entity;

import com.alstjrzzz.srr.domain.Room;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "room")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RoomEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "equipment")
    private String equipment;

    @Column(name = "description")
    private String description;

    @Column(name = "available", nullable = false)
    private boolean available;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "room_image",
            joinColumns = @JoinColumn(name = "room_id")
    )
    @Column(name = "images")
    private List<String> images;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public static RoomEntity fromRoom(Room room) {

        return RoomEntity.builder()
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
                .build();
    }

    public Room toRoom() {

        return Room.builder()
                .id(id)
                .name(name)
                .location(location)
                .capacity(capacity)
                .equipment(equipment)
                .description(description)
                .available(available)
                .images(images)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }

    public void updateImages(List<String> images) {

        this.images = images;
    }

    public void updateDetails(String name, String location, Integer capacity, String equipment, String description, boolean available) {

        this.name = name;
        this.location = location;
        this.capacity = capacity;
        this.equipment = equipment;
        this.description = description;
        this.available = available;
    }
}
