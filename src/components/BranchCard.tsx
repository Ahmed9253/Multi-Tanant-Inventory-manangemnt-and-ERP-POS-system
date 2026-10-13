import type { Branch } from "../types";
import { Button } from "./Button";

type Props = {
  branch: Branch;
  isActive: boolean;
  onEnter: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
};

export function BranchCard({ branch, isActive, onEnter, onDelete }: Props) {
  return (
    <article className="branch-card">
      <div className="branch-card-top">
        <span className="branch-symbol">⌂</span>
        <span className="active-pill">
          <i className="status-dot" /> {branch.status}
        </span>
      </div>
      <h3>{branch.name}</h3>
      <code>{branch.code}</code>
      <p>{branch.address || "Address not set"}</p>
      <div className="branch-meta">
        <span>
          Manager<strong>{branch.manager || "Unassigned"}</strong>
        </span>
        <span>
          Contact<strong>{branch.phone || "No phone"}</strong>
        </span>
      </div>
      <div className="branch-actions">
        <Button
          variant="outline"
          className="branch-enter"
          onClick={() => onEnter(branch)}
        >
          {isActive ? "Current workspace" : "Enter branch →"}
        </Button>
        <Button
          variant="danger"
          className="branch-delete"
          onClick={() => onDelete(branch)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
