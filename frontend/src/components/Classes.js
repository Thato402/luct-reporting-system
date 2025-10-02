import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
  const { user, canAccess } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const simulatedClasses = getClassesBasedOnRole(user.role);
      setClasses(simulatedClasses);
      setLoading(false);
    }, 1000);
  }, [user.role]);

  const getClassesBasedOnRole = (role) => {
    const baseClasses = [
      
      {
        id: 2,
        name: 'BIOP2110 - Object Oriented Programming 1',
        courseCode: 'BIOP2110',
        lecturer: 'Dr. Kapela Morutwa',
        students: 38,
        schedule: 'Wed, 08:30-10:30',
        venue: 'MM5',
        status: 'Active'
      },
      {
        id: 3,
        name: 'BBDM2108 - Digital Marketing',
        courseCode: 'BBDM2108',
        lecturer: 'Prof. Frank Molise',
        students: 45,
        schedule: 'Thur, 08:30-10:30',
        venue: 'Hall 5',
        status: 'Active'
      },
      {
        id: 4,
        name: 'BIDC2110 - Data Communication & Networking',
        courseCode: 'BIDC2110',
        lecturer: 'Prof. Mabafokeng Mokete',
        students: 38,
        schedule: 'Tue, 10:30 - 12:30',
        venue: 'Hall 6',
        status: 'Active'
      },
      {
        id: 5,
        name: 'BBFA2110 - Financial Accounting',
        courseCode: 'BBFA2110',
        lecturer: 'Prof. Amelia Phatsisi',
        students: 45,
        schedule: 'Fri, 10:30 - 12:30',
        venue: 'Hall 5',
        status: 'Active'
      },
      {
        id: 6,
        name: 'BBCO2110 - Concept of Organisation',
        courseCode: 'BBCO2110',
        lecturer: 'Prof. Noko',
        students: 38,
        schedule: 'Mon, 10:30 - 12:30',
        venue: 'Room 6',
        status: 'Active'
      }
    ];

    if (role === 'program_leader') {
      return [
        ...baseClasses,
        {
          id: 1,
        name: 'BIWA2110 - Web Application Development',
        courseCode: 'BIWA2110',
        lecturer: 'Dr. Liteboho Molaoa',
        students: 45,
        schedule: 'Thur, 10:30-12:30',
        venue: 'MM2',
        status: 'Active'
        }
        
        
        
      ];
    }

    return baseClasses;
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-users me-2"></i>
          Classes Management
        </h1>
        
      </div>

      {/* Statistics Cards for Lecturers and above */}
      {(user.role === 'lecturer' || user.role === 'principal_lecturer' || user.role === 'program_leader') && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-white bg-primary">
              <div className="card-body text-center">
                <h3>{classes.length}</h3>
                <p>Total Classes</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-success">
              <div className="card-body text-center">
                <h3>{classes.reduce((sum, cls) => sum + cls.students, 0)}</h3>
                <p>Total Students</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-info">
              <div className="card-body text-center">
                <h3>{new Set(classes.map(cls => cls.lecturer)).size}</h3>
                <p>Lecturers</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-white bg-warning">
              <div className="card-body text-center">
                <h3>{classes.filter(cls => cls.status === 'Active').length}</h3>
                <p>Active Classes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {classes.map(cls => (
          <div key={cls.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card card-custom h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">{cls.name}</h5>
                <small className="text-muted">Code: {cls.courseCode}</small>
              </div>
              <div className="card-body">
                <p className="card-text">
                  <i className="fas fa-chalkboard-teacher me-2 text-primary"></i>
                  <strong>Lecturer:</strong> {cls.lecturer}
                </p>
                <p className="card-text">
                  <i className="fas fa-users me-2 text-success"></i>
                  <strong>Students:</strong> {cls.students}
                </p>
                <p className="card-text">
                  <i className="fas fa-clock me-2 text-info"></i>
                  <strong>Schedule:</strong> {cls.schedule}
                </p>
                <p className="card-text">
                  <i className="fas fa-map-marker-alt me-2 text-warning"></i>
                  <strong>Venue:</strong> {cls.venue}
                </p>
                <p className="card-text">
                  <span className={`badge ${cls.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                    {cls.status}
                  </span>
                </p>
              </div>
              <div className="card-footer">
                {user.role === 'lecturer' ? (
                  <div className="btn-group w-100">
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="fas fa-eye me-1"></i>View
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      <i className="fas fa-edit me-1"></i>Edit
                    </button>
                  </div>
                ) : user.role === 'principal_lecturer' ? (
                  <div className="btn-group w-100">
                    <button className="btn btn-outline-primary btn-sm">
                      View
                    </button>
                    <button className="btn btn-outline-info btn-sm">
                      Assign
                    </button>
                    <button className="btn btn-outline-warning btn-sm">
                      Monitor
                    </button>
                  </div>
                ) : user.role === 'program_leader' ? (
                  <div className="btn-group w-100">
                    <button className="btn btn-outline-primary btn-sm">
                      View
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      Edit
                    </button>
                    <button className="btn btn-outline-info btn-sm">
                      Assign
                    </button>
                    <button className="btn btn-outline-warning btn-sm">
                      Oversee
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {classes.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h4>No Classes Found</h4>
          <p className="text-muted">There are no classes available at the moment.</p>
          {canAccess('classes', 'create') && (
            <button className="btn btn-luct mt-2">
              <i className="fas fa-plus me-2"></i>Create First Class
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Classes;