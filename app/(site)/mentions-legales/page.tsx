import type { Metadata } from "next";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { host, publisher } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

const canonical = absoluteUrl("/mentions-legales");

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de ${site.name} : éditeur, hébergement, propriété intellectuelle.`,
  alternates: { canonical },
};

/**
 * Base technique raisonnable — PAS une consultation juridique. Les champs
 * `publisher.*` sont des placeholders explicites (voir lib/legal.ts) tant
 * que l'identité légale réelle de l'éditeur n'a pas été fournie ; ce sera
 * à faire vérifier avant tout lancement commercial réel.
 */
export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]} />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Mentions légales
      </h1>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted">
        <section>
          <h2 className="text-lg font-semibold text-fg">Éditeur du site</h2>
          <dl className="mt-2 space-y-1">
            <div>
              <dt className="inline text-fg">Nom : </dt>
              <dd className="inline">{publisher.name}</dd>
            </div>
            <div>
              <dt className="inline text-fg">Statut : </dt>
              <dd className="inline">{publisher.legalForm}</dd>
            </div>
            <div>
              <dt className="inline text-fg">Contact : </dt>
              <dd className="inline">{publisher.email}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm">
            Conformément à l&apos;article 1-1 de la loi n°2004-575 du 21 juin 2004 (LCEN),
            l&apos;éditeur, qui agit à titre non professionnel, a communiqué ses éléments
            d&apos;identification à son hébergeur, dont les coordonnées figurent ci-dessous.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Directeur de la publication</h2>
          <p className="mt-2">{publisher.publicationDirector}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Hébergement</h2>
          <p className="mt-2">
            {host.name}
            <br />
            {host.address}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Propriété intellectuelle</h2>
          <p className="mt-2">
            Le contenu original de {site.name} (textes, mise en page, code, base de données des
            constructions) est protégé par le droit d&apos;auteur. Toute reproduction sans
            autorisation est interdite, sauf usage strictement personnel.
          </p>
          <p className="mt-2">
            Les icônes de matériaux affichées sur les fiches construction reproduisent l&apos;
            apparence d&apos;objets du jeu Minecraft ; elles sont utilisées à titre purement
            descriptif pour identifier les blocs nécessaires à chaque construction, et restent la
            propriété de Mojang/Microsoft.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Minecraft et Mojang</h2>
          <p className="mt-2">
            {site.name} est un site indépendant. Il n&apos;est pas un produit officiel Minecraft,
            n&apos;est ni approuvé par, ni associé à Mojang Studios ou Microsoft. « Minecraft »
            est une marque déposée de Mojang Studios/Microsoft. Cette mention est faite
            conformément aux{" "}
            <a
              href="https://www.minecraft.net/en-us/usage-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg underline underline-offset-2 hover:text-accent"
            >
              Minecraft Usage Guidelines
            </a>{" "}
            publiées par Mojang.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Contact</h2>
          <p className="mt-2">
            Pour toute question relative au site, voir la page{" "}
            <a
              href="/contact"
              className="text-fg underline underline-offset-2 hover:text-accent"
            >
              Contact
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
