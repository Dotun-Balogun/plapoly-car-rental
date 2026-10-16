"use client";

import Link from "next/link";
import { useTransition } from "react";
import { DropdownMenu } from "radix-ui";
import { CalendarCheck, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function UserMenu({ name, email, isAdmin }: { name: string; email: string; isAdmin: boolean }) {
  const [pending, startTransition] = useTransition();
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  const item =
    "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-muted";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary">
        <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-sm font-bold">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">{name.split(" ")[0] || "Account"}</span>
        <ChevronDown className="size-4 opacity-70" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="bg-popover text-popover-foreground z-50 w-60 rounded-xl border p-1.5 shadow-xl"
        >
          <div className="border-b px-3 py-2.5">
            <p className="truncate text-sm font-semibold">{name || "Your account"}</p>
            <p className="text-muted-foreground truncate text-xs">{email}</p>
          </div>
          <div className="pt-1.5">
            <DropdownMenu.Item asChild>
              <Link href="/reservations" className={item}>
                <CalendarCheck className="size-4" /> My bookings
              </Link>
            </DropdownMenu.Item>
            {isAdmin && (
              <DropdownMenu.Item asChild>
                <Link href="/admin" className={item}>
                  <LayoutDashboard className="size-4" /> Admin dashboard
                </Link>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item
              disabled={pending}
              className={`${item} w-full text-left`}
              onSelect={(event) => {
                event.preventDefault();
                startTransition(() => logout());
              }}
            >
              <LogOut className="size-4" /> {pending ? "Logging out..." : "Log out"}
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}