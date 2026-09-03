import type { Metadata } from "next";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { publisher } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

const canonical = absoluteUrl("/contact");

export const metadata: Metadata = {
  title: "Contact",
  description: `Comment contacter l'équipe de ${site.name}.`,
  alternates: { canonical },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Contact" }]} />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Contact
      </h1>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-muted">
        <p>
          Pour toute question sur {site.name}, une construction, ou pour exercer vos droits sur
          vos données personnelles (voir la page{" "}
          <a href="/confidentialite" className="text-fg underline underline-offset-2 hover:text-accent">
            Confidentialité
          </a>
          ), vous pouvez nous écrire à :
        </p>
        <p className="text-lg text-fg">{publisher.email}</p>
        <p className="text-sm">
          Adresse à activer avant le lancement public du site (voir les{" "}
          <a href="/mentions-legales" className="underline underline-offset-2 hover:text-accent">
            mentions légales
          </a>
          ).
        </p>
      </div>
    </div>
  );
}
