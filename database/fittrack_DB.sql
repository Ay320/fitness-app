SHOW DATABASES;
CREATE DATABASE REMOVED;
USE REMOVED;

-- Tables:
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    weight_kg FLOAT CHECK (weight_kg > 0 AND weight_kg < 500), 
    height_cm FLOAT CHECK (height_cm > 0 AND height_cm < 300), 
    fitness_goal ENUM('Muscle Gain', 'Weight Loss', 'Endurance', 'General Fitness') NOT NULL DEFAULT 'General Fitness',
    experience_level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE Users
ADD COLUMN current_streak INT DEFAULT 0,
ADD COLUMN last_streak_update DATE NULL;

ALTER TABLE Users ADD COLUMN bio TEXT;

CREATE TABLE Workout_Exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_name VARCHAR(100) UNIQUE NOT NULL,
    primary_muscle VARCHAR(50) NOT NULL,
    secondary_muscle VARCHAR(50),
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
    category ENUM('Strength', 'Cardio', 'Flexibility', 'Balance') NOT NULL DEFAULT  'Balance',
    equipment VARCHAR(50),
    initial_recommended_sets VARCHAR(10),
    initial_recommended_reps VARCHAR(20),
    initial_recommended_time VARCHAR(20),
    instructions TEXT,
    injury_prevention_tips TEXT,
    image_url VARCHAR(255), -- images hosted on Pexels
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Workout_Logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    plan_exercise_id INT DEFAULT NULL, -- Links to Plan_Exercises, nullable for general logs
    date_logged DATETIME DEFAULT CURRENT_TIMESTAMP,
    sets INT CHECK (sets >= 0),
    reps INT CHECK (reps >=0 ),
	duration_minutes FLOAT CHECK (duration_minutes >= 0),
    weight FLOAT DEFAULT NULL, -- NULL if not a weight-based exercise
    notes TEXT, -- Additional comments by the user
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES Workout_Exercises(exercise_id) ON DELETE RESTRICT,
    FOREIGN KEY (plan_exercise_id) REFERENCES Plan_Exercises(plan_exercise_id) ON DELETE SET NULL
);
-- DROP TABLE Workout_Logs;



CREATE TABLE Weight_History (
    weight_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date_logged DATETIME DEFAULT CURRENT_TIMESTAMP,
    weight_kg FLOAT CHECK (weight_kg > 0 AND weight_kg < 500),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
-- DROP TABLE Weight_history;

-- Plans tables:
CREATE TABLE AI_Recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exercise_id INT NOT NULL,
    recommended_sets INT,
    recommended_reps INT,
    recommended_duration_minutes FLOAT,
    date_recommended DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES Workout_Exercises(exercise_id) ON DELETE CASCADE
);

CREATE TABLE Plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    days_per_week INT NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
    preferred_days VARCHAR(255), -- e.g., "Monday,Wednesday,Friday"
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- This table represents a specific day within a plan (e.g., Day 1, Day 2).
CREATE TABLE Plan_Days (
    plan_day_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    day_number INT NOT NULL CHECK (day_number >= 1),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES Plans(plan_id) ON DELETE CASCADE
);

-- This table links specific exercises to a day in a plan
CREATE TABLE Plan_Exercises (
    plan_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_day_id INT NOT NULL,
    exercise_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_day_id) REFERENCES Plan_Days(plan_day_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES Workout_Exercises(exercise_id) ON DELETE RESTRICT
);

-- End Tables------------------------------------

-- Indecies for performance: 
CREATE INDEX idx_user_id_logs ON Workout_Logs(user_id);
CREATE INDEX idx_date_logged ON Workout_Logs(date_logged);
CREATE INDEX idx_user_id_recommend ON AI_Recommendations(user_id);
CREATE INDEX idx_date_recommend ON AI_Recommendations(date_recommended);
CREATE INDEX idx_plans_user_id ON Plans(user_id);
CREATE INDEX idx_plan_days_plan_id ON Plan_Days(plan_id);
CREATE INDEX idx_plan_exercises_plan_day_id ON Plan_Exercises(plan_day_id);

-- Checks:
SHOW TABLES;
DELETE FROM Users WHERE firebase_uid IS NULL OR username IS NULL;
SELECT * FROM Workout_Exercises;
SELECT * FROM Users;
SELECT * FROM Workout_Logs;
SELECT * FROM Weight_History;
SELECT * FROM Plans;
SELECT * FROM Plan_Exercises;
SELECT * FROM Plan_Days;


  
INSERT INTO Plans
  (user_id, name, description, days_per_week, preferred_days, is_active)
VALUES
  (58, 'General Fitness Plan', 'A balanced plan focusing on strength and cardio for general fitness.', 3, 'Monday,Wednesday,Friday', TRUE);
  
INSERT INTO Plan_Days
  (plan_id, day_number, description)
VALUES
  (1, 1, 'Monday: Strength Focus'),
  (1, 2, 'Wednesday: Cardio and Core'),
  (1, 3, 'Friday: Full Body Workout');
  
INSERT INTO Plan_Exercises
  (plan_day_id, exercise_id)
VALUES
  (1, 5), -- Day 1: Squats
  (1, 6), -- Day 1: Push-Ups
  (2, 74), -- Day 2: Running
  (2, 8), -- Day 2: Push-Ups (for core)
  (3, 9), -- Day 3: Squats
  (3, 26), -- Day 3: Push-Ups
  (3, 74); -- Day 3: Running

INSERT INTO Weight_History
  (user_id, date_logged, weight_kg)
VALUES
  (58, '2025-04-01 08:00:00', 78.5),  -- Starting weight
  (58, '2025-04-08 08:00:00', 78.2),  -- Slight decrease
  (58, '2025-04-15 08:00:00', 77.8),  -- Continuing to decrease
  (58, '2025-04-22 08:00:00', 77.5),  -- Further decrease
  (58, '2025-04-29 08:00:00', 77.3);  -- Most recent weight

INSERT INTO Workout_Logs
  (user_id, exercise_id, date_logged, sets, reps, duration_minutes, weight, notes)
VALUES
  (58, 10, '2025-04-26 08:00:00', 3, 12, NULL, 50.0, 'Felt strong today!');
  
  
START TRANSACTION;

DELETE FROM Workout_Exercises;
ALTER TABLE Workout_Exercises AUTO_INCREMENT = 1;

COMMIT;
SET SQL_SAFE_UPDATES = 0;
SET SQL_SAFE_UPDATES = 0;



