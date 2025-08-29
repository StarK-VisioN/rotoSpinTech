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

    // Validate inputs
    if (!validateWorkingId(workingId)) {
      setError("Enter a valid Working ID");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError(""); // clear previous errors

    try {
      // Call backend login API
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        workingId,
        password,
      });

      const { token, name, position } = res.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("position", position);

      // Navigate to Home page after successful login
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Try again!");
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-12">
        <img
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Logo"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          RotoSpinTech Pvt. Ltd
        </h2>
        <h2 className="mt-1 text-center text-md tracking-tight text-gray-900">
          House Of Custom Rotomolding
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="workingId" className="block text-sm font-medium text-gray-900">
              Working ID
            </label>
            <div className="mt-2">
              <input
                id="workingId"
                type="text"
                value={workingId}
                onChange={(e) => setWorkingId(e.target.value)}
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
