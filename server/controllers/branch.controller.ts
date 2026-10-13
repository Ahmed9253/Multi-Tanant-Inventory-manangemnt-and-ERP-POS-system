import type { Request, Response } from "express";
import { Branch } from "../models/branch.model";

export async function listBranches(
  _request: Request,
  response: Response,
): Promise<void> {
  const branches = await Branch.find().sort({ createdAt: 1 });
  response.json(branches);
}

export async function createBranch(
  request: Request,
  response: Response,
): Promise<void> {
  const branch = await Branch.create({
    ...request.body,
    code: String(request.body.code).toUpperCase(),
  });
  response.status(201).json(branch);
}

export async function updateBranch(
  request: Request,
  response: Response,
): Promise<void> {
  const branch = await Branch.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });
  if (!branch) {
    response.status(404).json({ error: "Branch not found" });
    return;
  }
  response.json(branch);
}

export async function deleteBranch(
  request: Request,
  response: Response,
): Promise<void> {
  const branch = await Branch.findByIdAndDelete(request.params.id);
  if (!branch) {
    response.status(404).json({ error: "Branch not found" });
    return;
  }
  response.status(204).send();
}
