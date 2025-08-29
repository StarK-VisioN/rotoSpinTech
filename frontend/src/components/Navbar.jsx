import React, { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assests.js";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.position?.toLowerCase() || "";

  // Determine role-based Home path
  const homePath = role ? `/${role}/home` : "/home";

  // Active check for Home link
  const isHomeActive = location.pathname === homePath;

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      {/* Logo */}
      <Link to="/">
        {assets.logo && <img src={assets.logo} className="w-36" alt="logo_img" />}
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <li
          onClick={() => navigate(homePath)}
          className={`${isHomeActive ? "text-blue-600 font-semibold" : "text-gray-700"} cursor-pointer`}
        >
          Home
        </li>

        <NavLink
          to="/production"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-700"
          }
        >
          Production
        </NavLink>

        <NavLink
          to="/material"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-700"
          }
        >
          Material
        </NavLink>

        <NavLink
          to="/stockin"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-700"
          }
        >
          Stock In
        </NavLink>

        <NavLink
          to="/stockout"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-700"
          }
        >
          Stock Out
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) =>
            isActive ? "text-blue-600 font-semibold" : "text-gray-700"
          }
        >
          Report
        </NavLink>
      </ul>

      {/* Right Icons */}
      <div className="flex items-center gap-6">
        <div className="group relative">
          {assets.profile_icon && (
            <img
              src={assets.profile_icon}
              alt="profile_img"
              className="w-5 cursor-pointer"
            />
          )}

          <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
            <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
              <p className="cursor-pointer hover:text-black">My Profile</p>
              <p
                className="cursor-pointer hover:text-black"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {assets.menu_icon && (
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            alt="menu_icon"
            className="w-5 cursor-pointer sm:hidden"
          />
        )}
      </div>

      {/* Sidebar for Mobile */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            className="flex items-center gap-4 p-3 cursor-pointer"
            onClick={() => setVisible(false)}
          >
            {assets.dropdown_icon && (
              <img
                src={assets.dropdown_icon}
                alt="dropdown_icon"
                className="h-4 rotate-180"
              />
            )}
            <p>Back</p>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              navigate(homePath); // Navigate to role-based Home
            }}
            className={`py-2 pl-6 border border-gray-200 ${
              isHomeActive ? "text-blue-600 font-semibold" : "text-gray-700"
            } text-left`}
          >
            Home
          </button>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/production"
          >
            Production
          </NavLink>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/material"
          >
            Material
          </NavLink>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/stockin"
          >
            Stock In
          </NavLink>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/stockout"
          >
            Stock Out
          </NavLink>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/report"
          >
            Report
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
