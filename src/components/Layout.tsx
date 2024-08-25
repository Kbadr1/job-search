import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import SearchBox from "./SearchBox/SearchBox";

const Layout = () => {
  return (
    <>
      <Navbar />
      <SearchBox />
      <Outlet />
    </>
  );
};

export default Layout;
