import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based restriction
  if (role && user.position.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to={`/${user.position.toLowerCase()}/home`} replace />;
  }

  return children;
};

export default ProtectedRoute;
