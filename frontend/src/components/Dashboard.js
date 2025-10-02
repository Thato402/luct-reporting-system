import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const { user, canAccess } = useAuth();
  const [stats, setStats] = useState({});
  const [ratingStats, setRatingStats] = useState({ totalRatings: 0, averageRating: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardData, ratingStatsData] = await Promise.all([
        api.getDashboardStats(),
        api.getRatingStats().catch(() => ({ overallStats: { totalRatings: 0, averageRating: 0 } }))
      ]);
      
      setStats(dashboardData);
      setRatingStats(ratingStatsData.overallStats);
      setRecentActivity(getRecentActivityBasedOnRole(user.role));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivityBasedOnRole = (role) => {
    const baseActivity = [
      { action: 'Login', icon: 'fa-sign-in-alt', color: 'info', time: 'Today' }
    ];

    if (role === 'student') {
      return [
        ...baseActivity,
        { action: 'Course Rated', icon: 'fa-star', color: 'warning', time: '2 hours ago' },
        { action: 'Attendance Marked', icon: 'fa-check-circle', color: 'success', time: '4 hours ago' },
        { action: 'Assignment Submitted', icon: 'fa-file-upload', color: 'primary', time: '1 day ago' }
      ];
    } else {
      return [
        ...baseActivity,
        { action: 'Report Submitted', icon: 'fa-file-alt', color: 'success', time: '2 hours ago' },
        { action: 'Class Conducted', icon: 'fa-chalkboard', color: 'info', time: '4 hours ago' },
        { action: 'Student Rated', icon: 'fa-star', color: 'warning', time: '1 day ago' }
      ];
    }
  };

  // Role-specific quick actions - FIXED: Initialize roleSpecificActions properly
  const getQuickActions = () => {
    const baseActions = [
      { 
        label: 'Rate Experience', 
        path: '/rating', 
        icon: 'fa-star', 
        color: 'warning',
        requiredPermission: ['rating', 'submit']
      },
      { 
        label: 'View Monitoring', 
        path: '/monitoring', 
        icon: 'fa-chart-line', 
        color: 'info',
        requiredPermission: ['monitoring', 'view']
      }
    ];

    // Add report actions only for NON-STUDENTS
    if (user.role !== 'student') {
      baseActions.unshift(
        { 
          label: 'Submit Report', 
          path: '/report-form', 
          icon: 'fa-file-alt', 
          color: 'primary',
          requiredPermission: ['reports', 'create_own']
        },
        { 
          label: 'View Reports', 
          path: '/reports', 
          icon: 'fa-list', 
          color: 'success',
          requiredPermission: ['reports', 'view']
        }
      );
    }

    // Initialize roleSpecificActions as an empty array FIRST
    const roleSpecificActions = [];
    
    // THEN add items to it
    if (user.role !== 'student') {
      roleSpecificActions.push(
        { 
          label: 'Manage Classes', 
          path: '/classes', 
          icon: 'fa-users', 
          color: 'secondary',
          requiredPermission: ['classes', 'view']
        }
      );
    }

    // ONLY Program Leader and Principal Lecturer can view courses
    if (user.role === 'program_leader' || user.role === 'principal_lecturer') {
      roleSpecificActions.push(
        { 
          label: 'View Courses', 
          path: '/courses', 
          icon: 'fa-book', 
          color: 'dark',
          requiredPermission: ['courses', 'view_all']
        }
      );
    }

    // Combine and filter actions
    const allActions = [...baseActions, ...roleSpecificActions];
    return allActions.filter(action => 
      !action.requiredPermission || canAccess(...action.requiredPermission)
    );
  };

  // Role-specific statistics - Different for students
  const getRoleSpecificStats = () => {
    if (user.role === 'student') {
      return [
        { 
          title: 'My Courses', 
          value: 6, 
          color: 'primary', 
          icon: 'book',
          description: 'Courses enrolled'
        },
        { 
          title: 'Attendance Rate', 
          value: '85%', 
          color: 'success', 
          icon: 'chart-line',
          description: 'Overall attendance'
        },
        { 
          title: 'Assignments', 
          value: 3, 
          color: 'info', 
          icon: 'tasks',
          description: 'Pending submissions'
        },
        { 
          title: 'My Ratings', 
          value: ratingStats.totalRatings || 0, 
          color: 'warning', 
          icon: 'star',
          description: 'Ratings submitted'
        }
      ];
    }

    // For lecturers and above
    const baseStats = [
      { 
        title: 'My Reports', 
        value: stats.totalReports || 0, 
        color: 'primary', 
        icon: 'file-alt',
        description: 'Reports submitted'
      },
      { 
        title: 'Rating Average', 
        value: ratingStats.averageRating ? ratingStats.averageRating.toFixed(1) : '0.0', 
        color: 'warning', 
        icon: 'star',
        description: 'Average rating given'
      }
    ];

    if (user.role === 'program_leader') {
      return [
        ...baseStats,
        { 
          title: 'Department Lecturers', 
          value: 15, 
          color: 'info', 
          icon: 'chalkboard-teacher',
          description: 'Active lecturers'
        },
        { 
          title: 'Total Courses', 
          value: 25, 
          color: 'success', 
          icon: 'book',
          description: 'Courses offered'
        }
      ];
    }

    if (user.role === 'principal_lecturer') {
      return [
        ...baseStats,
        { 
          title: 'Courses Overseeing', 
          value: 8, 
          color: 'info', 
          icon: 'book',
          description: 'Courses managed'
        },
        { 
          title: 'Total Ratings', 
          value: ratingStats.totalRatings || 0, 
          color: 'info', 
          icon: 'star-half-alt',
          description: 'Ratings submitted'
        }
      ];
    }

    if (user.role === 'lecturer') {
      return [
        ...baseStats,
        { 
          title: 'My Courses', 
          value: 4, 
          color: 'info', 
          icon: 'book',
          description: 'Courses teaching'
        },
        { 
          title: 'Total Ratings', 
          value: ratingStats.totalRatings || 0, 
          color: 'info', 
          icon: 'star-half-alt',
          description: 'Ratings submitted'
        }
      ];
    }

    return baseStats;
  };

  // Helper functions
  const getRoleIcon = (role) => {
    const icons = {
      student: 'user-graduate',
      lecturer: 'chalkboard-teacher',
      principal_lecturer: 'user-tie',
      program_leader: 'user-cog'
    };
    return icons[role] || 'user';
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      student: 'Student',
      lecturer: 'Lecturer',
      principal_lecturer: 'Principal Lecturer',
      program_leader: 'Program Leader'
    };
    return roles[role] || role;
  };

  const getWelcomeMessage = (role) => {
    const messages = {
      student: '',
      lecturer: '',
      principal_lecturer: '',
      program_leader: ''
    };
    return messages[role] || 'Welcome to the LUCT Reporting System.';
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = getQuickActions();
  const roleStats = getRoleSpecificStats();

  return (
    <div className="container my-5">
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-gradient-primary text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="card-title">
                    <i className={`fas ${getRoleIcon(user.role)} me-3`}></i>
                    Welcome back, {user.name}!
                  </h2>
                  <p className="card-text">
                    {getWelcomeMessage(user.role)}
                  </p>
                </div>
                <div className="col-md-4 text-end">
                  <span className="badge bg-light text-dark fs-6 p-3">
                    <i className="fas fa-user-tag me-2"></i>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">Quick Actions</h4>
          <div className="row g-3">
            {quickActions.map((action, index) => (
              <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                <Link 
                  to={action.path} 
                  className={`card action-card text-decoration-none text-dark h-100 hover-lift`}
                  style={{transition: 'all 0.3s ease'}}
                >
                  <div className="card-body text-center">
                    <div className={`text-${action.color} mb-3`}>
                      <i className={`fas ${action.icon} fa-2x`}></i>
                    </div>
                    <h6 className="card-title">{action.label}</h6>
                    <small className="text-muted">Click to proceed</small>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">My Statistics</h4>
        </div>
        {roleStats.map((stat, index) => (
          <div key={index} className="col-xl-3 col-lg-6 mb-3">
            <div className={`card stat-card border-${stat.color} h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className={`text-${stat.color}`}>{stat.value}</h2>
                    <h6 className="card-title">{stat.title}</h6>
                    <small className="text-muted">{stat.description}</small>
                  </div>
                  <div className={`display-4 text-${stat.color} opacity-25`}>
                    <i className={`fas fa-${stat.icon}`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body">
              {recentActivity.map((activity, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <div className={`bg-${activity.color} rounded-circle p-3 me-3`}>
                    <i className={`fas ${activity.icon} text-white`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0">{activity.action}</h6>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;