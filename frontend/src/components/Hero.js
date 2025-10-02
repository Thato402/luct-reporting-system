import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="py-5" style={{ background: 'linear-gradient(to right, #2C3E50, #4CA1AF)', color: 'white' }}>
      <div className="container text-center py-5">
        <h1 className="display-4 fw-bold mb-4">LUCT Faculty Reporting System</h1>
       
        <Link to="/login" className="btn btn-light btn-lg px-4">
          Get Started <i className="fas fa-arrow-right ms-2"></i>
        </Link>
      </div>

      {/* Features Section - Generic without role specifics */}
      <div className="container py-5">
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="card bg-transparent text-white border-light h-100">
              <div className="card-body">
                <i className="fas fa-chart-line fa-3x mb-3 text-primary"></i>
                <h4>Academic Monitoring</h4>
                <p>Track academic progress and performance metrics across all departments and courses.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card bg-transparent text-white border-light h-100">
              <div className="card-body">
                <i className="fas fa-file-alt fa-3x mb-3 text-success"></i>
                <h4>Comprehensive Reporting</h4>
                <p>Generate detailed academic reports with real-time data and analytics.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card bg-transparent text-white border-light h-100">
              <div className="card-body">
                <i className="fas fa-star fa-3x mb-3 text-warning"></i>
                <h4>Quality Assessment</h4>
                <p>Evaluate and improve educational quality through systematic feedback and ratings.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;