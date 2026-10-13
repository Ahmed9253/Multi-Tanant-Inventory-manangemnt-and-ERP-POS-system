import { useEffect, useRef } from "react";
import type { Product } from "../types";
import { money } from "../lib/format";
import { lowStockThreshold } from "../lib/constants";

type Props = {
  products: Product[];
  onClose: () => void;
  onNavigateInventory: () => void;
  currency: string;
};

export function NotificationsDropdown({
  products,
  onClose,
  onNavigateInventory,
  currency,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lowStock = products.filter((item) => item.stock <= lowStockThreshold);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [onClose]);

  return (
    <div className="notifications-dropdown" ref={ref}>
      <div className="notifications-header">
        <span>Notifications</span>
        <button className="text-link" onClick={onClose}>Close</button>
      </div>
      <div className="notifications-body">
        {lowStock.length ? (
          lowStock.map((product) => (
            <div className="notification-item" key={product._id}>
              <span className="notification-dot warning" />
              <div>
                <strong>{product.name}</strong>
                <span>
                  {product.stock} left · {money(product.price, currency)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="notifications-empty">
            <span className="notification-dot ok" />
            All stock levels are healthy
          </div>
        )}
      </div>
      <button className="notifications-footer" onClick={onNavigateInventory}>
        Open inventory →
      </button>
    </div>
  );
}
