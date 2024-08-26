import { useDispatch, useSelector } from "react-redux";
import "./searchHistory.css";
import { RootState } from "../../store";
import { setSearchQuery } from "../../store/jobs/jobsSlice";

const SearchHistory = () => {
  const dispatch = useDispatch();
  const { searchHistory } = useSelector((state: RootState) => state.jobs);

  const handleSelectQuery = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  return (
    <div className="search-history">
      {searchHistory.length ? (
        <>
          <h4>Search history:</h4>
          <ul>
            {searchHistory.map((searchQuery: string) => (
              <li
                key={searchQuery}
                onClick={() => handleSelectQuery(searchQuery)}
              >
                {searchQuery}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h3>No search history</h3>
      )}
    </div>
  );
};

export default SearchHistory;
