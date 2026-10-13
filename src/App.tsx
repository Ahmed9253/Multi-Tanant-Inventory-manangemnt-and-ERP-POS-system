import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Branch, BranchForm, ProductForm, View } from "./types";
import { StoreProvider, useStore } from "./context/StoreContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import { useClock } from "./hooks/useClock";
import { isMac, modKey } from "./hooks/useShortcut";
import { Sidebar } from "./layout/Sidebar";
import { Topbar } from "./layout/Topbar";
import { Footer } from "./layout/Footer";
import { HelpModal } from "./modals/HelpModal";
import { ProductFormModal } from "./modals/ProductFormModal";
import { BranchFormModal } from "./modals/BranchFormModal";
import { CommandPalette } from "./components/CommandPalette";
import { ToastContainer } from "./components/Toast";
import { LoadingPage } from "./pages/LoadingPage";
import { BranchEntryPage } from "./pages/BranchEntryPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SellPage } from "./pages/SellPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { BranchesPage } from "./pages/BranchesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { PayrollPage } from "./pages/PayrollPage";
import { SettingsPage } from "./pages/SettingsPage";
import { canAccess, getDefaultView } from "./lib/constants";

const emptyProductForm: ProductForm = {
  name: "",
  category: "Coffee",
  price: "",
  stock: "",
  barcode: "",
};

const emptyBranchForm: BranchForm = {
  name: "",
  code: "",
  address: "",
  manager: "",
  phone: "",
};

function Workspace() {
  const store = useStore();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const now = useClock();
  const [view, setView] = useState<View>("sell");
  const [showForm, setShowForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [branchForm, setBranchForm] = useState<BranchForm>(emptyBranchForm);

  useEffect(() => {
    if (user && !canAccess(user.role, view)) {
      setView(getDefaultView(user.role));
    }
  }, [user, view]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = isMac ? event.metaKey : event.ctrlKey;
      if (mod && event.key === "/") {
        event.preventDefault();
        setShowHelp((open) => !open);
      } else if (mod && event.key === "k") {
        event.preventDefault();
        setShowPalette((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!store.dataReady) return <LoadingPage />;
  if (store.needsBranchSetup || !store.branches.length) return <BranchEntryPage />;

  const openProductForm = () => setShowForm(true);
  const openBranchForm = () => setShowBranchForm(true);

  const enterBranch = (branch: Branch) => {
    store.setActiveBranchId(branch._id);
    setView("sell");
  };

  const handleAddProduct = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await store.addProduct(productForm);
    if (ok) {
      setProductForm(emptyProductForm);
      setShowForm(false);
    }
  };

  const handleAddBranch = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await store.addBranch(branchForm);
    if (ok) {
      setBranchForm(emptyBranchForm);
      setShowBranchForm(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} />
      <div className="app-main">
        <Topbar
          view={view}
          setView={setView}
          theme={theme}
          onToggleTheme={toggle}
          now={now}
          onOpenPalette={() => setShowPalette(true)}
        />
        <div className="app-content">
          {view === "sell" && <SellPage />}
          {view === "dashboard" && <DashboardPage onAdd={openProductForm} />}
          {view === "inventory" && <InventoryPage onAdd={openProductForm} />}
          {view === "branches" && (
            <BranchesPage onAdd={openBranchForm} onEnterBranch={enterBranch} />
          )}
          {view === "reports" && <ReportsPage />}
          {view === "customers" && <CustomersPage />}
          {view === "employees" && <EmployeesPage />}
          {view === "payroll" && <PayrollPage />}
          {view === "settings" && <SettingsPage />}
        </div>
        <Footer
          shortcut={`${modKey} /`}
          onOpenHelp={() => setShowHelp(true)}
        />
      </div>
      {showForm && (
        <ProductFormModal
          form={productForm}
          setForm={setProductForm}
          onSubmit={handleAddProduct}
          onClose={() => setShowForm(false)}
        />
      )}
      {showBranchForm && (
        <BranchFormModal
          form={branchForm}
          setForm={setBranchForm}
          onSubmit={handleAddBranch}
          onClose={() => setShowBranchForm(false)}
        />
      )}
      {showHelp && (
        <HelpModal
          shortcut={`${modKey} /`}
          searchShortcut={`${modKey} K`}
          onClose={() => setShowHelp(false)}
        />
      )}
      {showPalette && (
        <CommandPalette
          products={store.products}
          currentView={view}
          onNavigate={(next) => setView(next)}
          onAddProduct={() => setView("sell")}
          onClose={() => setShowPalette(false)}
          currency={store.settings.currency}
        />
      )}
      <ToastContainer toasts={store.toasts} onDismiss={store.dismissToast} />
    </div>
  );
}

type LoginRole = "admin" | "hr" | "employee";

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Gate />
      </StoreProvider>
    </AuthProvider>
  );
}

function Gate() {
  const { user } = useAuth();
  const [loginRole, setLoginRole] = useState<LoginRole | null>(null);

  if (user) return <Workspace />;
  if (loginRole)
    return (
      <LoginPage
        role={loginRole}
        onBack={() => setLoginRole(null)}
      />
    );
  return <LandingPage onSelect={setLoginRole} />;
}

export default App;
