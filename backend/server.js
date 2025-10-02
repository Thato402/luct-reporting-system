const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const XLSX = require('xlsx');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Update CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://yourusername.github.io', // Your GitHub Pages URL
    'https://yourusername.github.io/luct-reporting-system' // If using project site
  ],
  credentials: true
}));
app.use(express.json());

// PostgreSQL connection with better error handling
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'luct_reporting',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize Database Tables and Sample Data
const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'lecturer', 'principal_lecturer', 'program_leader')),
        faculty VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        faculty_name VARCHAR(255) NOT NULL,
        class_name VARCHAR(255) NOT NULL,
        week_reporting VARCHAR(50) NOT NULL,
        date_lecture DATE NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        course_code VARCHAR(255) NOT NULL,
        lecturer_name VARCHAR(255) NOT NULL,
        students_present INTEGER NOT NULL,
        total_students INTEGER NOT NULL,
        venue VARCHAR(255) NOT NULL,
        lecture_time VARCHAR(100) NOT NULL,
        topic_taught TEXT NOT NULL,
        learning_outcomes TEXT NOT NULL,
        recommendations TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feedback table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        report_id INTEGER REFERENCES reports(id),
        principal_lecturer_id INTEGER REFERENCES users(id),
        feedback_text TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('lecturer', 'course', 'class', 'student', 'facility')),
        target_id VARCHAR(255),
        target_name VARCHAR(255) NOT NULL,
        rating_score INTEGER NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
        comments TEXT,
        rated_by INTEGER REFERENCES users(id),
        rater_role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');

    // Check and insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// Insert sample data if database is empty
const insertSampleData = async () => {
  try {
    // Check if users exist
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log('📝 Inserting sample users...');
      
      // Hash password for sample users
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      // Insert sample users
      await pool.query(`
        INSERT INTO users (email, password, name, role, faculty) VALUES 
        ('admin@luct.ac.rw', $1, 'System Administrator', 'program_leader', 'Computing and IT'),
        ('lecturer@luct.ac.rw', $1, 'Dr. John Smith', 'lecturer', 'Computing and IT'),
        ('principal@luct.ac.rw', $1, 'Prof. Alice Johnson', 'principal_lecturer', 'Computing and IT'),
        ('student@luct.ac.rw', $1, 'Student User', 'student', 'Computing and IT')
      `, [hashedPassword]);

      console.log('✅ Sample users inserted');
    }

    // Check if reports exist
    const reportsCount = await pool.query('SELECT COUNT(*) FROM reports');
    
    if (parseInt(reportsCount.rows[0].count) === 0) {
      console.log('📝 Inserting sample reports...');
      
      // Get a user ID to use as created_by
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@luct.ac.rw']);
      const userId = userResult.rows[0].id;

      // Insert sample reports
      const sampleReports = [
        {
          faculty_name: 'Computing and IT',
          class_name: 'Year 1 CS A',
          week_reporting: 'Week 1',
          date_lecture: '2024-01-15',
          course_name: 'Introduction to Programming',
          course_code: 'CS101',
          lecturer_name: 'Dr. John Smith',
          students_present: 25,
          total_students: 30,
          venue: 'Room 101',
          lecture_time: '08:00-10:00',
          topic_taught: 'Programming Basics, Variables, Data Types, Control Structures',
          learning_outcomes: 'Students learned basic programming concepts and were able to write simple programs using variables and control structures',
          recommendations: 'More practical exercises needed for better understanding'
        },
        {
          faculty_name: 'Computing and IT',
          class_name: 'Year 2 IT B',
          week_reporting: 'Week 2',
          date_lecture: '2024-01-22',
          course_name: 'Database Systems',
          course_code: 'CS201',
          lecturer_name: 'Dr. John Smith',
          students_present: 28,
          total_students: 32,
          venue: 'Lab 205',
          lecture_time: '10:00-12:00',
          topic_taught: 'SQL Queries, SELECT statements, WHERE clauses, JOIN operations',
          learning_outcomes: 'Students mastered basic SQL operations and can create complex queries with multiple tables',
          recommendations: 'Good participation, continue with advanced queries next week'
        },
        {
          faculty_name: 'Business',
          class_name: 'Year 1 BBA A',
          week_reporting: 'Week 1',
          date_lecture: '2024-01-16',
          course_name: 'Business Mathematics',
          course_code: 'BUS101',
          lecturer_name: 'Dr. Sarah Wilson',
          students_present: 22,
          total_students: 25,
          venue: 'Room 301',
          lecture_time: '14:00-16:00',
          topic_taught: 'Algebra Review, Linear Equations, Business Calculations',
          learning_outcomes: 'Students refreshed algebra concepts and solved basic business math problems including profit calculations',
          recommendations: 'Provide additional practice problems for homework'
        },
        {
          faculty_name: 'Computing and IT',
          class_name: 'Year 3 SE A',
          week_reporting: 'Week 3',
          date_lecture: '2024-01-29',
          course_name: 'Web Development',
          course_code: 'CS301',
          lecturer_name: 'Prof. Alice Johnson',
          students_present: 18,
          total_students: 20,
          venue: 'Lab 310',
          lecture_time: '13:00-15:00',
          topic_taught: 'React.js Fundamentals, Components, State Management, Hooks',
          learning_outcomes: 'Students built their first React components and understood state management using useState hook',
          recommendations: 'Excellent engagement, students should practice building more components'
        },
        {
          faculty_name: 'Engineering',
          class_name: 'Year 2 Civil A',
          week_reporting: 'Week 2',
          date_lecture: '2024-01-23',
          course_name: 'Structural Analysis',
          course_code: 'ENG202',
          lecturer_name: 'Dr. Robert Brown',
          students_present: 35,
          total_students: 40,
          venue: 'Room 205',
          lecture_time: '09:00-11:00',
          topic_taught: 'Beam Analysis, Load Calculations, Stress Distribution',
          learning_outcomes: 'Students can calculate loads and analyze simple beam structures with various support conditions',
          recommendations: 'Some students need extra help with complex calculations'
        }
      ];

      for (const report of sampleReports) {
        await pool.query(
          `INSERT INTO reports (
            faculty_name, class_name, week_reporting, date_lecture,
            course_name, course_code, lecturer_name, students_present,
            total_students, venue, lecture_time, topic_taught,
            learning_outcomes, recommendations, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            report.faculty_name,
            report.class_name,
            report.week_reporting,
            report.date_lecture,
            report.course_name,
            report.course_code,
            report.lecturer_name,
            report.students_present,
            report.total_students,
            report.venue,
            report.lecture_time,
            report.topic_taught,
            report.learning_outcomes,
            report.recommendations,
            userId
          ]
        );
      }

      console.log('✅ Sample reports inserted');
    }

    const finalReportsCount = await pool.query('SELECT COUNT(*) FROM reports');
    const finalUsersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Database ready - Users: ${finalUsersCount.rows[0].count}, Reports: ${finalReportsCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
};

// ==================== TEST & HEALTH ENDPOINTS ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'LUCT Reporting System API',
    database: 'Connected',
    version: '1.0.0'
  });
});

// Simple test endpoint - no authentication needed
app.get('/api/test-simple', async (req, res) => {
  try {
    console.log('📨 Test endpoint called');
    
    const result = await pool.query('SELECT id, faculty_name, class_name, course_name FROM reports LIMIT 5');
    
    res.json({
      success: true,
      message: 'Backend is working!',
      reports: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint with authentication
app.get('/api/test-auth', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, faculty_name, class_name, course_name FROM reports LIMIT 3');
    
    res.json({
      success: true,
      user: req.user,
      reports: result.rows
    });
    
  } catch (error) {
    console.error('Test auth endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AUTHENTICATION ROUTES ====================

// User Registration
app.post('/api/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('role').isIn(['student', 'lecturer', 'principal_lecturer', 'program_leader'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, faculty } = req.body;

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password, name, role, faculty) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
      [email, hashedPassword, name, role, faculty]
    );

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        faculty: user.faculty
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== REPORTS ROUTES ====================

// Get Reports - SIMPLIFIED VERSION
app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Loading reports for user:', req.user.id, 'Role:', req.user.role);
    
    const { search, faculty, course, lecturer, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.*, 
        u.name as sender_name,
        u.role as sender_role,
        u.email as sender_email
      FROM reports r 
      LEFT JOIN users u ON r.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Add search filters if provided
    if (search && search.trim() !== '') {
      paramCount++;
      query += ` AND (
        r.class_name ILIKE $${paramCount} OR 
        r.course_name ILIKE $${paramCount} OR 
        r.lecturer_name ILIKE $${paramCount} OR
        r.faculty_name ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
    }

    if (faculty && faculty.trim() !== '') {
      paramCount++;
      query += ` AND r.faculty_name = $${paramCount}`;
      params.push(faculty.trim());
    }

    if (course && course.trim() !== '') {
      paramCount++;
      query += ` AND r.course_code = $${paramCount}`;
      params.push(course.trim());
    }

    if (lecturer && lecturer.trim() !== '') {
      paramCount++;
      query += ` AND r.lecturer_name ILIKE $${paramCount}`;
      params.push(`%${lecturer.trim()}%`);
    }

    // Role-based filtering
    if (req.user.role === 'lecturer') {
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
      if (userResult.rows.length > 0) {
        paramCount++;
        query += ` AND r.lecturer_name = $${paramCount}`;
        params.push(userResult.rows[0].name);
      }
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    console.log('Executing query with params:', params);
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM reports r WHERE 1=1`;
    const countParams = [];
    let countParamCount = 0;

    if (search && search.trim() !== '') {
      countParamCount++;
      countQuery += ` AND (
        r.class_name ILIKE $${countParamCount} OR 
        r.course_name ILIKE $${countParamCount} OR 
        r.lecturer_name ILIKE $${countParamCount} OR
        r.faculty_name ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search.trim()}%`);
    }

    if (faculty && faculty.trim() !== '') {
      countParamCount++;
      countQuery += ` AND r.faculty_name = $${countParamCount}`;
      countParams.push(faculty.trim());
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    console.log(`✅ Successfully loaded ${result.rows.length} reports out of ${totalCount} total`);
    
    res.json({
      success: true,
      reports: result.rows,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      totalReports: totalCount
    });
    
  } catch (error) {
    console.error('❌ Get reports error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load reports',
      details: error.message
    });
  }
});

// Submit Report
app.post('/api/reports', authenticateToken, [
  body('facultyName').notEmpty(),
  body('className').notEmpty(),
  body('courseName').notEmpty(),
  body('lecturerName').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      facultyName, className, weekReporting, dateLecture,
      courseName, courseCode, lecturerName, studentsPresent,
      totalStudents, venue, lectureTime, topicTaught,
      learningOutcomes, recommendations
    } = req.body;

    const result = await pool.query(
      `INSERT INTO reports (
        faculty_name, class_name, week_reporting, date_lecture,
        course_name, course_code, lecturer_name, students_present,
        total_students, venue, lecture_time, topic_taught,
        learning_outcomes, recommendations, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        facultyName, className, weekReporting, dateLecture,
        courseName, courseCode, lecturerName, studentsPresent,
        totalStudents, venue, lectureTime, topicTaught,
        learningOutcomes, recommendations, req.user.id
      ]
    );

    res.status(201).json({ 
      message: 'Report submitted successfully', 
      report: result.rows[0] 
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Report
app.get('/api/reports/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        r.*, 
        u.name as sender_name,
        u.role as sender_role,
        u.email as sender_email
      FROM reports r 
      LEFT JOIN users u ON r.created_by = u.id 
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Get single report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== FEEDBACK ROUTES ====================

// Add Feedback to Report
app.post('/api/reports/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedbackText, rating } = req.body;

    if (req.user.role !== 'principal_lecturer') {
      return res.status(403).json({ error: 'Only principal lecturers can add feedback' });
    }

    // Check if report exists
    const reportExists = await pool.query('SELECT id FROM reports WHERE id = $1', [id]);
    if (reportExists.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const result = await pool.query(
      'INSERT INTO feedback (report_id, principal_lecturer_id, feedback_text, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, req.user.id, feedbackText, rating]
    );

    res.status(201).json({ 
      message: 'Feedback added successfully', 
      feedback: result.rows[0] 
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Feedback for Report
app.get('/api/reports/:id/feedback', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT f.*, u.name as principal_lecturer_name
      FROM feedback f
      LEFT JOIN users u ON f.principal_lecturer_id = u.id
      WHERE f.report_id = $1
      ORDER BY f.created_at DESC
    `, [id]);

    res.json({
      success: true,
      feedback: result.rows
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get Dashboard Statistics
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const totalReports = await pool.query('SELECT COUNT(*) FROM reports');
    const totalStudents = await pool.query('SELECT SUM(students_present) as total_present FROM reports');
    const totalCourses = await pool.query('SELECT COUNT(DISTINCT course_code) FROM reports');
    const recentReports = await pool.query(`
      SELECT r.*, u.name as created_by_name 
      FROM reports r 
      LEFT JOIN users u ON r.created_by = u.id 
      ORDER BY r.created_at DESC LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalReports: parseInt(totalReports.rows[0].count),
        totalStudentsPresent: parseInt(totalStudents.rows[0].total_present || 0),
        totalCourses: parseInt(totalCourses.rows[0].count || 0),
        recentReports: recentReports.rows
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user-specific dashboard data
app.get('/api/dashboard/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = '';
    let params = [];

    // Role-based data filtering
    if (userRole === 'lecturer') {
      const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0) {
        query = `
          SELECT r.* FROM reports r 
          WHERE r.lecturer_name = $1
          ORDER BY r.created_at DESC LIMIT 5
        `;
        params = [userResult.rows[0].name];
      }
    } else if (userRole === 'principal_lecturer') {
      const userResult = await pool.query('SELECT faculty FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0 && userResult.rows[0].faculty) {
        query = `
          SELECT r.* FROM reports r 
          WHERE r.faculty_name = $1
          ORDER BY r.created_at DESC LIMIT 5
        `;
        params = [userResult.rows[0].faculty];
      }
    } else {
      query = 'SELECT r.* FROM reports r ORDER BY r.created_at DESC LIMIT 5';
    }

    const reportsResult = await query ? await pool.query(query, params) : { rows: [] };
    
    // Get statistics based on role
    let stats = {};
    if (userRole === 'program_leader') {
      const lecturersCount = await pool.query('SELECT COUNT(*) FROM users WHERE role IN ($1, $2)', ['lecturer', 'principal_lecturer']);
      const coursesCount = await pool.query('SELECT COUNT(DISTINCT course_code) FROM reports');
      const facultiesCount = await pool.query('SELECT COUNT(DISTINCT faculty_name) FROM reports');
      
      stats = {
        totalLecturers: parseInt(lecturersCount.rows[0].count),
        totalCourses: parseInt(coursesCount.rows[0].count),
        totalFaculties: parseInt(facultiesCount.rows[0].count)
      };
    }

    res.json({
      success: true,
      recentReports: reportsResult.rows,
      stats: stats
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== RATING ENDPOINTS ====================

// Submit Rating
app.post('/api/ratings', authenticateToken, [
  body('targetType').isIn(['lecturer', 'course', 'class', 'student', 'facility']),
  body('targetName').notEmpty(),
  body('ratingScore').isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { targetType, targetId, targetName, ratingScore, comments } = req.body;

    const result = await pool.query(
      `INSERT INTO ratings (target_type, target_id, target_name, rating_score, comments, rated_by, rater_role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [targetType, targetId || targetName, targetName, ratingScore, comments, req.user.id, req.user.role]
    );

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Rating submission error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get Ratings with filtering
app.get('/api/ratings', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetName, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.name as rater_name 
      FROM ratings r 
      LEFT JOIN users u ON r.rated_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.user.role === 'student') {
      paramCount++;
      query += ` AND r.rated_by = $${paramCount}`;
      params.push(req.user.id);
    }

    if (targetType) {
      paramCount++;
      query += ` AND r.target_type = $${paramCount}`;
      params.push(targetType);
    }

    if (targetName) {
      paramCount++;
      query += ` AND r.target_name ILIKE $${paramCount}`;
      params.push(`%${targetName}%`);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM ratings WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (req.user.role === 'student') {
      countParamCount++;
      countQuery += ` AND rated_by = $${countParamCount}`;
      countParams.push(req.user.id);
    }

    if (targetType) {
      countParamCount++;
      countQuery += ` AND target_type = $${countParamCount}`;
      countParams.push(targetType);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      ratings: result.rows,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      currentPage: parseInt(page),
      totalRatings: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Get Rating Statistics
app.get('/api/ratings/stats', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        target_type,
        COUNT(*) as total_ratings,
        AVG(rating_score) as average_rating,
        MIN(rating_score) as min_rating,
        MAX(rating_score) as max_rating,
        COUNT(CASE WHEN rating_score = 5 THEN 1 END) as five_stars,
        COUNT(CASE WHEN rating_score >= 4 THEN 1 END) as positive_ratings
      FROM ratings 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.user.role === 'student') {
      paramCount++;
      query += ` AND rated_by = $${paramCount}`;
      params.push(req.user.id);
    }

    query += ` GROUP BY target_type ORDER BY total_ratings DESC`;

    const statsResult = await pool.query(query, params);

    // Get recent ratings
    let recentQuery = `
      SELECT r.*, u.name as rater_name 
      FROM ratings r 
      LEFT JOIN users u ON r.rated_by = u.id 
      WHERE 1=1
    `;
    const recentParams = [];
    let recentParamCount = 0;

    if (req.user.role === 'student') {
      recentParamCount++;
      recentQuery += ` AND r.rated_by = $${recentParamCount}`;
      recentParams.push(req.user.id);
    }

    recentQuery += ` ORDER BY r.created_at DESC LIMIT 5`;
    const recentResult = await pool.query(recentQuery, recentParams);

    // Calculate overall stats
    const overallStats = {
      totalRatings: statsResult.rows.reduce((sum, stat) => sum + parseInt(stat.total_ratings), 0),
      averageRating: statsResult.rows.length > 0 ? 
        statsResult.rows.reduce((sum, stat) => sum + parseFloat(stat.average_rating), 0) / statsResult.rows.length : 0
    };

    res.json({
      success: true,
      statistics: statsResult.rows,
      recentRatings: recentResult.rows,
      overallStats: overallStats
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// ==================== EXPORT ROUTES ====================

// Export Reports to Excel// Enhanced Export Reports to Excel with Better Error Handling
app.get('/api/reports/export', authenticateToken, async (req, res) => {
  try {
    console.log('Export request received from user:', req.user.id);
    
    const result = await pool.query(`
      SELECT 
        r.*, 
        u.name as sender_name, 
        u.role as sender_role,
        u.email as sender_email
      FROM reports r 
      LEFT JOIN users u ON r.created_by = u.id 
      ORDER BY r.created_at DESC
    `);

    console.log(`Found ${result.rows.length} reports for export`);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No reports found to export' 
      });
    }

    const reports = result.rows.map(report => ({
      'Report ID': report.id,
      'Faculty': report.faculty_name,
      'Class': report.class_name,
      'Week': report.week_reporting,
      'Date': report.date_lecture,
      'Course Name': report.course_name,
      'Course Code': report.course_code,
      'Lecturer': report.lecturer_name,
      'Students Present': report.students_present,
      'Total Students': report.total_students,
      'Attendance Rate': report.total_students > 0 ? 
        ((report.students_present / report.total_students) * 100).toFixed(1) + '%' : '0%',
      'Venue': report.venue,
      'Lecture Time': report.lecture_time,
      'Topic Taught': report.topic_taught,
      'Learning Outcomes': report.learning_outcomes,
      'Recommendations': report.recommendations || 'None',
      'Submitted By': report.sender_name,
      'Submitter Role': report.sender_role,
      'Submitter Email': report.sender_email,
      'Submitted At': new Date(report.created_at).toLocaleString()
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(reports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    // Set column widths for better readability
    const colWidths = [
      { wch: 10 }, // Report ID
      { wch: 20 }, // Faculty
      { wch: 15 }, // Class
      { wch: 10 }, // Week
      { wch: 12 }, // Date
      { wch: 25 }, // Course Name
      { wch: 15 }, // Course Code
      { wch: 20 }, // Lecturer
      { wch: 15 }, // Students Present
      { wch: 15 }, // Total Students
      { wch: 15 }, // Attendance Rate
      { wch: 15 }, // Venue
      { wch: 15 }, // Lecture Time
      { wch: 30 }, // Topic Taught
      { wch: 30 }, // Learning Outcomes
      { wch: 30 }, // Recommendations
      { wch: 20 }, // Submitted By
      { wch: 15 }, // Submitter Role
      { wch: 25 }, // Submitter Email
      { wch: 20 }  // Submitted At
    ];
    worksheet['!cols'] = colWidths;

    // Generate buffer
    const buffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    // Set headers
    const filename = `reports_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log(`Export successful: ${result.rows.length} reports exported`);
    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate export file',
      details: error.message
    });
  }
});

// Test export endpoint
app.get('/api/reports/export-test', authenticateToken, async (req, res) => {
  try {
    console.log('Export test endpoint called');
    
    // Create simple test data
    const testData = [
      {
        'Test Column 1': 'Test Data 1',
        'Test Column 2': 'Test Data 2',
        'Test Column 3': 'Test Data 3'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(testData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="test_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('Export test error:', error);
    res.status(500).json({ error: 'Test export failed: ' + error.message });
  }
});
// ==================== STATISTICS ROUTES ====================

// Get Comprehensive Report Statistics
app.get('/api/reports/stats', authenticateToken, async (req, res) => {
  try {
    // Total reports count
    const totalReports = await pool.query('SELECT COUNT(*) FROM reports');
    
    // Total students across all reports
    const totalStudents = await pool.query('SELECT SUM(students_present) as total_present, SUM(total_students) as total_registered FROM reports');
    
    // Average attendance
    const averageAttendance = await pool.query(`
      SELECT AVG(students_present::float / total_students * 100) as avg_attendance 
      FROM reports 
      WHERE total_students > 0
    `);
    
    // Reports by faculty
    const reportsByFaculty = await pool.query(`
      SELECT faculty_name, COUNT(*) as count 
      FROM reports 
      GROUP BY faculty_name 
      ORDER BY count DESC
    `);
    
    // Reports by lecturer
    const reportsByLecturer = await pool.query(`
      SELECT lecturer_name, COUNT(*) as count 
      FROM reports 
      GROUP BY lecturer_name 
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        totalReports: parseInt(totalReports.rows[0].count),
        totalStudents: {
          present: parseInt(totalStudents.rows[0].total_present || 0),
          registered: parseInt(totalStudents.rows[0].total_registered || 0)
        },
        averageAttendance: parseFloat(averageAttendance.rows[0].avg_attendance || 0).toFixed(1),
        reportsByFaculty: reportsByFaculty.rows,
        reportsByLecturer: reportsByLecturer.rows
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SERVER STARTUP ====================

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'luct_reporting'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Available endpoints:`);
    console.log(`   http://localhost:${PORT}/api/health`);
    console.log(`   http://localhost:${PORT}/api/test-simple`);
    console.log(`   http://localhost:${PORT}/api/test-auth`);
    console.log(`   http://localhost:${PORT}/api/reports`);
    console.log(`   http://localhost:${PORT}/api/dashboard/stats`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});