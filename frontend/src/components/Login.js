import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    faculty: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
        setIsLogin(true); // Switch to login after successful registration
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">Role</label>
                      <select
                        className="form-select"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="principal_lecturer">Principal Lecturer</option>
                        <option value="program_leader">Program Leader</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="faculty" className="form-label">Faculty</label>
                      <input
                        type="text"
                        className="form-control"
                        id="faculty"
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-luct w-100"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
              </form>

              <div className="text-center mt-3">
                <button 
                  className="btn btn-link"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;