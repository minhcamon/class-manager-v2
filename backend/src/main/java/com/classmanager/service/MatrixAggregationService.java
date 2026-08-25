package com.classmanager.service;

import com.classmanager.dto.matrix.*;
import com.classmanager.entity.*;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.enums.Role;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.StudentWeeklyBehaviorRepository;
import com.classmanager.repository.projection.StudentRankingProjection;
import com.classmanager.repository.projection.StudentWeekAggregatedProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatrixAggregationService {

    private final StudentWeeklyBehaviorRepository behaviorRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GroupRepository groupRepository;

    @Transactional(readOnly = true)
    public MatrixBoardResponse getMatrixBoard(
            Long currentUserId, Role role, Integer classId, Integer academicYear, Integer semester, Integer fromWeek, Integer toWeek) {

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Lớp học không tồn tại."));

        validateMemberAccess(currentUserId, role, classId);

        if (fromWeek == null || fromWeek < 1) fromWeek = 1;
        if (toWeek == null || toWeek < fromWeek) toWeek = fromWeek + 3; // Default 4 weeks span
        if (toWeek - fromWeek > 52) toWeek = fromWeek + 51;

        // 1. Fetch all active enrollments for this class with user, profile, group details
        List<Enrollment> enrollments = enrollmentRepository.findClassDashboardData(classId, EnrollmentStatus.ACTIVE);
        if (enrollments == null || enrollments.isEmpty()) {
            enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, EnrollmentStatus.ACTIVE);
        }

        // 2. Fetch aggregations in the week range
        List<StudentWeekAggregatedProjection> matrixProjections =
                behaviorRepository.aggregateMatrix(classId, academicYear, fromWeek, toWeek);

        // Map key: "studentId_weekNumber" -> projection
        Map<String, StudentWeekAggregatedProjection> cellMap = new HashMap<>();
        if (matrixProjections != null) {
            for (StudentWeekAggregatedProjection proj : matrixProjections) {
                if (proj != null && proj.getStudentId() != null && proj.getWeekNumber() != null) {
                    cellMap.put(proj.getStudentId() + "_" + proj.getWeekNumber(), proj);
                }
            }
        }

        // 3. Fetch academic cumulative totals
        List<StudentRankingProjection> academicTotals =
                behaviorRepository.aggregateAcademicPointsByClass(classId, academicYear);
        Map<Integer, Integer> academicTotalMap = new HashMap<>();
        if (academicTotals != null) {
            for (StudentRankingProjection p : academicTotals) {
                if (p != null && p.getStudentId() != null) {
                    academicTotalMap.put(p.getStudentId(), p.getTotalPoints() != null ? p.getTotalPoints().intValue() : 0);
                }
            }
        }

        // 4. Fetch all groups in the class
        List<Group> classGroups = groupRepository.findByClassEntityId(classId);

        // Map group ID -> Group
        Map<Integer, Group> groupMap = new HashMap<>();
        if (classGroups != null) {
            for (Group g : classGroups) {
                if (g != null && g.getId() != null) {
                    groupMap.put(g.getId(), g);
                }
            }
        }

        // Group enrollments by group ID (null for ungrouped)
        Map<Integer, List<Enrollment>> enrollmentsByGroup = new LinkedHashMap<>();
        if (classGroups != null) {
            for (Group g : classGroups) {
                enrollmentsByGroup.put(g.getId(), new ArrayList<>());
            }
        }
        enrollmentsByGroup.put(-1, new ArrayList<>()); // For ungrouped students

        if (enrollments != null) {
            for (Enrollment en : enrollments) {
                if (en.getStudentProfile() == null) continue;
                Integer gId = (en.getGroup() != null) ? en.getGroup().getId() : -1;
                enrollmentsByGroup.computeIfAbsent(gId, k -> new ArrayList<>()).add(en);
            }
        }

        int basePoint = classEntity.getBasePoint();
        List<GroupMatrixDTO> groupDTOList = new ArrayList<>();

        for (Map.Entry<Integer, List<Enrollment>> entry : enrollmentsByGroup.entrySet()) {
            Integer groupId = entry.getKey();
            List<Enrollment> groupEnrollments = entry.getValue();
            if (groupEnrollments.isEmpty() && groupId == -1) {
                continue; // Skip empty ungrouped section
            }

            String groupName = (groupId != -1 && groupMap.containsKey(groupId))
                    ? groupMap.get(groupId).getGroupName() : "Chưa phân tổ";

            List<StudentMatrixDTO> studentDTOs = new ArrayList<>();
            double totalGroupScore = 0.0;

            for (Enrollment en : groupEnrollments) {
                StudentProfile sp = en.getStudentProfile();
                Integer sId = sp.getId();
                String studentName = (en.getUser() != null) ? en.getUser().getFullName() : "Học sinh #" + sId;

                int studentAcademicDelta = academicTotalMap.getOrDefault(sId, 0);
                int totalAcademicPoints = basePoint + studentAcademicDelta;
                totalGroupScore += totalAcademicPoints;

                List<WeekCellDTO> weekCells = new ArrayList<>();
                for (int w = fromWeek; w <= toWeek; w++) {
                    String key = sId + "_" + w;
                    if (cellMap.containsKey(key)) {
                        StudentWeekAggregatedProjection proj = cellMap.get(key);
                        weekCells.add(WeekCellDTO.builder()
                                .weekNumber(w)
                                .netScore(proj.getNetScore() != null ? proj.getNetScore().intValue() : 0)
                                .posScore(proj.getTotalBonus() != null ? proj.getTotalBonus().intValue() : 0)
                                .negScore(proj.getTotalPenalty() != null ? proj.getTotalPenalty().intValue() : 0)
                                .logCount(proj.getLogCount() != null ? proj.getLogCount().longValue() : 0L)
                                .build());
                    } else {
                        // Empty week default (BR-WEEK-02 & Agent Directives)
                        weekCells.add(WeekCellDTO.builder()
                                .weekNumber(w)
                                .netScore(0)
                                .posScore(0)
                                .negScore(0)
                                .logCount(0L)
                                .build());
                    }
                }

                studentDTOs.add(StudentMatrixDTO.builder()
                        .studentId(sId)
                        .studentName(studentName)
                        .groupName(groupName)
                        .totalAcademicPoints(totalAcademicPoints)
                        .weekCells(weekCells)
                        .build());
            }

            double groupAvgScore = groupEnrollments.isEmpty() ? 0.0 :
                    Math.round((totalGroupScore / groupEnrollments.size()) * 10.0) / 10.0;

            groupDTOList.add(GroupMatrixDTO.builder()
                    .groupId(groupId == -1 ? null : groupId)
                    .groupName(groupName)
                    .groupAvgScore(groupAvgScore)
                    .students(studentDTOs)
                    .build());
        }

        return MatrixBoardResponse.builder()
                .classId(classId)
                .academicYear(academicYear)
                .semester(semester)
                .fromWeek(fromWeek)
                .toWeek(toWeek)
                .groups(groupDTOList)
                .build();
    }

    private void validateMemberAccess(Long currentUserId, Role role, Integer classId) {
        if (role == Role.ADMIN) {
            return;
        }

        if (role == Role.TEACHER) {
            boolean isOwner = classRepository.existsByIdAndTeacherId(classId, currentUserId);
            if (!isOwner) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên chủ nhiệm lớp này.");
            }
        } else if (role == Role.STUDENT) {
            boolean isEnrolled = enrollmentRepository.existsByClassEntityIdAndUserIdAndStatus(classId, currentUserId, EnrollmentStatus.ACTIVE);
            if (!isEnrolled) {
                throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không thuộc lớp học này.");
            }
        } else {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Quyền hạn không hợp lệ.");
        }
    }
}
