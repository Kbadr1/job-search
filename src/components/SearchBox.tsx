import SearchIcon from "../assets/icons/search-icon.svg";

const SearchBox = () => {
  return (
    <section className="search-box">
      <div className="input-container">
        <input type="text" placeholder="search keyword" />
        <img src={SearchIcon} alt="search" className="search-icon" />
      </div>
    </section>
  );
};

export default SearchBox;
