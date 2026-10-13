import type { Request, Response } from "express";
import { Employee } from "../models/employee.model";
import { Payroll } from "../models/payroll.model";

export async function listPayroll(
  _request: Request,
  response: Response,
): Promise<void> {
  const payroll = await Payroll.find().sort({ createdAt: -1 });
  response.json(payroll);
}

export async function createPayroll(
  request: Request,
  response: Response,
): Promise<void> {
  const payroll = await Payroll.create({
    employeeId: request.body.employeeId,
    employeeName: request.body.employeeName,
    month: request.body.month,
    baseSalary: Number(request.body.baseSalary) || 0,
    bonus: Number(request.body.bonus) || 0,
    deductions: Number(request.body.deductions) || 0,
    netPay:
      (Number(request.body.baseSalary) || 0) +
      (Number(request.body.bonus) || 0) -
      (Number(request.body.deductions) || 0),
    status: "pending",
  });
  response.status(201).json(payroll);
}

export async function updatePayroll(
  request: Request,
  response: Response,
): Promise<void> {
  const existing = await Payroll.findById(request.params.id);
  if (!existing) {
    response.status(404).json({ error: "Payroll record not found" });
    return;
  }
  const bonus =
    request.body.bonus !== undefined
      ? Number(request.body.bonus)
      : existing.bonus;
  const deductions =
    request.body.deductions !== undefined
      ? Number(request.body.deductions)
      : existing.deductions;
  const patch: Record<string, unknown> = {
    ...request.body,
    netPay: existing.baseSalary + bonus - deductions,
  };
  if (request.body.status === "paid" && !existing.paidAt) {
    patch.paidAt = new Date();
  }
  const payroll = await Payroll.findByIdAndUpdate(request.params.id, patch, {
    new: true,
  });
  response.json(payroll);
}

export async function deletePayroll(
  request: Request,
  response: Response,
): Promise<void> {
  const payroll = await Payroll.findByIdAndDelete(request.params.id);
  if (!payroll) {
    response.status(404).json({ error: "Payroll record not found" });
    return;
  }
  response.status(204).send();
}

export async function generatePayroll(
  request: Request,
  response: Response,
): Promise<void> {
  const month = request.body.month;
  const employees = await Employee.find({ status: "active" });
  const existing = await Payroll.find({ month });
  const existingIds = new Set(existing.map((item) => String(item.employeeId)));
  let generated = 0;

  for (const employee of employees) {
    if (existingIds.has(String(employee._id))) continue;
    await Payroll.create({
      employeeId: employee._id,
      employeeName: employee.name,
      month,
      baseSalary: employee.salary,
      bonus: 0,
      deductions: 0,
      netPay: employee.salary,
      status: "pending",
    });
    generated += 1;
  }

  response.status(201).json({ generated });
}
