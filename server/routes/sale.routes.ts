import { Router } from "express";
import { createSale, listSales } from "../controllers/sale.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const saleRouter = Router();

saleRouter.get("/", asyncHandler(listSales));
saleRouter.post("/", asyncHandler(createSale));
