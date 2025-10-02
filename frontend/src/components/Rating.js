import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Rating = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ statistics: [], overallStats: {} });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [error, setError] = useState('');

  const [newRating, setNewRating] = useState({
    targetType: 'lecturer',
    targetId: '',
    targetName: '',
    ratingScore: 5,
    comments: ''
  });

  const getTargetOptions = () => {
    const baseOptions = {
      lecturer: [
        'Prof. Liteboho Molaoa',
        'Prof. Kapela Morutwa', 
        'Prof. Mabafokeng Mokete',
        'Prof. Noko',
        'Prof. Frank Modise',
        'Prof. Amelia Phatsisi',
        'Prof. Takalimane'
      ],
      course: [
        'Web Application Development (BIWA2110)',
        'Object Oriented Programming 1 (BIOP2110)',
        'Data Communication (BIDC2110)',
        'Concept of Organisation (BBCO2110)',
        'Digital Marketing (BBDM2108)',
        'Financial Accounting (BBFA2110)'
      ],
      class: [
        'Software Engineering',
        'IT',
        'Business IT',
        'Tourism'
      ],
      facility: [
        'Wings Cafe',
        'Libraries',
        'Lecture Halls',
        'Multimedia'
      ]
    };

    if (user && user.role !== 'student') {
      baseOptions.student = [
        'Tsele Motsoeneng',
        'Thabiso Makatane',
        'Refiloe Monare',
        'Thato Letsoela'
      ];
    }

    return baseOptions;
  };

  useEffect(() => {
    fetchRatingData();
  }, [activeTab]);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'history') {
        const ratingsData = await api.getRatings({ page: 1, limit: 20 });
        
        if (ratingsData.success) {
          setRatings(ratingsData.ratings || []);
        } else {
          throw new Error(ratingsData.error || 'Failed to load ratings');
        }

        // Try to load stats, but don't fail if it doesn't work
        try {
          const statsData = await api.getRatingStats();
          if (statsData.success) {
            setStats(statsData);
          }
        } catch (statsError) {
          console.warn('Could not load rating stats:', statsError);
          // Don't set error for stats failure
        }
      }
    } catch (error) {
      console.error('Error fetching rating data:', error);
      setError('Unable to load rating data. Please try again later.');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate form
    if (!newRating.targetName) {
      setError('Please select a target to rate.');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Submitting rating:', newRating);
      
      const result = await api.submitRating(newRating);
      
      if (result.success) {
        alert('Rating submitted successfully!');
        setNewRating({
          targetType: 'lecturer',
          targetId: '',
          targetName: '',
          ratingScore: 5,
          comments: ''
        });
        
        // Refresh data if we're on history tab
        if (activeTab === 'history') {
          fetchRatingData();
        }
      } else {
        throw new Error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTargetTypeChange = (type) => {
    setNewRating({
      ...newRating,
      targetType: type,
      targetName: '',
      targetId: ''
    });
  };

  // Test API connection
  const testRatingAPI = async () => {
    try {
      setError('');
      console.log('Testing rating API...');
      
      const result = await api.getRatings({ limit: 5 });
      console.log('Rating API test result:', result);
      
      if (result.success) {
        alert('Rating API is working! Check console for details.');
      } else {
        throw new Error(result.error || 'API returned error');
      }
    } catch (error) {
      console.error('Rating API test failed:', error);
      setError('Rating API connection failed: ' + error.message);
    }
  };

  const targetOptions = getTargetOptions();

  // Show loading only for history tab
  if (loading && activeTab === 'history') {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading rating data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="fas fa-star me-2"></i>
          Rating System
        </h1>
        <button 
          className="btn btn-outline-info btn-sm"
          onClick={testRatingAPI}
          title="Test API Connection"
        >
          <i className="fas fa-wifi me-1"></i>Test Connection
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Submit Rating
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history me-2"></i>
            Rating History
          </button>
        </li>
      </ul>

      {/* Submit Rating Tab */}
      {activeTab === 'submit' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Submit New Rating</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmitRating}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">What are you rating? *</label>
                  <select 
                    className="form-select"
                    value={newRating.targetType}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                    required
                  >
                    <option value="lecturer">Lecturer</option>
                    <option value="course">Course</option>
                    <option value="class">Class</option>
                    <option value="facility">Facility</option>
                    {user && user.role !== 'student' && <option value="student">Student</option>}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Select {newRating.targetType} *</label>
                  <select 
                    className="form-select"
                    value={newRating.targetName}
                    onChange={(e) => setNewRating({
                      ...newRating, 
                      targetName: e.target.value,
                      targetId: e.target.value // Use name as ID for simplicity
                    })}
                    required
                  >
                    <option value="">Choose a {newRating.targetType}</option>
                    {targetOptions[newRating.targetType]?.map((target, index) => (
                      <option key={index} value={target}>{target}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Rating Score *</label>
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="me-3 text-muted">Poor</span>
                    <div className="btn-group" role="group">
                      {[1, 2, 3, 4, 5].map(score => (
                        <button
                          key={score}
                          type="button"
                          className={`btn ${
                            newRating.ratingScore >= score 
                              ? 'btn-warning' 
                              : 'btn-outline-warning'
                          }`}
                          onClick={() => setNewRating({...newRating, ratingScore: score})}
                        >
                          <i className={`fas fa-star ${newRating.ratingScore >= score ? 'text-white' : ''}`}></i>
                          <span className="ms-1">{score}</span>
                        </button>
                      ))}
                    </div>
                    <span className="ms-3 text-muted">Excellent</span>
                  </div>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      Selected: {newRating.ratingScore} star{newRating.ratingScore !== 1 ? 's' : ''}
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label">Comments (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Share your feedback, experience, or suggestions..."
                  value={newRating.comments}
                  onChange={(e) => setNewRating({...newRating, comments: e.target.value})}
                />
                <small className="form-text text-muted">
                  Your feedback helps improve the learning experience
                </small>
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary me-md-2"
                  onClick={() => {
                    setNewRating({
                      targetType: 'lecturer',
                      targetId: '',
                      targetName: '',
                      ratingScore: 5,
                      comments: ''
                    });
                    setError('');
                  }}
                >
                  <i className="fas fa-undo me-2"></i>Reset Form
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg"
                  disabled={submitting || !newRating.targetName}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-star me-2"></i>
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Statistics Summary */}
          {stats.overallStats && stats.overallStats.totalRatings > 0 && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white text-center">
                  <div className="card-body">
                    <h3>{stats.overallStats.totalRatings}</h3>
                    <p className="mb-0">Total Ratings</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white text-center">
                  <div className="card-body">
                    <h3>{stats.overallStats.averageRating ? stats.overallStats.averageRating.toFixed(1) : '0.0'}</h3>
                    <p className="mb-0">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rating History */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Rating History</h5>
              <div>
                <span className="badge bg-primary me-2">{ratings.length} ratings</span>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={fetchRatingData}
                  disabled={loading}
                >
                  <i className="fas fa-refresh me-1"></i>Refresh
                </button>
              </div>
            </div>
            <div className="card-body">
              {ratings.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-star fa-3x text-muted mb-3"></i>
                  <h5>No Ratings Yet</h5>
                  <p className="text-muted">Submit your first rating to see it here!</p>
                  <button 
                    className="btn btn-warning"
                    onClick={() => setActiveTab('submit')}
                  >
                    <i className="fas fa-plus me-2"></i>Submit First Rating
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Target</th>
                        <th>Type</th>
                        <th>Rating</th>
                        <th>Comments</th>
                        <th>Date Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratings.map(rating => (
                        <tr key={rating.id}>
                          <td>
                            <strong>{rating.target_name}</strong>
                          </td>
                          <td>
                            <span className="badge bg-info text-capitalize">
                              {rating.target_type}
                            </span>
                          </td>
                          <td>
                            <div className="text-warning">
                              {Array.from({ length: 5 }, (_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star${i < rating.rating_score ? '' : '-half-alt'}`}
                                ></i>
                              ))}
                            </div>
                            <small className="text-muted">({rating.rating_score}/5)</small>
                          </td>
                          <td>
                            {rating.comments ? (
                              <span 
                                className="comment-preview"
                                title={rating.comments}
                              >
                                {rating.comments.length > 50 ? 
                                  rating.comments.substring(0, 50) + '...' : rating.comments
                                }
                              </span>
                            ) : (
                              <span className="text-muted fst-italic">No comments</span>
                            )}
                          </td>
                          <td>
                            <div>
                              {new Date(rating.created_at).toLocaleDateString()}
                              <br/>
                              <small className="text-muted">
                                {new Date(rating.created_at).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Rating;