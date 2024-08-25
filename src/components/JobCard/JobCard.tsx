import { FC } from "react";
import { Link } from "react-router-dom";
import { TJob, TSkill } from "../../types";
import "./jobCard.css";

interface TJobCard {
  job: TJob;
  skills: TSkill[];
}

const JobCard: FC<TJobCard> = ({ job, skills }) => {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>Related Skills:</p>
      <div className="tags">
        {skills.map((skill) => (
          <Link to={``} key={skill.id}>
            {skill.name}
          </Link>
        ))}
      </div>
      <Link to={``} state={job} className="view-details">
        View Job Details
      </Link>
    </div>
  );
};

export default JobCard;
