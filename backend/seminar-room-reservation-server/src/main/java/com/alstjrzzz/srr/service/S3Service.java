package com.alstjrzzz.srr.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public List<String> uploadFiles(List<MultipartFile> files, String path) {

        List<String> urlList = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return null;
        }

        for (int i = 0; i < files.size(); i++) {

            MultipartFile file = files.get(i);

            if (file == null || file.isEmpty()) {
                continue;
            }

            String key = path + i + getFileExtension(file.getOriginalFilename());

            ObjectMetadata objectMetadata = new ObjectMetadata();
            objectMetadata.setContentLength(file.getSize());
            objectMetadata.setContentType(file.getContentType());

            try {
                amazonS3Client.putObject(new PutObjectRequest(bucket, key, file.getInputStream(), objectMetadata)
                        .withCannedAcl(CannedAccessControlList.PublicRead));
            } catch (IOException e) {
                throw new RuntimeException("S3 파일 업로드 중 오류가 발생했습니다.", e);
            }

            urlList.add(amazonS3Client.getUrl(bucket, key).toString());
        }

        return urlList;
    }

    public void deleteFolder(String prefix) {

        ListObjectsV2Request listRequest = new ListObjectsV2Request()
                .withBucketName(bucket)
                .withPrefix(prefix);

        ListObjectsV2Result listResult;
        do {
            listResult = amazonS3Client.listObjectsV2(listRequest);
            List<S3ObjectSummary> summaries = listResult.getObjectSummaries();

            if (summaries.isEmpty()) {
                return;
            }

            List<DeleteObjectsRequest.KeyVersion> keysToDelete = summaries.stream()
                    .map(summary -> new DeleteObjectsRequest.KeyVersion(summary.getKey()))
                    .collect(Collectors.toList());

            DeleteObjectsRequest deleteRequest = new DeleteObjectsRequest(bucket).withKeys(keysToDelete);

            amazonS3Client.deleteObjects(deleteRequest);

            listRequest.setContinuationToken(listResult.getNextContinuationToken());

        } while (listResult.isTruncated());
    }

    public String getFileExtension(String fileName) {

        if (fileName == null || !fileName.contains(".")) {
            return "";
        }

        return fileName.substring(fileName.lastIndexOf("."));
    }
}
