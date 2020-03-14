-- students
INSERT INTO students (firstname, lastname) VALUES ('Pat', 'Mahiney');
INSERT INTO students (firstname, lastname) VALUES ('Mike', 'Hawk');
INSERT INTO students (firstname, lastname) VALUES ('Ben', 'Dover');
INSERT INTO students (firstname, lastname) VALUES ('Mike', 'Tython');

-- parents
INSERT INTO parents (whatsapp, firstname, lastname) VALUES ('15551234567', 'Xelyk', 'Xyran');
INSERT INTO parents (whatsapp, firstname, lastname) VALUES ('15557654321', 'Axel', 'Lea');
INSERT INTO parents (whatsapp, firstname, lastname) VALUES ('15551237654', 'Xion', 'Oni');
INSERT INTO parents (whatsapp, firstname, lastname) VALUES ('15551234569', 'Zexion', 'Ienzo');

-- grade_authorizations
INSERT INTO grade_authorizations (whatsapp, student) VALUES ('15551234567', 1);
INSERT INTO grade_authorizations (whatsapp, student) VALUES ('15551237654', 2);
INSERT INTO grade_authorizations (whatsapp, student) VALUES ('15551234569', 3);
INSERT INTO grade_authorizations (whatsapp, student) VALUES ('15557654321', 4);

-- teachers
INSERT INTO teachers (firstname, lastname) VALUES ('Alan', 'Riggins');
INSERT INTO teachers (firstname, lastname) VALUES ('John', 'Carroll');

-- classes
INSERT INTO classes (teacher) VALUES (1);
INSERT INTO classes (teacher) VALUES (2);

-- class_enrollments
INSERT INTO class_enrollments (student, class) VALUES (1, 1);
INSERT INTO class_enrollments (student, class) VALUES (2, 1);
INSERT INTO class_enrollments (student, class) VALUES (3, 2);
INSERT INTO class_enrollments (student, class) VALUES (4, 2);

-- subjects
INSERT INTO subjects (name) VALUES ('Computer Science');

-- assignments
INSERT INTO assignments (name, maxpoints, subject, class) VALUES ('Homework 1', 10, 1, 1);
INSERT INTO assignments (name, maxpoints, subject, class) VALUES ('Homework 1', 10, 1, 2);

-- grades
INSERT INTO grades (student, assignment, points) VALUES (1, 1, 9);
INSERT INTO grades (student, assignment, points) VALUES (2, 1, 8);
INSERT INTO grades (student, assignment, points) VALUES (3, 2, 7);
INSERT INTO grades (student, assignment, points) VALUES (4, 2, 10);