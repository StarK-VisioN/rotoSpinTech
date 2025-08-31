import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.position)) {
    // Redirect to the user's home if not allowed
    return <Navigate to={`/${user.position.toLowerCase()}/home`} replace />;
  }

  return children;
};

export default ProtectedRoute;
