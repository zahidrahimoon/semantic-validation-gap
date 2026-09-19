import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "mono — workshop booking testbed",
  description: "Research testbed for structural vs. semantic input validation",
};

const nav = [
  ["/courses", "Courses"],
  ["/admin/courses/new", "Admin: new course"],
  ["/profile", "Profile"],
  ["/support", "Support"],
  ["/assistant", "Assistant"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <header className="border-b-2 border-black">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
            <Link href="/" className="text-xl font-black tracking-tight">
              mono
            </Link>
            <nav className="flex flex-wrap gap-x-4 text-sm">
              {nav.map(([href, label]) => (
                <Link key={href} href={href} className="underline-offset-4 hover:underline">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl border-t border-black px-4 py-4 text-xs text-muted-foreground">
          Research testbed — semantic-validation-gap. Demo users only, no authentication.
        </footer>
      </body>
    </html>
  );
}
