package com.classmanager.repository;

import com.classmanager.entity.FormTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FormTemplateRepository extends JpaRepository<FormTemplate, Integer> {
    
    Optional<FormTemplate> findByClassEntityIdAndIsActiveTrue(Integer classId);
    
    List<FormTemplate> findAllByClassEntityIdOrderByVersionDesc(Integer classId);
    
    @Query("SELECT MAX(f.version) FROM FormTemplate f WHERE f.classEntity.id = :classId")
    Optional<Integer> findMaxVersionByClassId(@Param("classId") Integer classId);
    
    @Modifying
    @Query("UPDATE FormTemplate f SET f.isActive = false WHERE f.classEntity.id = :classId AND f.isActive = true")
    void deactivateCurrentForm(@Param("classId") Integer classId);
}
