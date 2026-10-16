import type { Metadata, Viewport } from "next";
import "@fontsource-variable/figtree";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { config } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SetupNotice } from "@/components/setup-notice";

export const metadata: Metadata = {
  title: { default: `${config.appName} | Car rental made simple`, template: `%s | ${config.appName}` },
  description: "Search available cars for your dates, book online and pay by bank transfer or USSD.",
};

export const viewport: Viewport = { themeColor: "#0f1720" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">{isSupabaseConfigured ? children : <SetupNotice />}</body>
    </html>
  );
}
