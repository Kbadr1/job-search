import { useDispatch, useSelector } from "react-redux";
import JobCard from "../../components/JobCard/JobCard";
import { useEffect, useRef } from "react";
import { fetchJobs } from "../../store/jobsSlice";
import SearchHistory from "../../components/SearchHistory/SearchHistory";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { AppDispatch, RootState } from "../../store";

const Search = () => {
  const {
    jobs: jobsById = {},
    loading,
    error,
    skills,
    count,
    cursor,
    next,
    searchQuery,
  } = useSelector((state: RootState) => state.jobs);

  const dispatch = useDispatch<AppDispatch>();

  const loaderRef = useRef(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [searchQuery]);

  const jobs =
    jobsById && Object.keys(jobsById).length > 0 ? Object.values(jobsById) : [];

  useInfiniteScroll({
    cursor,
    dispatch,
    loaderRef,
    loading,
    next,
  });

  return (
    <>
      <section className="container ">
        <h2 className="page-title">
          {searchQuery.trim().length >= 3
            ? `"${searchQuery}" jobs  (${count})`
            : `${count} Available job`}
        </h2>
        <div className="layout-three-columns">
          <div className="layout-two-columns col-span-2">
            {loading ? (
              <h4>Loading ...</h4>
            ) : error ? (
              <h4>Something Went Wrong</h4>
            ) : !jobs.length ? (
              <h4>No jobs found</h4>
            ) : (
              jobs.map((job) => (
                <JobCard
                  job={job}
                  key={job.id}
                  skills={job.skills.map((skillId) => skills[skillId])}
                />
              ))
            )}
            <div ref={loaderRef} />
          </div>
          <SearchHistory />
        </div>
      </section>
    </>
  );
};

export default Search;
