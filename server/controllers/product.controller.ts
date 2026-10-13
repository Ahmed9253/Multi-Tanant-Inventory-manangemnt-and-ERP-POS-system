import type { Request, Response } from "express";
import { Product } from "../models/product.model";

export async function listProducts(
  _request: Request,
  response: Response,
): Promise<void> {
  const products = await Product.find().sort({ category: 1, name: 1 });
  response.json(products);
}

export async function createProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const product = await Product.create({
    name: request.body.name,
    category: request.body.category,
    price: Number(request.body.price),
    stock: Number(request.body.stock),
    barcode: request.body.barcode || undefined,
    sku: request.body.sku || `SKU-${Date.now().toString().slice(-6)}`,
  });
  response.status(201).json(product);
}

export async function updateProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const product = await Product.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    response.status(404).json({ error: "Product not found" });
    return;
  }
  response.json(product);
}

export async function deleteProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const product = await Product.findByIdAndDelete(request.params.id);
  if (!product) {
    response.status(404).json({ error: "Product not found" });
    return;
  }
  response.status(204).send();
}
