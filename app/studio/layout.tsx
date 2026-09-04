import Image from "next/image";
import Link from "next/link";
import { requireStudioAuth } from "@/lib/auth";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasAccess, admin } = await requireStudioAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link href="/studio" className="flex items-center gap-2.5">
            <Image
              src="/flawk.png"
              alt="Flawk"
              width={26}
              height={26}
              className="size-6.5"
            />
            <span className="text-base font-semibold tracking-tight">
              Studio
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {admin && (
              <Link
                href="/studio/admin"
                className="font-medium text-muted transition-colors hover:text-foreground"
              >
                Admin
              </Link>
            )}
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="squircle-sm border border-border bg-surface px-3 py-1.5 font-medium transition-colors hover:bg-surface-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {hasAccess ? children : <NoAccess email={user.email ?? ""} />}
      </main>
    </div>
  );
}

function NoAccess({ email }: { email: string }) {
  return (
    <div className="mx-auto mt-10 max-w-md squircle border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold tracking-tight">
        You&rsquo;re signed in, not allowlisted
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        <span className="font-medium text-foreground">{email}</span> doesn&rsquo;t
        have Studio access yet. Studio is invite-only while the creation flow is
        being hardened.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/apply"
          className="squircle-sm bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          Apply for access
        </Link>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="squircle-sm border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
