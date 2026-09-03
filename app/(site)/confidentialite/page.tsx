import type { Metadata } from "next";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { dataProcessors, publisher } from "@/lib/legal";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

const canonical = absoluteUrl("/confidentialite");

export const metadata: Metadata = {
  title: "Confidentialité",
  description: `Politique de confidentialité de ${site.name} : données réellement traitées, finalités, destinataires et droits RGPD.`,
  alternates: { canonical },
};

/**
 * Décrit uniquement les traitements réellement présents ou préparés dans
 * le code au moment de l'étape 21 — pas de traitement inventé, pas de
 * traitement existant omis. Base technique, pas une consultation
 * juridique : à faire vérifier avant tout lancement commercial réel.
 */
export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Confidentialité" }]} />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Politique de confidentialité
      </h1>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted">
        <section>
          <h2 className="text-lg font-semibold text-fg">Responsable du traitement</h2>
          <p className="mt-2">
            {publisher.name} (voir les{" "}
            <a href="/mentions-legales" className="text-fg underline underline-offset-2 hover:text-accent">
              mentions légales
            </a>{" "}
            pour l&apos;identité complète).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Ce que {site.name} ne collecte pas</h2>
          <p className="mt-2">
            {site.name} ne propose aucun compte utilisateur public, aucun formulaire d&apos;
            inscription, et ne demande jamais d&apos;informations personnelles pour consulter ou
            télécharger une construction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Données réellement traitées</h2>
          <dl className="mt-3 space-y-5">
            <div>
              <dt className="font-medium text-fg">Journaux techniques d&apos;hébergement</dt>
              <dd className="mt-1">
                Comme tout site web, l&apos;hébergeur ({dataProcessors[0].name}) génère des
                journaux techniques nécessaires au fonctionnement et à la sécurité (adresse IP,
                horodatage, page demandée), indépendamment de tout consentement — ce n&apos;est
                pas un traitement mis en place par {site.name}, mais une conséquence
                incontournable de l&apos;hébergement d&apos;un site sur Internet.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-fg">Base de données du catalogue</dt>
              <dd className="mt-1">
                {dataProcessors[1].role} Ces données concernent le contenu du site (constructions,
                matériaux, images), pas les visiteurs.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-fg">Mesure d&apos;audience (Google Analytics 4)</dt>
              <dd className="mt-1">
                Chargée uniquement après consentement explicite — voir la page{" "}
                <a href="/cookies" className="text-fg underline underline-offset-2 hover:text-accent">
                  Cookies
                </a>
                . Selon la documentation officielle de Google, GA4 n&apos;enregistre pas l&apos;
                adresse IP : elle sert brièvement à déterminer une localisation approximative
                (pays, région, ville) puis est immédiatement écartée (
                <a
                  href="https://support.google.com/analytics/answer/12017362"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-accent"
                >
                  support.google.com
                </a>
                ). Les données d&apos;événements sont conservées 14 mois au maximum (durée par
                défaut d&apos;une propriété GA4, paramétrable dans Google Analytics — pas un
                réglage du code de ce site).
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Base légale</h2>
          <p className="mt-2">
            Consentement pour la mesure d&apos;audience (GA4) ; intérêt légitime et nécessité
            technique pour les journaux d&apos;hébergement, indispensables au fonctionnement et à
            la sécurité du site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Destinataires et sous-traitants</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {dataProcessors.map((processor) => (
              <li key={processor.name}>
                <span className="text-fg">{processor.name}</span> — {processor.role}{" "}
                <a
                  href={processor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-accent"
                >
                  Politique de confidentialité
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Transferts hors Union européenne</h2>
          <p className="mt-2">
            L&apos;hébergement (Vercel) et Google Analytics (au-delà de son entité européenne)
            peuvent impliquer un transfert de données vers les États-Unis. Ces prestataires
            s&apos;engagent contractuellement à appliquer des garanties reconnues par le RGPD
            (clauses contractuelles types) — voir leurs politiques de confidentialité respectives
            ci-dessus pour le détail.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Vos droits</h2>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, d&apos;opposition, de limitation et de portabilité sur vos données.
            Pour l&apos;exercer, voir la page{" "}
            <a href="/contact" className="text-fg underline underline-offset-2 hover:text-accent">
              Contact
            </a>
            . Vous disposez également du droit d&apos;introduire une réclamation auprès de la{" "}
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg underline underline-offset-2 hover:text-accent"
            >
              CNIL
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
