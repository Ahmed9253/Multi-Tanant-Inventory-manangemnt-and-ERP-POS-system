export const APP_NAME = "NovaSuite";
export const APP_DESCRIPTION = "Multi-tenant POS, ERP, Inventory & HR Platform";

export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_TIMEZONE = "UTC";

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

export const HOME_HERO_IMAGE = "/hero.png";
export const HOME_HERO_BG = "/herobackground.jpg";
export const LOGO = "/logo.png";

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
] as const;

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Africa/Lagos",
  "Africa/Nairobi",
] as const;
