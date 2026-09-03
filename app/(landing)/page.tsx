"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { HOME_HERO_IMAGE, HOME_HERO_BG } from "@/config/constants";
import { ArrowRight, Sun, Moon } from "lucide-react";

const features = [
  {
    title: "Point of Sale",
    description:
      "A modern, fast POS with barcode support, split payments, and real-time inventory updates.",
  },
  {
    title: "Inventory Management",
    description:
      "Track stock across multiple stores with movements, transfers, low-stock alerts, and valuations.",
  },
  {
    title: "HR & Employees",
    description:
      "Manage employees, attendance, leave, payroll, and departments from a single platform.",
  },
  {
    title: "Multi-Store Support",
    description:
      "Run multiple stores under one business with store-specific inventory, sales, and performance.",
  },
  {
    title: "Reports & Analytics",
    description:
      "Sales, inventory, purchases, expenses, and profit/loss reports with powerful filters.",
  },
  {
    title: "Roles & Permissions",
    description:
      "Granular role-based access control with customizable permissions for every team member.",
  },
];

const steps = [
  "Create your business account",
  "Set up stores and invite your team",
  "Add products and manage inventory",
  "Start selling with POS",
  "Track sales, expenses, and growth",
];

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">How it Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background image + readability gradient overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={HOME_HERO_BG}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,primary/20,transparent)]" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 lg:py-32 relative">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                The all-in-one platform for your{" "}
                <span className="text-primary">business operations</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                POS, inventory, HR, sales, purchases, and analytics — unified in one powerful
                multi-tenant platform. Manage stores, employees, and growth from a single dashboard.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/login">
                  <Button size="lg" className="gap-2 text-base px-8">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="text-base px-8 bg-background/60 backdrop-blur">
                    Learn More
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Multi-tenant & secure
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Self-hosted ready
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Role-based access
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border shadow-2xl bg-background/40 backdrop-blur">
                <Image
                  src={HOME_HERO_IMAGE}
                  alt="NovaSuite in action"
                  width={1600}
                  height={1066}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Everything you need to run your business
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A comprehensive suite of tools designed for retail, wholesale, and service businesses.
              </p>
              <Link href="/register" className="mt-8 inline-block">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2">
              {features.map((f, i) => (
                <li
                  key={f.title}
                  className="group rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  <span className="text-sm font-semibold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started with NovaSuite in five simple steps.
            </p>
          </div>
          <ol className="mx-auto max-w-3xl divide-y rounded-xl border bg-card">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-5 px-6 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}
                </span>
                <div>
                  <p className="text-lg font-medium">{step}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to transform your business?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">
            Sign in to NovaSuite to manage operations, increase efficiency, and grow faster.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-8">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 border-primary-foreground/30 hover:bg-primary-foreground/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Logo href="/" size={32} showText={false} />
              NovaSuite
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} NovaSuite. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition">Privacy</a>
              <a href="#" className="hover:text-foreground transition">Terms</a>
              <a href="#" className="hover:text-foreground transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
