import type { Request, Response } from "express";
import { env } from "../config/env";
import { Employee } from "../models/employee.model";

export async function login(request: Request, response: Response): Promise<void> {
  const { email, password, loginType } = request.body;
  const { admin } = env;

  if (loginType === "admin" || (!loginType && email === admin.email)) {
    if (email === admin.email && password === admin.password) {
      response.json({
        id: "admin",
        name: admin.name,
        email,
        role: "admin",
      });
      return;
    }
    if (loginType === "admin") {
      response.status(401).json({ error: "Invalid admin credentials" });
      return;
    }
  }

  const employee = await Employee.findOne({ email, password, status: "active" });
  if (!employee) {
    response.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (loginType === "hr" && employee.role !== "hr") {
    response.status(403).json({ error: "Not an HR account" });
    return;
  }

  response.json({
    id: employee._id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
  });
}
