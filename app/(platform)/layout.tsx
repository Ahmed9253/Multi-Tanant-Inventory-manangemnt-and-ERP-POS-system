"use client";

import AuthProvider from "@/components/layout/auth-provider";
import AppShell from "@/components/layout/app-shell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
