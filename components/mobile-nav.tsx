"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav({
  links,
  signedIn,
}: {
  links: { href: string; label: string }[];
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid size-10 place-items-center rounded-lg text-white hover:bg-white/10"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="bg-ink absolute inset-x-0 top-full border-t border-white/10 px-4 pt-2 pb-5 shadow-xl">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-white/90 hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {!signedIn && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button asChild variant="ghost-light" className="border border-white/20">
                <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setOpen(false)}>Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
