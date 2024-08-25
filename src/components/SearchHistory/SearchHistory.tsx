import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../store/jobsSlice";
import "./searchHistory.css";
import { RootState } from "../../store";

const SearchHistory = () => {
  const dispatch = useDispatch();
  const { searchHistory } = useSelector((state: RootState) => state.jobs);

  const handleSearchClick = (query: string) => {
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
                onClick={() => handleSearchClick(searchQuery)}
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
