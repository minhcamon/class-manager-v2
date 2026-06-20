package com.classmanager.service;

import com.classmanager.dto.school.request.ClassCreateRequest;
import com.classmanager.dto.school.response.ClassResponse;
import com.classmanager.entity.ClassEntity;
import com.classmanager.entity.School;
import com.classmanager.entity.User;
import com.classmanager.enums.ClassStatus;
import com.classmanager.exception.ActiveClassExistsException;
import com.classmanager.exception.CustomException;
import com.classmanager.repository.ClassRepository;
import com.classmanager.repository.UserRepository;
import com.classmanager.repository.EnrollmentRepository;
import com.classmanager.repository.FormTemplateRepository;
import com.classmanager.entity.FormTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClassServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private FormTemplateRepository formTemplateRepository;

    @InjectMocks
    private ClassService classService;

    private User teacher;
    private School school;

    @BeforeEach
    void setUp() {
        school = School.builder().id(1L).name("Test School").build();
        teacher = User.builder().id(1L).username("teacher").school(school).build();
    }

    @Test
    void createClass_Success() {
        ClassCreateRequest request = ClassCreateRequest.builder()
                .className("10A1")
                .grade(10)
                .basePoint(100)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(classRepository.existsByTeacherIdAndStatus(1L, ClassStatus.ACTIVE)).thenReturn(false);
        when(classRepository.existsBySchoolIdAndClassNameAndStatus(1L, "10A1", ClassStatus.ACTIVE)).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(classRepository.save(any(ClassEntity.class))).thenAnswer(invocation -> {
            ClassEntity entity = invocation.getArgument(0);
            entity.setId(1);
            return entity;
        });
        when(formTemplateRepository.save(any(FormTemplate.class))).thenAnswer(invocation -> {
            FormTemplate form = invocation.getArgument(0);
            form.setId(1);
            return form;
        });

        ClassResponse response = classService.createClass(1L, request);

        assertNotNull(response);
        assertEquals("10A1", response.getClassName());
        assertEquals(ClassStatus.ACTIVE, response.getStatus());
        assertNotNull(response.getClassPassword());
        assertEquals(8, response.getClassPassword().length());
        verify(classRepository, times(1)).save(any(ClassEntity.class));
    }

    @Test
    void createClass_Failure_ActiveClassExists() {
        ClassCreateRequest request = ClassCreateRequest.builder()
                .className("10A2")
                .grade(10)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(classRepository.existsByTeacherIdAndStatus(1L, ClassStatus.ACTIVE)).thenReturn(true);

        assertThrows(ActiveClassExistsException.class, () -> classService.createClass(1L, request));
        verify(classRepository, never()).save(any(ClassEntity.class));
    }

    @Test
    void createClass_Failure_DuplicateClassName() {
        ClassCreateRequest request = ClassCreateRequest.builder()
                .className("10A1")
                .grade(10)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher));
        when(classRepository.existsByTeacherIdAndStatus(1L, ClassStatus.ACTIVE)).thenReturn(false);
        when(classRepository.existsBySchoolIdAndClassNameAndStatus(1L, "10A1", ClassStatus.ACTIVE)).thenReturn(true);

        assertThrows(CustomException.class, () -> classService.createClass(1L, request));
        verify(classRepository, never()).save(any(ClassEntity.class));
    }
}
