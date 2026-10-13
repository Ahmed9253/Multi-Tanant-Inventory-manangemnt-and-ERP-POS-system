import { BrandLogo } from "../components/BrandLogo";

export function LoadingPage() {
  return (
    <div className="entry-loading">
      <BrandLogo className="loading-logo" />
      <span>Preparing your workspace</span>
    </div>
  );
}
