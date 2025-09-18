package com.alstjrzzz.srr.dto.room;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
public class UpdateRoomRequestDTO {

    @NotNull
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String location;

    @NotNull
    private Integer capacity;

    private String equipment;

    private String description;

    @NotNull
    private boolean available;

    private List<MultipartFile> images;

//  private LocalDateTime createdAt;

//  private LocalDateTime updatedAt;
}
