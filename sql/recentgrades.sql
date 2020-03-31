SELECT assignments.name AS assignment, grades.points, assignments.maxpoints, subjects.name AS subject
FROM grades
JOIN assignments
ON grades.assignment = assignments.id
JOIN subjects
ON assignments.subject = subjects.id
WHERE grades.student = 1;