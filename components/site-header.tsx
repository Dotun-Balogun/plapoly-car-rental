import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";

const links = [
  { href: "/vehicles", label: "Vehicles" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#contact", label: "Contact" },
];

export async function SiteHeader() {
  const profile = await getProfile();

  return (
    <header className="bg-ink sticky top-0 z-40 border-b border-white/10">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {profile ? (
            <UserMenu name={profile.full_name} email={profile.email} isAdmin={profile.role === "admin"} />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost-light">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
          <MobileNav links={links} signedIn={Boolean(profile)} />
        </div>
      </div>
    </header>
  );
}
