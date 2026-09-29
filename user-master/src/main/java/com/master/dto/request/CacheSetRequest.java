package com.master.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CacheSetRequest {
    private String key;
    private String value;
    private Long ttl;
}