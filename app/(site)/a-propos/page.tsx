import type { Metadata } from "next";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const canonical = absoluteUrl("/a-propos");

export const metadata: Metadata = {
  title: "À propos",
  description: `${site.name} recense des constructions Minecraft vérifiées bloc par bloc, avec dimensions, matériaux et fichier téléchargeable pour chacune.`,
  alternates: { canonical },
};

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "À propos" }]} />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        À propos de {site.name}
      </h1>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted">
        <section>
          <h2 className="text-lg font-semibold text-fg">Ce qu&apos;est {site.name}</h2>
          <p className="mt-2">
            {site.name} est un site qui recense des plans de constructions à reproduire dans
            Minecraft : maisons, fermes, décorations et bien d&apos;autres. L&apos;objectif est
            simple : aider à trouver rapidement une construction adaptée à ce qu&apos;on cherche —
            par style, par dimensions, par difficulté ou par les matériaux qu&apos;on a sous la
            main.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Des fiches vérifiées</h2>
          <p className="mt-2">
            Chaque construction marquée « Vérifiée » a été bâtie et testée en jeu par
            l&apos;équipe de {site.name} avant publication : la liste de matériaux, les
            dimensions et le fichier de schématique (Litematica) fourni correspondent réellement
            à ce qui est présenté. Les fiches marquées « Démo » servent uniquement à présenter le
            fonctionnement du site pendant son développement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Indépendance</h2>
          <p className="mt-2">
            {site.name} est un site indépendant, non officiel. Il n&apos;est ni édité par, ni
            affilié à, ni approuvé par Mojang Studios ou Microsoft. Minecraft est une marque de
            Mojang/Microsoft. Voir les{" "}
            <a
              href="/mentions-legales"
              className="text-fg underline underline-offset-2 hover:text-accent"
            >
              mentions légales
            </a>{" "}
            pour le détail.
          </p>
        </section>
      </div>
    </div>
  );
}
