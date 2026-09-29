package com.master.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UserDuplicateCheckRequest {
    private Set<String> userIds;
    private Set<Long> employeeIds;
    private Set<String> employeeCodes;
    private Set<String> emails;
    private Set<String> mobiles;
}