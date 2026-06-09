CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_hash VARCHAR(255) UNIQUE,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    embedding JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);