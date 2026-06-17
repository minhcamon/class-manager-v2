package com.classmanager.service;

import com.classmanager.dto.auth.request.GoogleLoginRequest;
import com.classmanager.dto.auth.request.SelectRoleRequest;
import com.classmanager.dto.auth.request.UserLoginRequest;
import com.classmanager.dto.auth.request.UserRegisterRequest;
import com.classmanager.dto.auth.response.TokenPair;
import com.classmanager.dto.auth.response.UserResponse;
import com.classmanager.entity.User;
import com.classmanager.enums.Role;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.UserRepository;
import com.classmanager.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.entity.Enrollment;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    @Transactional
    public UserResponse register(UserRegisterRequest request) {
        // BR-AUTH-01: phone_number cannot be empty or duplicate
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Phone number cannot be empty");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Username is already in use");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Phone number is already in use");
        }

        // BR-AUTH-03: default role = null
        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .fullName(request.getFullName())
                .role(null)
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public TokenPair login(UserLoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", "Invalid username or password"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", "Invalid username or password");
        }

        return generateTokenPair(user);
    }

    @Transactional
    public TokenPair loginWithGoogle(GoogleLoginRequest request) {
        try {
            GoogleIdToken idToken = googleIdTokenVerifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new CustomException(HttpStatus.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN", "Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findByGoogleEmail(email)
                    .map(existingUser -> {
                        // Update avatarUrl if it has changed or is empty
                        if (pictureUrl != null && !pictureUrl.equals(existingUser.getAvatarUrl())) {
                            existingUser.setAvatarUrl(pictureUrl);
                            return userRepository.save(existingUser);
                        }
                        return existingUser;
                    })
                    .orElseGet(() -> {
                        // Extract default username from email prefix
                        String baseUsername = email != null && email.contains("@") ? email.split("@")[0] : "google_user";
                        String usernameCandidate = baseUsername;
                        
                        // Limit candidate to fit within length constraint (50 chars)
                        if (usernameCandidate.length() > 40) {
                            usernameCandidate = usernameCandidate.substring(0, 40);
                        }
                        
                        // Resolve potential collisions by appending a number
                        int count = 1;
                        while (userRepository.existsByUsername(usernameCandidate)) {
                            usernameCandidate = baseUsername + count;
                            if (usernameCandidate.length() > 45) {
                                usernameCandidate = usernameCandidate.substring(0, 45);
                            }
                            count++;
                        }

                        // BR-AUTH-02: phone number can be empty for Google Login, BR-AUTH-03: role = null
                        User newUser = User.builder()
                                .username(usernameCandidate)
                                .googleEmail(email)
                                .fullName(name != null && !name.trim().isEmpty() ? name : email)
                                .avatarUrl(pictureUrl)
                                .role(null)
                                .build();
                        return userRepository.save(newUser);
                    });

            return generateTokenPair(user);
        } catch (CustomException ex) {
            throw ex;
        } catch (Exception e) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "INVALID_GOOGLE_TOKEN", "Failed to verify Google Token: " + e.getMessage());
        }
    }

    @Transactional
    public TokenPair refreshToken(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new CustomException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Invalid or expired refresh token");
        }

        Long userId = jwtUtil.extractUserId(refreshToken);
        User user = userRepository.findByIdWithSchool(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND", "User not found"));

        return generateTokenPair(user);
    }

    @Transactional
    public UserResponse selectRole(Long userId, SelectRoleRequest request) {
        User user = userRepository.findByIdWithSchool(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        // BR-AUTH-05: role cannot be selected if already assigned
        if (user.getRole() != null) {
            throw new CustomException(HttpStatus.CONFLICT, "ROLE_ALREADY_SELECTED", "User has already selected a role");
        }

        Role role = request.getRole();
        if (role == Role.ADMIN) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "INVALID_ROLE", "Cannot select ADMIN role");
        }

        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = userRepository.findByIdWithSchool(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return mapToUserResponse(user);
    }

    private TokenPair generateTokenPair(User user) {
        Integer classId = null;
        if (user.getRole() == Role.STUDENT) {
            Enrollment enrollment = enrollmentRepository.findByUserIdWithClass(user.getId()).orElse(null);
            if (enrollment != null) {
                classId = enrollment.getClassEntity().getId();
            }
        } else if (user.getRole() == Role.TEACHER) {
             // In future, if teacher needs classId in JWT, handle it here.
        }

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getSchool() != null ? user.getSchool().getName() : null,
                user.getAvatarUrl(),
                user.getGoogleEmail(),
                classId
        );
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        Integer classId = null;
        if (user.getRole() == Role.STUDENT) {
            Enrollment enrollment = enrollmentRepository.findByUserIdWithClass(user.getId()).orElse(null);
            if (enrollment != null) {
                classId = enrollment.getClassEntity().getId();
            }
        }

        return UserResponse.builder()
                .username(user.getUsername())
                .googleEmail(user.getGoogleEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .role(user.getRole())
                .schoolName(user.getSchool() != null ? user.getSchool().getName() : null)
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .classId(classId)
                .build();
    }
}
