import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/actions/auth";
import { getAdminUser } from "@/lib/auth/admin";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/constructions", label: "Constructions" },
];

/**
 * Deuxième vérification, indépendante du middleware : si jamais une requête
 * atteignait ce layout sans être passée par le middleware (mauvaise config,
 * cache, etc.), l'accès reste bloqué ici. On ne fait jamais confiance à un
 * seul point de contrôle.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-6">
        <nav className="flex items-center gap-5">
          <span className="text-sm font-medium">Administration</span>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted hover:text-fg">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
