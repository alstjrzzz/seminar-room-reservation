package com.alstjrzzz.srr.log;

import com.alstjrzzz.srr.repository.ReservationRepository;
import com.alstjrzzz.srr.repository.RoomRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Aspect
@Component
public class LogAspect {

    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);
    private final ObjectMapper objectMapper;

    public LogAspect(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Pointcut("execution(* com.alstjrzzz.srr.controller.AdminController.adminAccess(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.AdminController.deleteReservation(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.AdminController.createRoom(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.AdminController.updateRoom(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.AdminController.deleteRoom(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.AdminController.downloadLog(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.ReservationController.createReservation(..)) || " +
            "execution(* com.alstjrzzz.srr.controller.ReservationController.cancelReservation(..))")
    public void logMethods() {}

    @Around("logMethods()")
    public Object recordLog(ProceedingJoinPoint joinPoint) throws Throwable {

        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        Object result = joinPoint.proceed();

        String response;
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> responseEntity = (ResponseEntity<?>) result;
            response = responseEntity.getStatusCode().toString();
        } else {
            response = "VOID";
        }

        String parameter = getMethodParameters(joinPoint.getArgs());

        log.info("[TIMESTAMP][{}], [IP][{}], [METHOD][{}], [URI][{}], [RESPONSE][{}], [PARAMETER][{}]",
                LocalDateTime.now(),
                request.getRemoteAddr(),
                request.getMethod(),
                request.getRequestURI(),
                response,
                parameter);

        return result;
    }

    private String getMethodParameters(Object[] args) {

        if (args == null || args.length == 0) {
            return "";
        }

        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < args.length; i++) {

            Object arg = args[i];

            if (arg instanceof HttpServletResponse) {
                continue;
            }

            if (arg instanceof MultipartFile) {
                MultipartFile file = (MultipartFile) arg;
                builder.append(String.format("file(name: %s, size: %d)",
                        file.getOriginalFilename(), file.getSize()));
            }
            else if (arg instanceof List) {
                List<?> list = (List<?>) arg;

                if (!list.isEmpty() && list.get(0) instanceof MultipartFile) {

                    List<MultipartFile> fileList = (List<MultipartFile>) list;
                    builder.append("list(");
                    for (int j = 0; j < fileList.size(); j++) {
                        MultipartFile file = fileList.get(j);
                        builder.append(String.format("file(name: %s, size: %d)",
                                file.getOriginalFilename(), file.getSize()));
                        if (j < fileList.size() - 1) {
                            builder.append(", ");
                        }
                    }
                    builder.append(")");
                } else {
                    builder.append(String.format("list(size: %d)", list.size()));
                }
            }
            else {
                try {
                    builder.append(objectMapper.writeValueAsString(arg));
                } catch (JsonProcessingException e) {
                    log.warn("Failed to serialize object to JSON: {}", arg, e);
                    builder.append(arg.toString());
                }
            }

            if (i < args.length - 1) {
                builder.append(", ");
            }
        }

        return builder.toString();
    }
}


