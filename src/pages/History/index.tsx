import { useDispatch } from "react-redux";
import SearchHistory from "../../components/SearchHistory/SearchHistory";
import { clearHistory } from "../../store/jobsSlice";
import "./history.css";

const History = () => {
  const dispatch = useDispatch();

  const handleClearHistory = () => {
    dispatch(clearHistory());
  };

  return (
    <section className="container history">
      <div className="header">
        <h2 className="page-title">Search History</h2>
        <button onClick={handleClearHistory}>Clear history</button>
      </div>
      <SearchHistory />
    </section>
  );
};

export default History;
