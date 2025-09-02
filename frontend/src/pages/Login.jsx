import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { validateWorkingId, validatePassword } from "../../utils/helper";

const Login = () => {
  const [workingId, setWorkingId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateWorkingId(workingId)) {
      setError("Enter a valid Working ID");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        workingId,
        password,
      });

      const { token, name, position } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("name", name);
      localStorage.setItem("position", position);

      // Redirect based on role
      navigate(`/${position.toLowerCase()}/home`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Try again!");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          RotoSpinTech Pvt. Ltd
        </h2>
        <h2 className="mt-1 text-center text-md tracking-tight text-gray-900">
          House Of Custom Rotomolding
        </h2>
        <p className="mt-2 text-center text-xs text-blue-600 font-medium">
          Precision Manufacturing & Engineering Excellence
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="workingId" className="block text-sm font-medium text-gray-700">
                Working ID
              </label>
              <div className="mt-2">
                <input
                  id="workingId"
                  type="text"
                  value={workingId}
                  onChange={(e) => setWorkingId(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your working ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-red-800 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure access to manufacturing management system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;