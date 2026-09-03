import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "products.view")) return apiForbidden();

    await connectDB();
    const { id } = await params;

    const product = await Product.findOne({
      _id: id,
      businessId: ctx.businessId,
    })
      .populate("categoryId", "name")
      .lean();

    if (!product) return apiNotFound("Product not found");
    return apiSuccess(product);
  } catch (error) {
    console.error("Product GET error:", error);
    return apiError("Failed to fetch product", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "products.update")) return apiForbidden();

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findOne({
      _id: id,
      businessId: ctx.businessId,
    });

    if (!product) return apiNotFound("Product not found");

    if (body.sku && body.sku !== product.sku) {
      const existing = await Product.findOne({
        businessId: ctx.businessId,
        sku: body.sku,
        _id: { $ne: id },
      });
      if (existing) return apiError("A product with this SKU already exists");
    }

    Object.assign(product, body);
    await product.save();

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "UPDATE",
      resource: "product",
      resourceId: String(product._id),
      metadata: { changes: Object.keys(body) },
    });

    return apiSuccess(product);
  } catch (error) {
    console.error("Product PUT error:", error);
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "products.delete")) return apiForbidden();

    await connectDB();
    const { id } = await params;

    const product = await Product.findOneAndDelete({
      _id: id,
      businessId: ctx.businessId,
    });

    if (!product) return apiNotFound("Product not found");

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "DELETE",
      resource: "product",
      resourceId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return apiError("Failed to delete product", 500);
  }
}
