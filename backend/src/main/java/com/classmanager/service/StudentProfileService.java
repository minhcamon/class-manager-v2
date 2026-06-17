package com.classmanager.service;

import com.classmanager.dto.school.request.FormFieldDto;
import com.classmanager.dto.school.request.StudentProfileUpdateRequest;
import com.classmanager.dto.school.response.StudentProfileResponse;
import com.classmanager.entity.FormTemplate;
import com.classmanager.entity.StudentProfile;
import com.classmanager.enums.ClassStatus;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.FormNotFoundException;
import com.classmanager.exception.InvalidFormStructureException;
import com.classmanager.exception.ProfileNotFoundException;
import com.classmanager.repository.FormTemplateRepository;
import com.classmanager.repository.StudentProfileRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final FormTemplateRepository formTemplateRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public StudentProfileResponse upsertProfile(Integer enrollmentId, Integer classId, StudentProfileUpdateRequest request) {
        FormTemplate activeForm = formTemplateRepository.findByClassEntityIdAndIsActiveTrue(classId)
                .orElseThrow(FormNotFoundException::new);

        if (activeForm.getClassEntity().getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        validateProfileData(request.getData(), activeForm);

        StudentProfile profile = studentProfileRepository.findByEnrollmentId(enrollmentId)
                .orElse(StudentProfile.builder().enrollmentId(enrollmentId).build());

        try {
            profile.setData(objectMapper.writeValueAsString(request.getData()));
            profile.setFormTemplate(activeForm);
            
            return mapToResponse(studentProfileRepository.save(profile));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing profile data JSON", e);
        }
    }

    public StudentProfileResponse getProfile(Integer enrollmentId) {
        StudentProfile profile = studentProfileRepository.findByEnrollmentId(enrollmentId)
                .orElseThrow(ProfileNotFoundException::new);
        return mapToResponse(profile);
    }

    private void validateProfileData(Map<String, Object> data, FormTemplate form) {
        try {
            List<FormFieldDto> structure = objectMapper.readValue(form.getStructure(), new TypeReference<List<FormFieldDto>>() {});
            for (FormFieldDto field : structure) {
                if (field.isRequired() && (!data.containsKey(field.getFieldName()) || data.get(field.getFieldName()) == null)) {
                    throw new InvalidFormStructureException("Field '" + field.getLabel() + "' is required");
                }
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing form structure JSON", e);
        }
    }

    private StudentProfileResponse mapToResponse(StudentProfile entity) {
        try {
            Map<String, Object> data = objectMapper.readValue(entity.getData(), new TypeReference<Map<String, Object>>() {});
            List<FormFieldDto> structure = objectMapper.readValue(entity.getFormTemplate().getStructure(), new TypeReference<List<FormFieldDto>>() {});
            
            return StudentProfileResponse.builder()
                    .id(entity.getId())
                    .enrollmentId(entity.getEnrollmentId())
                    .formVersionId(entity.getFormTemplate().getId())
                    .formVersion(entity.getFormTemplate().getVersion())
                    .formStructure(structure)
                    .data(data)
                    .updatedAt(entity.getUpdatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing profile data JSON", e);
        }
    }
}
