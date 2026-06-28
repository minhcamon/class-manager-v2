package com.classmanager.service;

import com.classmanager.dto.school.response.AcademicLeaderboardResponse;
import com.classmanager.dto.school.response.WeeklyLeaderboardResponse;
import com.classmanager.dto.school.response.WeeklyReportResponse;
import com.classmanager.dto.school.response.WeeklyHistoryResponse;
import com.classmanager.entity.*;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeeklyReportService {

    private final CurrentWeekSnapshotRepository currentWeekSnapshotRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final PointLogRepository pointLogRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;

    public LocalDate getCurrentWeekMonday() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    @Transactional
    public void syncSnapshotForStudent(StudentProfile student, ClassEntity classEntity, LocalDate weekStartDate) {
        Integer totalBonus = pointLogRepository.sumBonusByStudentIdAndClassIdAndWeek(
                student.getId(), classEntity.getId(), weekStartDate);
        Integer totalPenalty = pointLogRepository.sumPenaltyByStudentIdAndClassIdAndWeek(
                student.getId(), classEntity.getId(), weekStartDate);

        Integer totalDelta = pointLogRepository.sumPointValuesByStudentIdAndClassId(
                student.getId(), classEntity.getId());
        if (totalDelta == null) totalDelta = 0;
        Integer currentPoint = classEntity.getBasePoint() + totalDelta;

        CurrentWeekSnapshot snapshot = currentWeekSnapshotRepository
                .findByStudentIdAndWeekStartDate(student.getId(), weekStartDate)
                .orElse(CurrentWeekSnapshot.builder()
                        .student(student)
                        .classEntity(classEntity)
                        .weekStartDate(weekStartDate)
                        .build());

        snapshot.setCurrentPoint(currentPoint);
        snapshot.setTotalBonus(totalBonus);
        snapshot.setTotalPenalty(totalPenalty);
        currentWeekSnapshotRepository.save(snapshot);
    }

    @Transactional
    public void closeWeek(Integer classId, LocalDate weekStartDate, Long actorUserId, String lockedBy) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Lớp học không tồn tại."));

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        if (weeklyReportRepository.existsByClassEntityIdAndWeekStartDate(classId, weekStartDate)) {
            throw new CustomException(HttpStatus.CONFLICT, "WEEK_ALREADY_LOCKED", "Tuần học này đã được chốt.");
        }

        // 1. Sync snapshots for all active students in the class
        List<Enrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, EnrollmentStatus.ACTIVE);
        for (Enrollment enrollment : enrollments) {
            if (enrollment.getStudentProfile() != null) {
                syncSnapshotForStudent(enrollment.getStudentProfile(), classEntity, weekStartDate);
            }
        }

        // 2. Fetch all snapshots for calculation of ranks
        List<CurrentWeekSnapshot> snapshots = currentWeekSnapshotRepository.findByClassEntityIdAndWeekStartDate(classId, weekStartDate);

        // Class Ranking (ordered by weekly net delta)
        snapshots.sort((a, b) -> Integer.compare(
                b.getTotalBonus() + b.getTotalPenalty(),
                a.getTotalBonus() + a.getTotalPenalty()));

        int classRank = 1;
        int prevClassScore = Integer.MAX_VALUE;
        for (int i = 0; i < snapshots.size(); i++) {
            CurrentWeekSnapshot s = snapshots.get(i);
            int score = s.getTotalBonus() + s.getTotalPenalty();
            if (score < prevClassScore) {
                classRank = i + 1;
                prevClassScore = score;
            }
            s.setClassRank(classRank);
        }

        // Group Ranking (ordered by weekly net delta within group)
        Map<Integer, List<CurrentWeekSnapshot>> snapshotsByGroup = new HashMap<>();
        for (CurrentWeekSnapshot s : snapshots) {
            Enrollment e = s.getStudent().getEnrollment();
            if (e != null && e.getGroup() != null) {
                snapshotsByGroup.computeIfAbsent(e.getGroup().getId(), k -> new ArrayList<>()).add(s);
            }
        }

        for (List<CurrentWeekSnapshot> groupList : snapshotsByGroup.values()) {
            groupList.sort((a, b) -> Integer.compare(
                    b.getTotalBonus() + b.getTotalPenalty(),
                    a.getTotalBonus() + a.getTotalPenalty()));
            int groupRank = 1;
            int prevGroupScore = Integer.MAX_VALUE;
            for (int i = 0; i < groupList.size(); i++) {
                CurrentWeekSnapshot s = groupList.get(i);
                int score = s.getTotalBonus() + s.getTotalPenalty();
                if (score < prevGroupScore) {
                    groupRank = i + 1;
                    prevGroupScore = score;
                }
                s.setGroupRank(groupRank);
            }
        }

        // Save snapshots with ranks
        currentWeekSnapshotRepository.saveAll(snapshots);

        // 3. Create WeeklyReport records and initialize next week
        List<WeeklyReport> reportsToSave = new ArrayList<>();
        List<CurrentWeekSnapshot> nextWeekSnapshots = new ArrayList<>();
        LocalDate nextWeekStartDate = weekStartDate.plusWeeks(1);

        for (CurrentWeekSnapshot snapshot : snapshots) {
            WeeklyReport report = WeeklyReport.builder()
                    .student(snapshot.getStudent())
                    .classEntity(snapshot.getClassEntity())
                    .weekStartDate(weekStartDate)
                    .weekEndDate(weekStartDate.plusDays(6))
                    .finalPoint(snapshot.getCurrentPoint())
                    .totalBonus(snapshot.getTotalBonus())
                    .totalPenalty(snapshot.getTotalPenalty())
                    .classRank(snapshot.getClassRank())
                    .groupRank(snapshot.getGroupRank())
                    .lockedBy(lockedBy)
                    .build();
            reportsToSave.add(report);

            // Initialize next week's snapshot with current cumulative points
            CurrentWeekSnapshot nextSnapshot = CurrentWeekSnapshot.builder()
                    .student(snapshot.getStudent())
                    .classEntity(snapshot.getClassEntity())
                    .weekStartDate(nextWeekStartDate)
                    .currentPoint(snapshot.getCurrentPoint()) // rolls over
                    .totalBonus(0)
                    .totalPenalty(0)
                    .build();
            nextWeekSnapshots.add(nextSnapshot);
        }

        weeklyReportRepository.saveAll(reportsToSave);
        currentWeekSnapshotRepository.saveAll(nextWeekSnapshots);
    }

    @Transactional(readOnly = true)
    public AcademicLeaderboardResponse getAcademicLeaderboard(Integer classId) {
        LocalDate currentMonday = getCurrentWeekMonday();
        List<CurrentWeekSnapshot> snapshots = currentWeekSnapshotRepository.findAcademicLeaderboard(classId, currentMonday);

        // Map to student ranking entries
        List<AcademicLeaderboardResponse.StudentRankingEntry> students = new ArrayList<>();
        int rank = 1;
        int prevScore = Integer.MAX_VALUE;
        for (int i = 0; i < snapshots.size(); i++) {
            CurrentWeekSnapshot s = snapshots.get(i);
            Enrollment e = s.getStudent().getEnrollment();
            String groupName = e != null && e.getGroup() != null ? e.getGroup().getGroupName() : "Chưa chia tổ";
            String fullName = e != null && e.getUser() != null ? e.getUser().getFullName() : "Học sinh";

            int score = s.getCurrentPoint();
            if (score < prevScore) {
                rank = i + 1;
                prevScore = score;
            }

            students.add(AcademicLeaderboardResponse.StudentRankingEntry.builder()
                    .rank(rank)
                    .studentId(s.getStudent().getId())
                    .name(fullName)
                    .groupName(groupName)
                    .score(score)
                    .build());
        }

        // Calculate group rankings
        Map<Integer, GroupPointsAccumulator> groupMap = new HashMap<>();
        for (CurrentWeekSnapshot s : snapshots) {
            Enrollment e = s.getStudent().getEnrollment();
            if (e != null && e.getGroup() != null) {
                Group g = e.getGroup();
                GroupPointsAccumulator acc = groupMap.computeIfAbsent(g.getId(), k -> new GroupPointsAccumulator(g.getId(), g.getGroupName()));
                acc.addPoints(s.getCurrentPoint());
            }
        }

        List<GroupPointsAccumulator> groupList = new ArrayList<>(groupMap.values());
        groupList.sort((a, b) -> Double.compare(b.getAverage(), a.getAverage()));

        List<AcademicLeaderboardResponse.GroupRankingEntry> groups = new ArrayList<>();
        int gRank = 1;
        double gPrevScore = Double.MAX_VALUE;
        for (int i = 0; i < groupList.size(); i++) {
            GroupPointsAccumulator acc = groupList.get(i);
            double avg = acc.getAverage();
            if (avg < gPrevScore) {
                gRank = i + 1;
                gPrevScore = avg;
            }
            groups.add(AcademicLeaderboardResponse.GroupRankingEntry.builder()
                    .rank(gRank)
                    .groupId(acc.getGroupId())
                    .name(acc.getGroupName())
                    .score(Math.round(avg * 100.0) / 100.0)
                    .build());
        }

        return AcademicLeaderboardResponse.builder()
                .students(students)
                .groups(groups)
                .build();
    }

    @Transactional(readOnly = true)
    public WeeklyLeaderboardResponse getWeeklyLeaderboard(Integer classId) {
        LocalDate currentMonday = getCurrentWeekMonday();
        List<CurrentWeekSnapshot> snapshots = currentWeekSnapshotRepository.findWeeklyLeaderboard(classId, currentMonday);

        List<WeeklyLeaderboardResponse.StudentWeeklyRankingEntry> students = new ArrayList<>();
        int rank = 1;
        int prevScore = Integer.MAX_VALUE;
        for (int i = 0; i < snapshots.size(); i++) {
            CurrentWeekSnapshot s = snapshots.get(i);
            Enrollment e = s.getStudent().getEnrollment();
            String groupName = e != null && e.getGroup() != null ? e.getGroup().getGroupName() : "Chưa chia tổ";
            String fullName = e != null && e.getUser() != null ? e.getUser().getFullName() : "Học sinh";

            int score = s.getTotalBonus() + s.getTotalPenalty();
            if (score < prevScore) {
                rank = i + 1;
                prevScore = score;
            }

            students.add(WeeklyLeaderboardResponse.StudentWeeklyRankingEntry.builder()
                    .rank(rank)
                    .studentId(s.getStudent().getId())
                    .name(fullName)
                    .groupName(groupName)
                    .score(score)
                    .build());
        }

        // Calculate weekly group rankings
        Map<Integer, GroupPointsAccumulator> groupMap = new HashMap<>();
        for (CurrentWeekSnapshot s : snapshots) {
            Enrollment e = s.getStudent().getEnrollment();
            if (e != null && e.getGroup() != null) {
                Group g = e.getGroup();
                GroupPointsAccumulator acc = groupMap.computeIfAbsent(g.getId(), k -> new GroupPointsAccumulator(g.getId(), g.getGroupName()));
                acc.addPoints(s.getTotalBonus() + s.getTotalPenalty());
            }
        }

        List<GroupPointsAccumulator> groupList = new ArrayList<>(groupMap.values());
        groupList.sort((a, b) -> Double.compare(b.getAverage(), a.getAverage()));

        List<WeeklyLeaderboardResponse.GroupWeeklyRankingEntry> groups = new ArrayList<>();
        int gRank = 1;
        double gPrevScore = Double.MAX_VALUE;
        for (int i = 0; i < groupList.size(); i++) {
            GroupPointsAccumulator acc = groupList.get(i);
            double avg = acc.getAverage();
            if (avg < gPrevScore) {
                gRank = i + 1;
                gPrevScore = avg;
            }
            groups.add(WeeklyLeaderboardResponse.GroupWeeklyRankingEntry.builder()
                    .rank(gRank)
                    .groupId(acc.getGroupId())
                    .name(acc.getGroupName())
                    .score(Math.round(avg * 100.0) / 100.0)
                    .build());
        }

        return WeeklyLeaderboardResponse.builder()
                .students(students)
                .groups(groups)
                .build();
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getLockedWeeks(Integer classId) {
        return weeklyReportRepository.findLockedWeeksByClassId(classId);
    }

    @Transactional(readOnly = true)
    public WeeklyReportResponse getWeeklyReport(Integer classId, LocalDate weekStartDate) {
        List<WeeklyReport> reports = weeklyReportRepository.findByClassEntityIdAndWeekStartDate(classId, weekStartDate);
        if (reports.isEmpty()) {
            throw new CustomException(HttpStatus.NOT_FOUND, "REPORT_NOT_FOUND", "Báo cáo tuần không tồn tại.");
        }

        WeeklyReport sample = reports.get(0);
        List<WeeklyReportResponse.WeeklyReportEntry> entries = reports.stream()
                .map(r -> {
                    Enrollment e = r.getStudent().getEnrollment();
                    String groupName = e != null && e.getGroup() != null ? e.getGroup().getGroupName() : "Chưa chia tổ";
                    String name = e != null && e.getUser() != null ? e.getUser().getFullName() : "Học sinh";
                    return WeeklyReportResponse.WeeklyReportEntry.builder()
                            .studentId(r.getStudent().getId())
                            .name(name)
                            .groupName(groupName)
                            .finalPoint(r.getFinalPoint())
                            .totalBonus(r.getTotalBonus())
                            .totalPenalty(r.getTotalPenalty())
                            .classRank(r.getClassRank())
                            .groupRank(r.getGroupRank())
                            .build();
                })
                .collect(Collectors.toList());

        return WeeklyReportResponse.builder()
                .weekStartDate(sample.getWeekStartDate())
                .weekEndDate(sample.getWeekEndDate())
                .lockedAt(sample.getLockedAt())
                .lockedBy(sample.getLockedBy())
                .entries(entries)
                .build();
    }

    @Transactional(readOnly = true)
    public List<WeeklyHistoryResponse> getStudentHistory(Integer studentProfileId) {
        return weeklyReportRepository.findByStudentIdOrderByWeekStartDateDesc(studentProfileId).stream()
                .map(r -> WeeklyHistoryResponse.builder()
                        .weekStartDate(r.getWeekStartDate())
                        .finalPoint(r.getFinalPoint())
                        .totalBonus(r.getTotalBonus())
                        .totalPenalty(r.getTotalPenalty())
                        .classRank(r.getClassRank())
                        .groupRank(r.getGroupRank())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeeklyHistoryResponse> getStudentHistoryByUserIdAndClassId(Long userId, Integer classId) {
        StudentProfile student = studentProfileRepository.findByUserIdAndClassId(userId, classId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND", "Học sinh không thuộc lớp này."));
        return getStudentHistory(student.getId());
    }

    private static class GroupPointsAccumulator {
        private final Integer groupId;
        private final String groupName;
        private int totalPoints = 0;
        private int count = 0;

        public GroupPointsAccumulator(Integer groupId, String groupName) {
            this.groupId = groupId;
            this.groupName = groupName;
        }

        public void addPoints(int pts) {
            totalPoints += pts;
            count++;
        }

        public double getAverage() {
            return count == 0 ? 0.0 : (double) totalPoints / count;
        }

        public Integer getGroupId() { return groupId; }
        public String getGroupName() { return groupName; }
    }
}
