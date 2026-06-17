-- Bảng này tham chiếu enrollments (Feature-03)
-- Tạo trước với enrollment_id nullable, FK sẽ thêm ở Feature-03
CREATE TABLE student_profiles (
    id              SERIAL    PRIMARY KEY,
    enrollment_id   INT       UNIQUE,           -- UNIQUE: 1 enrollment = 1 profile
    form_version_id INT       NOT NULL REFERENCES form_templates(id),
    -- Câu trả lời của Student theo cấu trúc form
    data            JSONB     NOT NULL DEFAULT '{}',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_enrollment
    ON student_profiles(enrollment_id);
CREATE INDEX idx_student_profiles_form_version
    ON student_profiles(form_version_id);
