import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ReportsList from './components/ReportsList';
import ReportForm from './components/ReportForm';
import Classes from './components/Classes';
import Courses from './components/Courses';
import Lecturers from './components/Lecturers';
import Monitoring from './components/Monitoring';
import Rating from './components/Rating';
import './App.css';

// Simple Protected Route component
const SimpleProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Protected Route for Program Leader only
const ProgramLeaderRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'program_leader' ? children : <Navigate to="/dashboard" />;
};

// Protected Route for Program Leader and Principal Lecturer
const HigherLevelRoute = ({ children }) => {
  const { user } = useAuth();
  return user && (user.role === 'program_leader' || user.role === 'principal_lecturer') ? children : <Navigate to="/dashboard" />;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      
      {/* Main content wrapper that grows and pushes footer to bottom */}
      <div className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Hero />} 
          />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={<SimpleProtectedRoute><Dashboard /></SimpleProtectedRoute>} />
          
          {/* Reports - Protected but accessible to lecturers and above */}
          <Route path="/reports" element={
            <SimpleProtectedRoute>
              {user && user.role !== 'student' ? (
                <ReportsList />
              ) : (
                <div className="container my-5">
                  <div className="alert alert-danger text-center">
                    <h4>Access Denied</h4>
                    <p>Students cannot access reports management.</p>
                  </div>
                </div>
              )}
            </SimpleProtectedRoute>
          } />
          
          <Route path="/report-form" element={
            <SimpleProtectedRoute>
              {user && user.role !== 'student' ? (
                <ReportForm />
              ) : (
                <div className="container my-5">
                  <div className="alert alert-danger text-center">
                    <h4>Access Denied</h4>
                    <p>Students cannot submit reports.</p>
                  </div>
                </div>
              )}
            </SimpleProtectedRoute>
          } />

          
          
          {/* Classes - Not for students */}
          <Route path="/classes" element={
            <SimpleProtectedRoute>
              {user && user.role !== 'student' ? (
                <Classes />
              ) : (
                <div className="container my-5">
                  <div className="alert alert-danger text-center">
                    <h4>Access Denied</h4>
                    <p>Students cannot access classes management.</p>
                  </div>
                </div>
              )}
            </SimpleProtectedRoute>
          } />
          
          {/* Courses - For Program Leaders AND Principal Lecturers */}
          <Route path="/courses" element={
            <HigherLevelRoute>
              <Courses />
            </HigherLevelRoute>
          } />
          
          {/* Lecturers - ONLY for Program Leaders */}
          <Route path="/lecturers" element={<ProgramLeaderRoute><Lecturers /></ProgramLeaderRoute>} />
          
          <Route path="/monitoring" element={<SimpleProtectedRoute><Monitoring /></SimpleProtectedRoute>} />
          <Route path="/rating" element={<SimpleProtectedRoute><Rating /></SimpleProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;