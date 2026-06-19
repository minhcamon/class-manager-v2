package com.classmanager.repository;

import com.classmanager.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByNameContainingIgnoreCase(String name);
}
