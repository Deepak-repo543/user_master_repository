package com.master.client;

import com.master.dto.ApiResponse;
import com.master.dto.request.CacheSetRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "common-service", url = "${common-service.url}")
public interface CommonCacheClient {
    @PostMapping("cache/set")
    ApiResponse<Void> set(@RequestBody CacheSetRequest request);
    @GetMapping("cache/get/{key}")
    ApiResponse<String> get(@PathVariable String key);
    @DeleteMapping("cache/delete/{key}")
    ApiResponse<Void> delete(@PathVariable String key);
    @GetMapping("cache/exists/{key}")
    ApiResponse<Boolean> exists(@PathVariable String key);
}