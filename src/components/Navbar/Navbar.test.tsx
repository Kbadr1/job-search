import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import "@testing-library/jest-dom";

jest.mock("../../assets/icons/menu-icon.svg", () => "mocked-menu-icon.svg");

jest.mock("../../constants", () => {
  const mockNavLinks = [
    { path: "/home", name: "Home" },
    { path: "/jobs", name: "Jobs" },
    { path: "/about", name: "About" },
  ];
  return { navLinks: mockNavLinks };
});

describe("Navbar Component", () => {
  it("should render the JobsNow logo", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText("JobsNow")).toBeInTheDocument();
  });

  it("should render all navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const mockNavLinks = [
      { path: "/home", name: "Home" },
      { path: "/jobs", name: "Jobs" },
      { path: "/about", name: "About" },
    ];

    mockNavLinks.forEach((link) => {
      expect(screen.getByText(link.name)).toBeInTheDocument();
    });
  });

  it("should toggle the menu when the menu button is clicked", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const menuButton = screen.getByRole("button");
    const navList = screen.getByRole("list");

    expect(navList).not.toHaveClass("open");

    fireEvent.click(menuButton);
    expect(navList).toHaveClass("open");

    fireEvent.click(menuButton);
    expect(navList).not.toHaveClass("open");
  });

  it("should close the menu when a link is clicked", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const menuButton = screen.getByRole("button");
    const navList = screen.getByRole("list");
    const firstNavLink = screen.getByText("Home");

    fireEvent.click(menuButton);
    expect(navList).toHaveClass("open");

    fireEvent.click(firstNavLink);
    expect(navList).not.toHaveClass("open");
  });

  it('should apply the "active" class to the active NavLink', () => {
    render(
      <MemoryRouter initialEntries={["/jobs"]}>
        <Navbar />
      </MemoryRouter>
    );

    const activeLink = screen.getByText("Jobs");
    expect(activeLink).toHaveClass("active");
  });
});
