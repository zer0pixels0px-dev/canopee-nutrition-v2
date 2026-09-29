---
name: optimisation-systeme-culture
description: Optimisation du système de culture cannabis indoor — température, VPD, HR, PPFD, DLI, lux, rendement lumière, ventilation entrée/sortie, circulation d’air, CO2 ambiant, EC/pH drainage. Utiliser pour réglages de chambre de floraison ou végétative, diagnostic de frisage/oïdium, dimensionnement CFM, et recommandations sourcées pour setup LED+HPS ou Promix. Déclenché par questions sur environnement, lumière, air ou paramètres de salle.
---

# Optimisation Système Culture Cannabis

## Objectif

Fournir des recommandations **précises, sourcées et actionnables** pour optimiser l’environnement de culture indoor (température, HR, VPD, lumière, ventilation, CO2, EC). Ne jamais inventer de valeurs. Toujours citer les sources (études peer-reviewed ou guides consensuels) et adapter aux données connues de l’utilisateur.

## Données connues de l’utilisateur (à conserver et mettre à jour)

- **Salle #1** : 11 ft × 28 ft × 7.8 ft ≈ 2442 ft³ (69 m³), 64 plantes, 10× DE 1000 W + 10× Ridgetop LED.
- **Total** ≈ 130 plantes en 4e semaine de floraison.
- **Sans injection de CO2**.
- Substrat **Promix**.
- Lecture luxmètre ≈ 15 000 lux (non fiable pour conversion exacte LED/HPS).
- Capteur CO2 indiquant 200–300 ppm (anormalement bas → vérifier étalonnage).
- pH drainage ≈ 6,3 ; EC drainage ≈ 2,3 (échelle à confirmer).
- **Problèmes** : trop d’humidité → oïdium (mildew) sur feuilles, frisage possible, canopée dense.
- **Salle #2** : dimensions non encore fournies.

Mettre à jour ce bloc dès que l’utilisateur fournit de nouvelles mesures (température, HR, PPFD réels, dimensions, EC entrée, etc.).

## Workflow obligatoire

1. **Identifier le paramètre demandé** (température, VPD, PPFD/DLI, ventilation, CO2, EC/pH…).
2. **Charger la fiche référence** correspondante dans `references/`.
3. **Appliquer les données utilisateur** (stade, CO2 ambiant, setup LED+HPS, Promix).
4. **Répondre avec plages + justification sourcée** + action concrète.
5. **Toujours rappeler** : mesurer avec les bons outils (PAR meter pour PPFD, hygromètre calibré, etc.) et respecter le permis/réglementation locale.
6. Si dimensions des salles manquent pour un calcul CFM → demander longueur × largeur × hauteur.

## Règles strictes

- **Sources uniquement** : études peer-reviewed (ex. Rodriguez-Morrison et al. 2021, Frontiers in Plant Science) + consensus de guides techniques fiables. Pas de forums non vérifiés.
- **Sans CO2 enrichi** : plafonner PPFD ≈ 800–950 µmol/m²/s en floraison (diminishing returns + risque stress au-delà).
- **VPD prioritaire** sur RH seule : calculer ou utiliser tableau (feuille ~1–2 °C plus froide sous LED, plus chaude sous HPS).
- **Augmentations progressives** : lumière par paliers de 5–10 % seulement après stabilisation environnement + EC.
- **Ventilation** : pression négative légère, exhaust dimensionné sur volume + pertes filtre/conduit, intake ≈ 70–80 % de l’exhaust.
- **Ne jamais recommander** de valeurs extrêmes sans justification de stabilité (temp/HR/EC/oïdium).
- En Promix : piloter par EC entrée vs drainage (écart > 0,3–0,4 → réduire apport).

## Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `references/ppfd-dli.md` | Plages PPFD/DLI par stade, formules, sources (Guelph 2021 + consensus) |
| `references/vpd-temp-hr.md` | Tableaux VPD, temp/HR par stade, formule SVP, risques frisage/oïdium |
| `references/ventilation-cfm.md` | Calcul CFM volume, pertes filtre/conduit, intake/exhaust, circulation |
| `references/co2-ec-ph.md` | CO2 ambiant vs enrichi, conversion ppm/EC, pH Promix, drainage |
| `references/utilisateur-setup.md` | Snapshot des données actuelles de l’utilisateur + historique des conseils |

## Exemples de tâches

- « Quel PPFD viser pour mes 130 plantes en semaine 4 flower sans CO2 ? »
- « Mon VPD est trop élevé à 27 °C / 40 % HR — que faire ? »
- « Calcule le CFM exhaust pour ma salle de X m³ »
- « Comment régler les 10 LED + 10 HPS pour uniformité ? »
- « Mon capteur CO2 lit 250 ppm — est-ce normal ? »
- « Diagnostic frisage + oïdium possible »

## Mise à jour

Quand l’utilisateur fournit de nouvelles mesures (dimensions, relevés PAR, EC entrée, etc.), mettre à jour `references/utilisateur-setup.md` et le bloc « Données connues » de ce SKILL.md.

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Define the functionality provided by this skill, including detailed instructions and examples