import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { AdminNav } from "@/components/admin-nav";
import { UserMenu } from "@/components/user-menu";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <>
      <header className="bg-ink border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="bg-primary text-primary-foreground rounded-md px-2 py-0.5 text-xs font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-1.5 text-sm text-white/75 hover:text-white sm:flex">
              View site <ExternalLink className="size-3.5" />
            </Link>
            <UserMenu name={profile.full_name} email={profile.email} isAdmin />
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-[minmax(0,1fr)] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:py-8">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <AdminNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </>
  );
}