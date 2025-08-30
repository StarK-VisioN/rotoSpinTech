import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {assets} from '../assets/assests.js'
import logo from "../assets/logo.jpg";
const Navbar = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center justify-between py-5 font-medium">

      <Link to='/'> <img src={logo} className="w-36 rounded-2xl" alt="logo_img" /> </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink
          to="/admin/home"
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
          to="/RawMaterial"
          className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "text-gray-700"}
        >
          Raw Material
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

      <div className="flex items-center gap-6">

        <div className="group relative">
          
            <img src={assets.profile_icon} alt="profile_img" className="w-5 cursor-pointer" />
          
          {/* As we hover this icon then dropdown will open only when user is logged in */}
          {
     
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <p className="cursor-pointer hover:text-black">My Profile</p>
                <p className="cursor-pointer hover:text-black">Logout</p>
              </div>
            </div>
          }
        </div>

        
        <img onClick={()=> setVisible(true)} src={assets.menu_icon} alt="menu_icon"  className="w-5 cursor-pointer sm:hidden"/>
      </div> 


      {/* sidebar menu for small screen */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className="flex flex-col text-gray-600">
          <div className="flex items-center gap-4 p-3 cursor-pointer" onClick={() => setVisible(false)}>
            <img src={assets.dropdown_icon} alt="dropdown_icon" className="h-4 rotate-180"/>
            <p>Back</p>
          </div>

          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 ' to='/'>Home</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 ' to='/production'>Production</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 ' to='/material'>Material</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 ' to='/stockin'>Stock In</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 ' to='/stockout'>Stock Out</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border border-gray-200 ' to='/report'>Report</NavLink>
        </div>
      </div>

    </div>
  );
};

export default Navbar;
