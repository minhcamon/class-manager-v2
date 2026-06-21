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
import com.classmanager.entity.Enrollment;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.GroupRepository;
import com.classmanager.repository.StudentProfileRepository;
import com.classmanager.repository.EnrollmentRepository;
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
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public GroupResponse createGroup(Long teacherId, GroupCreateRequest request) {
        ClassEntity classEntity = classRepository.findByIdWithTeacher(request.getClassId())
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

        Enrollment enrollment = studentProfile.getEnrollment();
        if (enrollment == null) {
            enrollment = enrollmentRepository.findById(studentProfile.getEnrollmentId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "Enrollment not found."));
        }

        // BR-GROUP-03: Group leader must belong to the group
        if (enrollment.getGroup() == null || !enrollment.getGroup().getId().equals(groupId)) {
            throw new GroupLeaderConflictException();
        }

        // Remove previous leader role if any other group has this student as leader
        Optional<Group> previousGroup = groupRepository.findByLeaderId(enrollment.getId());
        previousGroup.ifPresent(g -> {
            g.setLeader(null);
            groupRepository.save(g);
        });

        group.setLeader(enrollment);
        return mapToResponse(groupRepository.save(group));
    }

    @Transactional
    public void addStudentToGroup(Long teacherId, Integer studentProfileId, Integer groupId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        Enrollment enrollment = studentProfile.getEnrollment();
        if (enrollment == null) {
            enrollment = enrollmentRepository.findById(studentProfile.getEnrollmentId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "Enrollment not found."));
        }

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
        Optional<Group> previousGroup = groupRepository.findByLeaderId(enrollment.getId());
        previousGroup.ifPresent(g -> {
            g.setLeader(null);
            groupRepository.save(g);
        });

        enrollment.setGroup(group);
        enrollmentRepository.save(enrollment);
    }

    @Transactional
    public void removeStudentFromGroup(Long teacherId, Integer studentProfileId) {
        StudentProfile studentProfile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(ProfileNotFoundException::new);

        Enrollment enrollment = studentProfile.getEnrollment();
        if (enrollment == null) {
            enrollment = enrollmentRepository.findById(studentProfile.getEnrollmentId())
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "ENROLLMENT_NOT_FOUND", "Enrollment not found."));
        }

        ClassEntity classEntity = enrollment.getClassEntity();
        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải giáo viên của lớp này.");
        }

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        // If the student is a leader of their current group, clear it
        Optional<Group> ledGroup = groupRepository.findByLeaderId(enrollment.getId());
        ledGroup.ifPresent(g -> {
            g.setLeader(null);
            groupRepository.save(g);
        });

        enrollment.setGroup(null);
        enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getClassGroups(Integer classId) {
        return groupRepository.findByClassEntityId(classId).stream()
                .map(group -> mapToResponse(group, classId))
                .collect(Collectors.toList());
    }

    private GroupResponse mapToResponse(Group group) {
        return mapToResponse(group, group.getClassEntity() != null ? group.getClassEntity().getId() : null);
    }

    private GroupResponse mapToResponse(Group group, Integer classId) {
        Integer leaderProfileId = null;
        String leaderName = null;
        if (group.getLeader() != null) {
            Enrollment leaderEnrollment = group.getLeader();
            if (leaderEnrollment.getStudentProfile() != null) {
                leaderProfileId = leaderEnrollment.getStudentProfile().getId();
            }
            if (leaderEnrollment.getUser() != null) {
                leaderName = leaderEnrollment.getUser().getFullName();
            }
        }
        return GroupResponse.builder()
                .id(group.getId())
                .classId(classId)
                .groupName(group.getGroupName())
                .leaderStudentId(leaderProfileId)
                .leaderName(leaderName)
                .build();
    }
}
