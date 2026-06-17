CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE,              -- NULL nếu đăng nhập thuần bằng Google
    password_hash   VARCHAR(100),                     -- NULL nếu đăng nhập thuần bằng Google
    google_email    VARCHAR(100) UNIQUE,             -- NULL nếu đăng ký bằng Username/Password
    phone_number    VARCHAR(15) UNIQUE,              -- Bắt buộc nếu đăng ký bằng Username/Password
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) DEFAULT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    school_id       BIGINT REFERENCES schools(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_auth_method CHECK (
        (username IS NOT NULL AND password_hash IS NOT NULL AND phone_number IS NOT NULL) OR
        (google_email IS NOT NULL)
    )
);

-- Thêm khóa ngoại chéo từ schools về users sau khi cả 2 bảng đã tồn tại
ALTER TABLE schools ADD CONSTRAINT fk_schools_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_google ON users(google_email) WHERE google_email IS NOT NULL;
