import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — Flawk Studio",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/studio";

  const user = await getSessionUser();
  if (user) redirect(safeNext);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        {error === "link" && (
          <p className="mb-4 squircle-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            That sign-in link was invalid or expired. Request a new one.
          </p>
        )}
        <LoginForm next={safeNext} />
      </div>
    </div>
  );
}
