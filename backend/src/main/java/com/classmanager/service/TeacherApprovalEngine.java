package com.classmanager.service;

import com.classmanager.dto.admin.AdminDTOs.TeacherRequestResponse;
import com.classmanager.entity.TeacherRoleRequest;
import com.classmanager.entity.User;
import com.classmanager.enums.Role;
import com.classmanager.enums.TeacherRequestStatus;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.TeacherRoleRequestRepository;
import com.classmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherApprovalEngine {

    private final TeacherRoleRequestRepository teacherRoleRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public TeacherRoleRequest createRequest(User user) {
        TeacherRoleRequest latestReq = teacherRoleRequestRepository.findTopByUserIdOrderByRequestedAtDesc(user.getId()).orElse(null);
        if (latestReq != null) {
            if (latestReq.getStatus() == TeacherRequestStatus.PENDING) {
                throw new CustomException(HttpStatus.CONFLICT, "PENDING_REQUEST_EXISTS",
                        "User already has a pending teacher role request.");
            }
            if (latestReq.getStatus() == TeacherRequestStatus.WITHDRAWAL) {
                throw new CustomException(HttpStatus.FORBIDDEN, "TEACHER_REQUEST_WITHDRAWN",
                        "Bạn đã rút lại yêu cầu Giáo viên, hiện tại chỉ có thể tiếp tục với vai trò Học sinh.");
            }
        }

        if (user.getRole() == Role.TEACHER) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "ALREADY_TEACHER", "User is already a teacher.");
        }

        TeacherRoleRequest request = TeacherRoleRequest.builder()
                .user(user)
                .status(TeacherRequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        TeacherRoleRequest saved = teacherRoleRequestRepository.save(request);
        log.info("Teacher role request created for user id={}", user.getId());
        return saved;
    }

    @Transactional
    public void withdrawRequest(Long userId) {
        TeacherRoleRequest request = teacherRoleRequestRepository.findTopByUserIdOrderByRequestedAtDesc(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "REQUEST_NOT_FOUND",
                        "No teacher role request found for user."));

        if (request.getStatus() != TeacherRequestStatus.PENDING) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "CANNOT_WITHDRAW",
                    "Only PENDING teacher requests can be withdrawn.");
        }

        request.setStatus(TeacherRequestStatus.WITHDRAWAL);
        teacherRoleRequestRepository.save(request);
        log.info("Teacher role request id={} updated to WITHDRAWAL for user id={}", request.getId(), userId);
    }

    @Transactional
    public TeacherRequestResponse approveRequest(Long requestId, Long adminUserId) {
        TeacherRoleRequest request = teacherRoleRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "REQUEST_NOT_FOUND",
                        "Teacher role request not found"));

        // BR-ADMIN-10: Request đã ở trạng thái APPROVED/REJECTED không được xử lý lại
        if (request.getStatus() != TeacherRequestStatus.PENDING) {
            throw new CustomException(HttpStatus.CONFLICT, "REQUEST_ALREADY_PROCESSED",
                    "This request has already been reviewed.");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(
                        () -> new CustomException(HttpStatus.NOT_FOUND, "ADMIN_NOT_FOUND", "Admin user not found"));

        // BR-ADMIN-07: Khi APPROVED, hệ thống set User.role = TEACHER ngay lập tức
        User user = request.getUser();
        user.setRole(Role.TEACHER);
        userRepository.save(user);

        request.setStatus(TeacherRequestStatus.APPROVED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        TeacherRoleRequest updated = teacherRoleRequestRepository.save(request);

        log.info("Teacher role request id={} APPROVED by admin id={} for user id={}", requestId, adminUserId,
                user.getId());
        return mapToResponse(updated);
    }

    @Transactional
    public TeacherRequestResponse rejectRequest(Long requestId, Long adminUserId, String reason) {
        // BR-ADMIN-08: Khi REJECTED bắt buộc có rejectReason
        if (reason == null || reason.trim().isEmpty()) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "REASON_REQUIRED", "Rejection reason is required.");
        }

        TeacherRoleRequest request = teacherRoleRequestRepository.findById(requestId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "REQUEST_NOT_FOUND",
                        "Teacher role request not found"));

        // BR-ADMIN-10: Request đã ở trạng thái APPROVED/REJECTED không được xử lý lại
        if (request.getStatus() != TeacherRequestStatus.PENDING) {
            throw new CustomException(HttpStatus.CONFLICT, "REQUEST_ALREADY_PROCESSED",
                    "This request has already been reviewed.");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(
                        () -> new CustomException(HttpStatus.NOT_FOUND, "ADMIN_NOT_FOUND", "Admin user not found"));

        request.setStatus(TeacherRequestStatus.REJECTED);
        request.setRejectReason(reason.trim());
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        TeacherRoleRequest updated = teacherRoleRequestRepository.save(request);

        log.info("Teacher role request id={} REJECTED by admin id={} for user id={}, reason: {}", requestId,
                adminUserId, request.getUser().getId(), reason);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public Page<TeacherRequestResponse> getRequests(TeacherRequestStatus status, Pageable pageable) {
        Page<TeacherRoleRequest> page;
        if (status != null) {
            page = teacherRoleRequestRepository.findByStatus(status, pageable);
        } else {
            page = teacherRoleRequestRepository.findAllWithDetails(pageable);
        }
        return page.map(this::mapToResponse);
    }

    public TeacherRequestResponse mapToResponse(TeacherRoleRequest req) {
        User u = req.getUser();
        User admin = req.getReviewedBy();
        return TeacherRequestResponse.builder()
                .id(req.getId())
                .userId(u != null ? u.getId() : null)
                .username(u != null ? u.getUsername() : null)
                .fullName(u != null ? u.getFullName() : null)
                .googleEmail(u != null ? u.getGoogleEmail() : null)
                .phoneNumber(u != null ? u.getPhoneNumber() : null)
                .schoolName(u != null && u.getSchool() != null ? u.getSchool().getName() : null)
                .status(req.getStatus())
                .requestedAt(req.getRequestedAt())
                .reviewedById(admin != null ? admin.getId() : null)
                .reviewedByName(admin != null ? admin.getFullName() : null)
                .reviewedAt(req.getReviewedAt())
                .rejectReason(req.getRejectReason())
                .build();
    }
}
