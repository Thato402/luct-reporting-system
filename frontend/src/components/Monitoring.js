import React from 'react';
import { useAuth } from '../context/AuthContext';

const Monitoring = () => {
  const { user } = useAuth();

  const getMonitoringData = () => {
    const baseData = {
      attendance: { present: 85, absent: 15, total: 100 },
      performance: { excellent: 40, good: 35, average: 20, poor: 5 },
      recentActivity: [
        { action: 'Report Submitted', by: 'Dr. Kapela Morutwa', time: '2 hours ago' },
        { action: 'Class Completed', by: 'Dr. Kapela Morutwa', time: '4 hours ago' },
        { action: 'Rating Added', by: 'Refiloe Monare', time: '6 hours ago' }
      ]
    };

    if (user.role === 'program_leader') {
      return {
        ...baseData,
        departmentStats: {
          lecturers: 15,
          courses: 25,
          students: 450,
          attendanceRate: 87
        }
      };
    }

    if (user.role === 'principal_lecturer') {
      return {
        ...baseData,
        facultyStats: {
          courses: 12,
          lecturers: 8,
          students: 280,
          completionRate: 92
        }
      };
    }

    return baseData;
  };

  const data = getMonitoringData();

  return (
    <div className="container my-5">
      <h1 className="mb-4">
        <i className="fas fa-chart-line me-2"></i>
        Monitoring Dashboard
      </h1>
      
      {/* Role-specific statistics */}
      {(user.role === 'program_leader' || user.role === 'principal_lecturer') && (
        <div className="row mb-4">
          {user.role === 'program_leader' && (
            <>
              <div className="col-md-3">
                <div className="card text-white bg-primary">
                  <div className="card-body text-center">
                    <h3>{data.departmentStats.lecturers}</h3>
                    <p>Department Lecturers</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-success">
                  <div className="card-body text-center">
                    <h3>{data.departmentStats.courses}</h3>
                    <p>Total Courses</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-info">
                  <div className="card-body text-center">
                    <h3>{data.departmentStats.students}</h3>
                    <p>Total Students</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-warning">
                  <div className="card-body text-center">
                    <h3>{data.departmentStats.attendanceRate}%</h3>
                    <p>Attendance Rate</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {user.role === 'principal_lecturer' && (
            <>
              <div className="col-md-3">
                <div className="card text-white bg-primary">
                  <div className="card-body text-center">
                    <h3>{data.facultyStats.courses}</h3>
                    <p>Faculty Courses</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-success">
                  <div className="card-body text-center">
                    <h3>{data.facultyStats.lecturers}</h3>
                    <p>Faculty Lecturers</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-info">
                  <div className="card-body text-center">
                    <h3>{data.facultyStats.students}</h3>
                    <p>Faculty Students</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-white bg-warning">
                  <div className="card-body text-center">
                    <h3>{data.facultyStats.completionRate}%</h3>
                    <p>Completion Rate</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Attendance Overview</h5>
            </div>
            <div className="card-body">
              <div className="progress mb-3" style={{ height: '30px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${data.attendance.present}%` }}
                >
                  Present: {data.attendance.present}%
                </div>
              </div>
              <p>Total Students: {data.attendance.total}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Performance Distribution</h5>
            </div>
            <div className="card-body">
              {Object.entries(data.performance).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-capitalize">{key}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="progress" style={{ height: '15px' }}>
                    <div 
                      className={`progress-bar bg-${getPerformanceColor(key)}`} 
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5>Recent Activity</h5>
        </div>
        <div className="card-body">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
              <div>
                <strong>{activity.action}</strong> by {activity.by}
              </div>
              <span className="text-muted">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getPerformanceColor = (level) => {
  const colors = {
    excellent: 'success',
    good: 'info',
    average: 'warning',
    poor: 'danger'
  };
  return colors[level] || 'secondary';
};

export default Monitoring;