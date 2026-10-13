import type { Request, Response } from "express";
import { AppSettings } from "../models/appSettings.model";

const fallbackSettings = {
  taxRate: 0.08,
  storeName: "WorkNest",
  currency: "$",
};

export async function getSettings(
  _request: Request,
  response: Response,
): Promise<void> {
  const [settings] = await AppSettings.find().limit(1);
  response.json(settings ?? fallbackSettings);
}

export async function updateSettings(
  request: Request,
  response: Response,
): Promise<void> {
  const [existing] = await AppSettings.find().limit(1);
  const settings = existing
    ? await Object.assign(existing, request.body).save()
    : await AppSettings.create(request.body);
  response.json(settings);
}
