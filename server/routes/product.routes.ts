import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const productRouter = Router();

productRouter.get("/", asyncHandler(listProducts));
productRouter.post("/", asyncHandler(createProduct));
productRouter.patch("/:id", asyncHandler(updateProduct));
productRouter.delete("/:id", asyncHandler(deleteProduct));
