package com.classmanager.config;

import com.classmanager.entity.*;
import com.classmanager.enums.ClassStatus;
import com.classmanager.enums.EnrollmentStatus;
import com.classmanager.enums.Role;
import com.classmanager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already initialized (User count = {}). Skipping DataInitializer.", userRepository.count());
            return;
        }

        log.info("Initializing default sample seed data for ClassManager...");

        // 1. Create Default School
        School school = School.builder()
                .name("Trường THPT Chuyên Hà Nội - Amsterdam")
                .address("1 Hoàng Minh Giám, Cầu Giấy, Hà Nội")
                .build();
        school = schoolRepository.save(school);

        // 2. Create Admin User
        User adminUser = User.builder()
                .username("admin_dev")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("Quản trị viên Hệ thống")
                .phoneNumber("0900000000")
                .role(Role.ADMIN)
                .school(school)
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
}
