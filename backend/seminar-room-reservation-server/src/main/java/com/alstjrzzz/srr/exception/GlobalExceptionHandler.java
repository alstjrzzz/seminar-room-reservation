package com.alstjrzzz.srr.exception;

import com.alstjrzzz.srr.dto.ExceptionResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateReservationException.class)
    public ResponseEntity<ExceptionResponseDTO> handleDuplicateReservationException() {

        ExceptionResponseDTO exceptionResponseDTO = new ExceptionResponseDTO("이미 예약된 시간입니다.");
        return ResponseEntity.badRequest().body(exceptionResponseDTO);
    }

    @ExceptionHandler(InvalidReservationTimeException.class)
    public ResponseEntity<ExceptionResponseDTO> handleInvalidReservationTimeException() {

        ExceptionResponseDTO exceptionResponseDTO = new ExceptionResponseDTO("예약 시간이 올바르지 않습니다.");
        return ResponseEntity.badRequest().body(exceptionResponseDTO);
    }

    @ExceptionHandler(InvalidStudentInfoException.class)
    public ResponseEntity<ExceptionResponseDTO> handleInvalidStudentInfoException() {

        ExceptionResponseDTO exceptionResponseDTO = new ExceptionResponseDTO("입력하신 학번 또는 암호가 올바르지 않습니다.");
        return ResponseEntity.badRequest().body(exceptionResponseDTO);
    }

    @ExceptionHandler(InvalidReservationIdException.class)
    public ResponseEntity<ExceptionResponseDTO> handleInvalidReservationIdException() {

        ExceptionResponseDTO exceptionResponseDTO = new ExceptionResponseDTO("존재하지 않는 예약 ID 입니다.");
        return ResponseEntity.badRequest().body(exceptionResponseDTO);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ExceptionResponseDTO> handleUnauthorizedException() {

        ExceptionResponseDTO exceptionResponseDTO = new ExceptionResponseDTO("비밀번호가 틀렸습니다.");
        return ResponseEntity.badRequest().body(exceptionResponseDTO);
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public ResponseEntity<ExceptionResponseDTO> handleRoomNotFoundException() {

        ExceptionResponseDTO exceptionResponseDTO = new ExceptionResponseDTO("존재하지 않는 방 ID 입니다.");
        return ResponseEntity.badRequest().body(exceptionResponseDTO);
    }
}
