import { useEffect, useRef, useState } from "react";
import SearchIcon from "../../assets/icons/search-icon.svg";
import _debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import "./searchBox.css";
import { TJob } from "../../types";
import { useClickOutside } from "../../hooks/useClickOutside";
import { setSearchQuery } from "../../store/jobs/jobsSlice";

const SearchBox = () => {
  const [isSuggestions, setIsSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    searchQuery,
    entities: { jobs: jobsById },
  } = useSelector((state: RootState) => state.jobs);

  const handleSuggestionClick = (query: string) => {
    dispatch(setSearchQuery(query));
    setIsSuggestions(false);
  };

  const jobs = Object.values(jobsById);

  const debounce = _debounce((e) => {
    dispatch(setSearchQuery(e.target.value));
    setIsSuggestions(true);
  }, 800);

  useEffect(() => {
    if (searchQuery.length >= 3) {
      navigate(`/jobs/search`);
    }
  }, [searchQuery, navigate, dispatch]);

  useClickOutside(dropdownRef, () => setIsSuggestions(false));

  return (
    <section className="search-box">
      <div className="input-container">
        <input
          type="text"
          placeholder="search keyword"
          onChange={debounce}
          autoFocus
        />
        <img src={SearchIcon} alt="search" className="search-icon" />
        {!!jobs.length && searchQuery.length >= 3 && (
          <div
            ref={dropdownRef}
            className={`autoComplete-list ${!isSuggestions ? "hide-list" : ""}`}
          >
            <ul>
              {jobs?.slice(0, 6).map((job: TJob) => (
                <li
                  key={job.id}
                  onClick={() => handleSuggestionClick(job.title)}
                >
                  {job.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchBox;
