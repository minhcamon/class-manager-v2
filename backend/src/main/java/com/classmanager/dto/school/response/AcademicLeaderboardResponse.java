package com.classmanager.dto.school.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicLeaderboardResponse {
    private List<StudentRankingEntry> students;
    private List<GroupRankingEntry> groups;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRankingEntry {
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
    public static class GroupRankingEntry {
        private Integer rank;
        private Integer groupId;
        private String name;
        private Double score;
    }
}
