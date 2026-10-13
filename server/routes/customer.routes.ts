import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from "../controllers/customer.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const customerRouter = Router();

customerRouter.get("/", asyncHandler(listCustomers));
customerRouter.post("/", asyncHandler(createCustomer));
customerRouter.patch("/:id", asyncHandler(updateCustomer));
customerRouter.delete("/:id", asyncHandler(deleteCustomer));
