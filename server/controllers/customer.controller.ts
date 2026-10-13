import type { Request, Response } from "express";
import { Customer } from "../models/customer.model";

export async function listCustomers(
  _request: Request,
  response: Response,
): Promise<void> {
  const customers = await Customer.find().sort({ name: 1 });
  response.json(customers);
}

export async function createCustomer(
  request: Request,
  response: Response,
): Promise<void> {
  const customer = await Customer.create({
    name: request.body.name,
    email: request.body.email || undefined,
    phone: request.body.phone || undefined,
    notes: request.body.notes || undefined,
  });
  response.status(201).json(customer);
}

export async function updateCustomer(
  request: Request,
  response: Response,
): Promise<void> {
  const customer = await Customer.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true },
  );
  if (!customer) {
    response.status(404).json({ error: "Customer not found" });
    return;
  }
  response.json(customer);
}

export async function deleteCustomer(
  request: Request,
  response: Response,
): Promise<void> {
  const customer = await Customer.findByIdAndDelete(request.params.id);
  if (!customer) {
    response.status(404).json({ error: "Customer not found" });
    return;
  }
  response.status(204).send();
}
