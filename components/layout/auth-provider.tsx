"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/hooks/use-store";
import { fetchCurrentUser } from "@/store/auth-slice";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/", "/login", "/register", "/forgot-password"];
    const isPublic = publicPaths.includes(pathname);

    dispatch(fetchCurrentUser())
      .unwrap()
      .then(() => {
        if (isPublic && pathname !== "/") {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        if (!isPublic) {
          router.replace("/login");
        }
      });
  }, [dispatch, router, pathname]);

  return <>{children}</>;
}
