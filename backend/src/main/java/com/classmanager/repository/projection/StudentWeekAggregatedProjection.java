package com.classmanager.repository.projection;

public interface StudentWeekAggregatedProjection {
    Integer getStudentId();
    Integer getWeekNumber();
    Integer getTotalBonus();
    Integer getTotalPenalty();
    Integer getNetScore();
    Long getLogCount();
}
