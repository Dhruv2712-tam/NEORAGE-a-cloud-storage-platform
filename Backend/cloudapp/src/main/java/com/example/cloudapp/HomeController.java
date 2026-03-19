package com.example.cloudapp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

@RestController
@CrossOrigin(origins="*")
public class HomeController {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucket;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId,
            @RequestParam("folder") String folder){

        try{

            String original = file.getOriginalFilename();

            String name = original.substring(0, original.lastIndexOf("."));
            String ext = original.substring(original.lastIndexOf("."));

            String fileName = original;
            int counter = 1;

            while(true){

                String path = userId + "/" + folder + "/" + fileName;

                String checkUrl =
                        supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

                HttpHeaders checkHeaders = new HttpHeaders();
                checkHeaders.set("apikey", supabaseKey);
                checkHeaders.set("Authorization", "Bearer " + supabaseKey);

                HttpEntity<String> entity = new HttpEntity<>(checkHeaders);

                try{

                    restTemplate.exchange(checkUrl, HttpMethod.HEAD, entity, String.class);

                    fileName = name + "(" + counter + ")" + ext;
                    counter++;

                }catch(Exception e){
                    break;
                }

            }

            String storagePath = userId + "/" + folder + "/" + fileName;

            String uploadUrl =
                    supabaseUrl + "/storage/v1/object/" + bucket + "/" + storagePath;

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey",supabaseKey);
            headers.set("Authorization","Bearer "+supabaseKey);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            HttpEntity<byte[]> req =
                    new HttpEntity<>(file.getBytes(),headers);

            restTemplate.exchange(uploadUrl,HttpMethod.PUT,req,String.class);

            String publicUrl =
                    supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + storagePath;

            String dbUrl = supabaseUrl + "/rest/v1/files";

            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String,Object> body = new HashMap<>();

            body.put("file_name",fileName);
            body.put("file_url",publicUrl);
            body.put("file_size",file.getSize());
            body.put("user_id",userId);
            body.put("folder",folder);

            /* ADD TIMESTAMP HERE */
            body.put("created_at", Instant.now().toString());

            HttpEntity<Map<String,Object>> dbReq =
                    new HttpEntity<>(body,headers);

            restTemplate.exchange(dbUrl,HttpMethod.POST,dbReq,String.class);

            return ResponseEntity.ok("Uploaded");

        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }

    }

    @GetMapping("/files")
    public ResponseEntity<String> files(@RequestParam String userId){

        String url =
                supabaseUrl + "/rest/v1/files?user_id=eq."+userId+"&order=created_at.desc";

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey",supabaseKey);
        headers.set("Authorization","Bearer "+supabaseKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> res =
                restTemplate.exchange(url,HttpMethod.GET,entity,String.class);

        return ResponseEntity.ok(res.getBody());

    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(
            @RequestParam String fileName,
            @RequestParam String userId,
            @RequestParam String folder){

        try{

            String path = userId + "/" + folder + "/" + fileName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey",supabaseKey);
            headers.set("Authorization","Bearer "+supabaseKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            String storageUrl =
                    supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

            restTemplate.exchange(storageUrl,HttpMethod.DELETE,entity,String.class);

            String dbUrl =
                    supabaseUrl + "/rest/v1/files?file_name=eq."+fileName+"&user_id=eq."+userId+"&folder=eq."+folder;

            restTemplate.exchange(dbUrl,HttpMethod.DELETE,entity,String.class);

            return ResponseEntity.ok("Deleted");

        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }

    }

}