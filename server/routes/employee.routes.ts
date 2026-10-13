import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from "../controllers/employee.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const employeeRouter = Router();

employeeRouter.get("/", asyncHandler(listEmployees));
employeeRouter.post("/", asyncHandler(createEmployee));
employeeRouter.patch("/:id", asyncHandler(updateEmployee));
employeeRouter.delete("/:id", asyncHandler(deleteEmployee));
