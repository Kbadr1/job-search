import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import "./skillDetails.css";
import SideCard from "../../components/SideCard";
import { fetchSkillById } from "../../store/jobs/thunks/fetchSkillById";

const SkillDetails = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { skill, relatedJobs, relatedSkills, loading } = useSelector(
    (state: RootState) => {
      const skill = skillId ? state.jobs.entities.skills[skillId] : undefined;

      const relatedJobs = skill?.jobs
        ?.map((jobId) => state.jobs.entities.jobs[jobId])
        .filter((job) => job);

      const relatedSkills = skill?.skills
        ?.map((relatedSkillId) => state.jobs.entities.skills[relatedSkillId])
        .filter((relatedSkill) => relatedSkill);

      return {
        skill,
        relatedJobs: relatedJobs || [],
        relatedSkills: relatedSkills || [],
        loading: state.jobs.loading,
      };
    }
  );

  useEffect(() => {
    if (skillId) {
      dispatch(fetchSkillById(skillId));
    }
  }, [dispatch, skillId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!skill) {
    return <div>Skill not found.</div>;
  }

  return (
    <section className="container skill-details">
      <h1 className="page-title">{skill.name}</h1>

      <div className="grid-three-columns">
        <div className="related-jobs grid-column-span-2">
          <h2>Related Jobs:</h2>
          <ul className="job-card">
            {relatedJobs.length > 0 ? (
              relatedJobs.map((job) => (
                <li key={job.id}>
                  <Link to={`/job/${job.id}`}>{job.title}</Link>
                </li>
              ))
            ) : (
              <p>No related jobs found.</p>
            )}
          </ul>
        </div>

        <SideCard data={relatedSkills} path="skill" />
      </div>
    </section>
  );
};

export default SkillDetails;
