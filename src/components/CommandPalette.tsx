import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, View } from "../types";
import { navGroups } from "../lib/constants";
import { money } from "../lib/format";
import { Modal } from "./Modal";

type Props = {
  products: Product[];
  currentView: View;
  onNavigate: (view: View) => void;
  onAddProduct: (id: string) => void;
  onClose: () => void;
  currency: string;
};

type Entry =
  | { type: "nav"; view: View; icon: string; label: string }
  | { type: "product"; id: string; icon: string; label: string; sub: string };

export function CommandPalette({
  products,
  onNavigate,
  onAddProduct,
  onClose,
  currency,
}: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const entries = useMemo<Entry[]>(() => {
    const allItems = navGroups.flatMap((group) => group.items);
    const navEntries: Entry[] = allItems.map((item) => ({
      type: "nav",
      view: item.view,
      icon: item.icon,
      label: item.label,
    }));
    if (!query.trim()) return navEntries;
    const lower = query.toLowerCase();
    const matchedNav = navEntries.filter((item) =>
      item.label.toLowerCase().includes(lower),
    );
    const matchedProducts: Entry[] = products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(lower) ||
          product.sku?.toLowerCase().includes(lower) ||
          product.barcode?.toLowerCase().includes(lower),
      )
      .slice(0, 8)
      .map((product) => ({
        type: "product",
        id: product._id,
        icon: product.icon || "✦",
        label: product.name,
        sub: money(product.price, currency),
      }));
    return [...matchedNav, ...matchedProducts];
  }, [query, products, currency]);

  const select = (entry: Entry) => {
    if (entry.type === "nav") onNavigate(entry.view);
    else onAddProduct(entry.id);
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, entries.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && entries[active]) {
      event.preventDefault();
      select(entries[active]);
    }
  };

  return (
    <Modal onClose={onClose} className="palette-modal" label="Command palette">
      <div className="palette">
        <div className="palette-input-row">
          <span className="palette-icon">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages and products..."
            className="palette-input"
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-results">
          {entries.length ? (
            entries.map((entry, index) => (
              <button
                key={entry.type === "nav" ? `nav-${entry.view}` : `prod-${entry.id}`}
                className={`palette-item ${index === active ? "active" : ""}`}
                onClick={() => select(entry)}
                onMouseEnter={() => setActive(index)}
              >
                <span className="palette-item-icon">{entry.icon}</span>
                <span className="palette-item-label">{entry.label}</span>
                {entry.type === "product" && (
                  <span className="palette-item-sub">{entry.sub}</span>
                )}
                {entry.type === "nav" && (
                  <span className="palette-item-tag">Page</span>
                )}
              </button>
            ))
          ) : (
            <div className="palette-empty">No matches found</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
