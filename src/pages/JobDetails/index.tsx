import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import "./jobDetails.css";
import SideCard from "../../components/SideCard";
import { fetchJobById } from "../../store/jobs/thunks/fetchJobById";

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { job, skills, relatedJobs, loading } = useSelector(
    (state: RootState) => {
      const job = jobId ? state.jobs.entities.jobs[jobId] : undefined;

      const skills = job?.skills
        ?.map((skillId) => state.jobs.entities.skills[skillId])
        .filter((skill) => skill);

      const relatedJobs = skills
        ? skills
            .flatMap((skill) =>
              skill?.jobs
                .filter((relatedJobId) => relatedJobId !== jobId)
                .map((relatedJobId) => state.jobs.entities.jobs[relatedJobId])
            )
            .filter((relatedJob) => relatedJob)
        : [];

      return {
        job,
        skills: skills || [],
        relatedJobs: relatedJobs || [],
        loading: state.jobs.loading,
      };
    }
  );

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
    }
  }, [dispatch, jobId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!job) {
    return <div>Job not found.</div>;
  }

  return (
    <section className="container job-details">
      <h1 className="page-title">{job.title}</h1>

      <div className="layout-three-columns">
        <div className="skills col-span-2">
          <h2>Related Skills:</h2>
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div className="skill-card" key={skill.id}>
                <Link to={`/skill/${skill.id}`}>{skill?.name}</Link>
                <div className="attributes">
                  <p>
                    <span>Type:</span> {skill?.type}
                  </p>
                  <p>
                    <span> Importance: </span>
                    {skill?.importance}
                  </p>
                  <p>
                    <span>Level:</span> {skill?.level}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No skills found for this job.</p>
          )}
        </div>

        <SideCard data={relatedJobs} path="job" />
      </div>
    </section>
  );
};

export default JobDetails;
