import type { Metadata } from "next";

import { CookieConsentControls } from "@/components/analytics/CookieConsentControls";
import { Breadcrumb } from "@/components/public/Breadcrumb";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

const canonical = absoluteUrl("/cookies");

export const metadata: Metadata = {
  title: "Cookies",
  description: `Cookies et stockage local utilisés par ${site.name}, et comment gérer votre choix pour la mesure d'audience.`,
  alternates: { canonical },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Cookies" }]} />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Cookies et traceurs
      </h1>

      <div className="mt-8 space-y-8 text-base leading-relaxed text-muted">
        <section>
          <p>
            Un cookie (ou une entrée de stockage local du navigateur) est une petite donnée
            déposée sur votre appareil. {site.name} en utilise le moins possible, et liste ici
            exactement ceux réellement utilisés — rien d&apos;autre.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Ce que nous utilisons</h2>
          <ul className="mt-3 space-y-4">
            <li className="rounded-lg border border-line bg-surface px-4 py-3">
              <p className="text-fg">
                <code className="font-mono text-sm">blokprint_cookie_consent</code> — stockage
                local (localStorage), pas un cookie
              </p>
              <p className="mt-1 text-sm">
                Mémorise votre choix pour la mesure d&apos;audience, environ 6 mois. Strictement
                nécessaire au fonctionnement du bandeau de consentement lui-même — ne demande pas
                de consentement séparé.
              </p>
            </li>
            <li className="rounded-lg border border-line bg-surface px-4 py-3">
              <p className="text-fg">
                <code className="font-mono text-sm">_ga</code>,{" "}
                <code className="font-mono text-sm">_ga_&lt;id&gt;</code> — Google Analytics 4
              </p>
              <p className="mt-1 text-sm">
                Mesure d&apos;audience anonymisée (pages visitées, recherches, téléchargements).
                Déposés uniquement si vous acceptez ci-dessous — jamais avant.
              </p>
            </li>
            <li className="rounded-lg border border-line bg-surface px-4 py-3">
              <p className="text-fg">
                <code className="font-mono text-sm">sb-*-auth-token</code> — authentification du
                back-office
              </p>
              <p className="mt-1 text-sm">
                Strictement nécessaire pour qu&apos;un membre de l&apos;équipe reste connecté à
                l&apos;espace d&apos;administration (<code className="font-mono">/admin</code>).
                Ce cookie n&apos;est jamais posé pour un visiteur du site public : il ne concerne
                que la connexion au back-office.
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Gérer votre choix</h2>
          <p className="mt-2">
            Vous pouvez accepter ou refuser la mesure d&apos;audience à tout moment, et revenir
            sur votre choix quand vous le souhaitez.
          </p>
          <div className="mt-4">
            <CookieConsentControls />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Limites d&apos;un refus ou d&apos;un retrait</h2>
          <p className="mt-2">
            Refuser ou retirer votre consentement empêche tout nouveau chargement de Google
            Analytics lors de vos prochaines visites, et supprime immédiatement, dans la mesure du
            possible, les cookies <code className="font-mono">_ga*</code> déjà déposés sur ce
            domaine par votre navigateur. En revanche, cela ne peut pas effacer rétroactivement
            des données déjà transmises aux serveurs de Google avant le retrait — voir la{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              politique de confidentialité de Google
            </a>{" "}
            pour exercer vos droits directement auprès de Google si besoin.
          </p>
        </section>
      </div>
    </div>
  );
}
