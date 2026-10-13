import { Router } from "express";
import {
  createPayroll,
  deletePayroll,
  generatePayroll,
  listPayroll,
  updatePayroll,
} from "../controllers/payroll.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const payrollRouter = Router();

payrollRouter.get("/", asyncHandler(listPayroll));
payrollRouter.post("/", asyncHandler(createPayroll));
payrollRouter.post("/generate", asyncHandler(generatePayroll));
payrollRouter.patch("/:id", asyncHandler(updatePayroll));
payrollRouter.delete("/:id", asyncHandler(deletePayroll));
