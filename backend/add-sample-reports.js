const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'luct_reporting',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

async function addSampleReports() {
  try {
    console.log('📝 Adding sample reports to database...');

    // Get the first user ID to use as created_by
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    const userId = userResult.rows[0].id;

    // Sample reports data
    const sampleReports = [
      
      {
        faculty_name: 'FICT',
        class_name: 'Bsc BIT Year2',
        week_reporting: 'Week 6',
        date_lecture: '2025-09-12',
        course_name: 'Data Communication & Networking',
        course_code: 'BIDC2110',
        lecturer_name: 'Prof. Mabafokeng Mokete',
        students_present: 45,
        total_students: 50,
        venue: 'Hall 6',
        lecture_time: '10:30-12:30',
        topic_taught: 'Access Control',
        learning_outcomes: 'Students bearly understood the topic',
        recommendations: 'Provide additional practice problems for homework'
      },
      {
        faculty_name: 'FICT',
        class_name: 'Bsc BIT Year2',
        week_reporting: 'Week 6',
        date_lecture: '2025-08-18',
        course_name: 'Web Application Development',
        course_code: 'BIWA2110',
        lecturer_name: 'Prof. Liteboho Molaoa',
        students_present: 28,
        total_students: 50,
        venue: 'MM2',
        lecture_time: '10:30-12:30',
        topic_taught: 'React',
        learning_outcomes: 'Students created their first React-app',
        recommendations: 'students should practice creating react-app'
      },
      {
        faculty_name: 'FICT',
        class_name: 'Bsc BIT Year2',
        week_reporting: 'Week 8',
        date_lecture: '2025-09-23',
        course_name: 'Object Oriented Programming 1',
        course_code: 'BIOP2110',
        lecturer_name: 'Prof. Kapela Morutwa',
        students_present: 35,
        total_students: 40,
        venue: 'MM5',
        lecture_time: '08:30-10:30',
        topic_taught: 'Inheritance',
        learning_outcomes: 'Students can create mother classes and mother classes',
        recommendations: 'Some students need extra help with class creation'
      }
    ];

    // Insert each sample report
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
      console.log(`✅ Added report: ${report.course_name} - ${report.class_name}`);
    }

    console.log('🎉 Successfully added all sample reports!');
    
    // Verify the reports were added
    const countResult = await pool.query('SELECT COUNT(*) FROM reports');
    console.log(`📊 Total reports in database: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error adding sample reports:', error);
  } finally {
    await pool.end();
  }
}

addSampleReports();