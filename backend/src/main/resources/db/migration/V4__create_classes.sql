CREATE TABLE classes (
    id          SERIAL       PRIMARY KEY,
    class_name  VARCHAR(50)  NOT NULL,
    grade       INT          NOT NULL CHECK (grade BETWEEN 10 AND 12),
    teacher_id  BIGINT       NOT NULL REFERENCES users(id),
    school_id   BIGINT       NOT NULL REFERENCES schools(id),
    status      VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE'
                             CHECK (status IN ('ACTIVE', 'ENDED')),
    base_point  INT          NOT NULL DEFAULT 100,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ràng buộc cốt lõi: Mỗi Teacher chỉ có 1 lớp ACTIVE tại một thời điểm
CREATE UNIQUE INDEX uq_class_active_per_teacher
    ON classes (teacher_id)
    WHERE status = 'ACTIVE';
