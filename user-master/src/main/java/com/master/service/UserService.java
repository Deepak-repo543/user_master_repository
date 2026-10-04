package com.master.service;

import com.common.service.CacheService;
import com.master.client.MasterServiceClient;
import com.master.dto.ApiResponse;
import com.master.dto.master.BranchResponse;
import com.master.dto.master.DepartmentResponse;
import com.master.dto.master.DesignationResponse;
import com.master.dto.response.UserHistoryResponseDto;
import com.master.dto.master.ModuleResponse;
import com.master.dto.master.RoleResponse;
import com.master.dto.request.UserDuplicateCheckRequest;
import com.master.dto.request.UserFilterRequest;
import com.master.dto.request.UserRequestDto;
import com.master.dto.request.UserSearchRequestDto;
import com.master.dto.response.UserDepartmentCountDto;
import com.master.dto.response.UserResponseDto;
import com.master.entity.User;
import com.master.enums.AttachmentType;
import com.master.exceptions.AppException;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.master.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.master.entity.UserHistory;
import com.master.repository.UserHistoryRepository;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.util.StringUtils;


import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private static final Set<String> VALID_SORT_FIELDS = Set.of("id", "userId", "employeeCode", "fullName", "email", "mobileNumber", "createdAt");
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of("image/jpeg", "image/png", "image/jpg");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private final FileStorageService fileStorageService;
    private final MasterServiceClient masterServiceClient;
    private final CacheService cacheService;
    private final ObjectMapper objectMapper;
    private final UserHistoryRepository userHistoryRepository;

    @Transactional
    public ResponseEntity<ApiResponse<?>> saveOrUpdateUsers(List<UserRequestDto> requests) {
        try {
            if (Objects.isNull(requests) || requests.isEmpty())
                throw new AppException(400, "Request cannot be null or empty", HttpStatus.BAD_REQUEST);
            validateNoDuplicatesWithinBatch(requests);
            Map<Long, User> oldUsers = captureOldUsers(requests);
            List<User> existingMatches = findExistingDuplicatesForBatch(requests);
            boolean allNewUsers = requests.stream().noneMatch(r -> Objects.nonNull(r.getId()));
            List<User> users = requests.stream().map(request -> buildUserEntity(request, existingMatches)).toList();
            List<User> savedUsers = userRepository.saveAll(users);
            for (User savedUser : savedUsers) {
                if (Objects.isNull(savedUser.getId())) continue;
                User oldUser = oldUsers.get(savedUser.getId());
                String action;
                if (Objects.isNull(oldUser)) action = "ADD";
                else if (oldUser.isStatus() != savedUser.isStatus()) action = "STATUS_CHANGE";
                else action = "UPDATE";
                saveUserHistory(savedUser.getId(), savedUser.getEmployeeCode(), action, getLoggedInUsername(), getLoggedInUserRole(), savedUser);
            }
            List<UserResponseDto> responseData = mapToResponseDtoList(savedUsers);
            HttpStatus httpStatus = allNewUsers ? HttpStatus.CREATED : HttpStatus.OK;
            String message = allNewUsers ? "Users added successfully" : "Users saved/updated successfully";
            return ResponseEntity.status(httpStatus).body(new ApiResponse<>(httpStatus.value(), message, responseData, null));
        } catch (AppException ex) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.warn("saveOrUpdateUsers failed: {}", ex.getMessage());
            return ResponseEntity.status(ex.getHttpStatus()).body(new ApiResponse<>(ex.getStatus(), ex.getMessage(), null, null));
        } catch (DataIntegrityViolationException ex) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.error("Data integrity violation in saveOrUpdateUsers", ex);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse<>(409, "Duplicate or invalid data", null, ex.getMostSpecificCause().getMessage()));
        } catch (Exception ex) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            log.error("Unexpected error in saveOrUpdateUsers", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(500, "Something went wrong. Please try again.", null, ex.getClass().getSimpleName() + ": " + ex.getMessage()));
        }
    }

    public ResponseEntity<ApiResponse<UserResponseDto>> getUserById(Long id) {
        String cacheKey = "user:" + id;
        try {
            String cachedData = cacheService.get(cacheKey);
            if (cachedData != null) {
                UserResponseDto data = objectMapper.readValue(cachedData, UserResponseDto.class);
                return ResponseEntity.ok(new ApiResponse<>(200, "User fetched from cache", data, null));
            }
            User user = userRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new AppException(404, "User not found", HttpStatus.NOT_FOUND));
            UserResponseDto data = mapToResponseDto(user);
            String json = objectMapper.writeValueAsString(data);
            cacheService.set(cacheKey, json, 300L);
            return ResponseEntity.ok(new ApiResponse<>(200, "User fetched successfully", data, null));
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            User user = userRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new AppException(404, "User not found", HttpStatus.NOT_FOUND));
            UserResponseDto data = mapToResponseDto(user);
            return ResponseEntity.ok(new ApiResponse<>(200, "User fetched successfully", data, null));
        }
    }

    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> getUsers(UserFilterRequest filter) {
        String sortBy = VALID_SORT_FIELDS.contains(filter.getSortBy()) ? filter.getSortBy() : "id";
        Sort.Direction direction = "desc".equalsIgnoreCase(filter.getDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(Math.max(filter.getPage(), 0), Math.max(filter.getSize(), 1), Sort.by(direction, sortBy));
        LocalDateTime fromDateTime = null;
        LocalDateTime toDateTime = null;
        if (StringUtils.hasText(filter.getFromDate()) && StringUtils.hasText(filter.getToDate())) {
            fromDateTime = LocalDate.parse(filter.getFromDate()).atStartOfDay();
            toDateTime = LocalDate.parse(filter.getToDate()).atTime(LocalTime.MAX);
        }
        Page<User> result = userRepository.searchUsersWithNames(StringUtils.hasText(filter.getSearch()) ? filter.getSearch().trim() : null, filter.getStatus(), filter.getDepartmentId(), filter.getDesignationId(), filter.getRoleId(), StringUtils.hasText(filter.getEmployeeName()) ? filter.getEmployeeName().trim() : null, StringUtils.hasText(filter.getBranch()) ? filter.getBranch().trim() : null, fromDateTime, toDateTime, pageable);
        Page<UserResponseDto> data = result.map(this::mapToResponseDto);
        return ResponseEntity.ok(new ApiResponse<>(200, "Users fetched successfully", data, null));
    }

    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteUsersById(Long id) {
        User user = userRepository.findByIdAndIsDeletedFalse(id).orElseThrow(() -> new AppException(404, "User not found", HttpStatus.NOT_FOUND));
        User oldUser = new User();
        BeanUtils.copyProperties(user, oldUser);
        user.setStatus(true);
        User savedUser = userRepository.save(user);
        saveUserHistory(savedUser.getId(), savedUser.getEmployeeCode(), "STATUS_CHANGE", getLoggedInUsername(), getLoggedInUserRole(), savedUser);
        return ResponseEntity.ok(new ApiResponse<>(200, "User deleted successfully", null, null));
    }

    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStatusCount(LocalDate fromDate, LocalDate toDate) {
        try {
            long activeCount;
            long inactiveCount;
            if (fromDate != null && toDate != null) {
                LocalDateTime start = fromDate.atStartOfDay();
                LocalDateTime end = toDate.atTime(LocalTime.MAX);
                activeCount = userRepository.countByIsDeletedFalseAndStatusAndCreatedAtBetween(false, start, end);
                inactiveCount = userRepository.countByIsDeletedFalseAndStatusAndCreatedAtBetween(true, start, end);
            } else {
                activeCount = userRepository.countByIsDeletedFalseAndStatus(false);
                inactiveCount = userRepository.countByIsDeletedFalseAndStatus(true);
            }
            long totalCount = activeCount + inactiveCount;
            Map<String, Long> count = new LinkedHashMap<>();
            count.put("totalCount", totalCount);
            count.put("activeCount", activeCount);
            count.put("inactiveCount", inactiveCount);
            return ResponseEntity.ok(new ApiResponse<>(200, "Status count fetched successfully", count, null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(500, "Failed to fetch user status count", null, e.getMessage()));
        }
    }

    public ResponseEntity<ApiResponse<?>> uploadAttachments(MultiValueMap<String, MultipartFile> files) {
        if (files == null || files.isEmpty())
            throw new AppException(400, "Attachments are required", HttpStatus.BAD_REQUEST);
        for (Map.Entry<String, List<MultipartFile>> entry : files.entrySet()) {
            String key = entry.getKey();
            if (entry.getValue() == null || entry.getValue().isEmpty()) continue;
            MultipartFile file = entry.getValue().getFirst();
            if (key.startsWith("profileImage_")) {
                String userId = key.substring("profileImage_".length());
                User user = userRepository.findByUserIdAndIsDeletedFalse(userId).orElseThrow(() -> new AppException(404, "User not found: " + userId, HttpStatus.NOT_FOUND));
                validateFile(file);
                String path = fileStorageService.store(file, AttachmentType.PROFILE_IMAGE.name().toLowerCase());
                user.setProfileImage(path);
                user.setProfileImageOriginalName(file.getOriginalFilename());
                userRepository.save(user);
            } else if (key.startsWith("digitalSignature_")) {
                String userId = key.substring("digitalSignature_".length());
                User user = userRepository.findByUserIdAndIsDeletedFalse(userId).orElseThrow(() -> new AppException(404, "User not found: " + userId, HttpStatus.NOT_FOUND));
                validateFile(file);
                String path = fileStorageService.store(file, AttachmentType.DIGITAL_SIGNATURE.name().toLowerCase());
                user.setDigitalSignature(path);
                user.setDigitalSignatureOriginalName(file.getOriginalFilename());
                userRepository.save(user);
            }
        }
        return ResponseEntity.ok(new ApiResponse<>(200, "Attachments uploaded successfully", null, null));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new AppException(400, "File cannot be empty", HttpStatus.BAD_REQUEST);
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType()))
            throw new AppException(400, "Only JPG/PNG images are allowed", HttpStatus.BAD_REQUEST);
        if (file.getSize() > MAX_FILE_SIZE)
            throw new AppException(400, "File size must not exceed 5MB", HttpStatus.BAD_REQUEST);
    }

    private UserResponseDto mapToResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        BeanUtils.copyProperties(user, dto);
        try {
            if (!CollectionUtils.isEmpty(user.getBranchIds())) {
                ApiResponse<List<BranchResponse>> response = masterServiceClient.getBranches();
                if (response != null && response.getData() != null) {
                    Map<Long, String> branchMap = response.getData().stream().collect(Collectors.toMap(BranchResponse::getId, BranchResponse::getBranchName, (a, b) -> a));
                    dto.setBranchNames(user.getBranchIds().stream().map(branchMap::get).filter(Objects::nonNull).toList());
                } else dto.setBranchNames(List.of());
            } else dto.setBranchNames(List.of());
        } catch (Exception e) {
            log.error("Failed to fetch branch names for user: {}", user.getUserId(), e);
            dto.setBranchNames(List.of());
        }
        try {
            if (!CollectionUtils.isEmpty(user.getAccessibleModules())) {
                ApiResponse<List<ModuleResponse>> response = masterServiceClient.getModules();
                if (response != null && response.getData() != null) {
                    Map<Long, String> moduleMap = response.getData().stream().collect(Collectors.toMap(ModuleResponse::getId, ModuleResponse::getModuleName, (a, b) -> a));
                    dto.setModuleNames(user.getAccessibleModules().stream().map(moduleMap::get).filter(Objects::nonNull).toList());
                } else dto.setModuleNames(List.of());
            } else dto.setModuleNames(List.of());

        } catch (Exception e) {
            log.error("Failed to fetch module names for user: {}", user.getUserId(), e);
            dto.setModuleNames(List.of());
        }
        try {
            if (Objects.nonNull(user.getDepartmentId())) {
                ApiResponse<List<DepartmentResponse>> response = masterServiceClient.getDepartments();
                if (response != null && response.getData() != null) {
                    response.getData().stream().filter(department -> Objects.equals(department.getId(), user.getDepartmentId())).findFirst().ifPresent(department -> dto.setDepartmentName(department.getDepartmentName()));
                }
            }

        } catch (Exception e) {
            log.error("Failed to fetch department name for user: {}", user.getUserId(), e);
        }
        try {
            if (Objects.nonNull(user.getRoleId())) {
                ApiResponse<List<RoleResponse>> response = masterServiceClient.getRoles();
                if (response != null && response.getData() != null) {
                    response.getData().stream().filter(role -> Objects.equals(role.getId(), user.getRoleId())).findFirst().ifPresent(role -> dto.setRoleName(role.getRoleName()));
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch role name for user: {}", user.getUserId(), e);
        }
        try {
            if (Objects.nonNull(user.getDesignationId())) {
                ApiResponse<List<DesignationResponse>> response = masterServiceClient.getDesignations();
                if (response != null && response.getData() != null) {
                    response.getData().stream().filter(designation -> Objects.equals(designation.getId(), user.getDesignationId())).findFirst().ifPresent(designation -> dto.setDesignationName(designation.getDesignationName()));
                }
            }

        } catch (Exception e) {
            log.error("Failed to fetch designation name for user: {}", user.getUserId(), e);
        }
        return dto;
    }

    public ResponseEntity<ApiResponse<List<UserDepartmentCountDto>>> getUserCountByDepartment() {
        List<Object[]> result = userRepository.getUserCountByDepartment();
        ApiResponse<List<DepartmentResponse>> response = masterServiceClient.getDepartments();
        Map<Long, String> departmentNameMap = response != null && response.getData() != null ? response.getData().stream().collect(Collectors.toMap(DepartmentResponse::getId, DepartmentResponse::getDepartmentName)) : Map.of();
        List<UserDepartmentCountDto> data = result.stream().map(row -> new UserDepartmentCountDto((Long) row[0], departmentNameMap.get((Long) row[0]), ((Number) row[1]).longValue(), ((Number) row[2]).longValue())).toList();
        return ResponseEntity.ok(new ApiResponse<>(200, "Department-wise user count fetched successfully", data, null));
    }

    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> searchUsers(UserSearchRequestDto filter) {
        String search = StringUtils.hasText(filter.getSearch()) ? filter.getSearch().trim() : null;
        String employeeName = StringUtils.hasText(filter.getEmployeeName()) ? filter.getEmployeeName().trim() : null;
        String branch = StringUtils.hasText(filter.getBranch()) ? filter.getBranch().trim() : null;
        Long branchId = null;
        if (branch != null) {
            try {
                branchId = Long.parseLong(branch);
            } catch (NumberFormatException e) {
                ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Invalid branch id", Page.empty(), null);
                return ResponseEntity.badRequest().body(response);
            }
        }
        boolean hasAdvancedFilter = filter.getStatus() != null || filter.getDepartmentId() != null || filter.getDesignationId() != null || filter.getRoleId() != null || StringUtils.hasText(employeeName) || branchId != null || StringUtils.hasText(filter.getFromDate()) || StringUtils.hasText(filter.getToDate());
        if (!hasAdvancedFilter && !StringUtils.hasText(search)) {
            ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Please enter at least 2 characters or select a filter", Page.empty(), null);
            return ResponseEntity.badRequest().body(response);
        }
        if (!hasAdvancedFilter && StringUtils.hasText(search) && search.length() < 2) {
            ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Search must contain at least 2 characters", Page.empty(), null);
            return ResponseEntity.badRequest().body(response);
        }
        LocalDate fromDate = null;
        LocalDate toDate = null;
        try {
            if (StringUtils.hasText(filter.getFromDate())) fromDate = LocalDate.parse(filter.getFromDate().trim());
            if (StringUtils.hasText(filter.getToDate())) toDate = LocalDate.parse(filter.getToDate().trim());
        } catch (DateTimeParseException e) {
            ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Invalid date format. Use yyyy-MM-dd", Page.empty(), null);
            return ResponseEntity.badRequest().body(response);
        }
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "From date cannot be greater than to date", Page.empty(), null);
            return ResponseEntity.badRequest().body(response);
        }
        int page = Math.max(filter.getPage() == null ? 0 : filter.getPage(), 0);
        int size = Math.max(filter.getSize() == null ? 10 : filter.getSize(), 1);
        String sortBy = filter.getSortBy();
        if (sortBy == null || sortBy.isBlank()) sortBy = "id";
        Sort.Direction direction = "desc".equalsIgnoreCase(filter.getDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<User> result;
        try {
            result = userRepository.searchUsersForFilter(search, filter.getStatus(), filter.getDepartmentId(), filter.getDesignationId(), filter.getRoleId(), employeeName, branchId, fromDate, toDate, pageable);
        } catch (Exception e) {
            log.error("Error while fetching users", e);
            ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error while fetching users: " + e.getMessage(), Page.empty(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
        Page<UserResponseDto> responsePage;
        try {
            responsePage = result.map(this::mapToResponseDto);
        } catch (Exception e) {
            log.error("Error while mapping user response", e);
            ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error while mapping user response: " + e.getMessage(), Page.empty(), null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
        ApiResponse<Page<UserResponseDto>> response = new ApiResponse<>(HttpStatus.OK.value(), "Users fetched successfully", responsePage, null);
        return ResponseEntity.ok(response);
    }

    private User buildUserEntity(UserRequestDto request, List<User> existingMatches) {
        if (Objects.isNull(request)) throw new AppException(400, "User request cannot be null", HttpStatus.BAD_REQUEST);
        User user = Objects.nonNull(request.getId()) ? userRepository.findByIdAndIsDeletedFalse(request.getId()).orElseThrow(() -> new AppException(404, "User not found", HttpStatus.NOT_FOUND)) : new User();
        checkAgainstExisting(request, existingMatches);
        BeanUtils.copyProperties(request, user, "id");
        return user;
    }

    private void validateNoDuplicatesWithinBatch(List<UserRequestDto> requests) {
        checkFieldDuplicateInBatch(requests, UserRequestDto::getUserId, "User ID");
        checkFieldDuplicateInBatch(requests, UserRequestDto::getEmployeeId, "Employee ID");
        checkFieldDuplicateInBatch(requests, UserRequestDto::getEmployeeCode, "Employee Code");
        checkFieldDuplicateInBatch(requests, UserRequestDto::getEmail, "Email");
        checkFieldDuplicateInBatch(requests, UserRequestDto::getMobileNumber, "Mobile Number");
    }

    private <T> void checkFieldDuplicateInBatch(List<UserRequestDto> requests, Function<UserRequestDto, T> extractor, String fieldLabel) {
        Set<T> seen = new HashSet<>();
        for (UserRequestDto request : requests) {
            T value = extractor.apply(request);
            if (Objects.nonNull(value) && !seen.add(value))
                throw new AppException(409, "Duplicate " + fieldLabel + " found in the request: " + value, HttpStatus.CONFLICT);
        }
    }

    private List<User> findExistingDuplicatesForBatch(List<UserRequestDto> requests) {
        Set<String> userIds = requests.stream().map(UserRequestDto::getUserId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> employeeIds = requests.stream().map(UserRequestDto::getEmployeeId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<String> employeeCodes = requests.stream().map(UserRequestDto::getEmployeeCode).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<String> emails = requests.stream().map(UserRequestDto::getEmail).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<String> mobiles = requests.stream().map(UserRequestDto::getMobileNumber).filter(Objects::nonNull).collect(Collectors.toSet());
        if (userIds.isEmpty() && employeeIds.isEmpty() && employeeCodes.isEmpty() && emails.isEmpty() && mobiles.isEmpty())
            return List.of();
        return userRepository.findAllPossibleDuplicates(safeSet(userIds), safeLongSet(employeeIds), safeSet(employeeCodes), safeSet(emails), safeSet(mobiles));
    }

    private Set<String> safeSet(Set<String> set) {
        return set.isEmpty() ? Set.of("__NONE__") : set;
    }

    private Set<Long> safeLongSet(Set<Long> set) {
        return set.isEmpty() ? Set.of(-1L) : set;
    }

    private void checkAgainstExisting(UserRequestDto request, List<User> existingMatches) {
        Long excludeId = request.getId();
        for (User existing : existingMatches) {
            if (Objects.equals(existing.getId(), excludeId)) continue;
            if (Objects.nonNull(request.getUserId()) && request.getUserId().equalsIgnoreCase(existing.getUserId()))
                throw new AppException(409, "User id already exists. " + request.getUserId(), HttpStatus.CONFLICT);
            if (Objects.nonNull(request.getEmployeeId()) && request.getEmployeeId().equals(existing.getEmployeeId()))
                throw new AppException(409, "Duplicate Employee ID found " + request.getEmployeeId(), HttpStatus.CONFLICT);
            if (Objects.nonNull(request.getEmployeeCode()) && request.getEmployeeCode().equalsIgnoreCase(existing.getEmployeeCode()))
                throw new AppException(409, "Duplicate Employee Code found " + request.getEmployeeCode(), HttpStatus.CONFLICT);
            if (Objects.nonNull(request.getEmail()) && request.getEmail().equalsIgnoreCase(existing.getEmail()))
                throw new AppException(409, "Duplicate Email found " + request.getEmail(), HttpStatus.CONFLICT);
            if (Objects.nonNull(request.getMobileNumber()) && request.getMobileNumber().equalsIgnoreCase(existing.getMobileNumber()))
                throw new AppException(409, "Duplicate Mobile Number found " + request.getMobileNumber(), HttpStatus.CONFLICT);
        }
    }

    private List<UserResponseDto> mapToResponseDtoList(List<User> users) {
        ApiResponse<List<BranchResponse>> branchResponse = masterServiceClient.getBranches();
        ApiResponse<List<ModuleResponse>> moduleResponse = masterServiceClient.getModules();
        ApiResponse<List<DepartmentResponse>> departmentResponse = masterServiceClient.getDepartments();
        ApiResponse<List<RoleResponse>> roleResponse = masterServiceClient.getRoles();
        ApiResponse<List<DesignationResponse>> designationResponse = masterServiceClient.getDesignations();
        Map<Long, String> branchNameMap = branchResponse != null && branchResponse.getData() != null ? branchResponse.getData().stream().collect(Collectors.toMap(BranchResponse::getId, BranchResponse::getBranchName)) : Map.of();
        Map<Long, String> moduleNameMap = moduleResponse != null && moduleResponse.getData() != null ? moduleResponse.getData().stream().collect(Collectors.toMap(ModuleResponse::getId, ModuleResponse::getModuleName)) : Map.of();
        Map<Long, String> departmentNameMap = departmentResponse != null && departmentResponse.getData() != null ? departmentResponse.getData().stream().collect(Collectors.toMap(DepartmentResponse::getId, DepartmentResponse::getDepartmentName)) : Map.of();
        Map<Long, String> roleNameMap = roleResponse != null && roleResponse.getData() != null ? roleResponse.getData().stream().collect(Collectors.toMap(RoleResponse::getId, RoleResponse::getRoleName)) : Map.of();
        Map<Long, String> designationNameMap = designationResponse != null && designationResponse.getData() != null ? designationResponse.getData().stream().collect(Collectors.toMap(DesignationResponse::getId, DesignationResponse::getDesignationName)) : Map.of();
        return users.stream().map(user -> {
            UserResponseDto dto = new UserResponseDto();
            BeanUtils.copyProperties(user, dto);
            dto.setBranchNames(CollectionUtils.isEmpty(user.getBranchIds()) ? List.of() : user.getBranchIds().stream().map(branchNameMap::get).filter(Objects::nonNull).toList());
            dto.setModuleNames(CollectionUtils.isEmpty(user.getAccessibleModules()) ? List.of() : user.getAccessibleModules().stream().map(moduleNameMap::get).filter(Objects::nonNull).toList());
            dto.setDepartmentName(departmentNameMap.get(user.getDepartmentId()));
            dto.setProfileImageOriginalName(user.getProfileImageOriginalName());
            dto.setDigitalSignatureOriginalName(user.getDigitalSignatureOriginalName());
            dto.setRoleName(roleNameMap.get(user.getRoleId()));
            dto.setDesignationName(designationNameMap.get(user.getDesignationId()));
            return dto;
        }).toList();
    }

    public ResponseEntity<ApiResponse<List<User>>> checkDuplicates(UserDuplicateCheckRequest request) {
        List<User> duplicates = userRepository.findAllPossibleDuplicates(request.getUserIds(), request.getEmployeeIds(), request.getEmployeeCodes(), request.getEmails(), request.getMobiles());
        return ResponseEntity.ok(new ApiResponse<>(200, null, duplicates, null));
    }

    private Map<Long, User> captureOldUsers(List<UserRequestDto> requests) {
        return requests.stream().filter(Objects::nonNull).filter(request -> Objects.nonNull(request.getId())).collect(Collectors.toMap(UserRequestDto::getId, request -> userRepository.findByIdAndIsDeletedFalse(request.getId()).map(user -> {
            User oldUser = new User();
            BeanUtils.copyProperties(user, oldUser);
            return oldUser;
        }).orElseThrow(() -> new AppException(404, "User not found", HttpStatus.NOT_FOUND)), (existing, duplicate) -> existing));
    }

    private String getLoggedInUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (Objects.isNull(authentication) || !authentication.isAuthenticated()) return null;
        return authentication.getName();
    }

    private String getLoggedInUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (Objects.isNull(authentication) || !authentication.isAuthenticated()) return null;
        return authentication.getAuthorities().stream().map(authority -> Objects.requireNonNull(authority.getAuthority()).replace("ROLE_", "")).findFirst().orElse(null);
    }

    public ResponseEntity<ApiResponse<Page<UserHistoryResponseDto>>> getUserHistory(String employeeCode, Pageable pageable) {
        if (!StringUtils.hasText(employeeCode))
            throw new AppException(400, "Employee code cannot be empty", HttpStatus.BAD_REQUEST);
        Page<UserHistoryResponseDto> history = userHistoryRepository.findByEmployeeCodeOrderByPerformedAtDesc(employeeCode, pageable).map(userHistory -> {
            UserHistoryResponseDto response = new UserHistoryResponseDto();
            BeanUtils.copyProperties(userHistory, response);
            return response;
        });
        return ResponseEntity.ok(new ApiResponse<>(200, "User history fetched successfully", history, null));
    }

    private void saveUserHistory(Long userId, String employeeCode, String action, String performedBy, String performedByRole, Object newData) {
        if (!StringUtils.hasText(employeeCode) || !StringUtils.hasText(action)) return;
        UserHistory history = new UserHistory();
        history.setUserId(userId);
        history.setEmployeeCode(employeeCode);
        history.setAction(action);
        history.setPerformedBy(performedBy);
        history.setPerformedByRole(performedByRole);
        history.setPerformedAt(LocalDateTime.now());
        history.setNewData(convertToJson(newData));
        userHistoryRepository.save(history);
    }

    private String convertToJson(Object data) {
        if (Objects.isNull(data)) return null;
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to convert history data to JSON", e);
        }
    }
}