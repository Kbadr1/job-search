import { useState } from "react";
import { NavLink } from "react-router-dom";
import MenuIcon from "../assets/icons/menu-icon.svg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    {
      name: "home",
      path: "/jobs",
    },
    {
      name: "search",
      path: "/jobs/search",
    },
    {
      name: "history",
      path: "/history",
    },
  ];

  return (
    <nav className="navbar container">
      <h1>JobsNow</h1>
      <ul className="desktop-menu">
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              end={true}
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <button className="menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        <img src={MenuIcon} alt="menu" />
      </button>
      <ul className={`mobile-menu ${isOpen ? "visible" : "hidden"}`}>
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              end={true}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
