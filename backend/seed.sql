INSERT INTO users (name, email, password_hash, bio, is_public, availability, is_admin, created_at) VALUES
('Kumari Ankita', 'ankita@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVjs2VIMy', 'Experienced Excel trainer and data analyst. Love helping others master spreadsheets!', true, 'available', false, NOW()),
('Roopesh Ranjan', 'roopesh@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVjs2VIMy', 'Full-stack developer passionate about React and Node.js. Always eager to learn new technologies!', true, 'available', false, NOW()),
('Admin User', 'admin@admin.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVjs2VIMy', 'Platform administrator', true, 'available', true, NOW());

INSERT INTO skills (name, description, is_approved, created_at) VALUES
('Excel', 'Microsoft Excel spreadsheet software', true, NOW()),
('Data Analysis', 'Analyzing and interpreting data', true, NOW()),
('React', 'React JavaScript library for building user interfaces', true, NOW()),
('Node.js', 'JavaScript runtime for server-side development', true, NOW()),
('Python', 'Python programming language', true, NOW()),
('JavaScript', 'JavaScript programming language', true, NOW()),
('SQL', 'Structured Query Language for databases', true, NOW()),
('Machine Learning', 'Machine learning and AI techniques', true, NOW()),
('UI/UX Design', 'User interface and user experience design', true, NOW()),
('Project Management', 'Managing projects and teams', true, NOW()),
('Photography', 'Digital photography and editing', true, NOW()),
('Public Speaking', 'Presentation and communication skills', true, NOW()),
('Foreign Languages', 'Teaching and learning foreign languages', true, NOW()),
('Marketing', 'Digital marketing and strategy', true, NOW()),
('Cooking', 'Culinary skills and recipes', true, NOW());

INSERT INTO skills_offered (user_id, skill_id) VALUES
(1, 1), (1, 2), (1, 7),
(2, 3), (2, 4), (2, 6), (2, 5);

INSERT INTO skills_wanted (user_id, skill_id) VALUES
(1, 3), (1, 5), (1, 8),
(2, 1), (2, 2), (2, 9), (2, 10);