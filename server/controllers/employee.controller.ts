import type { Request, Response } from "express";
import { Employee } from "../models/employee.model";

export async function listEmployees(
  _request: Request,
  response: Response,
): Promise<void> {
  const employees = await Employee.find().sort({ name: 1 });
  response.json(employees);
}

export async function createEmployee(
  request: Request,
  response: Response,
): Promise<void> {
  const employee = await Employee.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    phone: request.body.phone || undefined,
    role: request.body.role || "cashier",
    department: request.body.department || undefined,
    position: request.body.position || undefined,
    salary: Number(request.body.salary) || 0,
    hireDate: request.body.hireDate || new Date(),
    status: request.body.status || "active",
  });
  response.status(201).json(employee);
}

export async function updateEmployee(
  request: Request,
  response: Response,
): Promise<void> {
  const employee = await Employee.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true },
  );
  if (!employee) {
    response.status(404).json({ error: "Employee not found" });
    return;
  }
  response.json(employee);
}

export async function deleteEmployee(
  request: Request,
  response: Response,
): Promise<void> {
  const employee = await Employee.findByIdAndDelete(request.params.id);
  if (!employee) {
    response.status(404).json({ error: "Employee not found" });
    return;
  }
  response.status(204).send();
}
