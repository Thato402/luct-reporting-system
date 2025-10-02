import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Create a separate React modal component
const ReportModal = ({ report, show, onClose }) => {
  if (!show || !report) return null;

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050
      }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Report Details - {report.course_name}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Course Information</h6>
                <p><strong>Course:</strong> {report.course_name} ({report.course_code})</p>
                <p><strong>Class:</strong> {report.class_name}</p>
                <p><strong>Faculty:</strong> {report.faculty_name}</p>
              </div>
              <div className="col-md-6">
                <h6>Lecture Details</h6>
                <p><strong>Date:</strong> {new Date(report.date_lecture).toLocaleDateString()}</p>
                <p><strong>Week:</strong> {report.week_reporting}</p>
                <p><strong>Time:</strong> {report.lecture_time}</p>
                <p><strong>Venue:</strong> {report.venue}</p>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-6">
                <h6>Attendance</h6>
                <p><strong>Students Present:</strong> {report.students_present} / {report.total_students}</p>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${report.total_students > 0 ? (report.students_present / report.total_students) * 100 : 0}%` 
                    }}
                  >
                    {report.total_students > 0 ? Math.round((report.students_present / report.total_students) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <h6>Submitted By</h6>
                <p><strong>Name:</strong> {report.sender_name || 'Unknown'}</p>
                <p><strong>Role:</strong> {(report.sender_role || 'unknown').replace(/_/g, ' ')}</p>
                <p><strong>Lecturer:</strong> {report.lecturer_name}</p>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <h6>Topic Taught</h6>
                <p className="bg-light p-3 rounded">{report.topic_taught || 'Not specified'}</p>
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12">
                <h6>Learning Outcomes</h6>
                <p className="bg-light p-3 rounded">{report.learning_outcomes || 'Not specified'}</p>
              </div>
            </div>
            {report.recommendations && (
              <div className="row mt-3">
                <div className="col-12">
                  <h6>Recommendations</h6>
                  <p className="bg-light p-3 rounded">{report.recommendations}</p>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    faculty: '',
    course: '',
    lecturer: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0
  });
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchReportStats();
    }
  }, [pagination.currentPage, searchTerm, filters, activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        search: searchTerm,
        faculty: filters.faculty,
        course: filters.course,
        lecturer: filters.lecturer,
        page: pagination.currentPage,
        limit: 10
      };

      console.log('Fetching reports with params:', params);
      
      // Use getReports instead of getEnhancedReports
      const data = await api.getReports(params);
      console.log('Reports API response:', data);
      
      if (data.success) {
        setReports(data.reports || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalReports: data.totalReports || 0
        });
      } else {
        throw new Error(data.error || 'Failed to load reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getReportStats();
      console.log('Stats API response:', data);
      
      // Handle both response formats
      if (data.success) {
        setStats(data.stats || {});
      } else if (data.totalReports !== undefined) {
        // Direct stats object
        setStats(data);
      } else {
        throw new Error(data.error || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Error fetching report stats:', error);
      setError(error.message);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      faculty: '',
      course: '',
      lecturer: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExport = async () => {
  try {
    setError('');
    
    // Show loading state
    const exportButton = document.querySelector('.btn-success');
    const originalText = exportButton.innerHTML;
    exportButton.innerHTML = '<i className="fas fa-spinner fa-spin me-2"></i>Exporting...';
    exportButton.disabled = true;

    console.log('Starting export...');
    
    const blob = await api.exportReports();
    console.log('Export blob received:', blob);
    
    if (!blob) {
      throw new Error('No file received from server');
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `reports_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('Export completed successfully');
    
    // Show success message
    alert('Reports exported successfully! The download should start automatically.');

  } catch (error) {
    console.error('Export error:', error);
    
    let errorMessage = error.message;
    
    // Provide more user-friendly error messages
    if (errorMessage.includes('500')) {
      errorMessage = 'Server error during export. Please try again later.';
    } else if (errorMessage.includes('401')) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (errorMessage.includes('404')) {
      errorMessage = 'No reports found to export.';
    } else if (errorMessage.includes('empty')) {
      errorMessage = 'No data available for export.';
    }
    
    setError(`Export failed: ${errorMessage}`);
    alert(`Export failed: ${errorMessage}`);
  } finally {
    // Restore button state
    const exportButton = document.querySelector('.btn-success');
    if (exportButton) {
      exportButton.innerHTML = '<i className="fas fa-download me-2"></i>Export to Excel';
      exportButton.disabled = false;
    }
  }
};

const testExport = async () => {
  try {
    console.log('Testing export functionality...');
    
    // Test 1: Check if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Test 2: Check if there are reports to export
    const reportsData = await api.getReports({ limit: 1 });
    if (!reportsData.reports || reportsData.reports.length === 0) {
      throw new Error('No reports available for export');
    }
    
    // Test 3: Try test export endpoint
    const testResponse = await fetch(`${API_BASE_URL}/reports/export-test`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (testResponse.ok) {
      console.log('Test export works!');
      alert('Test export works! The main export should also work now.');
    } else {
      throw new Error(`Test export failed: ${testResponse.status}`);
    }
    
  } catch (error) {
    console.error('Export test failed:', error);
    setError(`Export test failed: ${error.message}`);
  }
};

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const testConnection = async () => {
    try {
      const result = await api.testSimple();
      console.log('Test connection result:', result);
      alert('API connection is working! Check console for details.');
    } catch (error) {
      console.error('Test connection failed:', error);
      alert('API connection failed: ' + error.message);
    }
  };

  const refreshData = () => {
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchReportStats();
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  if (loading && activeTab === 'reports') {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-file-alt me-2"></i>
          Reports Management
        </h1>
        <div>
          <button className="btn btn-outline-info me-2" onClick={testConnection}>
            <i className="fas fa-wifi me-2"></i>Test Connection
          </button>
          <button className="btn btn-outline-primary me-2" onClick={refreshData}>
            <i className="fas fa-refresh me-2"></i>Refresh
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            <i className="fas fa-download me-2"></i>Export to Excel
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-list me-2"></i>
            All Reports ({pagination.totalReports})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <i className="fas fa-chart-bar me-2"></i>
            Statistics Overview
          </button>
        </li>
      </ul>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {/* Search and Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="search" className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    placeholder="Search by class, course, lecturer..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="faculty" className="form-label">Faculty</label>
                  <select
                    className="form-select"
                    id="faculty"
                    value={filters.faculty}
                    onChange={(e) => handleFilterChange('faculty', e.target.value)}
                  >
                    <option value="">All Faculties</option>
                    <option value="Computing and IT">Computing and IT</option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="course" className="form-label">Course Code</label>
                  <input
                    type="text"
                    className="form-control"
                    id="course"
                    placeholder="Course code"
                    value={filters.course}
                    onChange={(e) => handleFilterChange('course', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="lecturer" className="form-label">Lecturer</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lecturer"
                    placeholder="Lecturer name"
                    value={filters.lecturer}
                    onChange={(e) => handleFilterChange('lecturer', e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary w-100" 
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {reports.length > 0 ? (
                  <>Showing {reports.length} of {pagination.totalReports} reports</>
                ) : (
                  <>No reports found</>
                )}
              </h5>
              <button 
                className="btn btn-sm btn-outline-primary" 
                onClick={fetchReports}
                disabled={loading}
              >
                <i className="fas fa-refresh me-1"></i>
                Refresh
              </button>
            </div>
            <div className="card-body">
              {reports.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-file-excel fa-3x text-muted mb-3"></i>
                  <h5>No reports found</h5>
                  <p className="text-muted">
                    {searchTerm || filters.faculty || filters.course || filters.lecturer 
                      ? 'Try adjusting your search or filters' 
                      : 'There are no reports in the system yet'
                    }
                  </p>
                  <button className="btn btn-primary" onClick={clearFilters}>
                    Clear Search & Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Class</th>
                          <th>Lecturer</th>
                          <th>Date</th>
                          <th>Students</th>
                          <th>Venue</th>
                          <th>Submitted By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr key={report.id}>
                            <td>
                              <strong>{report.course_code}</strong>
                              <br />
                              <small className="text-muted">{report.course_name}</small>
                            </td>
                            <td>{report.class_name}</td>
                            <td>{report.lecturer_name}</td>
                            <td>
                              {new Date(report.date_lecture).toLocaleDateString()}
                              <br />
                              <small className="text-muted">Week: {report.week_reporting}</small>
                            </td>
                            <td>
                              <span className={
                                report.total_students > 0 && report.students_present / report.total_students > 0.7 
                                  ? 'text-success' 
                                  : 'text-warning'
                              }>
                                {report.students_present}/{report.total_students}
                              </span>
                              <br />
                              <small>
                                {report.total_students > 0 
                                  ? Math.round((report.students_present / report.total_students) * 100) + '%'
                                  : 'N/A'
                                }
                              </small>
                            </td>
                            <td>{report.venue}</td>
                            <td>
                              <div>
                                <strong>{report.sender_name || 'Unknown'}</strong>
                                <br />
                                <small className="text-capitalize text-muted">
                                  {(report.sender_role || 'unknown').replace(/_/g, ' ')}
                                </small>
                              </div>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleViewReport(report)}
                              >
                                <i className="fas fa-eye"></i> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <nav className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {[...Array(pagination.totalPages)].map((_, index) => (
                          <li key={index} className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="row">
          {loading ? (
            <div className="col-12 text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading statistics...</span>
              </div>
              <p>Loading statistics...</p>
            </div>
          ) : (
            <>
              {/* Overall Statistics Cards */}
              <div className="col-12 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-bar me-2"></i>
                      Overall Report Statistics
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-md-2 col-6 mb-3">
                        <div className="card bg-primary text-white">
                          <div className="card-body">
                            <h3>{stats.totalReports || 0}</h3>
                            <p>Total Reports</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 col-6 mb-3">
                        <div className="card bg-success text-white">
                          <div className="card-body">
                            <h3>{stats.totalStudents?.present || 0}</h3>
                            <p>Students Present</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 col-6 mb-3">
                        <div className="card bg-info text-white">
                          <div className="card-body">
                            <h3>{stats.averageAttendance || '0.0'}%</h3>
                            <p>Avg Attendance</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 col-6 mb-3">
                        <div className="card bg-warning text-white">
                          <div className="card-body">
                            <h3>{stats.facultyCount || 0}</h3>
                            <p>Faculties</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 col-6 mb-3">
                        <div className="card bg-secondary text-white">
                          <div className="card-body">
                            <h3>{stats.lecturerCount || 0}</h3>
                            <p>Lecturers</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-2 col-6 mb-3">
                        <div className="card bg-dark text-white">
                          <div className="card-body">
                            <h3>{stats.courseCount || 0}</h3>
                            <p>Courses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports by Faculty */}
              {stats.reportsByFaculty && stats.reportsByFaculty.length > 0 && (
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Reports by Faculty</h5>
                    </div>
                    <div className="card-body">
                      {stats.reportsByFaculty.map((faculty, index) => (
                        <div key={index} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{faculty.faculty_name}</span>
                            <span className="badge bg-primary">{faculty.count} reports</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${stats.totalReports ? (faculty.count / stats.totalReports) * 100 : 0}%`,
                                backgroundColor: getColorByIndex(index)
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reports by Lecturer */}
              {stats.reportsByLecturer && stats.reportsByLecturer.length > 0 && (
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Top Lecturers by Reports</h5>
                    </div>
                    <div className="card-body">
                      {stats.reportsByLecturer.slice(0, 10).map((lecturer, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                          <div>
                            <strong>{lecturer.lecturer_name}</strong>
                          </div>
                          <span className="badge bg-success">{lecturer.count} reports</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reports by Course */}
              {stats.reportsByCourse && stats.reportsByCourse.length > 0 && (
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Reports by Course</h5>
                    </div>
                    <div className="card-body">
                      {stats.reportsByCourse.slice(0, 10).map((course, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                          <div>
                            <strong>{course.course_code}</strong>
                            <br />
                            <small className="text-muted">{course.course_name}</small>
                          </div>
                          <span className="badge bg-info">{course.count} reports</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reports by Venue/Facility */}
              {stats.reportsByVenue && stats.reportsByVenue.length > 0 && (
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Reports by Venue/Facility</h5>
                    </div>
                    <div className="card-body">
                      {stats.reportsByVenue.slice(0, 10).map((venue, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                          <div>
                            <strong>{venue.venue}</strong>
                          </div>
                          <span className="badge bg-warning">{venue.count} reports</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reports by Sender Role */}
              {stats.reportsBySenderRole && stats.reportsBySenderRole.length > 0 && (
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Reports by Submitter Role</h5>
                    </div>
                    <div className="card-body">
                      {stats.reportsBySenderRole.map((role, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                          <div>
                            <strong className="text-capitalize">{role.role?.replace(/_/g, ' ')}</strong>
                          </div>
                          <span className="badge bg-secondary">{role.count} reports</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Courses by Attendance */}
              {stats.topCoursesByAttendance && stats.topCoursesByAttendance.length > 0 && (
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header">
                      <h5 className="mb-0">Top Courses by Attendance</h5>
                    </div>
                    <div className="card-body">
                      {stats.topCoursesByAttendance.slice(0, 10).map((course, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                          <div>
                            <strong>{course.course_code}</strong>
                            <br />
                            <small className="text-muted">
                              {parseFloat(course.attendance_rate || 0).toFixed(1)}% attendance
                            </small>
                          </div>
                          <span className="badge bg-success">{course.report_count} reports</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Reports */}
              {stats.recentReports && stats.recentReports.length > 0 && (
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Recent Reports</h5>
                    </div>
                    <div className="card-body">
                      {stats.recentReports.map((report, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                          <div>
                            <strong>{report.course_name}</strong> - {report.class_name}
                            <br />
                            <small className="text-muted">
                              By {report.sender_name} ({report.sender_role}) | {report.lecturer_name} | {report.students_present}/{report.total_students} students
                            </small>
                          </div>
                          <small className="text-muted">
                            {new Date(report.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!stats.totalReports && !loading && (
                <div className="col-12 text-center py-4">
                  <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                  <h5>No statistics available</h5>
                  <p className="text-muted">There are no reports to display statistics for.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      <ReportModal 
        report={selectedReport}
        show={showModal}
        onClose={closeModal}
      />
    </div>
  );
};

// Helper function for colors
const getColorByIndex = (index) => {
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997', '#fd7e14'];
  return colors[index % colors.length];
};

export default ReportsList;