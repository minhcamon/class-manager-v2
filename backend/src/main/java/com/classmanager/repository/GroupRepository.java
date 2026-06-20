package com.classmanager.repository;

import com.classmanager.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Integer> {
    Optional<Group> findByClassEntityIdAndGroupName(Integer classId, String groupName);
    List<Group> findByClassEntityId(Integer classId);
    Optional<Group> findByLeaderId(Integer leaderStudentProfileId);
}
