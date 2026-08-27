import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <p className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        Administration
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-1.5 text-sm text-muted">Accès réservé à l&apos;administrateur du site.</p>
      <LoginForm />
    </div>
  );
}
