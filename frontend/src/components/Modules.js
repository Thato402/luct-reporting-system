import React from 'react';
import { Link } from 'react-router-dom';

const Modules = () => {
  const modules = [
    {
      title: "Student",
      icon: "fas fa-user-graduate",
      features: ["Login / Register", "Monitoring", "Rating"],
      link: "/student"
    },
    {
      title: "Lecturer",
      icon: "fas fa-chalkboard-teacher",
      features: ["Classes", "Reports", "Monitoring", "Rating"],
      link: "/lecturer"
    },
    {
      title: "Principal Lecturer",
      icon: "fas fa-user-tie",
      features: ["Courses", "Reports", "Monitoring", "Rating", "Classes"],
      link: "/principal-lecturer"
    },
    {
      title: "Program Leader",
      icon: "fas fa-user-cog",
      features: ["Courses", "Reports", "Monitoring", "Classes", "Lectures", "Rating"],
      link: "/program-leader"
    }
  ];

  return (
    <div className="container my-5">
      <h2 className="text-center mb-5">System Modules</h2>
      <div className="row g-4">
        {modules.map((module, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="card card-custom text-center p-4">
              <div className="module-icon">
                <i className={module.icon}></i>
              </div>
              <h3>{module.title}</h3>
              <ul className="list-unstyled">
                {module.features.map((feature, idx) => (
                  <li key={idx}>
                    <i className={`fas fa-${getFeatureIcon(feature)} me-2 text-${getFeatureColor(feature)}`}></i>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to={module.link} className="btn btn-luct mt-auto">
                Access Portal
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions for icons and colors
const getFeatureIcon = (feature) => {
  const icons = {
    "Login / Register": "sign-in-alt",
    "Monitoring": "chart-line",
    "Rating": "star",
    "Classes": "users",
    "Reports": "file-alt",
    "Courses": "book",
    "Lectures": "chalkboard-teacher"
  };
  return icons[feature] || "check";
};

const getFeatureColor = (feature) => {
  const colors = {
    "Login / Register": "success",
    "Monitoring": "success",
    "Rating": "warning",
    "Classes": "secondary",
    "Reports": "primary",
    "Courses": "info",
    "Lectures": "info"
  };
  return colors[feature] || "primary";
};

export default Modules;