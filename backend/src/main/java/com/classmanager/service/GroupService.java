package com.classmanager.service;

import com.classmanager.dto.school.request.GroupCreateRequest;
import com.classmanager.dto.school.response.GroupResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.Group;
import com.classmanager.entity.StudentProfile;
import com.classmanager.enums.ClassStatus;
import com.classmanager.exception.CustomException;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.GroupNameExistsException;
import com.classmanager.exception.GroupNotFoundException;
import com.classmanager.exception.ProfileNotFoundException;
import com.classmanager.exception.GroupLeaderConflictException;
import com.classmanager.exception.ClassNotFoundException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final ClassRepository classRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Transactional
    public GroupResponse createGroup(Long teacherId, GroupCreateRequest request) {
        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(ClassNotFoundException::new);

        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
        }

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        if (groupRepository.findByClassEntityIdAndGroupName(classEntity.getId(), request.getGroupName()).isPresent()) {
            throw new GroupNameExistsException();
        }

        Group group = Group.builder()
                .classEntity(classEntity)
                .groupName(request.getGroupName())
                .build();

        return mapToResponse(groupRepository.save(group));
    }

    @Transactional
    public GroupResponse assignGroupLeader(Long teacherId, Integer groupId, Integer studentProfileId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(GroupNotFoundException::new);

        ClassEntity classEntity = group.getClassEntity();
        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
        }

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        // BR-GROUP-03: Group leader must belong to the group
        if (studentProfile.getGroup() == null || !studentProfile.getGroup().getId().equals(groupId)) {
            throw new GroupLeaderConflictException();
        }

        // Remove previous leader role if any other group has this student as leader
        Optional<Group> previousGroup = groupRepository.findByLeaderId(studentProfileId);
        previousGroup.ifPresent(g -> {
            g.setLeader(null);
            groupRepository.save(g);
        });

        group.setLeader(studentProfile);
        return mapToResponse(groupRepository.save(group));
    }

    @Transactional
    public void addStudentToGroup(Long teacherId, Integer studentProfileId, Integer groupId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        if (groupId == null) {
            removeStudentFromGroup(teacherId, studentProfileId);
            return;
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(GroupNotFoundException::new);

        ClassEntity classEntity = group.getClassEntity();
        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
        }

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        // If student is currently leader of another group, clear that
        Optional<Group> previousGroup = groupRepository.findByLeaderId(studentProfileId);
        previousGroup.ifPresent(g -> {
            g.setLeader(null);
            groupRepository.save(g);
        });

        studentProfile.setGroup(group);
        studentProfileRepository.save(studentProfile);
    }

    @Transactional
    public void removeStudentFromGroup(Long teacherId, Integer studentProfileId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        ClassEntity classEntity = studentProfile.getFormTemplate().getClassEntity();
        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
        }

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        // If the student is a leader of their current group, clear it
        Optional<Group> ledGroup = groupRepository.findByLeaderId(studentProfileId);
        ledGroup.ifPresent(g -> {
            g.setLeader(null);
            groupRepository.save(g);
        });

        studentProfile.setGroup(null);
        studentProfileRepository.save(studentProfile);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getClassGroups(Integer classId) {
        if (!classRepository.existsById(classId)) {
            throw new ClassNotFoundException();
        }
        return groupRepository.findByClassEntityId(classId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private GroupResponse mapToResponse(Group group) {
        return GroupResponse.builder()
                .id(group.getId())
                .classId(group.getClassEntity().getId())
                .groupName(group.getGroupName())
                .leaderStudentId(group.getLeader() != null ? group.getLeader().getId() : null)
                .leaderName(group.getLeader() != null && group.getLeader().getEnrollment() != null ? group.getLeader().getEnrollment().getUser().getFullName() : null)
                .build();
    }
}
