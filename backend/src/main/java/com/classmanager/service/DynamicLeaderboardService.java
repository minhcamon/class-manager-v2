package com.classmanager.service;

import com.classmanager.dto.school.response.AcademicLeaderboardResponse;
import com.classmanager.dto.school.response.WeeklyLeaderboardResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.Enrollment;
import com.classmanager.entity.Group;
import com.classmanager.entity.StudentProfile;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.StudentWeeklyBehaviorRepository;
import com.classmanager.repository.projection.StudentRankingProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DynamicLeaderboardService {

    private final StudentWeeklyBehaviorRepository behaviorRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final GroupRepository groupRepository;

    @Transactional(readOnly = true)
    public AcademicLeaderboardResponse getAcademicLeaderboard(Integer classId, Integer academicYear) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Lớp học không tồn tại."));

        if (academicYear == null) {
            academicYear = LocalDate.now().getYear();
        }

        List<Enrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, EnrollmentStatus.ACTIVE);
        List<Group> classGroups = groupRepository.findByClassEntityId(classId);

        List<StudentRankingProjection> totals = behaviorRepository.aggregateAcademicPointsByClass(classId, academicYear);
        Map<Integer, Integer> scoreMap = totals.stream()
                .collect(Collectors.toMap(StudentRankingProjection::getStudentId, StudentRankingProjection::getTotalPoints));

        int basePoint = classEntity.getBasePoint();
        List<AcademicLeaderboardResponse.StudentRankingEntry> studentEntries = new ArrayList<>();

        for (Enrollment en : enrollments) {
            if (en.getStudentProfile() == null) continue;
            Integer sId = en.getStudentProfile().getId();
            String name = (en.getUser() != null) ? en.getUser().getFullName() : "Học sinh #" + sId;
            String groupName = (en.getGroup() != null) ? en.getGroup().getGroupName() : "Chưa phân tổ";
            int finalScore = basePoint + scoreMap.getOrDefault(sId, 0);

            studentEntries.add(AcademicLeaderboardResponse.StudentRankingEntry.builder()
                    .studentId(sId)
                    .name(name)
                    .groupName(groupName)
                    .score(finalScore)
                    .build());
        }

        // Sort descending by score
        studentEntries.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        // Assign ranks with tie handling
        int currentRank = 1;
        for (int i = 0; i < studentEntries.size(); i++) {
            if (i > 0 && !studentEntries.get(i).getScore().equals(studentEntries.get(i - 1).getScore())) {
                currentRank = i + 1;
            }
            studentEntries.get(i).setRank(currentRank);
        }

        // Compute Group Rankings
        List<AcademicLeaderboardResponse.GroupRankingEntry> groupEntries = new ArrayList<>();
        for (Group g : classGroups) {
            List<Enrollment> groupMembers = enrollments.stream()
                    .filter(e -> e.getGroup() != null && e.getGroup().getId().equals(g.getId()) && e.getStudentProfile() != null)
                    .collect(Collectors.toList());

            double avgScore = 0.0;
            if (!groupMembers.isEmpty()) {
                double total = 0.0;
                for (Enrollment en : groupMembers) {
                    total += (basePoint + scoreMap.getOrDefault(en.getStudentProfile().getId(), 0));
                }
                avgScore = Math.round((total / groupMembers.size()) * 10.0) / 10.0;
            }

            groupEntries.add(AcademicLeaderboardResponse.GroupRankingEntry.builder()
                    .groupId(g.getId())
                    .name(g.getGroupName())
                    .score(avgScore)
                    .build());
        }

        groupEntries.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        int currentGroupRank = 1;
        for (int i = 0; i < groupEntries.size(); i++) {
            if (i > 0 && !groupEntries.get(i).getScore().equals(groupEntries.get(i - 1).getScore())) {
                currentGroupRank = i + 1;
            }
            groupEntries.get(i).setRank(currentGroupRank);
        }

        return AcademicLeaderboardResponse.builder()
                .students(studentEntries)
                .groups(groupEntries)
                .build();
    }

    @Transactional(readOnly = true)
    public WeeklyLeaderboardResponse getWeeklyLeaderboard(Integer classId, Integer academicYear, Integer weekNumber) {
        classRepository.findById(classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Lớp học không tồn tại."));

        if (academicYear == null) {
            academicYear = LocalDate.now().getYear();
        }
        if (weekNumber == null) {
            weekNumber = 1;
        }

        List<Enrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, EnrollmentStatus.ACTIVE);
        List<Group> classGroups = groupRepository.findByClassEntityId(classId);

        List<StudentRankingProjection> weekTotals =
                behaviorRepository.aggregateWeeklyPointsByClassAndWeek(classId, academicYear, weekNumber);
        Map<Integer, Integer> scoreMap = weekTotals.stream()
                .collect(Collectors.toMap(StudentRankingProjection::getStudentId, StudentRankingProjection::getTotalPoints));

        List<WeeklyLeaderboardResponse.StudentWeeklyRankingEntry> studentEntries = new ArrayList<>();

        for (Enrollment en : enrollments) {
            if (en.getStudentProfile() == null) continue;
            Integer sId = en.getStudentProfile().getId();
            String name = (en.getUser() != null) ? en.getUser().getFullName() : "Học sinh #" + sId;
            String groupName = (en.getGroup() != null) ? en.getGroup().getGroupName() : "Chưa phân tổ";
            int weeklyNet = scoreMap.getOrDefault(sId, 0);

            studentEntries.add(WeeklyLeaderboardResponse.StudentWeeklyRankingEntry.builder()
                    .studentId(sId)
                    .name(name)
                    .groupName(groupName)
                    .score(weeklyNet)
                    .build());
        }

        studentEntries.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

        int currentRank = 1;
        for (int i = 0; i < studentEntries.size(); i++) {
            if (i > 0 && !studentEntries.get(i).getScore().equals(studentEntries.get(i - 1).getScore())) {
                currentRank = i + 1;
            }
            studentEntries.get(i).setRank(currentRank);
        }

        // Group Rankings for weekly
        List<WeeklyLeaderboardResponse.GroupWeeklyRankingEntry> groupEntries = new ArrayList<>();
        for (Group g : classGroups) {
            List<Enrollment> groupMembers = enrollments.stream()
                    .filter(e -> e.getGroup() != null && e.getGroup().getId().equals(g.getId()) && e.getStudentProfile() != null)
                    .collect(Collectors.toList());

            double avgScore = 0.0;
            if (!groupMembers.isEmpty()) {
                double total = 0.0;
                for (Enrollment en : groupMembers) {
                    total += scoreMap.getOrDefault(en.getStudentProfile().getId(), 0);
                }
                avgScore = Math.round((total / groupMembers.size()) * 10.0) / 10.0;
            }

            groupEntries.add(WeeklyLeaderboardResponse.GroupWeeklyRankingEntry.builder()
                    .groupId(g.getId())
                    .name(g.getGroupName())
                    .score(avgScore)
                    .build());
        }

        groupEntries.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        int currentGroupRank = 1;
        for (int i = 0; i < groupEntries.size(); i++) {
            if (i > 0 && !groupEntries.get(i).getScore().equals(groupEntries.get(i - 1).getScore())) {
                currentGroupRank = i + 1;
            }
            groupEntries.get(i).setRank(currentGroupRank);
        }

        return WeeklyLeaderboardResponse.builder()
                .students(studentEntries)
                .groups(groupEntries)
                .build();
    }
}
