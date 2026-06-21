package com.classmanager.service;

import com.classmanager.dto.school.request.FormFieldDto;
import com.classmanager.dto.school.request.FormTemplateCreateRequest;
import com.classmanager.dto.school.response.FormTemplateResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.FormTemplate;
import com.classmanager.enums.ClassStatus;
import com.classmanager.exception.ClassEndedException;
import com.classmanager.exception.ClassNotFoundException;
import com.classmanager.exception.FormNotFoundException;
import com.classmanager.exception.InvalidFormStructureException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.FormTemplateRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FormTemplateService {

    private final FormTemplateRepository formTemplateRepository;
    private final ClassRepository classRepository;
    private final ObjectMapper objectMapper;

    @Transactional(rollbackFor = Exception.class)
    public FormTemplateResponse createNewVersion(Long teacherId, Integer classId, FormTemplateCreateRequest request) {
        ClassEntity classEntity = classRepository.findByIdAndTeacherId(classId, teacherId)
                .orElseThrow(ClassNotFoundException::new);

        if (classEntity.getStatus() == ClassStatus.ENDED) {
            throw new ClassEndedException();
        }

        validateFormStructure(request.getStructure());

        // BR-FORM-01: Set current form to inactive
        formTemplateRepository.deactivateCurrentForm(classId);

        // Calculate next version
        int nextVersion = formTemplateRepository.findMaxVersionByClassId(classId).orElse(0) + 1;

        try {
            FormTemplate newForm = FormTemplate.builder()
                    .classEntity(classEntity)
                    .title(request.getTitle())
                    .structure(objectMapper.writeValueAsString(request.getStructure()))
                    .version(nextVersion)
                    .isActive(true)
                    .build();

            return mapToResponse(formTemplateRepository.save(newForm));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing form structure JSON", e);
        }
    }

    @Transactional(readOnly = true)
    public FormTemplateResponse getActiveForm(Integer classId) {
        FormTemplate formTemplate = formTemplateRepository.findByClassEntityIdAndIsActiveTrue(classId)
                .orElseThrow(FormNotFoundException::new);
        return mapToResponse(formTemplate);
    }

    @Transactional(readOnly = true)
    public List<FormTemplateResponse> getAllVersions(Integer classId) {
        return formTemplateRepository.findAllByClassEntityIdOrderByVersionDesc(classId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateFormStructure(List<FormFieldDto> structure) {
        Set<String> fieldNames = new HashSet<>();
        for (FormFieldDto field : structure) {
            if (field.getFieldName() == null || field.getFieldName().isBlank()) {
                throw new InvalidFormStructureException("Field name cannot be blank");
            }
            if (!fieldNames.add(field.getFieldName())) {
                throw new InvalidFormStructureException("Duplicate field name: " + field.getFieldName());
            }
            if ("select".equals(field.getType()) && (field.getOptions() == null || field.getOptions().isEmpty())) {
                throw new InvalidFormStructureException("Select field '" + field.getFieldName() + "' must have options");
            }
        }
    }

    private FormTemplateResponse mapToResponse(FormTemplate entity) {
        try {
            List<FormFieldDto> structure = objectMapper.readValue(entity.getStructure(), new TypeReference<List<FormFieldDto>>() {});
            return FormTemplateResponse.builder()
                    .id(entity.getId())
                    .classId(entity.getClassEntity().getId())
                    .title(entity.getTitle())
                    .structure(structure)
                    .version(entity.getVersion())
                    .isActive(entity.getIsActive())
                    .createdAt(entity.getCreatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing form structure JSON", e);
        }
    }
}
