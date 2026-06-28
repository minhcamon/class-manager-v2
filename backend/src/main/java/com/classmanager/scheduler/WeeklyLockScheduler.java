package com.classmanager.scheduler;

import com.classmanager.entity.ClassEntity;
import com.classmanager.enums.ClassStatus;
import com.classmanager.repository.ClassRepository;
import com.classmanager.service.WeeklyReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class WeeklyLockScheduler {

    private final ClassRepository classRepository;
    private final WeeklyReportService weeklyReportService;

    // Cron expression: 0 59 23 * * SUN (Runs at 23:59:00 on Sunday)
    // Zone: Asia/Ho_Chi_Minh
    @Scheduled(cron = "0 59 23 * * SUN", zone = "Asia/Ho_Chi_Minh")
    public void weeklyLockJob() {
        log.info("WeeklyLockScheduler: Starting weekly lock job...");

        LocalDate currentMonday = weeklyReportService.getCurrentWeekMonday();
        List<ClassEntity> activeClasses = classRepository.findByStatus(ClassStatus.ACTIVE);

        log.info("WeeklyLockScheduler: Found {} active classes to lock.", activeClasses.size());

        for (ClassEntity classEntity : activeClasses) {
            try {
                log.info("WeeklyLockScheduler: Closing week {} for class {} (ID: {})", 
                        currentMonday, classEntity.getClassName(), classEntity.getId());
                
                // System actor is represented by null actorUserId
                weeklyReportService.closeWeek(classEntity.getId(), currentMonday, null, "CRON");
                
                log.info("WeeklyLockScheduler: Successfully closed week for class ID: {}", classEntity.getId());
            } catch (Exception e) {
                log.error("WeeklyLockScheduler: Failed to close week for class ID: {}. Error: {}", 
                        classEntity.getId(), e.getMessage(), e);
            }
        }

        log.info("WeeklyLockScheduler: Completed weekly lock job.");
    }
}
