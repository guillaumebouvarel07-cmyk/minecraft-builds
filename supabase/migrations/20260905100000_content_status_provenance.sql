-- Étape 18 : distinction contenu de démonstration / contenu vérifié, et
-- traçabilité de la provenance (obligatoire avant de considérer une fiche
-- comme un véritable plan vérifié).
--
-- content_status reste volontairement à deux valeurs (demo/verified) —
-- pas de statut éditorial élaboré. "demo" est la valeur par défaut : les
-- 15 constructions actuelles basculent automatiquement dessus sans script
-- de migration de données séparé.
create type content_status as enum ('demo', 'verified');

-- source_type distingue les trois provenances possibles évoquées à
-- l'étape 18 : contenu créé par nous, fourni par un créateur avec son
-- autorisation, ou sous licence compatible. Volontairement pas de valeur
-- "scrapé"/"inconnu" — si la provenance n'est pas connue, la fiche ne
-- doit simplement pas pouvoir passer en verified (voir la contrainte
-- ci-dessous).
create type construction_source_type as enum (
  'interne',
  'autorisation_createur',
  'licence_compatible'
);

alter table constructions
  add column content_status content_status not null default 'demo',
  add column creator_name text,
  add column source_type construction_source_type,
  add column source_url text,
  add column license text,
  add column permission_note text,
  -- Confirmation explicite et distincte d'un simple champ texte rempli :
  -- une case à cocher qu'un·e admin doit délibérément activer, plutôt que
  -- de déduire un "droit de publier" à partir de la présence d'une note.
  add column rights_confirmed boolean not null default false;

-- Garde-fou au niveau base : les champs de provenance SUR LA MÊME LIGNE
-- sont vérifiables par une contrainte CHECK. La complétude relationnelle
-- (au moins une image/un matériau/un tag) ne l'est pas proprement pour du
-- un-vers-plusieurs — cette partie reste validée côté application, voir
-- lib/content-status.ts. Double barrière : même en cas de bug applicatif,
-- Postgres refuse un verified sans provenance ni confirmation de droits.
alter table constructions
  add constraint verified_requires_provenance
  check (
    content_status <> 'verified'
    or (
      creator_name is not null
      and trim(creator_name) <> ''
      and source_type is not null
      and rights_confirmed = true
    )
  );
