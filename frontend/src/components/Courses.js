import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const { user, canAccess } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const simulatedCourses = getCoursesBasedOnRole(user.role);
      setCourses(simulatedCourses);
      setLoading(false);
    }, 1000);
  }, [user.role]);

  const getCoursesBasedOnRole = (role) => {
    const baseCourses = [
      {
        id: 1,
        code: 'BIWA2110',
        name: 'Web Application Development',
        credits: 3,
        lecturer: 'Dr. Liteboho Molaoa',
        students: 45,
        department: 'ICT',
        status: 'Active'
      },
      {
        id: 2,
        code: 'BIOP210',
        name: 'Object Oriented Programming One',
        credits: 4,
        lecturer: 'Dr. Kapela Morutwa ',
        students: 38,
        department: 'ICT',
        status: 'Active'
      },
      {
        id: 3,
        code: 'BIDC210',
        name: 'Data communication and Networking',
        credits: 3,
        lecturer: 'Dr. Mabafokeng Mokete',
        students: 42,
        department: 'ICT',
        status: 'Active'
      }
    ];

    if (role === 'program_leader') {
      return [
        ...baseCourses,
        {
          id: 4,
          code: 'BBCO2110',
          name: 'Concept of organization',
          credits: 4,
          lecturer: 'Dr. Noko',
          students: 35,
          department: 'Business',
          status: 'Active'
        },
        {
          id: 5,
          code: 'BBDM2108',
        name: 'Digital Marketing',
        credits: 4,
        lecturer: 'Prof. Frank Modise ',
        students: 38,
        department: 'Business',
        status: 'Active'
        },
        {
          id: 6,
          code: 'BBFA2110',
        name: 'Financial Accounting',
        credits: 4,
        lecturer: 'Prof. Amelia Phatsisi ',
        students: 38,
        department: 'Business',
        status: 'Active'
        }
      ];
    }

    return baseCourses;
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-book me-2"></i>
          Courses Management
        </h1>
        
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body text-center">
              <h3>{courses.length}</h3>
              <p>Total Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body text-center">
              <h3>{courses.reduce((sum, course) => sum + course.students, 0)}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body text-center">
              <h3>{new Set(courses.map(course => course.lecturer)).size}</h3>
              <p>Lecturers Involved</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body text-center">
              <h3>{courses.reduce((sum, course) => sum + course.credits, 0)}</h3>
              <p>Total Credits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Course List</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Lecturer</th>
                  <th>Students</th>
                  <th>Department</th>
                  <th>Status</th>
                  
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.code}</strong>
                    </td>
                    <td>{course.name}</td>
                    <td>{course.credits}</td>
                    <td>{course.lecturer}</td>
                    <td>
                      <span className="badge bg-primary rounded-pill">
                        {course.students} students
                      </span>
                    </td>
                    <td>{course.department}</td>
                    <td>
                      <span className={`badge ${course.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {course.status}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {courses.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-book fa-3x text-muted mb-3"></i>
          <h4>No Courses Found</h4>
          <p className="text-muted">There are no courses available in the system.</p>
          {canAccess('courses', 'create') && (
            <button className="btn btn-luct mt-2">
              <i className="fas fa-plus me-2"></i>Add First Course
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;