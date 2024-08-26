import { FC } from "react";
import { Link } from "react-router-dom";
import "./sideCard.css";

interface TSideCardProps {
  data: {
    id: string;
    name?: string;
    title?: string;
  }[];
  path: "skill" | "job";
}

const SideCard: FC<TSideCardProps> = ({ data, path }) => {
  return (
    <div className="side-card">
      <h3>Related {path}s:</h3>
      <ul>
        {data.length > 0 ? (
          data.map((entity) => (
            <li key={entity.id}>
              <Link to={`/${path}/${entity.id}`}>
                {path == "skill" ? entity.name : entity.title}
              </Link>
            </li>
          ))
        ) : (
          <p>No related {path} found.</p>
        )}
      </ul>
    </div>
  );
};

export default SideCard;
