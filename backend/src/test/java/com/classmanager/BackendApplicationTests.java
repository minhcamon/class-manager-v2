package com.classmanager;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.beans.factory.annotation.Autowired;
import com.classmanager.repository.ClassRepository;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private ClassRepository classRepository;

    @Test
    @org.springframework.transaction.annotation.Transactional
    void contextLoads() {
        classRepository.findAll().forEach(c -> System.out.println("CLASS_DB_INSPECT ID: " + c.getId() + ", NAME: " + c.getClassName() + ", TEACHER: " + c.getTeacher().getUsername()));
    }

}
