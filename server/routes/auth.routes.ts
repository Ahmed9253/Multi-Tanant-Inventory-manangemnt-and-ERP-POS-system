import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/asyncHandler";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(login));
