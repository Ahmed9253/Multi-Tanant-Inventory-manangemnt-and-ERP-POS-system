import { Router } from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const settingsRouter = Router();

settingsRouter.get("/", asyncHandler(getSettings));
settingsRouter.patch("/", asyncHandler(updateSettings));
