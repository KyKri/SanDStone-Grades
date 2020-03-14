CREATE TABLE `students` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL
);

CREATE TABLE `parents` (
  `whatsapp` varchar(255) PRIMARY KEY,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL
);

CREATE TABLE `grade_authorizations` (
  `whatsapp` varchar(255),
  `student` int
);

CREATE TABLE `teachers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL
);

CREATE TABLE `classes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `teacher` int
);

CREATE TABLE `class_enrollments` (
  `student` int,
  `class` int
);

CREATE TABLE `subjects` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL
);

CREATE TABLE `assignments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `maxpoints` int,
  `subject` int,
  `class` int
);

CREATE TABLE `grades` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `student` int NOT NULL,
  `assignment` int NOT NULL,
  `points` int
);
