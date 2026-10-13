import { Router } from "express";
import {
  createBranch,
  deleteBranch,
  listBranches,
  updateBranch,
} from "../controllers/branch.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const branchRouter = Router();

branchRouter.get("/", asyncHandler(listBranches));
branchRouter.post("/", asyncHandler(createBranch));
branchRouter.patch("/:id", asyncHandler(updateBranch));
branchRouter.delete("/:id", asyncHandler(deleteBranch));
