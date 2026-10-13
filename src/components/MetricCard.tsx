type Props = {
  label: string;
  value: string;
  trend: string;
  icon: string;
  warning?: boolean;
};

export function MetricCard({ label, value, trend, icon, warning = false }: Props) {
  return (
    <div className={`metric-card ${warning ? "metric-warning" : ""}`.trim()}>
      <div className="metric-icon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{trend}</span>
    </div>
  );
}
