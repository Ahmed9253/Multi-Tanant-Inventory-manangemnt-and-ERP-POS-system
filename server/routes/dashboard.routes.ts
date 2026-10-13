import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const dashboardRouter = Router();

dashboardRouter.get("/", asyncHandler(getDashboard));
