import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ReportForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    facultyName: '',
    className: '',
    weekReporting: '',
    dateLecture: '',
    courseName: '',
    courseCode: '',
    lecturerName: '',
    studentsPresent: '',
    totalStudents: '50',
    venue: '',
    lectureTime: '',
    topicTaught: '',
    learningOutcomes: '',
    recommendations: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form data
      if (!user) {
        throw new Error('You must be logged in to submit a report');
      }

      if (parseInt(formData.studentsPresent) > parseInt(formData.totalStudents)) {
        throw new Error('Students present cannot be greater than total registered students');
      }

      // Prepare data for API
      const reportData = {
        facultyName: formData.facultyName,
        className: formData.className,
        weekReporting: formData.weekReporting,
        dateLecture: formData.dateLecture,
        courseName: formData.courseName,
        courseCode: formData.courseCode,
        lecturerName: formData.lecturerName,
        studentsPresent: parseInt(formData.studentsPresent),
        totalStudents: parseInt(formData.totalStudents),
        venue: formData.venue,
        lectureTime: formData.lectureTime,
        topicTaught: formData.topicTaught,
        learningOutcomes: formData.learningOutcomes,
        recommendations: formData.recommendations || null
      };

      console.log('Submitting report:', reportData);

      // Submit to backend
      const result = await api.submitReport(reportData);
      
      console.log('Report submission response:', result);
      
      setSuccess('Report submitted successfully!');
      
      // Reset form
      setFormData({
        facultyName: '',
        className: '',
        weekReporting: '',
        dateLecture: '',
        courseName: '',
        courseCode: '',
        lecturerName: '',
        studentsPresent: '',
        totalStudents: '50',
        venue: '',
        lectureTime: '',
        topicTaught: '',
        learningOutcomes: '',
        recommendations: ''
      });

      // Redirect to reports list after 2 seconds
      setTimeout(() => {
        window.location.href = '/reports';
      }, 2000);

    } catch (error) {
      console.error('Error submitting report:', error);
      setError(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill lecturer name with current user's name if available
  React.useEffect(() => {
    if (user && user.name && !formData.lecturerName) {
      setFormData(prev => ({
        ...prev,
        lecturerName: user.name
      }));
    }
  }, [user, formData.lecturerName]);

  // Format week input to display properly
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  // Set default values on component mount
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      dateLecture: today,
      weekReporting: getCurrentWeek()
    }));
  }, []);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="report-form-container">
            <h2 className="text-center mb-4">Lecturer Reporting Form</h2>
            
            {/* Success Message */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                <strong>Success!</strong> {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error:</strong> {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {/* User Info */}
            {user && (
              <div className="alert alert-info">
                <strong>Logged in as:</strong> {user.name} ({user.role})
                {user.faculty && ` - ${user.faculty}`}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="facultyName" className="form-label">Faculty Name *</label>
                  <select 
                    className="form-select" 
                    id="facultyName"
                    name="facultyName"
                    value={formData.facultyName}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Faculty</option>
                    <option value="FICT">FICT</option>
                    <option value="Business">Faculty of Business</option>
                    <option value="Communication">Faculty of Communication</option>
                    <option value="Tourism">Faculty of Tourism</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="className" className="form-label">Class Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="className" 
                    name="className"
                    placeholder=""
                    value={formData.className}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="weekReporting" className="form-label">Week of Reporting *</label>
                  <input 
                    type="week" 
                    className="form-control" 
                    id="weekReporting"
                    name="weekReporting"
                    value={formData.weekReporting}
                    onChange={handleChange}
                    required
                  />
                  
                </div>
                <div className="col-md-6">
                  <label htmlFor="dateLecture" className="form-label">Date of Lecture *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="dateLecture"
                    name="dateLecture"
                    value={formData.dateLecture}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="courseName" className="form-label">Course Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="courseName"
                    name="courseName"
                    placeholder=""
                    value={formData.courseName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="courseCode" className="form-label">Course Code *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="courseCode"
                    name="courseCode"
                    placeholder=""
                    value={formData.courseCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="lecturerName" className="form-label">Lecturer's Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="lecturerName"
                    name="lecturerName"
                    placeholder=""
                    value={formData.lecturerName}
                    onChange={handleChange}
                    required
                  />
                  
                </div>
                <div className="col-md-6">
                  <label htmlFor="studentsPresent" className="form-label">Actual Number of Students Present *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="studentsPresent"
                    name="studentsPresent"
                    min="0"
                    max={formData.totalStudents}
                    placeholder=""
                    value={formData.studentsPresent}
                    onChange={handleChange}
                    required
                  />
                  
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="totalStudents" className="form-label">Total Number of Registered Students *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    id="totalStudents"
                    name="totalStudents"
                    min="0" 
                    placeholder=""
                    value={formData.totalStudents}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="venue" className="form-label">Venue of the Class *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="venue"
                    name="venue"
                    placeholder=""
                    value={formData.venue}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="lectureTime" className="form-label">Scheduled Lecture Time *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="lectureTime"
                  name="lectureTime"
                  placeholder=""
                  value={formData.lectureTime}
                  onChange={handleChange}
                  required
                />
                
              </div>
              
              <div className="mb-3">
                <label htmlFor="topicTaught" className="form-label">Topic Taught *</label>
                <textarea 
                  className="form-control" 
                  id="topicTaught"
                  name="topicTaught"
                  rows="3" 
                  placeholder=""
                  value={formData.topicTaught}
                  onChange={handleChange}
                  required
                ></textarea>
              
              </div>
              
              <div className="mb-3">
                <label htmlFor="learningOutcomes" className="form-label">Learning Outcomes of the Topic *</label>
                <textarea 
                  className="form-control" 
                  id="learningOutcomes"
                  name="learningOutcomes"
                  rows="3" 
                  placeholder=""
                  value={formData.learningOutcomes}
                  onChange={handleChange}
                  required
                ></textarea>
               
              </div>
              
              <div className="mb-4">
                <label htmlFor="recommendations" className="form-label">Lecturer's Recommendations</label>
                <textarea 
                  className="form-control" 
                  id="recommendations"
                  name="recommendations"
                  rows="3" 
                  placeholder=""
                  value={formData.recommendations}
                  onChange={handleChange}
                ></textarea>
               
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting Report...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.href = '/reports'}
                >
                  View All Reports
                </button>
              </div>
            </form>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;