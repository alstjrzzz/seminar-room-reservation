package com.alstjrzzz.srr.service;

import com.alstjrzzz.srr.utils.ExcelUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.GZIPInputStream;

@Service
public class LogService {

    @Value("${logging.file.name}")
    private String LOG_FILE_PATH;

    @Value("${logging.logback.rollingpolicy.max-history}")
    private int MAX_HISTORY;

    @Value("${logging.logback.rollingpolicy.file-name-pattern}")
    private String FILE_NAME_PATTERN;

    public byte[] createLogExcel() throws IOException {

        ExcelUtil excelUtil = new ExcelUtil();

        List<String> allLogs = readAllLogs();

        createReadme(excelUtil);
        excelUtil.createSheet("access", Arrays.asList("TIMESTAMP", "IP", "METHOD", "RESPONSE", "PARAMETER"));
        excelUtil.createSheet("log", Arrays.asList("TIMESTAMP", "IP", "METHOD", "RESPONSE", "PARAMETER"));
        excelUtil.createSheet("reservation", Arrays.asList("TIMESTAMP", "IP", "METHOD", "RESPONSE", "PARAMETER"));
        excelUtil.createSheet("room", Arrays.asList("TIMESTAMP", "IP", "METHOD", "RESPONSE", "PARAMETER"));

        for (String log : allLogs) {

            Map<String, String> logMap = convertLogToMap(log);

            String uri = logMap.get("URI");

            if (uri == null || uri.isEmpty()) {
                continue;
            }

            List<String> data = Arrays.asList(
                    logMap.get("TIMESTAMP"),
                    logMap.get("IP"),
                    logMap.get("METHOD"),
                    logMap.get("RESPONSE"),
                    logMap.get("PARAMETER")
            );

            if (uri.contains("access")) {
                excelUtil.addData("access", data);
            } else if (uri.contains("log")) {
                excelUtil.addData("log", data);
            } else if (uri.contains("reservation")) {
                excelUtil.addData("reservation", data);
            } else if (uri.contains("room")) {
                excelUtil.addData("room", data);
            }
        }

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            excelUtil.write(os);

            return os.toByteArray();
        }
    }

    private Map<String, String> convertLogToMap(String log) {

        Map<String, String> logMap = new HashMap<>();

        Pattern pattern = Pattern.compile("\\[(TIMESTAMP|IP|METHOD|URI|RESPONSE|PARAMETER)\\]\\[(.*?)\\]");
        Matcher matcher = pattern.matcher(log);

        while (matcher.find()) {
            String key = matcher.group(1);
            String value = matcher.group(2);

            logMap.put(key, value);
        }

        return logMap;
    }

    private List<String> readAllLogs() throws IOException {

        List<String> allLogs = new ArrayList<>();

        try (Stream<String> lines = Files.lines(Paths.get(LOG_FILE_PATH))) {
            lines.forEach(allLogs::add);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 1; i <= MAX_HISTORY; i++) {
            String pastDate = LocalDate.now().minusDays(i).format(formatter);

            int fileIndex = 0;
            while (true) {
                String historyFile = String.format(
                        "%s.%s.%d.gz",
                        LOG_FILE_PATH,
                        pastDate,
                        fileIndex);

                Path path = Paths.get(historyFile);
                if (!Files.exists(path)) {
                    break;
                }

                try (GZIPInputStream gzis = new GZIPInputStream(Files.newInputStream(path));
                     BufferedReader reader = new BufferedReader(new InputStreamReader(gzis))) {
                    reader.lines().forEach(allLogs::add);
                }

                fileIndex++;
            }
        }

        return allLogs;
    }

    private void createReadme(ExcelUtil excelUtil) {

        excelUtil.createSheet("readme", new ArrayList<String>());

        List<String> text = Arrays.asList(
                "목포대학교 학생회관 세미나실 예약 시스템 로그",
                "",
                "로그에 대한 추가적인 정보가 필요하거나 수정이 필요한 부분이 있다면 언제든지 연락주세요.",
                "아래 내용은 로그에 포함된 각 열의 의미를 설명합니다.",
                "",
                "TIMESTAMP: 사용자가 동작한 시간을 기록합니다.",
                "IP: 사용자의 ip를 기록합니다.",
                "METHOD: 사용자의 동작 종류를 기록합니다.",
                "   GET: 데이터를 요청합니다.(로그 다운로드 등)",
                "   POST: 데이터를 추가하거나 작성합니다.(방 생성, 예약, 관리자 로그인 등)",
                "   DELETE: 데이터를 삭제합니다.(방 삭제, 예약 취소 등)",
                "   PATCH: 데이터를 수정합니다.(방 정보 수정 등)",
                "RESPONSE: 서버가 사용자가 요청한 작업의 결과를 반환합니다.",
                "   2XX: 작업을 성공적으로 수행했습니다.",
                "   4XX: 클라이언트 측 오류",
                "   5XX: 서버 측 오류",
                "PARAMETER: 사용자 요청에 포함된 파라미터입니다."
        );
        excelUtil.addDataRow("readme", text);
    }
}

