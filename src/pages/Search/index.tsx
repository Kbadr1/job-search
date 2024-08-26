import { useDispatch, useSelector } from "react-redux";
import JobCard from "../../components/JobCard/JobCard";
import { useEffect, useRef } from "react";
import SearchHistory from "../../components/SearchHistory/SearchHistory";
import { AppDispatch, RootState } from "../../store";
import { fetchJobs } from "../../store/jobs/thunks/fetchJobs";

const Search = () => {
  const {
    entities: { jobs: jobsById, skills },
    loading,
    error,
    count,
    searchQuery,
  } = useSelector((state: RootState) => state.jobs);

  const dispatch = useDispatch<AppDispatch>();
  const loaderRef = useRef(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch, searchQuery]);

  const jobs =
    jobsById && Object.keys(jobsById).length > 0 ? Object.values(jobsById) : [];

  return (
    <section className="container">
      <h2 className="page-title">
        {searchQuery.trim().length >= 3
          ? `"${searchQuery}" jobs  (${count})`
          : `${count} Available jobs`}
      </h2>
      <div className="grid-three-columns">
        <div className="grid-two-columns grid-column-span-2">
          {loading ? (
            <h4>Loading ...</h4>
          ) : error ? (
            <h4>Something Went Wrong</h4>
          ) : !jobs.length ? (
            <h4>No jobs found</h4>
          ) : (
            jobs.map((job) => {
              const jobSkills = job.skills
                .map((skillId) => skills[skillId])
                .filter(Boolean);

              return <JobCard job={job} key={job.id} skills={jobSkills} />;
            })
          )}
          <div ref={loaderRef} />
        </div>
        <SearchHistory />
      </div>
    </section>
  );
};

export default Search;
