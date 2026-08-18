package com.classmanager.service;

import com.classmanager.dto.admin.AdminDTOs.ApiMetricsResponse;
import com.classmanager.dto.admin.AdminDTOs.SystemHealthResponse;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemHealthService {

    private final DataSource dataSource;

    @Value("${app.timezone:Asia/Ho_Chi_Minh}")
    private String configuredTimezone;

    // In-memory request counters for API health monitoring
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong count2xx = new AtomicLong(0);
    private final AtomicLong count4xx = new AtomicLong(0);
    private final AtomicLong count5xx = new AtomicLong(0);
    private final AtomicLong totalResponseDurationMs = new AtomicLong(0);

    public void recordApiCall(int statusCode, long durationMs) {
        totalRequests.incrementAndGet();
        totalResponseDurationMs.addAndGet(durationMs);
        if (statusCode >= 200 && statusCode < 300) {
            count2xx.incrementAndGet();
        } else if (statusCode >= 400 && statusCode < 500) {
            count4xx.incrementAndGet();
        } else if (statusCode >= 500) {
            count5xx.incrementAndGet();
        }
    }

    public SystemHealthResponse getSystemHealth() {
        int activeConnections = 0;
        int maxConnections = 15;
        String dbStatus = "UP";

        try {
            if (dataSource instanceof HikariDataSource) {
                HikariDataSource hikari = (HikariDataSource) dataSource;
                maxConnections = hikari.getMaximumPoolSize();
                HikariPoolMXBean poolMXBean = hikari.getHikariPoolMXBean();
                if (poolMXBean != null) {
                    activeConnections = poolMXBean.getActiveConnections();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to read Hikari pool metrics: {}", e.getMessage());
            dbStatus = "DEGRADED";
        }

        // BR-ADMIN-05: Cảnh báo (warning) nếu active connection vượt quá 80% ngưỡng tối đa của HikariCP pool
        boolean poolWarning = maxConnections > 0 && ((double) activeConnections / maxConnections) >= 0.8;

        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;
        double memoryUsagePercent = maxMemory > 0 ? ((double) usedMemory / maxMemory) * 100.0 : 0;

        File root = new File(".");
        double freeDiskGb = (double) root.getFreeSpace() / (1024 * 1024 * 1024);
        double totalDiskGb = (double) root.getTotalSpace() / (1024 * 1024 * 1024);

        return SystemHealthResponse.builder()
                .dbStatus(dbStatus)
                .activeDbConnections(activeConnections)
                .maxDbConnections(maxConnections)
                .poolWarning(poolWarning)
                .jvmUsedMemoryMb(usedMemory)
                .jvmMaxMemoryMb(maxMemory)
                .jvmMemoryUsagePercent(Math.round(memoryUsagePercent * 100.0) / 100.0)
                .diskFreeSpaceGb(Math.round(freeDiskGb * 100.0) / 100.0)
                .diskTotalSpaceGb(Math.round(totalDiskGb * 100.0) / 100.0)
                .weeklyCronSchedule("59 23 * * 0 (Asia/Ho_Chi_Minh)")
                .serverTimezone(configuredTimezone)
                .serverTime(LocalDateTime.now(ZoneId.of(configuredTimezone)))
                .build();
    }

    public ApiMetricsResponse getApiMetrics() {
        long total = totalRequests.get();
        long c5xx = count5xx.get();
        long c4xx = count4xx.get();
        long c2xx = count2xx.get();
        long duration = totalResponseDurationMs.get();

        double errorRate = total > 0 ? ((double) (c4xx + c5xx) / total) * 100.0 : 0.0;
        long avgLatency = total > 0 ? duration / total : 0;

        return ApiMetricsResponse.builder()
                .totalRequests24h(total)
                .errorRatePercent(Math.round(errorRate * 100.0) / 100.0)
                .avgResponseTimeMs(avgLatency)
                .count2xx(c2xx)
                .count4xx(c4xx)
                .count5xx(c5xx)
                .build();
    }
}
