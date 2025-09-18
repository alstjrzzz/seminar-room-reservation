package com.alstjrzzz.srr.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class AdminAccessRequestDTO {

    @NotBlank
    private String password;
}
