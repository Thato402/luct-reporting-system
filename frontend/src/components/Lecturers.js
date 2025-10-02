import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Lecturers = () => {
  const { user, canAccess } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const simulatedLecturers = [
        {
          id: 1,
          name: 'Prof. Liteboho Molaoa',
          email: 'liteboho.molaoa@limkokwing.ac.ls',
          department: 'ICT',
          courses: 4,
          students: 120,
          status: 'Active',
          joinDate: '2017-01-15'
        },
        {
          id: 2,
          name: 'Prof. Mabafokeng Mokete',
          email: 'mabafokeng@limkokwing.ac.ls',
          department: 'ICT',
          courses: 3,
          students: 95,
          status: 'Active',
          joinDate: '2016-03-20'
        },
        {
          id: 3,
          name: 'Prof. Palesa Ntho',
          email: 'ntho@limkokwing.ac.ls',
          department: 'ICT',
          courses: 5,
          students: 150,
          status: 'Active',
          joinDate: '2012-08-10'
        },
        {
          id: 4,
          name: 'Prof. Kapela Morutwa',
          email: 'morutwa@limkokwing.ac.ls',
          department: 'ICT',
          courses: 5,
          students: 150,
          status: 'Active',
          joinDate: '2018-08-10'
        },
        {
          id: 4,
          name: 'Prof. Noko',
          email: 'noko@limkokwing.ac.ls',
          department: 'Business',
          courses: 5,
          students: 150,
          status: 'Active',
          joinDate: '2017-08-10'
        },
        {
          id: 5,
          name: 'Prof. Amelia Phatsisi',
          email: 'phatsisi@limkokwing.ac.ls',
          department: 'Business',
          courses: 5,
          students: 150,
          status: 'Active',
          joinDate: '2016-08-10'
        },
        {
          id: 6,
          name: 'Prof. Frank Molise',
          email: 'molise@limkokwing.ac.ls',
          department: 'Business',
          courses: 5,
          students: 150,
          status: 'Active',
          joinDate: '2015-08-10'
        }
      ];
      setLecturers(simulatedLecturers);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading lecturers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-chalkboard-teacher me-2"></i>
          Lecturers Management
        </h1>
       
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary">
            <div className="card-body text-center">
              <h3>{lecturers.length}</h3>
              <p>Total Lecturers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success">
            <div className="card-body text-center">
              <h3>{lecturers.filter(l => l.status === 'Active').length}</h3>
              <p>Active Lecturers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info">
            <div className="card-body text-center">
              <h3>{lecturers.reduce((sum, l) => sum + l.courses, 0)}</h3>
              <p>Total Courses</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning">
            <div className="card-body text-center">
              <h3>{lecturers.reduce((sum, l) => sum + l.students, 0)}</h3>
              <p>Total Students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Lecturers List</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Courses</th>
                  <th>Students</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  
                </tr>
              </thead>
              <tbody>
                {lecturers.map(lecturer => (
                  <tr key={lecturer.id}>
                    <td>
                      <strong>{lecturer.name}</strong>
                    </td>
                    <td>{lecturer.email}</td>
                    <td>{lecturer.department}</td>
                    <td>
                      <span className="badge bg-primary rounded-pill">
                        {lecturer.courses} courses
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success rounded-pill">
                        {lecturer.students} students
                      </span>
                    </td>
                    <td>{new Date(lecturer.joinDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${lecturer.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                        {lecturer.status}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lecturers;