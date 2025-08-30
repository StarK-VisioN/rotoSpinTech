import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {assets} from '../assets/assests.js'
const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.position?.toLowerCase() || "";

  // Define role-based menu items
  const menuItems = {
    admin: [
      { label: "Home", path: "/admin/home" },
      { label: "Entry Product", path: "/admin/entry-product" },
      { label: "Entry Raw Stock", path: "/admin/entry-raw-stock" },
      { label: "Add New Worker", path: "/admin/add-worker" },
      { label: "Active Production Order", path: "/admin/active-production" },
      { label: "Product Management", path: "/admin/product-management" },
      { label: "Dispatch", path: "/admin/dispatch" },
      { label: "Defective", path: "/admin/defective" },
      { label: "Task Management", path: "/admin/task-management" },
      { label: "Report Generate", path: "/admin/report" },
      { label: "Prediction", path: "/admin/prediction" },
    ],
    manager: [
      { label: "Home", path: "/manager/home" },
      { label: "Request Stock", path: "/manager/request-stock" },
      { label: "Report Generate", path: "/manager/report" },
      { label: "Dispatch", path: "/manager/dispatch" },
      { label: "Defective", path: "/manager/defective" },
      { label: "Re-Entry Raw Stock", path: "/manager/reentry-raw-stock" },
      { label: "Prediction", path: "/manager/prediction" },
      { label: "Active Production Order", path: "/manager/active-production" },
    ],
    worker: [
      { label: "Home", path: "/worker/home" },
      { label: "Entry Raw Stock", path: "/worker/entry-raw-stock" },
      { label: "Dispatch", path: "/worker/dispatch" },
      { label: "Defective", path: "/worker/defective" },
      { label: "Completion Status", path: "/worker/completion-status" },
      { label: "Raw Material Request", path: "/worker/raw-material-request" },
    ],
  };

  const currentMenu = menuItems[role] || [];

  // Check if a menu item is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      {/* Logo */}
      <Link to="/">
        {assets.logo && <img src={assets.logo} className="w-36" alt="logo_img" />}
      </Link>

      <Link to='/'> <img src='' className="w-36" alt="logo_img" /> </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Home
        </NavLink>

        <NavLink
          to="/production"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
        Production
        </NavLink>

        <NavLink
          to="/material"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
          >
          Material
        </NavLink>

        <NavLink
          to="/stockin"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Stock In
        </NavLink>

        <NavLink
          to="/stockout"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Stock Out
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Report
        </NavLink>
      </ul>

      {/* Right Icons */}
      <div className="flex items-center gap-6">
        {/* Profile */}
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

        {/* Hamburger Menu */}
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

          {currentMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setVisible(false);
                navigate(item.path);
              }}
              className={`py-2 pl-6 border border-gray-200 text-left ${
                isActive(item.path) ? "text-blue-600 font-semibold" : "text-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
