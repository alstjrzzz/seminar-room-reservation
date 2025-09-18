package com.alstjrzzz.srr.domain;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class Room {

    private Long id;
    private String name;
    private String location;
    private Integer capacity;
    private String equipment;
    private String description;
    private boolean available;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}