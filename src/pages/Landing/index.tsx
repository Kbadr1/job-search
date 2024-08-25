import { Link } from "react-router-dom";
import "./landing.css";

const Landing = () => {
  return (
    <section className="container landing">
      <h1>Welcome to JobsNow</h1>
      <h3>
        Explore <Link to={"/jobs"}>jobs</Link> and{" "}
        <Link to={"/jobs/search"}>search</Link> for your dream job now.
      </h3>
    </section>
  );
};

export default Landing;
