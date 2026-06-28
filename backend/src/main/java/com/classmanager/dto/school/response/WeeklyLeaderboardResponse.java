package com.classmanager.dto.school.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboardResponse {
    private List<StudentWeeklyRankingEntry> students;
    private List<GroupWeeklyRankingEntry> groups;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentWeeklyRankingEntry {
        private Integer rank;
        private Integer studentId;
        private String name;
        private String groupName;
        private Integer score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupWeeklyRankingEntry {
        private Integer rank;
        private Integer groupId;
        private String name;
        private Double score;
    }
}
