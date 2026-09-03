import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiPaginated, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";
import { PAGINATION_DEFAULTS } from "@/config/constants";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "products.view")) return apiForbidden();

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || String(PAGINATION_DEFAULTS.page));
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(PAGINATION_DEFAULTS.limit)),
      PAGINATION_DEFAULTS.maxLimit
    );
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";

    const query: Record<string, unknown> = { businessId: ctx.businessId };

    if (search) {
      query.$text = { $search: search };
    }
    if (categoryId) query.categoryId = categoryId;
    if (status) query.status = status;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return apiPaginated(products, total, page, limit);
  } catch (error) {
    console.error("Products GET error:", error);
    return apiError("Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "products.create")) return apiForbidden();

    await connectDB();

    const body = await request.json();
    const { name, sku, barcode, description, categoryId, brand, unit, costPrice, sellingPrice, taxRate, minimumStock, maximumStock, status } = body;

    if (!name || !sku) {
      return apiError("Name and SKU are required");
    }

    const existing = await Product.findOne({
      businessId: ctx.businessId,
      sku: sku,
    });
    if (existing) {
      return apiError("A product with this SKU already exists");
    }

    const product = await Product.create({
      businessId: ctx.businessId,
      name,
      sku,
      barcode,
      description,
      categoryId,
      brand,
      unit: unit || "pcs",
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      taxRate: Number(taxRate) || 0,
      minimumStock: Number(minimumStock) || 0,
      maximumStock: Number(maximumStock) || 0,
      status: status || "active",
    });

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "product",
      resourceId: String(product._id),
      metadata: { name, sku },
    });

    return apiSuccess(product, 201);
  } catch (error) {
    console.error("Products POST error:", error);
    return apiError("Failed to create product", 500);
  }
}
