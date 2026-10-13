import type { Request, Response } from "express";
import { Product } from "../models/product.model";
import { Sale } from "../models/sale.model";

export async function listSales(
  _request: Request,
  response: Response,
): Promise<void> {
  const sales = await Sale.find().sort({ createdAt: -1 }).limit(12);
  response.json(sales);
}

export async function createSale(
  request: Request,
  response: Response,
): Promise<void> {
  const sale = await Sale.create(request.body);
  await Promise.all(
    (request.body.items ?? []).map(
      (item: { productId?: string; quantity: number }) =>
        item.productId
          ? Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: -item.quantity } },
            )
          : null,
    ),
  );
  response.status(201).json(sale);
}
