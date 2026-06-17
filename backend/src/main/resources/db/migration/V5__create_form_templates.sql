CREATE TABLE form_templates (
    id         SERIAL        PRIMARY KEY,
    class_id   INT           NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title      VARCHAR(200)  NOT NULL,
    -- Mảng cấu trúc các trường câu hỏi
    structure  JSONB         NOT NULL DEFAULT '[]',
    version    INT           NOT NULL DEFAULT 1,
    is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, version)
);

-- Ràng buộc: Chỉ 1 form active trong 1 lớp tại một thời điểm
CREATE UNIQUE INDEX uq_form_active_per_class
    ON form_templates (class_id)
    WHERE is_active = TRUE;
