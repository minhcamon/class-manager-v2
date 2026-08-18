package com.classmanager.repository;

import com.classmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByGoogleEmail(String googleEmail);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByUsername(String username);
    boolean existsByGoogleEmail(String googleEmail);
    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school WHERE u.id = :id")
    Optional<User> findByIdWithSchool(@Param("id") Long id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school WHERE u.username = :username")
    Optional<User> findByUsernameWithSchool(@Param("username") String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school WHERE u.googleEmail = :googleEmail")
    Optional<User> findByGoogleEmailWithSchool(@Param("googleEmail") String googleEmail);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school WHERE " +
           "LOWER(u.username) LIKE :query OR " +
           "LOWER(u.fullName) LIKE :query OR " +
           "LOWER(u.googleEmail) LIKE :query OR " +
           "u.phoneNumber LIKE :query")
    org.springframework.data.domain.Page<User> searchByQuery(@Param("query") String query, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school WHERE u.role = :role AND (" +
           "LOWER(u.username) LIKE :query OR " +
           "LOWER(u.fullName) LIKE :query OR " +
           "LOWER(u.googleEmail) LIKE :query OR " +
           "u.phoneNumber LIKE :query)")
    org.springframework.data.domain.Page<User> searchByQueryAndRole(@Param("query") String query, @Param("role") com.classmanager.enums.Role role, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<User> findByRole(com.classmanager.enums.Role role, org.springframework.data.domain.Pageable pageable);

    long countByRole(com.classmanager.enums.Role role);

    long countBySchoolIdAndRole(Long schoolId, com.classmanager.enums.Role role);
}
