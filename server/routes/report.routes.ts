import { Router } from "express";
import { getMonthlyReport } from "../controllers/report.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const reportRouter = Router();

reportRouter.get("/monthly", asyncHandler(getMonthlyReport));
