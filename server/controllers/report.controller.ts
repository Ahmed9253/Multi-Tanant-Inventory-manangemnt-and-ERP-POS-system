import type { Request, Response } from "express";
import { Sale } from "../models/sale.model";
import { Setting } from "../models/setting.model";

type MonthlySummary = {
  month: string;
  bills: number;
  revenue: number;
  tax: number;
  discounts: number;
  items: number;
};

export async function getMonthlyReport(
  _request: Request,
  response: Response,
): Promise<void> {
  const firstUse = await Setting.findOne({ key: "firstUseAt" });
  const start = new Date(firstUse?.value ?? new Date());
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  const months: MonthlySummary[] = [];

  for (
    const cursor = new Date(start);
    cursor <= now;
    cursor.setMonth(cursor.getMonth() + 1)
  ) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + 1);
    const [summary] = await Sale.aggregate([
      { $match: { createdAt: { $gte: cursor, $lt: next } } },
      {
        $group: {
          _id: null,
          bills: { $sum: 1 },
          revenue: { $sum: "$total" },
          tax: { $sum: "$tax" },
          discounts: { $sum: "$discount" },
          items: { $sum: { $sum: "$items.quantity" } },
        },
      },
    ]);
    months.push({
      month: cursor.toLocaleString("en-US", { month: "long", year: "numeric" }),
      bills: summary?.bills || 0,
      revenue: summary?.revenue || 0,
      tax: summary?.tax || 0,
      discounts: summary?.discounts || 0,
      items: summary?.items || 0,
    });
  }

  response.json({ firstUseAt: start, months });
}
