import type { Request, Response } from "express";
import { Product } from "../models/product.model";
import { Sale } from "../models/sale.model";

export async function getDashboard(
  _request: Request,
  response: Response,
): Promise<void> {
  const [sales, inventory, lowStock] = await Promise.all([
    Sale.aggregate([
      {
        $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } },
      },
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          value: { $sum: { $multiply: ["$price", "$stock"] } },
          units: { $sum: "$stock" },
        },
      },
    ]),
    Product.countDocuments({ stock: { $lte: 5 } }),
  ]);

  const daily = await Sale.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 7 },
  ]);

  response.json({
    revenue: sales[0]?.revenue || 0,
    orders: sales[0]?.orders || 0,
    inventoryValue: inventory[0]?.value || 0,
    units: inventory[0]?.units || 0,
    lowStock,
    daily,
  });
}
