package com.classmanager.service;

import com.classmanager.dto.auth.response.UserResponse;
import com.classmanager.dto.school.request.SchoolCreateRequest;
import com.classmanager.entity.School;
import com.classmanager.entity.User;
import com.classmanager.enums.Role;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.SchoolRepository;
import com.classmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserResponse createSchool(Long userId, SchoolCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        if (user.getRole() != Role.TEACHER) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only teachers can create a school");
        }

        School school = School.builder()
                .name(request.getName())
                .address(request.getAddress())
                .createdBy(user)
                .build();

        School savedSchool = schoolRepository.save(school);

        // Associate school with teacher
        user.setSchool(savedSchool);
        User updatedUser = userRepository.save(user);

        return UserResponse.builder()
                .username(updatedUser.getUsername())
                .googleEmail(updatedUser.getGoogleEmail())
                .phoneNumber(updatedUser.getPhoneNumber())
                .fullName(updatedUser.getFullName())
                .role(updatedUser.getRole())
                .schoolName(updatedUser.getSchool().getName())
                .avatarUrl(updatedUser.getAvatarUrl())
                .createdAt(updatedUser.getCreatedAt())
                .build();
    }
}
