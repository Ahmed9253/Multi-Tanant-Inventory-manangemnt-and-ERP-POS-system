"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "email" | "password" | "date" | "datetime";
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  optionsUrl?: string;
  optionLabel?: string;
  optionValue?: string;
  step?: string;
  fullWidth?: boolean;
  defaultValue?: string | number;
}

export interface FormValue {
  [key: string]: string | number;
}

export function FormFields({
  fields,
  value,
  onChange,
}: {
  fields: FieldConfig[];
  value: FormValue;
  onChange: (v: FormValue) => void;
}) {
  const set = (name: string, v: string | number | null) =>
    onChange({ ...value, [name]: v ?? "" });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const current = value[f.name] ?? f.defaultValue ?? "";
        if (f.type === "textarea") {
          return (
            <div key={f.name} className={f.fullWidth ? "sm:col-span-2" : ""}>
              <Label htmlFor={f.name} className="mb-1.5 block">
                {f.label}
                {f.required ? <span className="text-destructive"> *</span> : null}
              </Label>
              <Textarea
                id={f.name}
                placeholder={f.placeholder}
                value={String(current)}
                onChange={(e) => set(f.name, e.target.value)}
              />
            </div>
          );
        }
        if (f.type === "select") {
          return (
            <div key={f.name} className={f.fullWidth ? "sm:col-span-2" : ""}>
              <Label className="mb-1.5 block">
                {f.label}
                {f.required ? <span className="text-destructive"> *</span> : null}
              </Label>
              <Select
                value={String(current)}
                onValueChange={(v) => set(f.name, v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={f.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  {f.required ? null : <SelectItem value="">None</SelectItem>}
                  {(f.options || []).map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return (
          <div key={f.name} className={f.fullWidth ? "sm:col-span-2" : ""}>
            <Label htmlFor={f.name} className="mb-1.5 block">
              {f.label}
              {f.required ? <span className="text-destructive"> *</span> : null}
            </Label>
            <Input
              id={f.name}
              type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "password" ? "password" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"}
              placeholder={f.placeholder}
              step={f.step}
              value={String(current)}
              onChange={(e) =>
                set(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
