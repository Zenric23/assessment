import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { IoIosArrowUp } from "react-icons/io";
import { UserContext } from "../context/userContext";


const Sidebar = () => {
  const {user} = useContext(UserContext)
  
  return (
    <div className="sidebar shadow border-end">
      {
        !user.isAdmin &&  (
          <NavLink
            to="/"
            className={({ isActive }) =>
              `py-2 d-block ${isActive ? "text-primary" : "text-black"}`
            }
          >
            Home
          </NavLink>
        )
      }
      {
        user.isAdmin && (
          <NavLink
            to="/"
            className={({ isActive }) =>
              `py-2 d-block ${isActive ? "text-primary" : "text-black"}`
            }
          >
            Dashboard
          </NavLink>
        )
      }
      {
        user.isAdmin && (
          <NavLink
            to="/user"
            className={({ isActive }) =>
              `py-2 d-block ${isActive ? "text-primary" : "text-black"}`
            }
          >
            User
          </NavLink>
        )
      }
      {
        user.isAdmin && (
          <NavLink
            to="/survey"
            className={({ isActive }) =>
              `py-2 d-block ${isActive ? "text-primary" : "text-black"}`
            }
          >
            Survey
          </NavLink>
        )
      }
      {
        user.isAdmin && (
          <NavLink
            to="/survey-report"
            className={({ isActive }) =>
              `py-2 d-block ${isActive ? "text-primary" : "text-black"}`
            }
          >
            Survey Report
          </NavLink>
        )
      }
    </div>
  );
};

export default Sidebar;
