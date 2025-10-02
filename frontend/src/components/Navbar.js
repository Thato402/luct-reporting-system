import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, canAccess } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
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

  const getRoleIcon = (role) => {
    const icons = {
      student: 'fa-user-graduate',
      lecturer: 'fa-chalkboard-teacher',
      principal_lecturer: 'fa-user-tie',
      program_leader: 'fa-user-cog'
    };
    return icons[role] || 'fa-user';
  };

  // If user is not logged in, show simple navbar
  if (!user) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
        <div className="container">
          <Link className="navbar-brand navbar-brand-custom" to="/">
            <i className="fas fa-graduation-cap me-2"></i>LUCT Reporting System
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/login">
              <i className="fas fa-sign-in-alt me-1"></i>Login
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark navbar-custom">
        <div className="container">
          <Link className="navbar-brand navbar-brand-custom" to="/dashboard">
            <i className="fas fa-graduation-cap me-2"></i>LUCT Reporting System
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                  to="/dashboard"
                >
                  <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                </Link>
              </li>

              {/* Reports - Only for Lecturers and above (NOT Students) */}
              {user.role !== 'student' && (
                <>
                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`} 
                      to="/reports"
                    >
                      <i className="fas fa-file-alt me-1"></i>Reports
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link 
                      className={`nav-link ${location.pathname === '/report-form' ? 'active' : ''}`} 
                      to="/report-form"
                    >
                      <i className="fas fa-plus-circle me-1"></i>New Report
                    </Link>
                  </li>
                </>
              )}

              {/* Classes - Not for students */}
              {user.role !== 'student' && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/classes' ? 'active' : ''}`} 
                    to="/classes"
                  >
                    <i className="fas fa-users me-1"></i>Classes
                  </Link>
                </li>
              )}

              {/* Courses - For Principal Lecturers and Program Leaders */}
              {(user.role === 'principal_lecturer' || user.role === 'program_leader') && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/courses' ? 'active' : ''}`} 
                    to="/courses"
                  >
                    <i className="fas fa-book me-1"></i>Courses
                  </Link>
                </li>
              )}

              {/* Lecturers - Program Leaders only */}
              {user.role === 'program_leader' && (
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/lecturers' ? 'active' : ''}`} 
                    to="/lecturers"
                  >
                    <i className="fas fa-chalkboard-teacher me-1"></i>Lecturers
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/monitoring' ? 'active' : ''}`} 
                  to="/monitoring"
                >
                  <i className="fas fa-chart-line me-1"></i>Monitoring
                </Link>
              </li>

              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/rating' ? 'active' : ''}`} 
                  to="/rating"
                >
                  <i className="fas fa-star me-1"></i>Rating
                </Link>
              </li>
            </ul>

            {/* Visible User Info and Logout */}
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                  <div className="d-flex align-items-center">
                    <i className={`fas ${getRoleIcon(user.role)} me-2`}></i>
                    <div className="text-end">
                      <div className="small">{user.name}</div>
                      <div className="small text-light opacity-75">{getRoleDisplayName(user.role)}</div>
                    </div>
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text">
                      <small>Signed in as</small><br/>
                      <strong>{user.name}</strong>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger fw-bold"
                      onClick={handleLogoutClick}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
              
              {/* Standalone Logout Button - Always Visible */}
              <div className="nav-item ms-2">
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogoutClick}
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt me-1"></i>
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Confirm Logout
                </h5>
                <button type="button" className="btn-close" onClick={cancelLogout}></button>
              </div>
              <div className="modal-body text-center py-4">
                <i className="fas fa-door-open fa-3x text-warning mb-3"></i>
                <h5>Ready to leave?</h5>
                <p className="text-muted mb-0">Are you sure you want to logout from the system?</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={cancelLogout}
                >
                  <i className="fas fa-times me-2"></i>Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;