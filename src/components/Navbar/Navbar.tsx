import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import MenuIcon from "../../assets/icons/menu-icon.svg";
import { navLinks } from "../../constants";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="navbar container">
      <Link to={"/"} className="logo">
        JobsNow
      </Link>
      <ul className={isMenuOpen ? "open" : ""}>
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              end={true}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <button className="menu-toggle" onClick={toggleMenu}>
        <img src={MenuIcon} alt="menu" />
      </button>
    </nav>
  );
};

export default Navbar;
