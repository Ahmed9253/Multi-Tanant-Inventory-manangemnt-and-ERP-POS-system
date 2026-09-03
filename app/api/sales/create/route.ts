import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sale, Product, Inventory, InventoryMovement } from "@/models";
import { getAuthContext, hasPermission } from "@/lib/auth";
import { apiError, apiSuccess, apiUnauthorized, apiForbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) return apiUnauthorized();
    if (!hasPermission(ctx.permissions, "sales.create")) return apiForbidden();

    await connectDB();
    const body = await request.json();
    const { storeId, customerId, items, discountAmount, payments, notes } = body;

    if (!storeId || !items || items.length === 0) {
      return apiError("Store and items are required");
    }

    if (!payments || payments.length === 0) {
      return apiError("At least one payment is required");
    }

    let subtotal = 0;
    let totalTax = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        businessId: ctx.businessId,
      });
      if (!product) {
        return apiError(`Product not found: ${item.productId}`);
      }

      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(item.unitPrice) || product.sellingPrice;
      const taxRate = product.taxRate || 0;
      const itemSubtotal = unitPrice * quantity;
      const itemTax = itemSubtotal * (taxRate / 100);

      saleItems.push({
        productId: product._id,
        variantSku: item.variantSku,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        costPrice: product.costPrice,
        discountAmount: Number(item.discountAmount) || 0,
        taxRate,
        taxAmount: itemTax,
        total: itemSubtotal + itemTax - (Number(item.discountAmount) || 0),
      });

      subtotal += itemSubtotal;
      totalTax += itemTax;
    }

    const totalDiscount = Number(discountAmount) || 0;
    const total = subtotal + totalTax - totalDiscount;
    const totalPayment = payments.reduce(
      (sum: number, p: { amount: number }) => sum + Number(p.amount),
      0
    );

    if (Math.abs(totalPayment - total) > 0.01) {
      return apiError(
        `Payment amount (${totalPayment}) does not match total (${total})`
      );
    }

    const saleCount = await Sale.countDocuments({ businessId: ctx.businessId });
    const receiptNumber = `RCP-${String(saleCount + 1).padStart(6, "0")}`;
    const invoiceNumber = `INV-${String(saleCount + 1).padStart(6, "0")}`;

    const sale = await Sale.create({
      businessId: ctx.businessId,
      storeId,
      cashierId: ctx.user.id,
      customerId,
      receiptNumber,
      invoiceNumber,
      items: saleItems,
      subtotal,
      discountAmount: totalDiscount,
      discountPercent: subtotal > 0 ? (totalDiscount / subtotal) * 100 : 0,
      taxAmount: totalTax,
      total,
      payments,
      status: "completed",
      notes,
    });

    for (const item of saleItems) {
      await Inventory.findOneAndUpdate(
        {
          businessId: ctx.businessId,
          storeId,
          productId: item.productId,
        },
        { $inc: { quantity: -item.quantity } },
        { upsert: true }
      );

      await InventoryMovement.create({
        businessId: ctx.businessId,
        storeId,
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: -item.quantity,
        type: "SALE",
        reference: receiptNumber,
        referenceId: sale._id,
        userId: ctx.user.id,
      });
    }

    await createAuditLog({
      businessId: ctx.businessId,
      userId: ctx.user.id,
      action: "CREATE",
      resource: "sale",
      resourceId: String(sale._id),
      metadata: { receiptNumber, total, itemCount: saleItems.length },
    });

    return apiSuccess(sale, 201);
  } catch (error) {
    console.error("Sale POST error:", error);
    return apiError("Failed to create sale", 500);
  }
}
