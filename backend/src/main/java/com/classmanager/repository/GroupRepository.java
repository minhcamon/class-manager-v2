package com.classmanager.repository;

import com.classmanager.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Integer> {
    Optional<Group> findByClassEntityIdAndGroupName(Integer classId, String groupName);

    @Query("SELECT g FROM Group g " +
           "LEFT JOIN FETCH g.leader l " +
           "LEFT JOIN FETCH l.studentProfile sp " +
           "LEFT JOIN FETCH l.user u " +
           "WHERE g.classEntity.id = :classId")
    List<Group> findByClassEntityId(@Param("classId") Integer classId);

    Optional<Group> findByLeaderId(Integer leaderEnrollmentId);
}
