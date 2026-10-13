import { useStore } from "../context/StoreContext";
import { MetricCard } from "../components/MetricCard";
import { Button } from "../components/Button";
import { money } from "../lib/format";
import { lowStockThreshold } from "../lib/constants";

type Props = {
  onAdd: () => void;
};

export function DashboardPage({ onAdd }: Props) {
  const { metrics, products, settings } = useStore();
  const low = products.filter((item) => item.stock <= lowStockThreshold);
  const currency = settings.currency;
  const daily = metrics.daily?.length
    ? metrics.daily
    : [
        {
          _id: "Today",
          revenue: metrics.revenue,
          orders: metrics.orders,
        },
      ];
  const maxRevenue = Math.max(metrics.revenue, ...daily.map((d) => d.revenue), 1);

  return (
    <main className="dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Store performance</h1>
          <p className="subheading">
            Everything your team needs to keep today moving.
          </p>
        </div>
        <Button variant="outline" onClick={onAdd}>
          ＋ Add product
        </Button>
      </div>
      <div className="metric-grid">
        <MetricCard
          label="Today's revenue"
          value={money(metrics.revenue, currency)}
          trend="from completed sales"
          icon="↗"
        />
        <MetricCard
          label="Orders today"
          value={String(metrics.orders)}
          trend="transactions recorded"
          icon="◫"
        />
        <MetricCard
          label="Inventory value"
          value={money(metrics.inventoryValue, currency)}
          trend={`${metrics.units} units on hand`}
          icon="◌"
        />
        <MetricCard
          label="Needs attention"
          value={String(metrics.lowStock)}
          trend="items at low stock"
          icon="!"
          warning
        />
      </div>
      <section className="chart-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SALES ANALYTICS</p>
            <h2>Revenue pulse</h2>
          </div>
          <span className="chart-period">Last 7 days · live from MongoDB</span>
        </div>
        <div className="chart">
          <div className="chart-axis">
            <span>{currency}</span>
            <span>{currency}</span>
            <span>{currency}</span>
            <span>{currency}</span>
          </div>
          <div className="bars">
            {daily.map((day) => (
              <div className="bar-group" key={day._id}>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(8, (day.revenue / maxRevenue) * 100)}%`,
                  }}
                  title={`${day._id}: ${money(day.revenue, currency)}`}
                />
                <span>{day._id}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="dashboard-columns">
        <section className="data-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">INVENTORY CONTROL</p>
              <h2>Product catalog</h2>
            </div>
            <Button variant="text" onClick={onAdd}>
              Manage products →
            </Button>
          </div>
          <div className="table">
            <div className="table-head">
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
            </div>
            {products.map((item) => (
              <div className="table-row" key={item._id}>
                <strong>
                  {item.icon || "✦"} {item.name}
                </strong>
                <span>{item.category}</span>
                <span>{money(item.price, currency)}</span>
                <span
                  className={item.stock <= lowStockThreshold ? "low-stock" : "stock-ok"}
                >
                  {item.stock} units
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="attention-section">
          <p className="eyebrow">QUICK ACTIONS</p>
          <h2>Stay in control</h2>
          <div className="action-card warning-card">
            <span className="action-icon">!</span>
            <div>
              <strong>{low.length} items need restocking</strong>
              <p>Review low inventory before the next rush.</p>
            </div>
            <button onClick={onAdd}>Review →</button>
          </div>
          <div className="action-card">
            <span className="action-icon">＋</span>
            <div>
              <strong>Grow your catalog</strong>
              <p>Add products and keep pricing current.</p>
            </div>
            <button onClick={onAdd}>Add →</button>
          </div>
        </section>
      </div>
    </main>
  );
}
