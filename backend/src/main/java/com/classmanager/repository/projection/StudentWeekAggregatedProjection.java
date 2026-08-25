package com.classmanager.repository.projection;

public interface StudentWeekAggregatedProjection {
    Integer getStudentId();
    Integer getWeekNumber();
    Number getTotalBonus();
    Number getTotalPenalty();
    Number getNetScore();
    Number getLogCount();
}
