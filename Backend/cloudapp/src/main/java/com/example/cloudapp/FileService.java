package com.example.cloudapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class FileService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private RestTemplate restTemplate = new RestTemplate();

    public String upload(MultipartFile file) throws Exception {

        String originalName = file.getOriginalFilename();

        String nameWithoutExt = originalName.substring(0, originalName.lastIndexOf("."));
        String extension = originalName.substring(originalName.lastIndexOf("."));

        // 1️⃣ Fetch existing files with same base name
        String searchUrl = supabaseUrl + "/rest/v1/files?file_name=like." + nameWithoutExt + "*";

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        headers.set("Accept", "application/json");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> searchResponse =
                restTemplate.exchange(searchUrl, HttpMethod.GET, entity, String.class);

        int count = 0;
        if (searchResponse.getBody() != null) {
            count = searchResponse.getBody().split(nameWithoutExt).length - 1;
        }

        String finalName;

        if (count == 0) {
            finalName = originalName;
        } else {
            finalName = nameWithoutExt + "(" + count + ")" + extension;
        }

        // 2️⃣ Upload to storage
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + finalName;

        HttpHeaders storageHeaders = new HttpHeaders();
        storageHeaders.set("apikey", supabaseKey);
        storageHeaders.set("Authorization", "Bearer " + supabaseKey);
        storageHeaders.set("x-upsert", "false"); // no overwrite
        storageHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        HttpEntity<byte[]> storageRequest =
                new HttpEntity<>(file.getBytes(), storageHeaders);

        restTemplate.exchange(uploadUrl, HttpMethod.PUT, storageRequest, String.class);

        // 3️⃣ Public URL
        String publicUrl = supabaseUrl
                + "/storage/v1/object/public/"
                + bucket
                + "/"
                + finalName;

        // 4️⃣ Save metadata
        String insertUrl = supabaseUrl + "/rest/v1/files";

        HttpHeaders dbHeaders = new HttpHeaders();
        dbHeaders.set("apikey", supabaseKey);
        dbHeaders.set("Authorization", "Bearer " + supabaseKey);
        dbHeaders.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("file_name", finalName);
        metadata.put("file_url", publicUrl);
        metadata.put("file_size", file.getSize());

        HttpEntity<Map<String, Object>> dbRequest =
                new HttpEntity<>(metadata, dbHeaders);

        restTemplate.exchange(insertUrl, HttpMethod.POST, dbRequest, String.class);

        return publicUrl;
    }
}