import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";

type LoginRole = "admin" | "hr" | "employee";

type Props = {
  role: LoginRole;
  onBack: () => void;
};

const roleConfig: Record<
  LoginRole,
  { title: string; subtitle: string; eyebrow: string; placeholder: string }
> = {
  admin: {
    title: "Admin Sign In",
    subtitle: "Sign in with your administrator credentials.",
    eyebrow: "ADMINISTRATOR",
    placeholder: "admin@worknest.com",
  },
  hr: {
    title: "HR Sign In",
    subtitle: "Sign in with your HR staff credentials.",
    eyebrow: "HUMAN RESOURCES",
    placeholder: "name@worknest.com",
  },
  employee: {
    title: "Employee Sign In",
    subtitle: "Sign in with your staff account.",
    eyebrow: "EMPLOYEE",
    placeholder: "name@worknest.com",
  },
};

export function LoginPage({ role, onBack }: Props) {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const config = roleConfig[role];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);
    if (!result.ok) setError(result.error || "Invalid credentials");
  };

  return (
    <main className="login-page">
      <button
        className="login-theme-toggle"
        onClick={toggle}
        aria-label="Toggle dark mode"
      >
        {theme === "light" ? "☾" : "☀"}
      </button>
      <div className="login-card">
        <div className="login-brand">
          <BrandLogo className="login-brand-logo" />
          <small>ERP</small>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className="login-subtitle">{config.subtitle}</p>
          {error && <div className="notice notice-error">{error}</div>}
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={config.placeholder}
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <Button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"} <span>→</span>
          </Button>
        </form>
        <button className="login-back" onClick={onBack}>
          ← Back to home
        </button>
      </div>
    </main>
  );
}
