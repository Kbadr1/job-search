import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobCard from "./JobCard"; // Adjust the path if needed
import "@testing-library/jest-dom";
import { TSkill } from "../../types";

const mockJob = {
  id: "1",
  title: "Frontend Developer",
  skills: [], // Include skills property as an empty array
};

const mockSkills: TSkill[] = [
  {
    id: "1",
    name: "React",
    type: "Frontend",
    importance: "High",
    level: "Expert",
    jobs: ["1", "2"],
  },
  {
    id: "2",
    name: "JavaScript",
    type: "Programming Language",
    importance: "High",
    level: "Expert",
    jobs: ["1", "3"],
  },
];

describe("JobCard Component", () => {
  it("should render the job title", () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} skills={mockSkills} />
      </MemoryRouter>
    );

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("should render related skills as links", () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} skills={mockSkills} />
      </MemoryRouter>
    );

    mockSkills.forEach((skill) => {
      const skillLink = screen.getByText(skill.name);
      expect(skillLink).toBeInTheDocument();
      expect(skillLink.closest("a")).toHaveAttribute(
        "href",
        `/skill/${skill.id}`
      );
    });
  });

  it('should display "No skills available" when skills array is empty', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} skills={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText("No skills available")).toBeInTheDocument();
  });

  it("should render a link to view job details", () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} skills={mockSkills} />
      </MemoryRouter>
    );

    const detailsLink = screen.getByText("View Job Details");
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink.closest("a")).toHaveAttribute(
      "href",
      `/job/${mockJob.id}`
    );
  });
});
