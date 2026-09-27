# MVP — ARCHITECTURE ÉCRAN PAR ÉCRAN

## 0. Navigation globale

La navigation principale sera :

```text
┌────────────────────────────────────────────┐
│ 🌱 CULTURE PLANNER                         │
├────────────────────────────────────────────┤
│                                            │
│ 🏠 Tableau de bord                         │
│ 📐 Environnements                          │
│ 🌱 Cultures                                │
│ ⚙ Équipements                              │
│ 📊 Données                                 │
│ ⚠ Diagnostic                               │
│                                            │
│ ────────────────────────────────────────   │
│                                            │
│ ⚙ Paramètres                               │
│                                            │
└────────────────────────────────────────────┘
```

Sur ordinateur : menu latéral.

Sur téléphone : barre de navigation inférieure.

---

# 1. Écran d'accueil / Tableau de bord

## Objectif

Donner immédiatement l'état général de l'installation.

### Structure

```text
┌──────────────────────────────────────────────┐
│ Tableau de bord                         👤   │
├──────────────────────────────────────────────┤
│                                              │
│ Bonjour                                      │
│ Voici l'état de vos environnements.          │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 🌱 Ma salle de culture                   │ │
│ │                                          │ │
│ │ État général                             │ │
│ │ ████████░░ 87 %                          │ │
│ │                                          │ │
│ │ 🌡 24,2 °C     💧 58 %                   │ │
│ │ 💡 Bon         🌬 À surveiller           │ │
│ │                                          │ │
│ │ [Ouvrir] [Diagnostic]                    │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [+ Ajouter un environnement]                 │
│                                              │
└──────────────────────────────────────────────┘
```

### Boutons

**Ouvrir**

→ ouvre l'environnement.

**Diagnostic**

→ ouvre directement le diagnostic.

**Ajouter un environnement**

→ lance l'assistant de création.

### Si aucun environnement existe

Afficher :

> Vous n'avez pas encore créé d'environnement.

Bouton :

**+ Créer mon premier environnement**

---

# 2. Écran « Mes environnements »

## Objectif

Gérer plusieurs espaces.

```text
MES ENVIRONNEMENTS

[ + Ajouter ]

┌───────────────────────┐
│ 🌱 Salle principale   │
│ 2,40 × 1,80 × 2,20 m │
│                       │
│ État : 87 %           │
│                       │
│ [Ouvrir]       ⋮      │
└───────────────────────┘

┌───────────────────────┐
│ 🌱 Serre              │
│ 3 × 4 × 2,5 m         │
│                       │
│ État : 92 %           │
│                       │
│ [Ouvrir]       ⋮      │
└───────────────────────┘
```

### Menu ⋮

```text
Modifier
Dupliquer
Renommer
Archiver
Supprimer
```

### Sécurité

La suppression demande confirmation :

> Supprimer cet environnement ?

> Cette action supprimera également ses zones, équipements et données associées.

**[Annuler] [Supprimer]**

---

# 3. Écran « Créer un environnement »

Cet écran est un assistant.

Il doit éviter de présenter 30 champs simultanément.

---

## Étape 1 — Identification

```text
Créer votre environnement

Nom
[ Ma salle de culture          ]

Type d'espace

○ Pièce
○ Tente
○ Serre
○ Armoire
○ Autre

[Annuler]                    [Continuer]
```

### Actions

**Continuer**

→ valide les données et passe à l'étape 2.

**Annuler**

→ demande confirmation si des données ont déjà été saisies.

---

# 4. Création — Étape 2 : dimensions

```text
Dimensions

Unité
[ Métrique ▼ ]

Largeur
[ 2,40 ] m

Profondeur
[ 1,80 ] m

Hauteur
[ 2,20 ] m

☐ Dimensions approximatives

[← Retour]                  [Continuer]
```

### Validation

Les champs doivent :

- être numériques ;
- être supérieurs à zéro ;
- accepter les décimales.

Si l'utilisateur coche :

**Dimensions approximatives**

l'application affiche un petit indicateur :

> Estimation

Cette information sera conservée dans la base de données.

---

# 5. Création — Étape 3 : zones

```text
Zones

Comment souhaitez-vous organiser
votre environnement ?

○ Une seule zone

○ Plusieurs zones

                 [Ajouter une zone]
```

Si plusieurs zones :

```text
ZONE 1

Nom
[ Zone principale ]

Largeur
[ 2,40 ] m

Profondeur
[ 1,80 ] m

Utilisation
[ Culture ▼ ]

[ + Ajouter une zone ]
```

Bouton :

**Continuer**

---

# 6. Création — Étape 4 : cultures

L'utilisateur peut ajouter les plantes maintenant ou plus tard.

```text
Ajouter une culture

[ + Ajouter une culture ]

────────────────────────────

Aucune culture ajoutée.

Vous pourrez également le faire plus tard.

[← Retour]             [Passer cette étape]
```

### Ajouter une culture

Fenêtre :

```text
Nouvelle culture

Nom
[ Culture principale ]

Plante
[ Rechercher une plante... ]

Quantité
[ 6 ]

Zone
[ Zone principale ▼ ]

Stade
[ Sélectionner ▼ ]

[Annuler] [Ajouter]
```

---

# 7. Création — Étape 5 : éclairage

```text
Éclairage

Avez-vous déjà un éclairage ?

○ Oui
○ Non
○ Je ne sais pas
```

Si oui :

```text
Type
[ LED ▼ ]

Fabricant
[ ................ ]

Modèle
[ ................ ]

Puissance
[ 240 ] W

Nombre
[ 2 ]

Hauteur
[ 1,80 ] m

[Ajouter l'éclairage]
```

### Important

Les champs avancés comme PPFD ne sont pas obligatoires dans le MVP.

On pourra les ajouter plus tard.

---

# 8. Création — Étape 6 : ventilation

```text
Ventilation

Avez-vous des ventilateurs ?

○ Oui
○ Non
○ Je ne sais pas
```

Si oui :

```text
Type
[ Circulation ▼ ]

Nombre
[ 2 ]

Débit
[ ........ ] m³/h

Débit inconnu
☐

[Ajouter]
```

Puis :

```text
Avez-vous une extraction ?

○ Oui
○ Non
○ Je ne sais pas
```

---

# 9. Création — Étape 7 : résumé

Avant de créer l'environnement :

```text
RÉSUMÉ

Nom
Ma salle de culture

Dimensions
2,40 × 1,80 × 2,20 m

Zones
1

Cultures
1

Éclairage
2 lampes

Ventilation
2 ventilateurs

Extraction
Oui

──────────────────────

[← Modifier]       [Créer l'environnement]
```

Bouton principal :

**Créer l'environnement**

→ crée toutes les données.

→ ouvre l'environnement.

---

# 10. Écran « Environnement »

Une fois créé, l'utilisateur arrive ici.

```text
MA SALLE DE CULTURE

[Vue] [Diagnostic] [Données]

┌───────────────────────────────────────┐
│                                       │
│              ÉDITEUR 2D              │
│                                       │
│       💡             💡              │
│                                       │
│     🌱     🌱     🌱                 │
│                                       │
│  🌬 → → → → → → →                   │
│                                       │
└───────────────────────────────────────┘

[+ Ajouter]

────────────────────────────────────────

🌡 Température       24,2 °C
💧 Humidité           58 %
💡 Éclairage          Bon
🌬 Ventilation        À surveiller
```

---

# 11. Éditeur 2D

L'utilisateur peut ajouter et déplacer des éléments.

### Bouton +

```text
Ajouter un élément

🌱 Plante
💡 Éclairage
🌬 Ventilateur
🌡 Capteur
🚪 Porte
🪟 Fenêtre
```

### Sélection d'un objet

Lorsqu'un élément est sélectionné :

```text
┌───────────────────────────┐
│ LAMPE                     │
│                           │
│ Nom : LED principale      │
│ Puissance : 240 W         │
│                           │
│ Position                  │
│ X : 1,20 m                │
│ Y : 0,90 m                │
│ Hauteur : 1,80 m          │
│                           │
│ [Modifier]                │
│ [Supprimer]               │
└───────────────────────────┘
```

---

# 12. Écran « Cultures »

```text
MES CULTURES

[ + Ajouter ]

┌────────────────────────────┐
│ 🌱 Culture principale      │
│                            │
│ 6 plantes                  │
│ Zone : principale          │
│ Stade : croissance         │
│                            │
│ [Ouvrir]             ⋮     │
└────────────────────────────┘
```

### Menu ⋮

```text
Modifier
Changer de zone
Dupliquer
Archiver
Supprimer
```

---

# 13. Écran « Équipements »

```text
ÉQUIPEMENTS

💡 Éclairage
2 équipements

🌬 Ventilation
2 équipements

🌡 Capteurs
0 équipement

[+ Ajouter]
```

### Bouton Ajouter

```text
Quel équipement ?

💡 Éclairage
🌬 Ventilateur
🌡 Capteur
💧 Autre
```

---

# 14. Écran « Données »

C'est l'écran des mesures.

```text
DONNÉES

Période
[ 24 heures ▼ ]

────────────────────────

🌡 Température

24,2 °C

Min : 22,8
Max : 26,1

[Graphique]

────────────────────────

💧 Humidité

58 %

Min : 51
Max : 64

[Graphique]
```

### Filtres

```text
[24 h ▼]
[Zone ▼]
[Paramètre ▼]
```

---

# 15. Ajouter une mesure manuelle

Bouton :

**+ Ajouter une mesure**

Fenêtre :

```text
Nouvelle mesure

Paramètre
[ Température ▼ ]

Valeur
[ 24,2 ]

Unité
°C

Date
[ maintenant ]

Source
[ Mesure manuelle ▼ ]

[Annuler] [Enregistrer]
```

Le système enregistre automatiquement :

- valeur ;
- unité ;
- date ;
- source ;
- environnement ;
- zone éventuelle.

---

# 16. Écran « Diagnostic »

C'est l'écran le plus important du MVP.

```text
DIAGNOSTIC

État général

████████░░
87 %

────────────────────────

✓ Température
Conditions satisfaisantes

✓ Humidité
Conditions satisfaisantes

✓ Éclairage
Conditions satisfaisantes

⚠ Ventilation
À surveiller

────────────────────────

1 recommandation

[Voir la recommandation]
```

---

# 17. Détail d'un diagnostic

```text
⚠ VENTILATION À SURVEILLER

Pourquoi ?

Les données disponibles indiquent que
la circulation de l'air pourrait être
insuffisante dans une partie de la zone.

Niveau
🟡 Optimisation

Confiance
82 %

Source
Moteur de règles

────────────────────────

Que faire ?

Vérifiez l'orientation et le positionnement
des ventilateurs.

[Voir sur la carte]

[Comprendre]
```

---

# 18. Écran « Recommandation »

L'utilisateur doit comprendre exactement ce que l'application veut dire.

```text
RECOMMANDATION

🟡 Optimisation

Circulation d'air à surveiller

PROBLÈME

Une partie de la zone semble moins
bien ventilée.

POURQUOI ?

Le positionnement actuel des ventilateurs
ne permet pas de confirmer une circulation
uniforme.

QUE FAIRE ?

Vérifiez leur orientation et observez
les zones moins exposées au mouvement d'air.

[Marquer comme résolu]

[Demander à l'assistant]
```

---

# 19. Assistant IA — MVP

L'IA n'est pas nécessaire pour faire fonctionner le diagnostic.

Elle vient **au-dessus du moteur de règles**.

Interface :

```text
ASSISTANT

🤖 Comment puis-je vous aider ?

[ Pourquoi ai-je cette alerte ? ]

[ Explique-moi mes données ]

[ Que dois-je vérifier ? ]

────────────────────────

Écrire une question...

[ Envoyer ]
```

L'assistant reçoit uniquement les données nécessaires.

Exemple :

```text
Utilisateur : débutant

Environnement :
2,4 × 1,8 × 2,2 m

Température :
24,2 °C

Humidité :
58 %

Diagnostic :
Ventilation à surveiller
```

---

# 20. Écran « Paramètres »

```text
PARAMÈTRES

Profil
────────────────
Niveau
[ Débutant ▼ ]

Unités
[ Métrique ▼ ]

Notifications
────────────────
☐ Alertes importantes
☐ Alertes environnementales

Application
────────────────
Langue
[ Français ▼ ]

À propos
Aide
Confidentialité
```

---

# 21. Mode débutant / expert

Dans le MVP, il ne faut pas créer deux applications différentes.

On garde **la même interface**, mais certains détails apparaissent selon le niveau.

### Débutant

```text
Température
24,2 °C

✓ Conditions satisfaisantes
```

### Expert

```text
Température
24,2 °C

Min : 22,8
Max : 26,1
Moyenne : 24,0
Variation : ±1,2

Source : capteur
Confiance : élevée
```

---

# 22. Menu contextuel universel

Pour chaque objet :

```text
⋮

Modifier
Déplacer
Dupliquer
Détails
Archiver
Supprimer
```

Cela évite de multiplier les boutons visibles.

---

# 23. États importants de l'interface

L'application doit gérer quatre situations.

### Chargement

```text
Analyse de votre environnement...
```

### Aucune donnée

```text
Aucune mesure disponible.

[+ Ajouter une mesure]
```

### Données insuffisantes

```text
ℹ Analyse limitée

Nous avons besoin de davantage
de données pour produire un diagnostic.

[Ajouter des données]
```

### Erreur

```text
Impossible de charger les données.

[Réessayer]
```

---

# 24. Flux utilisateur principal

Le parcours idéal du débutant :

```text
INSTALLATION
     ↓
ACCUEIL
     ↓
Créer mon environnement
     ↓
Nom + dimensions
     ↓
Zone
     ↓
Culture
     ↓
Éclairage
     ↓
Ventilation
     ↓
Résumé
     ↓
ENVIRONNEMENT
     ↓
DIAGNOSTIC
     ↓
RECOMMANDATIONS
```

Le parcours doit être utilisable même si l'utilisateur ne connaît pas les paramètres techniques.

---

# 25. Flux utilisateur avancé

Un utilisateur expert peut aller directement :

```text
ACCUEIL
   ↓
ENVIRONNEMENT
   ↓
ÉDITEUR
   ↓
ÉQUIPEMENTS
   ↓
DONNÉES
   ↓
DIAGNOSTIC
   ↓
HISTORIQUE
```

Il ne doit pas être obligé de refaire l'assistant.

---

# 26. Ce qui est volontairement exclu du MVP

Pour éviter de rendre le premier développement trop complexe :

### Pas encore

- véritable moteur 3D ;
- simulation physique des flux d'air ;
- reconnaissance photo ;
- connexion à tous les fabricants de capteurs ;
- automatisation ;
- prédiction avancée ;
- communauté ;
- marketplace ;
- API publique ;
- simulation « Et si... ? » avancée.

### Mais

L'architecture doit être préparée pour pouvoir les ajouter plus tard.

---

# 27. MVP fonctionnel minimum

À la fin du MVP, l'utilisateur doit pouvoir faire exactement ceci :

```text
1. Créer un environnement
        ↓
2. Entrer ses dimensions
        ↓
3. Créer une zone
        ↓
4. Ajouter ses plantes
        ↓
5. Ajouter ses lampes
        ↓
6. Ajouter ses ventilateurs
        ↓
7. Entrer température/humidité
        ↓
8. Voir son environnement
        ↓
9. Voir ses données
        ↓
10. Obtenir un diagnostic
        ↓
11. Comprendre le diagnostic
        ↓
12. Demander une explication à l'IA
```

Si ces 12 étapes fonctionnent correctement, **le MVP est déjà une vraie application**, et non simplement une maquette.

---

# 28. Priorité de développement des écrans

## Priorité 1 — indispensable

1. Tableau de bord
2. Création environnement
3. Environnement / éditeur 2D
4. Cultures
5. Équipements
6. Données
7. Diagnostic

## Priorité 2

8. Assistant IA
9. Paramètres
10. Historique avancé

## Après MVP

11. 3D
12. Photo
13. Simulation
14. IoT
15. Automatisation