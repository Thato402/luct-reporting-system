import React from 'react';

const TechnologyStack = () => {
  const technologies = [
    { name: "React", icon: "fab fa-react", color: "primary", description: "Frontend Library" },
    { name: "Bootstrap", icon: "fab fa-bootstrap", color: "purple", description: "CSS Framework" },
    { name: "Node.js", icon: "fab fa-node-js", color: "success", description: "Backend Runtime" },
    { name: "MySQL", icon: "fas fa-database", color: "info", description: "Database" }
  ];

  return (
    <div className="bg-light py-5">
      <div className="container">
        <h2 className="text-center mb-5">Technology Stack</h2>
        <div className="row text-center">
          {technologies.map((tech, index) => (
            <div key={index} className="col-md-3 mb-4">
              <i className={`${tech.icon} fa-3x text-${tech.color} mb-3`}></i>
              <h4>{tech.name}</h4>
              <p className="text-muted">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnologyStack;