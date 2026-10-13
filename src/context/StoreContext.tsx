import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { startTransition } from "react";
import type {
  Branch,
  BranchForm,
  Customer,
  CustomerForm,
  Employee,
  EmployeeForm,
  Metrics,
  MonthlyReport,
  Notice,
  Payroll,
  PayrollForm,
  Product,
  ProductForm,
  SalePayload,
  Settings,
  Toast,
  ToastKind,
} from "../types";
import { api } from "../lib/api";
import { defaultSettings } from "../lib/constants";

type StoreContextValue = {
  products: Product[];
  metrics: Metrics;
  branches: Branch[];
  reports: MonthlyReport[];
  customers: Customer[];
  settings: Settings;
  activeBranch: Branch | undefined;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  dataReady: boolean;
  needsBranchSetup: boolean;
  refresh: () => Promise<void>;
  toasts: Toast[];
  pushToast: (kind: ToastKind, text: string) => void;
  dismissToast: (id: number) => void;
  branchNotice: Notice;
  clearBranchNotice: () => void;
  addProduct: (form: ProductForm) => Promise<boolean>;
  updateProduct: (id: string, field: "stock" | "price", value: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addBranch: (form: BranchForm) => Promise<boolean>;
  deleteBranch: (branch: Branch) => Promise<void>;
  addCustomer: (form: CustomerForm) => Promise<boolean>;
  updateCustomer: (id: string, form: CustomerForm) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  recordSale: (payload: SalePayload) => Promise<void>;
  employees: Employee[];
  payroll: Payroll[];
  addEmployee: (form: EmployeeForm) => Promise<boolean>;
  updateEmployee: (id: string, form: Partial<EmployeeForm>) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<void>;
  addPayroll: (form: PayrollForm) => Promise<boolean>;
  updatePayroll: (id: string, patch: Record<string, unknown>) => Promise<void>;
  deletePayroll: (id: string) => Promise<void>;
  generatePayroll: (month: string) => Promise<number>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const emptyMetrics: Metrics = {
  revenue: 0,
  orders: 0,
  inventoryValue: 0,
  units: 0,
  lowStock: 0,
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeBranchId, setActiveBranchIdState] = useState(
    () => localStorage.getItem("worknest-active-branch") || "",
  );
  const [needsBranchSetup, setNeedsBranchSetup] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [branchNotice, setBranchNotice] = useState<Notice>(null);
  const branchMutationVersion = useRef(0);
  const toastId = useRef(0);

  const pushToast = useCallback((kind: ToastKind, text: string) => {
    const id = (toastId.current += 1);
    setToasts((current) => [...current, { id, kind, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const setActiveBranchId = useCallback((id: string) => {
    setActiveBranchIdState(id);
    if (id) localStorage.setItem("worknest-active-branch", id);
    else localStorage.removeItem("worknest-active-branch");
  }, []);

  const refresh = useCallback(async () => {
    const version = branchMutationVersion.current;
    const [
      productData,
      metricData,
      branchData,
      reportData,
      customerData,
      settingsData,
      employeeData,
      payrollData,
    ] = await Promise.all([
      api.get<Product[]>("/api/products"),
      api.get<Metrics>("/api/dashboard"),
      api.get<Branch[]>("/api/branches"),
      api.get<{ months: MonthlyReport[] }>("/api/reports/monthly"),
      api.get<Customer[]>("/api/customers"),
      api.get<Settings>("/api/settings"),
      api.get<Employee[]>("/api/employees"),
      api.get<Payroll[]>("/api/payroll"),
    ]);
    startTransition(() => {
      if (productData) setProducts(productData);
      if (metricData) setMetrics(metricData);
      if (branchData && version === branchMutationVersion.current)
        setBranches(branchData);
      if (reportData) setReports(reportData.months);
      if (customerData) setCustomers(customerData);
      if (settingsData)
        setSettings({ ...defaultSettings, ...settingsData });
      if (employeeData) setEmployees(employeeData);
      if (payrollData) setPayroll(payrollData);
      if (
        branchData?.length &&
        !activeBranchId &&
        version === branchMutationVersion.current
      ) {
        setActiveBranchId(branchData[0]._id);
      }
    });
    setDataReady(true);
  }, [activeBranchId, setActiveBranchId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const addProduct = useCallback(
    async (form: ProductForm): Promise<boolean> => {
      const product = await api.post<Product>("/api/products", form);
      if (!product) {
        pushToast("error", "Connect MongoDB to save new products");
        return false;
      }
      setProducts((current) => [...current, product]);
      pushToast("success", `${product.name} added to inventory`);
      return true;
    },
    [pushToast],
  );

  const updateProduct = useCallback(
    async (id: string, field: "stock" | "price", value: string) => {
      const product = await api.patch<Product>(`/api/products/${id}`, {
        [field]: Number(value),
      });
      if (product)
        setProducts((current) =>
          current.map((item) =>
            item._id === id ? { ...item, [field]: Number(value) } : item,
          ),
        );
    },
    [],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const ok = await api.delete(`/api/products/${id}`);
      if (ok === null) return;
      setProducts((current) => current.filter((item) => item._id !== id));
      pushToast("info", "Product deleted");
    },
    [pushToast],
  );

  const addBranch = useCallback(
    async (form: BranchForm): Promise<boolean> => {
      const branch = await api.post<Branch>("/api/branches", form);
      if (!branch) {
        setBranchNotice({ kind: "error", text: "Connect MongoDB to save this branch" });
        return false;
      }
      branchMutationVersion.current += 1;
      setBranches((current) => [...current, branch]);
      setNeedsBranchSetup(false);
      setActiveBranchId(branch._id);
      setBranchNotice({ kind: "success", text: `${branch.name} created.` });
      pushToast("success", `${branch.name} is ready`);
      return true;
    },
    [pushToast, setActiveBranchId],
  );

  const deleteBranch = useCallback(
    async (branch: Branch) => {
      branchMutationVersion.current += 1;
      const ok = await api.delete(`/api/branches/${branch._id}`);
      if (ok === null) {
        setBranchNotice({ kind: "error", text: "Could not delete branch" });
        return;
      }
      const remaining = branches.filter((item) => item._id !== branch._id);
      setBranches(remaining);
      setBranchNotice({ kind: "success", text: `${branch.name} deleted.` });
      if (branch._id === activeBranchId) {
        if (remaining[0]) setActiveBranchId(remaining[0]._id);
        else {
          setActiveBranchId("");
          setNeedsBranchSetup(true);
        }
      }
    },
    [activeBranchId, branches, setActiveBranchId],
  );

  const addCustomer = useCallback(
    async (form: CustomerForm): Promise<boolean> => {
      const customer = await api.post<Customer>("/api/customers", form);
      if (!customer) {
        pushToast("error", "Could not save customer");
        return false;
      }
      setCustomers((current) => [...current, customer].sort((a, b) =>
        a.name.localeCompare(b.name),
      ));
      pushToast("success", `${customer.name} added`);
      return true;
    },
    [pushToast],
  );

  const updateCustomer = useCallback(
    async (id: string, form: CustomerForm): Promise<boolean> => {
      const customer = await api.patch<Customer>(`/api/customers/${id}`, form);
      if (!customer) {
        pushToast("error", "Could not update customer");
        return false;
      }
      setCustomers((current) =>
        current.map((item) => (item._id === id ? customer : item)),
      );
      pushToast("success", "Customer updated");
      return true;
    },
    [pushToast],
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      const ok = await api.delete(`/api/customers/${id}`);
      if (ok === null) return;
      setCustomers((current) => current.filter((item) => item._id !== id));
      pushToast("info", "Customer removed");
    },
    [pushToast],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const updated = await api.patch<Settings>("/api/settings", patch);
      if (updated) {
        setSettings({ ...defaultSettings, ...updated });
        pushToast("success", "Settings saved");
      } else {
        pushToast("error", "Could not save settings");
      }
    },
    [pushToast],
  );

  const recordSale = useCallback(
    async (payload: SalePayload) => {
      await api.post("/api/sales", payload);
      void refresh();
    },
    [refresh],
  );

  const addEmployee = useCallback(
    async (form: EmployeeForm): Promise<boolean> => {
      const employee = await api.post<Employee>("/api/employees", form);
      if (!employee) {
        pushToast("error", "Could not save employee");
        return false;
      }
      setEmployees((current) => [...current, employee]);
      pushToast("success", `${employee.name} added`);
      return true;
    },
    [pushToast],
  );

  const updateEmployee = useCallback(
    async (id: string, form: Partial<EmployeeForm>): Promise<boolean> => {
      const employee = await api.patch<Employee>(`/api/employees/${id}`, form);
      if (!employee) {
        pushToast("error", "Could not update employee");
        return false;
      }
      setEmployees((current) =>
        current.map((item) => (item._id === id ? employee : item)),
      );
      pushToast("success", "Employee updated");
      return true;
    },
    [pushToast],
  );

  const deleteEmployee = useCallback(
    async (id: string) => {
      const ok = await api.delete(`/api/employees/${id}`);
      if (ok === null) return;
      setEmployees((current) => current.filter((item) => item._id !== id));
      pushToast("info", "Employee removed");
    },
    [pushToast],
  );

  const addPayroll = useCallback(
    async (form: PayrollForm): Promise<boolean> => {
      const record = await api.post<Payroll>("/api/payroll", form);
      if (!record) {
        pushToast("error", "Could not create payroll record");
        return false;
      }
      setPayroll((current) => [...current, record]);
      pushToast("success", "Payroll record created");
      return true;
    },
    [pushToast],
  );

  const updatePayroll = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      const record = await api.patch<Payroll>(`/api/payroll/${id}`, patch);
      if (!record) {
        pushToast("error", "Could not update payroll");
        return;
      }
      setPayroll((current) =>
        current.map((item) => (item._id === id ? record : item)),
      );
      pushToast("success", "Payroll updated");
    },
    [pushToast],
  );

  const deletePayroll = useCallback(
    async (id: string) => {
      const ok = await api.delete(`/api/payroll/${id}`);
      if (ok === null) return;
      setPayroll((current) => current.filter((item) => item._id !== id));
      pushToast("info", "Payroll record removed");
    },
    [pushToast],
  );

  const generatePayroll = useCallback(
    async (month: string): Promise<number> => {
      const result = await api.post<{ created: number }>(
        "/api/payroll/generate",
        { month },
      );
      if (!result) {
        pushToast("error", "Could not generate payroll");
        return 0;
      }
      void refresh();
      pushToast("success", `${result.created} payroll records generated`);
      return result.created;
    },
    [pushToast, refresh],
  );

  const clearBranchNotice = useCallback(() => setBranchNotice(null), []);

  const activeBranch = useMemo(
    () => branches.find((branch) => branch._id === activeBranchId) || branches[0],
    [branches, activeBranchId],
  );

  const value: StoreContextValue = {
    products,
    metrics,
    branches,
    reports,
    customers,
    settings,
    activeBranch,
    activeBranchId: activeBranch?._id || "",
    setActiveBranchId,
    dataReady,
    needsBranchSetup,
    refresh,
    toasts,
    pushToast,
    dismissToast,
    branchNotice,
    clearBranchNotice,
    addProduct,
    updateProduct,
    deleteProduct,
    addBranch,
    deleteBranch,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateSettings,
    recordSale,
    employees,
    payroll,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addPayroll,
    updatePayroll,
    deletePayroll,
    generatePayroll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
