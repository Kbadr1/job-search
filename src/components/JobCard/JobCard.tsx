import { FC } from "react";
import { Link } from "react-router-dom";
import { TJob, TSkill } from "../../types";
import "./jobCard.css";

interface TJobCardProps {
  job: TJob;
  skills: TSkill[];
}

const JobCard: FC<TJobCardProps> = ({ job, skills }) => {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>Related Skills:</p>
      <div className="tags">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <Link to={`/skill/${skill.id}`} key={skill.id}>
              {skill.name}
            </Link>
          ))
        ) : (
          <p>No skills available</p>
        )}
      </div>
      <Link to={`/job/${job.id}`} state={job} className="view-details">
        View Job Details
      </Link>
    </div>
  );
};

export default JobCard;
