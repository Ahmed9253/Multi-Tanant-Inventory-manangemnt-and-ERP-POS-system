import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { NoticeBanner } from "../components/Notice";
import { BranchCard } from "../components/BranchCard";
import type { Branch } from "../types";

type Props = {
  onAdd: () => void;
  onEnterBranch: (branch: Branch) => void;
};

export function BranchesPage({ onAdd, onEnterBranch }: Props) {
  const {
    branches,
    activeBranchId,
    branchNotice,
    deleteBranch,
  } = useStore();

  return (
    <main className="module-page branch-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">ORGANIZATION</p>
          <h1>Branches</h1>
          <p className="subheading">
            Manage locations, teams, and operating status from one workspace.
          </p>
        </div>
        <Button onClick={onAdd}>＋ Create branch</Button>
      </div>
      <NoticeBanner notice={branchNotice} />
      <div className="branch-hero">
        <div>
          <span className="hero-kicker">NETWORK OVERVIEW</span>
          <strong>
            {branches.length} <small>locations</small>
          </strong>
          <p>Your branch network at a glance.</p>
        </div>
        <div className="network-icon">⌘</div>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">LOCATIONS</p>
          <h2>All branches</h2>
        </div>
        <span className="chart-period">{branches.length} active records</span>
      </div>
      <div className="branch-grid">
        {branches.length ? (
          branches.map((branch) => (
            <BranchCard
              key={branch._id}
              branch={branch}
              isActive={branch._id === activeBranchId}
              onEnter={onEnterBranch}
              onDelete={deleteBranch}
            />
          ))
        ) : (
          <div className="no-branches">
            <span>⌂</span>
            <h2>Start with your first branch</h2>
            <p>
              Create your main operating location to begin organizing stores and
              teams.
            </p>
            <Button onClick={onAdd}>Create main branch →</Button>
          </div>
        )}
      </div>
    </main>
  );
}
