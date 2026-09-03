import Image from "next/image";
import Link from "next/link";
import { requireStudioAuth } from "@/lib/auth";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, hasAccess } = await requireStudioAuth();

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
        You&rsquo;re on the list, not the allowlist
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        <span className="font-medium text-foreground">{email}</span> is signed in
        but doesn&rsquo;t have Studio access yet. Studio is founder-only while the
        creation flow is being hardened.
      </p>
      <form action="/auth/sign-out" method="post" className="mt-6">
        <button
          type="submit"
          className="squircle-sm border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
