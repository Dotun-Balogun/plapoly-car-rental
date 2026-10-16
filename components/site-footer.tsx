import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { config } from "@/lib/config";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-ink mt-auto text-white/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed">
            Clean, well-kept cars you can book online. Pick your dates, see what is free, and pay by bank transfer or USSD.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/vehicles" className="hover:text-white">Browse vehicles</Link></li>
            <li><Link href="/reservations" className="hover:text-white">My bookings</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Need help?</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4" />
              <a href={`tel:${config.supportPhone}`} className="hover:text-white">{config.supportPhone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              <a href={`mailto:${config.supportEmail}`} className="hover:text-white">{config.supportEmail}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {config.appName}. All rights reserved.
      </div>
    </footer>
  );
}
