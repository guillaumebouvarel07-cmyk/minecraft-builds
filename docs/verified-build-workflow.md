# Workflow de création d'une construction "verified"

Document de référence, réutilisable pour **toutes** les futures constructions réelles — pas seulement la première. Rien ici ne remplace un vrai build testé en jeu : ce document définit *comment* mesurer, capturer et documenter, jamais les valeurs elles-mêmes.

## A. Concept recommandé pour le premier build

**Petite maison de survie pour débutant.**

- Un lit, un espace de rangement (coffres), un coin artisanat (table d'artisanat + fourneau), une entrée protégée contre les mobs, un éclairage suffisant à l'intérieur comme aux abords pour empêcher tout spawn.
- Structure principale en bois + pierre/cobblestone, toit à deux pentes, au moins une fenêtre en verre.
- Volontairement modeste : ni donjon, ni ferme, ni grande demeure — l'objectif est une première fiche *complète et honnête*, pas un build impressionnant.

**Pourquoi celui-ci plutôt qu'un autre concept du catalogue demo :**
- Une ferme (automatique ou non) implique de la redstone/mécanique à documenter et vérifier en plus de la structure — plus de surface d'erreur pour une première fiche.
- Un château ou un grand bâtiment moderne demande un temps de construction et une liste de matériaux bien plus longue à compter et vérifier.
- Une décoration seule est moins "utile en Survival" que ne le demande la consigne.
- Une maison de débutant reste le build le plus universellement recherché par un joueur qui débute une partie — fort potentiel de recherche/intérêt réel.

Aucune donnée de "Petite Maison de Débutant" (demo actuelle) ne doit être reprise telle quelle — seul le *concept général* sert d'inspiration ; toutes les valeurs (dimensions, matériaux, quantités) doivent venir du vrai build.

## B. Version Minecraft recommandée

**Java Edition, dernière version stable correspondant à la base de notre catalogue de matériaux (26.2).**

Si une version stable plus récente est sortie au moment où tu construis, utilise-la — l'important n'est pas un numéro figé mais la traçabilité : note le numéro **exact** affiché sur l'écran de création du monde (pas juste "1.21", la version complète telle qu'affichée). Évite toute snapshot/pre-release/version de test : une fiche "verified" doit être reproductible par n'importe qui sur une version stable standard.

## C. Java / Bedrock

**Java uniquement pour cette première fiche.**

Déclarer `edition = "both"` sans avoir réellement testé le build sur Bedrock serait trompeur — les ID de blocs, certains mécanismes et le comportement des mobs diffèrent parfois entre les deux éditions. `both` ne devra être utilisé que le jour où une vraie vérification Bedrock aura eu lieu sur cette construction précise. Règle à appliquer pour **toutes** les futures fiches, pas seulement celle-ci.

## D. Dimensions cibles (objectif, pas donnée vérifiée)

Approximativement **9 × 9 blocs au sol, 6 à 7 blocs de hauteur** (faîtage du toit compris) — un ordre de grandeur pour cadrer l'ambition du build, **pas une mesure**. Les dimensions réelles viendront exclusivement de la bounding box du schematic (voir section G).

## E. Protocole de construction

1. **Créer un monde de test** dédié (Créatif, n'importe quelle seed — un terrain plat facilite le nivellement mais n'est pas obligatoire). Ne pas réutiliser un monde de survie existant : le protocole de comptage suppose que tout bloc dans la sélection appartient au build.
2. **Choisir la version** stable définie en (B) dès l'écran de création — noter le numéro exact affiché.
3. **Construire la maison** selon le concept (A), en gardant à l'esprit qu'elle doit être réellement fonctionnelle (voir point 5).
4. **Mesurer les dimensions** via la sélection Litematica (voir section G) — jamais une estimation à l'œil.
5. **Vérifier l'utilisabilité réelle** : porte qui s'ouvre/se ferme sans bug, lit utilisable (dormir de nuit sans obstruction), stockage accessible, coin artisanat complet (table d'artisanat + fourneau accessibles), aucun spot où un mob pourrait spawn à l'intérieur (niveau de lumière ≥ 8 partout), sortie de secours si applicable.
6. **Compter les matériaux** via la Material List de Litematica (jamais un comptage manuel bloc par bloc — voir section F).
7. **Produire le fichier** `.litematic` (voir section G) et le nommer selon la convention (section J).
8. **Prendre les captures** selon le standard (section H).
9. **Remplir la fiche de travail** (section ci-dessous) avec les données réellement mesurées, puis me les transmettre (section M).

## F. Comptage des matériaux

Ne compte jamais 700 blocs à la main. Utilise la **Material List** intégrée à Litematica (menu du schematic une fois créé) : elle donne le décompte exact, par type de bloc, de tout ce que contient la sélection.

Pour chaque ligne de la Material List :
1. Note le nom du bloc et sa quantité exacte tels qu'affichés.
2. Retrouve son `minecraft_id` correspondant dans notre catalogue (`/admin` → recherche de matériau, ou directement dans `supabase/seed/materials-java-26-2.json`) — ne devine jamais un ID, vérifie-le dans le catalogue existant (758 entrées). S'il manque un bloc que tu as utilisé, dis-le-moi plutôt que d'inventer/approximer un ID proche.

## G. Procédure Litematica (Java uniquement)

Litematica nécessite un client Fabric (mod), uniquement pour la phase de création/export — les joueurs qui téléchargeront le fichier plus tard auront eux aussi besoin de Litematica pour l'utiliser, ce qui est normal pour ce format.

1. **Installer** : Fabric Loader + Fabric API + MaLiLib + Litematica, sur la version choisie en (B).
2. **Sélectionner la construction** : avec l'outil de sélection Litematica, place les deux coins de la sélection de façon à englober tout le build (murs extérieurs inclus, faîtage du toit inclus) et **rien d'autre** — pas de terrain environnant superflu.
3. **Lire la taille de la sélection** dans le panneau d'info Litematica (Area Selection) : il affiche la taille selon les trois axes — c'est la source de vérité pour les dimensions (voir convention en section suivante), pas un calcul manuel de coordonnées F3.
4. **Créer le schematic** ("Create Schematic" depuis la sélection).
5. **Ouvrir la Material List** du schematic créé pour le comptage (section F).
6. **Sauvegarder le fichier `.litematic`** (dossier `.minecraft/schematics/` par défaut), puis le renommer selon la convention (section J) avant de me l'envoyer.

Aucune modification du site n'est nécessaire pour cette procédure — c'est un workflow 100% côté joueur/Minecraft.

## Convention de dimensions (à utiliser pour TOUTES les futures constructions)

```
width  = axe X   (la taille X affichée par la sélection Litematica)
length = axe Z   (la taille Z affichée par la sélection Litematica)
height = axe Y   (la taille Y affichée par la sélection Litematica)
```

Ça correspond au système de coordonnées natif de Minecraft (X/Z = plan horizontal, Y = vertical) et à ce qu'affiche directement Litematica — aucune conversion à faire. Toujours utiliser exactement la taille de la bounding box du schematic, jamais une estimation.

## H. Standard screenshots (pour toutes les futures fiches)

- **Résolution** : 1920×1080 minimum.
- **HUD** : masqué (F1) — aucune barre de vie/faim/hotbar visible.
- **Shaders** : aucun pour l'instant — reste cohérent et reproductible d'une fiche à l'autre sans dépendre d'un pack spécifique qui pourrait fausser les couleurs réelles des blocs. Un resource pack neutre (vanilla ou très proche) est acceptable si utilisé de façon identique sur toutes les fiches.
- **FOV** : valeur par défaut (70) — évite tout effet fisheye qui déformerait les proportions du build.
- **Heure/météo** : fixées et identiques sur toutes les prises d'une même fiche — `/time set day` (ou 6000 ticks) et `/weather clear`, pour une lumière constante et comparable entre constructions.
- **À éviter** : joueurs/mobs dans le cadre, autres builds visibles en arrière-plan, inventaire ou menu ouvert, nuit/pluie (sauf si un jour on documente volontairement une ambiance nocturne pour un concept qui s'y prête).

**Prises à réaliser** : vue principale (avant, cadrée pour la cover — voir section I), vue arrière, vue de côté, vue intérieure, vue légèrement aérienne (spectateur ou F5 reculé) si elle apporte un vrai plus.

## I. Image principale (cover)

La même image "position 0" est utilisée à **trois formats différents** selon l'endroit du site (vérifié dans le code) :
- carte de listing (homepage, catégories, tags, recherche) : recadrée en **4:3**
- vue principale de la fiche construction : recadrée en **16:9**
- miniature de galerie (si utilisée comme image secondaire ailleurs) : recadrée en **1:1**

Toutes ces recadrages sont centrés et automatiques (`object-cover`) — il n'y a qu'UN seul fichier à fournir pour la cover, mais il doit survivre aux trois recadrages sans perdre l'essentiel du build.

**Consigne de cadrage** : capture en 16:9 (1920×1080), avec le bâtiment centré et une marge confortable de chaque côté — le build ne doit occuper ni toute la largeur ni toute la hauteur du cadre. Concrètement : laisse au moins ~15-20% de marge de chaque côté horizontalement (pour survivre au recadrage carré, le plus agressif) et un peu de ciel/sol au-dessus et en dessous (pour le recadrage 4:3). Angle légèrement en contre-plongée ou de face, jamais un angle qui coupe une partie importante (toit, entrée) en bord de cadre.

## Description — squelette (à remplir avec le vrai contenu, pas à inventer)

```
[Ce qu'est la construction — 1 à 2 phrases concrètes]

Pensée pour [type de joueur / contexte d'usage].

Caractéristiques : [matériaux dominants, style, éléments notables].

À l'intérieur : [ce qu'on y trouve réellement — lit, rangement, artisanat...].

Compatible [édition] [version], difficulté [niveau] — [pourquoi ce niveau,
en une phrase honnête].
```

Pas de superlatifs non justifiés, pas de répétition de mots-clés — une description utile, pas une description qui essaie de "faire du SEO".

## K. Tags candidats (à confirmer une fois le build terminé)

D'après les tags existants et le concept : `Starter`, `Small`, `Easy`, `Survival`. Ne garder que ceux réellement vérifiés après coup — si le build finit par être plus grand ou plus complexe que prévu, retire `Small`/`Easy` en conséquence plutôt que de forcer la cohérence avec ce document.

## Fiche de travail (à remplir avec les vraies données)

| Champ | Valeur |
|---|---|
| Nom final | *(à définir)* |
| Version Minecraft testée | *(numéro exact affiché en jeu)* |
| Édition | Java (voir section C) |
| Largeur (X) | *(mesurée)* |
| Longueur (Z) | *(mesurée)* |
| Hauteur (Y) | *(mesurée)* |
| Difficulté | *(à évaluer une fois le build terminé — probablement Facile)* |
| Catégorie | Maisons |
| Style | *(ex : rustique, si pertinent une fois construit)* |
| Description | *(voir squelette ci-dessus)* |
| Tags | *(voir section K, à confirmer)* |
| Matériaux + quantités | *(Material List Litematica, section F)* |
| Créateur | *(ton nom/pseudo)* |
| Provenance | `interne` (voir section L) |
| Fichier | `.litematic` (voir section J ci-dessous pour le nommage) |
| Screenshots | vue principale + arrière + côté + intérieur (+ aérienne si utile) |

## J. Convention de nommage du fichier

```
<slug-de-la-construction>-v1.litematic
```

Exemple : `maison-survie-debutant-v1.litematic`.

**Gestion d'une future V2** : ne jamais écraser le fichier `v1`. Une V2 du même concept devient soit un second fichier (`maison-survie-debutant-v2.litematic`) attaché à la même fiche si c'est une simple amélioration du même build, soit une fiche entièrement séparée (nouveau slug) si c'est un build suffisamment différent pour mériter sa propre page. On tranchera au cas par cas quand une vraie V2 existera — pas de règle figée à inventer maintenant.

## Notion de version de build en base (`build_version`) — analyse

**Pas ajoutée maintenant.** C'est la toute première construction réelle : il n'existe encore aucun scénario concret de "plusieurs versions du même build" à gérer. Ajouter une colonne `build_version` aujourd'hui serait de l'anticipation sans bénéfice immédiat — la convention de nommage de fichier (ci-dessus) suffit largement tant qu'on n'a pas de vrai second cas. À reconsidérer le jour où une vraie V2 se présente, avec le cas réel sous les yeux plutôt qu'un cas hypothétique.

## L. Provenance pour cette construction

- `source_type` = `interne`
- `creator_name` = ton nom ou pseudo (à me donner, je ne l'invente pas)
- `source_url` = laisser vide (pas de source externe pour du contenu créé par nous)
- `license` = laisser vide, sauf si tu souhaites explicitement autoriser la réutilisation par d'autres sous une licence précise (ton choix à faire, pas une valeur par défaut)
- `permission_note` = optionnel, ex. "Création originale pour Blokprint"
- `rights_confirmed` = coché (c'est bien ta propre création)

## M. Checklist "verified" — ce qu'il faut m'envoyer

Une fois le build terminé, envoie-moi :

1. Le fichier `.litematic` (nommé selon la convention J).
2. Les screenshots (vue principale + les autres vues du standard H).
3. Les dimensions mesurées (X/Y/Z lues dans Litematica).
4. La Material List complète (capture ou liste texte).
5. Le nom final, la version Minecraft exacte, le style si pertinent.
6. Ton nom/pseudo pour `creator_name`.
7. Confirmation que tu as bien testé l'utilisabilité (point 5 du protocole).

Avec ces éléments, je pourrai vérifier précisément la fiche contre la checklist de l'étape 18 (`lib/content-status.ts`) et te dire si elle est prête à passer `verified`, point par point — sans rien compléter à ta place.
