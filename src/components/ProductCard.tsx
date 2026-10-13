import type { Product } from "../types";
import { money } from "../lib/format";

type Props = {
  product: Product;
  onAdd: (id: string) => void;
  currency: string;
};

export function ProductCard({ product, onAdd, currency }: Props) {
  return (
    <button
      className="product-card"
      onClick={() => onAdd(product._id)}
      title={`Add ${product.name} to order`}
    >
      <div className={`product-art ${product.color || "mint"}`}>
        <span>{product.icon || "✦"}</span>
        <small>{product.stock} in stock</small>
      </div>
      <div className="product-info">
        <strong>{product.name}</strong>
        <span>{product.category}</span>
        <b>{money(product.price, currency)}</b>
        <small className="sku-label">{product.sku || "SKU pending"}</small>
      </div>
    </button>
  );
}
