import React from "react";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import BookDoctorLogo from "./logo";

export default function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto w-full bg-tree-dark text-white rounded-2xl ring-1 ring-white/10 overflow-hidden">
        {/* content */}
        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-3">
          {/* brand / blurb */}
          <div>
            <BookDoctorLogo
              className="h-10 w-auto"
              textClassName="text-white-900 dark:text-white"
              accentClassName="text-blue-600 dark:text-blue-400"
              strokeClassName="text-white-900 dark:text-white"
              showTagline={false}
            />
            <p className="mt-3 text-sm text-white/70">
              100% digital booking — fast, easy, no calls or clinic visits just
              to check availability.
            </p>
          </div>

          {/* contact */}
          <div className="flex">
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-white/10 ring-1 ring-white/15">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </span>
                <a
                  href="mailto:hello@bookdoctor.demo"
                  className="text-sm hover:text-blue-300"
                >
                  hello@bookdoctor.demo
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-white/10 ring-1 ring-white/15">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </span>
                <a
                  href="tel:+212600000000"
                  className="text-sm hover:text-blue-300"
                >
                  +212 600 000 000
                </a>
              </li>
            </ul>
          </div>
          {/* bottom bar */}
          <div className="flex flex-col sm:flex-row items-end justify-end gap-2 text-xs text-white/60">
            <span>Created at 2025</span>
            <span>
              © {new Date().getFullYear()} BookDoctor. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
