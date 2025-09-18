package com.alstjrzzz.srr.utils;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ExcelUtil {

    private final XSSFWorkbook workbook;
    private final Map<String, Sheet> sheets;

    public ExcelUtil() {
        workbook = new XSSFWorkbook();
        sheets = new ConcurrentHashMap<>();
    }

    public void createSheet(String sheetName, List<String> headers) {

        Sheet sheet = workbook.createSheet(sheetName);
        sheets.put(sheetName, sheet);

        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.size(); i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers.get(i));
        }
    }

    public void addData(String sheetName, List<String> data) {

        Sheet sheet = sheets.get(sheetName);

        if (sheet == null) {
            throw new IllegalArgumentException("Sheet not found: " + sheetName);
        }

        int rowNum = sheet.getLastRowNum() + 1;
        Row row = sheet.createRow(rowNum);

        for (int i = 0; i < data.size(); i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(data.get(i));
        }
    }

    public void addDataRow(String sheetName, List<String> data) {

        Sheet sheet = sheets.get(sheetName);

        if (sheet == null) {
            throw new IllegalArgumentException("Sheet not found: " + sheetName);
        }

        int rowNum = sheet.getLastRowNum();
        if (sheet.getPhysicalNumberOfRows() > 0) {
            rowNum += 1;
        } else {
            rowNum = 0;
        }

        for (int i = 0; i < data.size(); i++) {

            Row row = sheet.createRow(rowNum + i);

            Cell cell = row.createCell(0);
            cell.setCellValue(data.get(i));
        }
    }

    public void write(OutputStream os) throws IOException {

        workbook.write(os);
    }
}
