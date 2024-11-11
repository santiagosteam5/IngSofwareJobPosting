CREATE DATABASE vacancycraft_db;
USE vacancycraft_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SHOW DATABASES;
USE vacancycraft_db;
SELECT * FROM users;
ALTER TABLE users ADD UNIQUE (username);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    network VARCHAR(50) NOT NULL,
    template VARCHAR(50) NOT NULL,
    fontSize INT NOT NULL,
    textColor VARCHAR(7) NOT NULL,
    username VARCHAR(50),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
