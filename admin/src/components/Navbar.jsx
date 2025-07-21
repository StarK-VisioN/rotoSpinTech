import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  

  return (
    <div className="flex items-center justify-between py-2 px-[4%] relative">
      {/* Logo and title */}
      <Link to='/'> <img src={assets.logo} className="w-25 rounded-xl" alt="logo_img" /> <span className='text-md font-bold'><p>Admin Panel.</p></span></Link>

      <ul className="hidden sm:flex gap-8 text-sm text-gray-700">
        <NavLink
          to="/"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Over All
        </NavLink>

        <NavLink
          to="/entryform"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Entry Product Form
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          New Orders
        </NavLink>

        {/* <NavLink
          to="/add"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Add Stock
        </NavLink> */}

        <NavLink
          to="/raw"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          View Stock
        </NavLink>

        <NavLink
          to="/addworker"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Add New Worker
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Generate Report
        </NavLink>

        <NavLink
          to="/prediction"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Predict Now
        </NavLink>
      </ul>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="bg-gray-600 text-white px-5 py-2 rounded-full text-xs sm:text-sm">
          Logout
        </button>
        {/* Hamburger icon for mobile */}
        <img
          src={assets.menu_icon}
          alt="menu_icon"
          onClick={() => setVisible(true)}
          className="w-5 cursor-pointer sm:hidden"
        />
      </div>

      {/* Sidebar menu for mobile */}
      <div
        className={`fixed top-0 right-0 bottom-0 overflow-hidden bg-white transition-all duration-300 z-50 ${visible ? 'w-full' : 'w-0'}`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            className="flex items-center gap-4 p-3 cursor-pointer"
            onClick={() => setVisible(false)}
          >
            <img
              src={assets.dropdown_icon}
              alt="dropdown_icon"
              className="h-4 rotate-180"
            />
            <p>Back</p>
          </div>

          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/overall"
          >
            Over All
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/entryform"
          >
            Entry Product Form
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/orders"
          >
            New Orders
          </NavLink>
          {/* <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/add"
          >
            Add Stock
          </NavLink> */}
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/raw"
          >
            View Stock
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/addworker"
          >
            Add New Worker
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/report"
          >
            Generate Report
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border border-gray-200"
            to="/report"
          >
            Predict Now
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
