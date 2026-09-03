import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Inventory, InventoryMovement, Product } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "inventory.view")) return apiForbidden();

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit));
    const storeId = searchParams.get("storeId") || "";
    const lowStock = searchParams.get("lowStock") === "true";

    const query: Record<string, unknown> = { businessId: ctx.businessId };
    if (storeId) query.storeId = storeId;

    const [inventoryItems, total] = await Promise.all([
      Inventory.find(query)
        .populate("productId", "name sku minimumStock")
        .populate("storeId", "name code")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(query),
    ]);

    let filtered = inventoryItems;
    if (lowStock) {
      filtered = inventoryItems.filter((item) => {
        const product = item.productId as unknown as { minimumStock: number };
        return product && item.quantity <= (product.minimumStock || 0);
      });
    }

    return apiPaginated(filtered, total, page, limit);
  } catch (error) {
    console.error("Inventory GET error:", error);
    return apiError("Failed to fetch inventory", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "inventory.adjust")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { storeId, productId, quantity, type, notes, variantSku } = body;

    if (!storeId || !productId || quantity === undefined || !type) {
      return apiError("Store, product, quantity, and type are required");
    }

    const product = await Product.findOne({
      _id: productId,
      businessId: ctx.businessId,
    });
    if (!product) return apiError("Product not found");

    const qty = Number(quantity);

    if (type === "OPENING_BALANCE" || type === "ADJUSTMENT" || type === "PURCHASE_RECEIVED" || type === "SALE_RETURN" || type === "TRANSFER_IN") {
      await Inventory.findOneAndUpdate(
        {
          businessId: ctx.businessId,
          storeId,
          productId,
          variantSku,
        },
        { $inc: { quantity: qty } },
        { upsert: true }
      );
    } else {
      const inv = await Inventory.findOne({
        businessId: ctx.businessId,
        storeId,
        productId,
        variantSku,
      });
      if (inv && inv.quantity < Math.abs(qty)) {
        return apiError("Insufficient stock");
      }
      await Inventory.findOneAndUpdate(
        {
          businessId: ctx.businessId,
          storeId,
          productId,
          variantSku,
        },
        { $inc: { quantity: qty } }
      );
    }

    const movement = await InventoryMovement.create({
      businessId: ctx.businessId,
      storeId,
      productId,
      variantSku,
      quantity: qty,
      type,
      userId: ctx.user.id,
      notes,
    });

    return apiSuccess(movement, 201);
  } catch (error) {
    console.error("Inventory POST error:", error);
    return apiError("Failed to adjust inventory", 500);
  }
}
