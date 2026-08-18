package com.classmanager.repository.specification;

import com.classmanager.dto.audit.AuditLogFilterCriteria;
import com.classmanager.entity.AuditLog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AuditLogSpecification {

    public static Specification<AuditLog> filterBy(AuditLogFilterCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria == null) {
                return criteriaBuilder.conjunction();
            }

            if (criteria.getActorId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("actorId"), criteria.getActorId()));
            }

            if (criteria.getActorType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("actorType"), criteria.getActorType()));
            }

            if (criteria.getAction() != null) {
                predicates.add(criteriaBuilder.equal(root.get("action"), criteria.getAction()));
            }

            if (criteria.getTargetEntity() != null) {
                predicates.add(criteriaBuilder.equal(root.get("targetEntity"), criteria.getTargetEntity()));
            }

            if (criteria.getTargetId() != null && !criteria.getTargetId().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("targetId"), criteria.getTargetId().trim()));
            }

            if (criteria.getFromDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), criteria.getFromDate()));
            }

            if (criteria.getToDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), criteria.getToDate()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
