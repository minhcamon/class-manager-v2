package com.classmanager.config;

import com.classmanager.entity.*;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.enums.Role;
import com.classmanager.enums.AuditAction;
import com.classmanager.enums.AuditActorType;
import com.classmanager.enums.AuditTargetEntity;
import com.classmanager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final ClassRepository classRepository;
    private final GroupRepository groupRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CurrentWeekSnapshotRepository snapshotRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedInitialUsersAndClasses();
        seedAuditLogsIfEmpty();
    }

    private void seedInitialUsersAndClasses() {
        if (userRepository.count() > 0) {
            log.info("Database already initialized (User count = {}). Skipping user/class seeding.", userRepository.count());
            return;
        }

        log.info("Initializing default sample seed data for ClassManager...");

        // 1. Create Default School
        School school = School.builder()
                .name("Trường THPT Chuyên Hà Nội - Amsterdam")
                .address("1 Hoàng Minh Giám, Cầu Giấy, Hà Nội")
                .build();
        school = schoolRepository.save(school);

        // 2. Create Admin User (Global System Admin - no school assigned)
        User adminUser = User.builder()
                .username("admin_dev")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("Quản trị viên Hệ thống")
                .phoneNumber("0900000000")
                .role(Role.ADMIN)
                .school(null)
                .build();
        userRepository.save(adminUser);

        // 3. Create Teacher User
        User teacherUser = User.builder()
                .username("teacher_dev")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("Nguyễn Văn Giáo Viên")
                .phoneNumber("0912345678")
                .role(Role.TEACHER)
                .school(school)
                .build();
        teacherUser = userRepository.save(teacherUser);

        // 4. Create Sample Class (10A1)
        ClassEntity classEntity = ClassEntity.builder()
                .className("10A1")
                .grade(10)
                .teacher(teacherUser)
                .school(school)
                .status(ClassStatus.ACTIVE)
                .basePoint(100)
                .classCode("10A1-2026")
                .classPassword("123456")
                .classPasswordHash(passwordEncoder.encode("123456"))
                .build();
        classEntity = classRepository.save(classEntity);

        // 5. Create Default Form Template
        FormTemplate formTemplate = FormTemplate.builder()
                .classEntity(classEntity)
                .title("Mẫu Sơ yếu Lý lịch Học sinh 10A1")
                .structure("{\"fields\":[{\"name\":\"hobby\",\"label\":\"Sở thích\",\"type\":\"text\"}]}")
                .version(1)
                .isActive(true)
                .build();
        formTemplate = formTemplateRepository.save(formTemplate);

        // 6. Create Sample Groups (Tổ 1, Tổ 2, Tổ 3, Tổ 4)
        Group group1 = groupRepository.save(Group.builder().classEntity(classEntity).groupName("Tổ 1").build());
        Group group2 = groupRepository.save(Group.builder().classEntity(classEntity).groupName("Tổ 2").build());
        Group group3 = groupRepository.save(Group.builder().classEntity(classEntity).groupName("Tổ 3").build());
        groupRepository.save(Group.builder().classEntity(classEntity).groupName("Tổ 4").build());

        // 7. Create Sample Student Users
        User s1 = userRepository.save(User.builder().username("student_nam").passwordHash(passwordEncoder.encode("123456")).fullName("Lê Văn Nam").phoneNumber("0987654321").role(Role.STUDENT).school(school).build());
        User s2 = userRepository.save(User.builder().username("student_hoa").passwordHash(passwordEncoder.encode("123456")).fullName("Trần Thị Hoa").phoneNumber("0987654322").role(Role.STUDENT).school(school).build());
        User s3 = userRepository.save(User.builder().username("student_dung").passwordHash(passwordEncoder.encode("123456")).fullName("Phạm Quốc Dũng").phoneNumber("0987654323").role(Role.STUDENT).school(school).build());
        User s4 = userRepository.save(User.builder().username("student_linh").passwordHash(passwordEncoder.encode("123456")).fullName("Hoàng Phương Linh").phoneNumber("0987654324").role(Role.STUDENT).school(school).build());

        // 8. Create Enrollments
        Enrollment e1 = enrollmentRepository.save(Enrollment.builder().user(s1).classEntity(classEntity).group(group1).status(EnrollmentStatus.ACTIVE).build());
        Enrollment e2 = enrollmentRepository.save(Enrollment.builder().user(s2).classEntity(classEntity).group(group1).status(EnrollmentStatus.ACTIVE).build());
        Enrollment e3 = enrollmentRepository.save(Enrollment.builder().user(s3).classEntity(classEntity).group(group2).status(EnrollmentStatus.ACTIVE).build());
        Enrollment e4 = enrollmentRepository.save(Enrollment.builder().user(s4).classEntity(classEntity).group(group3).status(EnrollmentStatus.ACTIVE).build());

        // Assign Group Leaders
        group1.setLeader(e1);
        groupRepository.save(group1);
        group2.setLeader(e3);
        groupRepository.save(group2);

        // 9. Create Student Profiles
        StudentProfile sp1 = studentProfileRepository.save(StudentProfile.builder().enrollmentId(e1.getId()).formTemplate(formTemplate).data("{}").build());
        StudentProfile sp2 = studentProfileRepository.save(StudentProfile.builder().enrollmentId(e2.getId()).formTemplate(formTemplate).data("{}").build());
        StudentProfile sp3 = studentProfileRepository.save(StudentProfile.builder().enrollmentId(e3.getId()).formTemplate(formTemplate).data("{}").build());
        StudentProfile sp4 = studentProfileRepository.save(StudentProfile.builder().enrollmentId(e4.getId()).formTemplate(formTemplate).data("{}").build());

        // 10. Create Current Week Snapshots for Current Week
        LocalDate monday = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        snapshotRepository.saveAll(List.of(
                CurrentWeekSnapshot.builder().classEntity(classEntity).student(sp1).weekStartDate(monday).currentPoint(105).totalBonus(10).totalPenalty(5).classRank(1).groupRank(1).build(),
                CurrentWeekSnapshot.builder().classEntity(classEntity).student(sp2).weekStartDate(monday).currentPoint(102).totalBonus(5).totalPenalty(3).classRank(2).groupRank(2).build(),
                CurrentWeekSnapshot.builder().classEntity(classEntity).student(sp3).weekStartDate(monday).currentPoint(98).totalBonus(2).totalPenalty(4).classRank(3).groupRank(1).build(),
                CurrentWeekSnapshot.builder().classEntity(classEntity).student(sp4).weekStartDate(monday).currentPoint(95).totalBonus(0).totalPenalty(5).classRank(4).groupRank(1).build()
        ));

        log.info("Sample seed data initialized successfully!");
        log.info("-------------------------------------------------------");
        log.info("Teacher Dev Login : username='teacher_dev', password='123456'");
        log.info("Admin Dev Login   : username='admin_dev', password='123456'");
        log.info("Student Dev Login : username='student_nam', password='123456'");
        log.info("-------------------------------------------------------");
    }

    private void seedAuditLogsIfEmpty() {
        if (auditLogRepository.count() > 0) {
            log.info("Audit logs already exist (Count = {}). Skipping AuditLog seed.", auditLogRepository.count());
            return;
        }

        log.info("Seeding sample Audit Logs for testing Feature 8...");

        User admin = userRepository.findByUsername("admin_dev").orElse(null);
        User teacher = userRepository.findByUsername("teacher_dev").orElse(null);
        User student = userRepository.findByUsername("student_nam").orElse(null);

        Long adminId = admin != null ? admin.getId() : 1L;
        Long teacherId = teacher != null ? teacher.getId() : 2L;
        Long studentId = student != null ? student.getId() : 3L;

        LocalDateTime now = LocalDateTime.now();

        List<AuditLog> sampleLogs = List.of(
                // 1. SELECT_ROLE
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(studentId)
                        .actorName("Lê Văn Nam")
                        .actorRole("STUDENT")
                        .targetEntity(AuditTargetEntity.USER)
                        .targetId(String.valueOf(studentId))
                        .action(AuditAction.SELECT_ROLE)
                        .oldValue(null)
                        .newValue("{\"role\":\"STUDENT\"}")
                        .description("User selected role: STUDENT")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(7).minusHours(4))
                        .build(),

                // 2. CREATE_SCHOOL
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.SCHOOL)
                        .targetId("1")
                        .action(AuditAction.CREATE_SCHOOL)
                        .oldValue(null)
                        .newValue("{\"name\":\"Trường THPT Chuyên Hà Nội - Amsterdam\",\"address\":\"1 Hoàng Minh Giám, Cầu Giấy, Hà Nội\"}")
                        .description("Teacher created school: Trường THPT Chuyên Hà Nội - Amsterdam")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(7).minusHours(2))
                        .build(),

                // 3. CREATE_CLASS
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.CLASS)
                        .targetId("1")
                        .action(AuditAction.CREATE_CLASS)
                        .oldValue(null)
                        .newValue("{\"className\":\"10A1\",\"grade\":10,\"classCode\":\"10A1-2026\",\"basePoint\":100}")
                        .description("Teacher created class: 10A1")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(6).minusHours(8))
                        .build(),

                // 4. CREATE_GROUP
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.GROUP)
                        .targetId("1")
                        .action(AuditAction.CREATE_GROUP)
                        .oldValue(null)
                        .newValue("{\"groupName\":\"Tổ 1\",\"classId\":1}")
                        .description("Teacher created group: Tổ 1")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(6).minusHours(6))
                        .build(),

                // 5. ASSIGN_GROUP_LEADER
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.GROUP)
                        .targetId("1")
                        .action(AuditAction.ASSIGN_GROUP_LEADER)
                        .oldValue(null)
                        .newValue("{\"leaderStudentProfileId\":1}")
                        .description("Teacher assigned group leader for group: Tổ 1")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(5).minusHours(3))
                        .build(),

                // 6. PUBLISH_FORM_TEMPLATE
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.FORM_TEMPLATE)
                        .targetId("1")
                        .action(AuditAction.PUBLISH_FORM_TEMPLATE)
                        .oldValue(null)
                        .newValue("{\"title\":\"Mẫu Sơ yếu Lý lịch Học sinh 10A1\",\"version\":1,\"classId\":1}")
                        .description("Teacher published form template version 1")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(5).minusHours(1))
                        .build(),

                // 7. UPDATE_STUDENT_DOSSIER
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(studentId)
                        .actorName("Lê Văn Nam")
                        .actorRole("STUDENT")
                        .targetEntity(AuditTargetEntity.STUDENT_PROFILE)
                        .targetId("1")
                        .action(AuditAction.UPDATE_STUDENT_DOSSIER)
                        .oldValue("{\"hobby\":\"Chơi cờ vua\"}")
                        .newValue("{\"hobby\":\"Đọc sách khoa học, Lập trình Robotics\"}")
                        .description("Student updated dossier information")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(4).minusHours(5))
                        .build(),

                // 8. CREATE_POINT_LOG
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.POINT_LOG)
                        .targetId("101")
                        .action(AuditAction.CREATE_POINT_LOG)
                        .oldValue(null)
                        .newValue("{\"studentId\":1,\"pointValue\":5,\"reason\":\"Hăng hái phát biểu xây dựng bài học môn Toán\",\"weekStartDate\":\"2026-08-17\"}")
                        .description("Created point log: +5 pts")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(3).minusHours(4))
                        .build(),

                // 9. BATCH_POINT_EVALUATION
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(teacherId)
                        .actorName("Nguyễn Văn Giáo Viên")
                        .actorRole("TEACHER")
                        .targetEntity(AuditTargetEntity.POINT_LOG)
                        .targetId("batch-4")
                        .action(AuditAction.BATCH_POINT_EVALUATION)
                        .oldValue(null)
                        .newValue("{\"studentCount\":4,\"pointValue\":10,\"reason\":\"Vệ sinh lớp học sạch sẽ, ngăn nắp tuần 33\",\"weekStartDate\":\"2026-08-17\"}")
                        .description("Batch point evaluation for 4 students: +10 pts")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(2).minusHours(7))
                        .build(),

                // 10. EXECUTE_WEEKLY_LOCK
                AuditLog.builder()
                        .actorType(AuditActorType.SYSTEM)
                        .actorId(null)
                        .actorName("Hệ thống tự động")
                        .actorRole("SYSTEM")
                        .targetEntity(AuditTargetEntity.SYSTEM)
                        .targetId("1")
                        .action(AuditAction.EXECUTE_WEEKLY_LOCK)
                        .oldValue(null)
                        .newValue("{\"classId\":1,\"weekStartDate\":\"2026-08-10\",\"studentCount\":4,\"lockedBy\":\"SYSTEM_CRON\"}")
                        .description("System auto-executed weekly closeout lock for class id=1")
                        .ipAddress(null)
                        .userAgent(null)
                        .createdAt(now.minusDays(2).minusHours(1))
                        .build(),

                // 11. APPROVE_TEACHER_REQUEST
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(adminId)
                        .actorName("Quản trị viên Hệ thống")
                        .actorRole("ADMIN")
                        .targetEntity(AuditTargetEntity.TEACHER_REQUEST)
                        .targetId("1")
                        .action(AuditAction.APPROVE_TEACHER_REQUEST)
                        .oldValue("{\"status\":\"PENDING\",\"targetUserId\":2}")
                        .newValue("{\"status\":\"APPROVED\",\"targetUserId\":2,\"roleAssigned\":\"TEACHER\"}")
                        .description("Admin approved teacher role request for user: Nguyễn Văn Giáo Viên")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusDays(1).minusHours(6))
                        .build(),

                // 12. SUPPORT_CHANGE_ROLE
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(adminId)
                        .actorName("Quản trị viên Hệ thống")
                        .actorRole("ADMIN")
                        .targetEntity(AuditTargetEntity.USER)
                        .targetId("4")
                        .action(AuditAction.SUPPORT_CHANGE_ROLE)
                        .oldValue("{\"role\":\"STUDENT\"}")
                        .newValue("{\"role\":\"TEACHER\",\"reason\":\"Cấp quyền đặc cách cán bộ trợ giảng bộ môn\"}")
                        .description("Admin changed role for user: Phạm Quốc Dũng to TEACHER, reason: Cấp quyền đặc cách cán bộ trợ giảng bộ môn")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusHours(8))
                        .build(),

                // 13. SUPPORT_RESET_PASSWORD
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(adminId)
                        .actorName("Quản trị viên Hệ thống")
                        .actorRole("ADMIN")
                        .targetEntity(AuditTargetEntity.USER)
                        .targetId("3")
                        .action(AuditAction.SUPPORT_RESET_PASSWORD)
                        .oldValue(null)
                        .newValue("{\"targetUserId\":3,\"reason\":\"Học sinh quên mật khẩu đăng nhập cổng portal\"}")
                        .description("Admin reset password for user: Trần Thị Hoa, reason: Học sinh quên mật khẩu đăng nhập cổng portal")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusHours(4))
                        .build(),

                // 14. ADMIN_START_VIEW_AS
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(adminId)
                        .actorName("Quản trị viên Hệ thống")
                        .actorRole("ADMIN")
                        .targetEntity(AuditTargetEntity.USER)
                        .targetId(String.valueOf(teacherId))
                        .action(AuditAction.ADMIN_START_VIEW_AS)
                        .oldValue(null)
                        .newValue("{\"targetUserId\":" + teacherId + ",\"targetRole\":\"TEACHER\"}")
                        .description("Admin started view-as observation session for user: Nguyễn Văn Giáo Viên")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusMinutes(30))
                        .build(),

                // 15. ADMIN_END_VIEW_AS
                AuditLog.builder()
                        .actorType(AuditActorType.USER)
                        .actorId(adminId)
                        .actorName("Quản trị viên Hệ thống")
                        .actorRole("ADMIN")
                        .targetEntity(AuditTargetEntity.USER)
                        .targetId(String.valueOf(teacherId))
                        .action(AuditAction.ADMIN_END_VIEW_AS)
                        .oldValue(null)
                        .newValue("{\"targetUserId\":" + teacherId + "}")
                        .description("Admin exited view-as observation session")
                        .ipAddress("127.0.0.1")
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0")
                        .createdAt(now.minusMinutes(5))
                        .build()
        );

        auditLogRepository.saveAll(sampleLogs);
        log.info("Successfully seeded {} sample Audit Log records!", sampleLogs.size());
    }
}
