import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <img src="logo" alt="" className="mb-5 w-32" />
          <p className="w-full sm:w-2/3 text-gray-600">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Labore
            dignissimos, deserunt neque doloribus molestiae natus ratione
            laborum itaque ipsum ab aperiam, animi sunt, tenetur id iste
            obcaecati magnam deleniti inventore.
          </p>
        </div>

        <div>
          <p className="text-font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-black"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/production"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-black"
                }
              >
                Production
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/material"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-black"
                }
              >
                Material
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/stockin"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-black"
                }
              >
                Stock In
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/stockout"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-black"
                }
              >
                Stock Out
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/report"
                className={({ isActive }) =>
                  isActive ? "text-blue-600 font-semibold" : "hover:text-black"
                }
              >
                Report
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91-65274485489</li>
            <li>rotoSpinTech@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2025 rotoSpinTech.com - All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
