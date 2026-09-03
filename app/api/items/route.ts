import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

interface InventoryData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  stockStatus: string;
}

export async function POST(req: Request) {
  const body: InventoryData = await req.json();

  const { name, category, price, quantity, description, stockStatus } = body;

  const inventoryData: InventoryData = {
    name,
    category,
    price,
    quantity,
    description,
    stockStatus,
  };

  const client = await clientPromise;

  const db = client.db("inventory");

  const collection = db.collection("data");

  await collection.insertOne(inventoryData);

  return NextResponse.json({
    message: "Inventory added successfully",
    data: inventoryData,
  });
}
