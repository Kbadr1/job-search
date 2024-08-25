import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import JobCard from "../../components/JobCard/JobCard";
import { fetchJobs, setSearchQuery } from "../../store/jobsSlice";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { AppDispatch, RootState } from "../../store";
import { TJob } from "../../types";

const Jobs = () => {
  const {
    jobs: jobsById = {},
    loading,
    error,
    skills = {},
    next,
    cursor,
    count,
  } = useSelector((state: RootState) => state.jobs);

  const dispatch = useDispatch<AppDispatch>();
  const jobs = useMemo(() => Object.values(jobsById), [jobsById]);
  const loaderRef = useRef(null);

  useEffect(() => {
    dispatch(setSearchQuery(""));
    dispatch(fetchJobs());
  }, []);

  useInfiniteScroll({
    cursor,
    dispatch,
    loaderRef,
    loading,
    next,
  });

  return (
    <section className="container">
      <h2 className="page-title">All Jobs ({count})</h2>
      <div className="layout-two-columns">
        {loading && !jobs.length ? (
          <h4>Loading ...</h4>
        ) : error ? (
          <h4>Something Went Wrong</h4>
        ) : (
          jobs.map((job: TJob) => (
            <JobCard
              job={job}
              key={job.id}
              skills={job.skills.map((skillId) => skills[skillId])}
            />
          ))
        )}
        <div ref={loaderRef} />{" "}
      </div>
    </section>
  );
};

export default Jobs;
