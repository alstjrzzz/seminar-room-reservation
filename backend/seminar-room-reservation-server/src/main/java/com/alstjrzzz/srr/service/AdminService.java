package com.alstjrzzz.srr.service;

import com.alstjrzzz.srr.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final LogService logService;

    @Value("${admin.password}")
    private String configuredPassword;

    public void access(String password) {

        if (!password.equals(configuredPassword)) {
            throw new UnauthorizedException("비밀번호가 틀렸습니다.");
        }
    }

    public byte[] downloadLog() throws IOException {

        return logService.createLogExcel();
    }
}