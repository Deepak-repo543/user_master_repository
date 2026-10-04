package com.master.repository;

import com.master.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByIdAndIsDeletedFalse(Long id);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false AND (:search IS NULL OR TRIM(:search) = '' OR LOWER(CONCAT(COALESCE(u.userId, ''), ' ', COALESCE(u.employeeCode, ''), ' ', COALESCE(u.fullName, ''), ' ', COALESCE(u.email, ''), ' ', COALESCE(u.mobileNumber, ''))) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:status IS NULL OR u.status = :status) AND (:departmentId IS NULL OR u.departmentId = :departmentId) AND (:designationId IS NULL OR u.designationId = :designationId) AND (:roleId IS NULL OR u.roleId = :roleId) AND (:employeeName IS NULL OR TRIM(:employeeName) = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND (:branch IS NULL OR TRIM(:branch) = '') AND (:fromDate IS NULL OR :toDate IS NULL OR u.createdAt BETWEEN :fromDate AND :toDate)")
    Page<User> searchUsersWithNames(@Param("search") String search, @Param("status") Boolean status, @Param("departmentId") Long departmentId, @Param("designationId") Long designationId, @Param("roleId") Long roleId, @Param("employeeName") String employeeName, @Param("branch") String branch, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate, Pageable pageable);
    long countByIsDeletedFalseAndStatusAndCreatedAtBetween(boolean status, LocalDateTime start, LocalDateTime end);

    @Query("SELECT u.departmentId, SUM(CASE WHEN u.status = false THEN 1 ELSE 0 END), SUM(CASE WHEN u.status = true THEN 1 ELSE 0 END) FROM User u WHERE u.isDeleted = false GROUP BY u.departmentId ORDER BY u.departmentId")
    List<Object[]> getUserCountByDepartment();

    Optional<User> findByUserIdAndIsDeletedFalse(String userId);

    @Query(value = "SELECT u.* FROM user_master u WHERE u.is_deleted = false AND (:search IS NULL OR :search = '' OR LOWER(CONCAT(COALESCE(u.user_id, ''), ' ', COALESCE(u.employee_code, ''), ' ', COALESCE(u.full_name, ''), ' ', COALESCE(u.email, ''), ' ', COALESCE(u.mobile_number, ''))) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:status IS NULL OR u.status = :status) AND (:departmentId IS NULL OR u.department_id = :departmentId) AND (:designationId IS NULL OR u.designation_id = :designationId) AND (:roleId IS NULL OR u.role_id = :roleId) AND (:employeeName IS NULL OR :employeeName = '' OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND (:branchId IS NULL OR JSON_CONTAINS(u.branch_ids, CAST(:branchId AS JSON))) AND (:fromDate IS NULL OR DATE(u.created_at) >= :fromDate) AND (:toDate IS NULL OR DATE(u.created_at) <= :toDate)", countQuery = "SELECT COUNT(*) FROM user_master u WHERE u.is_deleted = false AND (:search IS NULL OR :search = '' OR LOWER(CONCAT(COALESCE(u.user_id, ''), ' ', COALESCE(u.employee_code, ''), ' ', COALESCE(u.full_name, ''), ' ', COALESCE(u.email, ''), ' ', COALESCE(u.mobile_number, ''))) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:status IS NULL OR u.status = :status) AND (:departmentId IS NULL OR u.department_id = :departmentId) AND (:designationId IS NULL OR u.designation_id = :designationId) AND (:roleId IS NULL OR u.role_id = :roleId) AND (:employeeName IS NULL OR :employeeName = '' OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', :employeeName, '%'))) AND (:branchId IS NULL OR JSON_CONTAINS(u.branch_ids, CAST(:branchId AS JSON))) AND (:fromDate IS NULL OR DATE(u.created_at) >= :fromDate) AND (:toDate IS NULL OR DATE(u.created_at) <= :toDate)", nativeQuery = true)
    Page<User> searchUsersForFilter(@Param("search") String search, @Param("status") Boolean status, @Param("departmentId") Long departmentId, @Param("designationId") Long designationId, @Param("roleId") Long roleId, @Param("employeeName") String employeeName, @Param("branchId") Long branchId, @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false AND (" + "u.userId IN :userIds OR " + "u.employeeId IN :employeeIds OR " + "u.employeeCode IN :employeeCodes OR " + "u.email IN :emails OR " + "u.mobileNumber IN :mobiles)")
    List<User> findAllPossibleDuplicates(@Param("userIds") Set<String> userIds, @Param("employeeIds") Set<Long> employeeIds, @Param("employeeCodes") Set<String> employeeCodes, @Param("emails") Set<String> emails, @Param("mobiles") Set<String> mobiles);

    long countByIsDeletedFalseAndStatus(boolean b);
}
