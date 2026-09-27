const describe = (...sections: string[]) => sections.join("\n");

export const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "bb-grow": describe(
    "Rôle : engrais liquide de croissance et de floraison, utilisable sur différents substrats.",
    "Composition : vinasse issue d’extrait de betterave fermenté, sucres et potassium; le fabricant ne publie pas ici de ratio NPK garanti.",
    "Dosage : tableau BioBizz Light·Mix Peat Free 2026 — 2 ml/L au démarrage, 3–4 ml/L en début de floraison, puis diminution jusqu’à 2 ml/L avant l’arrêt.",
    "Conseil : ajuster au substrat et suivre les étapes du tableau, sans cumuler automatiquement avec une seconde base riche en azote. Source : biobizz.com/products/bio-grow et tableau 2026 du dossier knowledge."
  ),
  "bb-bloom": describe(
    "Rôle : engrais liquide de floraison, de l’apparition des fleurs jusqu’à la fin du cycle.",
    "Composition : mélange NPK complété par des enzymes et acides aminés; le fabricant met en avant le phosphore et le potassium, sans ratio chiffré sur la fiche consultée.",
    "Dosage : BioBizz indique environ 2–4 ml/L; le tableau Light·Mix 2026 commence à 3 ml/L, monte à 4 ml/L, puis réduit progressivement.",
    "Conseil : utiliser le tableau du substrat et éviter d’ajouter plusieurs boosters PK sans surveiller la solution. Source : biobizz.com/products/bio-bloom et tableau 2026 knowledge."
  ),
  "bb-topmax": describe(
    "Rôle : stimulant de floraison; il accompagne le métabolisme et la disponibilité de minéraux dans le substrat.",
    "Composition : acides humiques provenant notamment de léonardite et acides fulviques issus de dépôts d’humates; pas de ratio NPK garanti publié sur la fiche consultée.",
    "Dosage : fabricant — 1 ml/L en début de floraison, augmentation possible jusqu’à 4 ml/L avant le rinçage; le tableau 2026 plafonne à 3 ml/L.",
    "Conseil : ne pas confondre stimulant et engrais de base; suivre les doses du tableau choisi. Source : biobizz.com/products/top-max et tableau 2026 knowledge."
  ),
  "bb-heaven": describe(
    "Rôle : stimulant métabolique utilisable pendant la croissance et la floraison, sur terre, coco ou hydroponie.",
    "Composition : acides aminés et stimulants biologiques; la fiche décrit une meilleure chélation des macro- et micronutriments, sans analyse NPK chiffrée publiée.",
    "Dosage : BioBizz conseille 2–5 ml/L sur All·Mix ou Light·Mix; la recette 2026 commence à 2 ml/L et monte jusqu’à 4 ml/L.",
    "Conseil : introduire progressivement et garder la même unité ml/L. Source : biobizz.com/products/bio-heaven et tableau 2026 knowledge."
  ),
  "bb-root": describe(
    "Rôle : stimulateur racinaire pour l’enracinement initial et les reprises après repiquage.",
    "Composition : ingrédients d’origine végétale, acides humiques et algues; le ratio NPK garanti n’est pas indiqué dans la fiche consultée.",
    "Dosage : 1–4 ml/L selon BioBizz; dans la recette 2026, 4 ml/L au démarrage, 2 ml/L au début du cycle, puis arrêt.",
    "Conseil : réserver surtout aux phases d’enracinement et de reprise; ne pas maintenir la dose maximale toute la culture. Source : biobizz.com/products/root-juice et tableau 2026 knowledge."
  ),
  "bb-acti-vera": describe(
    "Rôle : activateur végétal à base d’aloe vera, utilisable en croissance et en floraison.",
    "Composition : extrait d’aloe vera; formulation annoncée 100 % vegan. La fiche ne donne pas de ratio NPK garanti.",
    "Dosage : fabricant — 5 ml/L en arrosage ou 1–2 ml/L en pulvérisation foliaire; la recette Light·Mix 2026 utilise 2–4 ml/L par phase.",
    "Conseil : ne pas confondre dose foliaire et dose d’arrosage. Source : biobizz.com/products/acti-vera et tableau 2026 knowledge."
  ),
  "bb-fish-mix": describe(
    "Rôle : engrais organique riche pour soutenir la croissance et la vie biologique du substrat.",
    "Composition : émulsion de poisson de la mer du Nord et extrait de betterave sucrière; la fiche ne donne pas de ratio NPK garanti.",
    "Dosage général BioBizz : 1 ml/L sur All·Mix, 2–4 ml/L sur Light·Mix. Le tableau 2026 utilisé ici le limite à 2 ml/L en propagation et croissance, puis passe à Bio·Grow.",
    "Conseil : suivre la note spécifique du tableau, qui prime sur la recommandation générique pour cette recette. Source : biobizz.com/products/fish-mix et tableau 2026 knowledge."
  ),
  "bb-alga-mic": describe(
    "Rôle : revitalisant contre le stress lié notamment à la suralimentation, aux carences ou aux variations de température.",
    "Composition : concentré d’algues obtenu par pressage à froid; le fabricant le décrit comme ayant une faible teneur en NPK, sans ratio chiffré sur la fiche consultée.",
    "Dosage : 1–4 ml/L selon BioBizz; le tableau 2026 utilise 2–4 ml/L selon la phase.",
    "Conseil : complément de vitalité, pas substitut à l’engrais de base. Source : biobizz.com/products/alg-a-mic et tableau 2026 knowledge."
  ),
  "bb-microbes": describe(
    "Rôle : inoculant de microorganismes, enzymes et champignons bénéfiques pour la rhizosphère.",
    "Composition déclarée : Trichoderma harzianum (>10 M UFC/g), Bacillus velezensis (>500 M), B. megaterium (>200 M), B. pumilus (>250 M) et B. licheniformis (>500 M), selon la fiche BioBizz 2026.",
    "Dosage : 0,2–0,4 g/L une fois par semaine; BioBizz indique jusqu’à deux applications hebdomadaires en forte demande. La recette utilise exclusivement g/L.",
    "Conseil : peser la poudre, ne pas convertir en ml. Source : biobizz.com/products/microbes et tableau 2026 knowledge."
  ),
  "bb-up": describe(
    "Rôle : correcteur pH+ compatible avec les produits et substrats BioBizz.",
    "Composition : formulation à base d’acides humiques d’origine naturelle; ce n’est pas un engrais NPK.",
    "Dosage : ajouter par incréments mesurés; la fiche indique environ 0,1 ml pour augmenter le pH d’environ 0,1 point.",
    "Conseil : mesurer après mélange, remuer puis retester avant chaque nouvel ajout. Plage cible indiquée par BioBizz : pH 6,2–6,5. Source : biobizz.com/products/bio-up."
  ),
  "bb-down": describe(
    "Rôle : correcteur pH− pour les solutions nutritives et substrats compatibles avec la gamme BioBizz.",
    "Composition : solution aqueuse d’acide citrique; ce n’est pas un engrais NPK et elle est formulée pour éviter les acides forts.",
    "Dosage : ajouter une petite quantité, mélanger environ 10 secondes et mesurer à nouveau; répéter par étapes selon la réponse de l’eau.",
    "Conseil : viser la plage 6,2–6,5 indiquée par BioBizz et éviter un ajout d’un seul coup. Source : biobizz.com/products/bio-down."
  ),
  "bb-calmag": describe(
    "Rôle : complément de calcium et magnésium pour corriger une eau pauvre en minéraux ou une carence établie.",
    "Composition : Ca + Mg; le ratio et l’analyse garantie ne sont pas précisés dans les documents consultés.",
    "Dosage : aucun dosage hebdomadaire universel n’est fourni dans le tableau Light·Mix; suivre l’étiquette du flacon et la qualité de l’eau.",
    "Conseil : ne pas ajouter automatiquement à une eau déjà minéralisée; un excès de Ca/Mg peut déséquilibrer les autres éléments. Source : biobizz.com/products/calmag."
  ),
  "canna-a": describe(
    "Rôle : première partie de l’engrais de base CANNA COCO, formulée pour une culture sur coco.",
    "Composition : apporte notamment calcium, une partie de l’azote et des oligoéléments; l’analyse chiffrée complète n’est pas présente dans le guide local.",
    "Dosage : utiliser avec CANNA COCO B selon le tableau v26.06; celui-ci indique environ 2,96 ml/L au démarrage, puis 3,35 ml/L par composant en pleine phase.",
    "Conseil : ajouter A dans l’eau, mélanger, puis ajouter B. Ne jamais mélanger A et B concentrés ensemble. Source : tableau CANNA COCO v26.06 et guide Canna Coco local."
  ),
  "canna-b": describe(
    "Rôle : seconde partie de la base CANNA COCO; elle complète A pour fournir une nutrition de cycle sur coco.",
    "Composition : apporte notamment phosphore, potassium, magnésium et le complément d’oligoéléments; ratios détaillés non présents dans le guide local.",
    "Dosage : avec CANNA COCO A, à parts égales; le tableau v26.06 indique environ 2,96 ml/L au démarrage, puis 3,35 ml/L par composant.",
    "Conseil : diluer chaque partie séparément dans l’eau, A d’abord puis B; ne pas prémélanger les concentrés. Source : tableau CANNA COCO v26.06 et guide Canna Coco local."
  ),
  "canna-rhizo": describe(
    "Rôle : stimulateur racinaire et soutien à la reprise après repiquage ou stress.",
    "Composition : guide local — algue Ascophyllum nodosum et vitamines B; CANNA décrit une formule naturelle favorisant racines et tolérance au stress.",
    "Dosage : tableau COCO v26.06 — 3,96 ml/L au stade racines, 1,98 ml/L au début, puis 0,53 ml/L en milieu de cycle avant l’arrêt.",
    "Conseil : privilégier les jeunes racines et les reprises; réduire selon le tableau plutôt que garder la dose de départ. Source : canna.com et documentation Canna Coco locale."
  ),
  "canna-pk": describe(
    "Rôle : apport concentré de phosphore et potassium pour une fenêtre de floraison à forte demande.",
    "Composition garantie publiée par CANNA : NPK 0–10–11 en masse, équivalent à 0–13–14 en volume selon la fiche fabricant.",
    "Dosage : dans le tableau COCO v26.06 de cette recette, 1,51 ml/L au stade Gen II W6 uniquement.",
    "Conseil : garder la fenêtre courte et ne pas cumuler avec d’autres boosters PK sans vérifier l’EC. Source : canna-pk-1314 et tableau CANNA COCO v26.06."
  ),
  "an-grow-a": describe(
    "Rôle : composant A de l’engrais de base Sensi Grow pour la phase de croissance.",
    "Composition : formule complémentaire à Sensi Grow B; l’analyse NPK complète par bouteille n’est pas lisible dans le guide local consulté.",
    "Dosage : tableau fabricant Sensi Master Global — 1, 2, 3 puis 4 ml/L par composant sur Grow W1–W4; A et B sont dosés séparément à parts égales.",
    "Conseil : verser chaque partie dans l’eau et mélanger entre les ajouts; ne pas mélanger les concentrés A/B ensemble. Source : tableau Advanced Nutrients Sensi Global du dossier knowledge."
  ),
  "an-grow-b": describe(
    "Rôle : composant B complémentaire de Sensi Grow A pour la nutrition de croissance.",
    "Composition : seconde partie de la base pH Perfect; les proportions détaillées des éléments et l’analyse garantie ne sont pas indiquées dans le PDF local.",
    "Dosage : tableau Sensi Master Global — même dose que A, soit 1, 2, 3 puis 4 ml/L par composant sur Grow W1–W4.",
    "Conseil : ajouter dans l’eau après A dilué, jamais directement dans le concentré A. Source : tableau Advanced Nutrients Sensi Global du dossier knowledge."
  ),
  "an-bloom-a": describe(
    "Rôle : composant A de la base Sensi Bloom pour la phase de floraison.",
    "Composition : formule de base en deux parties, complémentaire à Sensi Bloom B; le PDF local ne donne pas l’analyse NPK séparée de chaque bouteille.",
    "Dosage : tableau fabricant Sensi Master Global — 4 ml/L de A par semaine de floraison W1–W7; la dose est par composant.",
    "Conseil : diluer A dans l’eau puis ajouter B séparément; ne pas mélanger les concentrés. Source : tableau Advanced Nutrients Sensi Global du dossier knowledge."
  ),
  "an-bloom-b": describe(
    "Rôle : composant B de la base Sensi Bloom, à utiliser avec Sensi Bloom A.",
    "Composition : seconde partie de la formule de floraison; l’analyse NPK propre à cette bouteille n’est pas publiée dans le guide local consulté.",
    "Dosage : tableau fabricant Sensi Master Global — 4 ml/L de B par semaine de floraison W1–W7, en plus de la même dose de A.",
    "Conseil : ajouter B seulement après dilution de A dans l’eau; ne pas prémélanger les concentrés. Source : tableau Advanced Nutrients Sensi Global du dossier knowledge."
  ),
  "an-bigbud": describe(
    "Rôle : booster PK liquide destiné à la floraison.",
    "Composition garantie affichée par Advanced Nutrients : NPK 0–1–3, soit un ratio phosphore/potassium de 1:3.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L sur Bloom W2–W5.",
    "Conseil : l’utiliser comme seul booster PK de cette fenêtre et surveiller la conductivité; ne pas le confondre avec une base complète. Source : advancednutrients.com/products/big-bud et tableau Sensi Global local."
  ),
  "an-voodoo": describe(
    "Rôle : inoculant bactérien conçu pour soutenir la rhizosphère et l’absorption des nutriments.",
    "Composition : quatre souches de bacilles sélectionnées; NPK affiché 0–0–0, ce n’est donc pas un engrais de base.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L en Grow W1–W2 et Bloom W1–W2.",
    "Conseil : diluer dans l’eau et garder les apports concentrés séparés; l’effet attendu porte sur la zone racinaire, pas sur un apport NPK direct. Source : advancednutrients.com/products/voodoo-juice et tableau local."
  ),
  "an-tarantula": describe(
    "Rôle : biofertilisant microbien pour enrichir la zone racinaire et soutenir le transport des nutriments.",
    "Composition : bacilles bénéfiques; la page fabricant indique 10 millions d’UFC/g et NPK 0–0–0.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L en Grow W1–W2 et Bloom W1–W2.",
    "Conseil : ce produit biologique ne remplace pas les engrais de base; suivre l’étiquette de la version vendue dans votre région. Source : advancednutrients.com/products/tarantula et tableau local."
  ),
  "an-piranha": describe(
    "Rôle : inoculant fongique pour la zone racinaire et l’association entre racines et microorganismes.",
    "Composition : champignons mycorhiziens et microorganismes bénéfiques; NPK affiché 0–0–0.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L en Grow W1–W2 et Bloom W1–W2.",
    "Conseil : utiliser comme complément biologique, pas comme source d’éléments majeurs; respecter les conditions de stockage de l’étiquette. Source : advancednutrients.com/products/piranha et tableau local."
  ),
  "an-rhino": describe(
    "Rôle : supplément de silicate de potassium pour renforcer les tissus et la résistance mécanique.",
    "Composition garantie affichée : NPK 0–0–0,4; le fabricant décrit une formule de silicate de potassium.",
    "Dosage : le tableau Sensi Global inclus indique 2 ml/L sur les phases listées, jusqu’à la fin de floraison; pas de dose au rinçage.",
    "Conseil : suivre l’ordre de mélange de l’étiquette et ne pas verser le concentré directement sur d’autres concentrés. Vérifier la version régionale du produit. Source : advancednutrients.com/products/rhino-skin et tableau local."
  ),
  "an-sensizym": describe(
    "Rôle : mélange enzymatique pour transformer les débris organiques de la zone racinaire en éléments plus disponibles.",
    "Composition publiée : xylanase, plusieurs cellulases et bêta-glucanase; NPK affiché 0–0–0.",
    "Dosage : le tableau Sensi Global inclus indique 2 ml/L pendant les semaines où Sensizym apparaît.",
    "Conseil : produit de conditionnement du milieu, pas un engrais de base; conserver la dose par litre et ne pas extrapoler au-delà du tableau. Source : advancednutrients.com/products/sensizym et tableau local."
  ),
  "an-bud-candy": describe(
    "Rôle : supplément de floraison destiné à apporter des glucides et du magnésium.",
    "Composition publiée : mélange de glucides et magnésium; NPK affiché 0–0–0.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L pendant les étapes où le produit est indiqué.",
    "Conseil : il complète la base mais ne la remplace pas; éviter de multiplier les additifs si l’EC est déjà élevé. Source : advancednutrients.com/products/bud-candy et tableau local."
  ),
  "an-b52": describe(
    "Rôle : biostimulant de soutien pendant la croissance et la floraison.",
    "Composition garantie affichée : NPK 2–1–4; la fiche cite aussi un complexe de vitamines B, du varech et de l’acide humique.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L aux semaines où B-52 est indiqué.",
    "Conseil : utiliser selon la phase du tableau; ce supplément n’est pas une base à substituer aux composants Grow/Bloom. Source : advancednutrients.com/products/b-52 et tableau local."
  ),
  "an-bud-factor-x": describe(
    "Rôle : biostimulant de floraison présenté par Advanced Nutrients comme soutien à l’arôme et aux composés des fleurs.",
    "Composition : NPK affiché 0–0–0; la formulation détaillée des actifs n’est pas publiée sur la fiche produit consultée.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L sur Bloom W3–W7.",
    "Conseil : considérer les bénéfices comme les allégations du fabricant; respecter la dose du tableau et ne pas le substituer à l’engrais de base. Source : advancednutrients.com/products/bud-factor-x et tableau local."
  ),
  "an-nirvana": describe(
    "Rôle : stimulateur de floraison actuellement renommé Tasty Terpenes sur certaines pages Advanced Nutrients.",
    "Composition publiée pour Tasty Terpenes, ancienne formule Nirvana : NPK 0–0–1, potassium, varech, farine de luzerne et acides aminés.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L sur Bloom W3–W7.",
    "Conseil : vérifier que l’étiquette de votre bouteille correspond à cette formule/ce nom de marché. Source : advancednutrients.com/products/tasty-terpenes et tableau local."
  ),
  "an-bud-ignitor": describe(
    "Rôle : booster de début de floraison, conçu pour accompagner la transition florale.",
    "Composition garantie affichée : NPK 0–1–2; la fiche mentionne phosphore, potassium et varech.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L sur Bloom W1–W2.",
    "Conseil : limiter à la fenêtre de début de floraison du tableau; ne pas ajouter en croissance tardive ou au rinçage. Source : advancednutrients.com/products/bud-ignitor et tableau local."
  ),
  "an-overdrive": describe(
    "Rôle : supplément de maturation destiné à la fin de floraison.",
    "Composition garantie affichée : NPK 1–5–4; la fiche fabricant cite phosphore et magnésium.",
    "Dosage : le tableau fournisseur Sensi Global indique 2 ml/L sur Bloom W6–W7.",
    "Conseil : la recette importée contient aussi une dose en Grow W1; cette entrée ne correspond pas à l’usage tardif décrit par le fabricant et doit être vérifiée sur l’étiquette avant usage. Source : advancednutrients.com/products/overdrive et tableau local."
  ),
  "an-flawless-finish": describe(
    "Rôle : produit de rinçage de fin de cycle, et non engrais de base.",
    "Composition : NPK affiché 0–0–0; la fiche cite une technologie chélatante et du sulfate de magnésium.",
    "Dosage : tableau Sensi Global inclus — 2 ml/L à l’étape Flush.",
    "Conseil : respecter la fenêtre de rinçage du guide et l’étiquette du marché; ne pas extrapoler cette dose aux semaines de nutrition. Source : advancednutrients.com/products/flawless-finish et tableau local."
  ),
  "custom-calmag": describe(
    "Rôle : supplément générique calcium/magnésium.",
    "Composition : Ca et Mg d’après le nom du produit; ratio, forme chimique et NPK non fournis pour cette référence générique.",
    "Dosage : suivre exclusivement l’étiquette du fabricant du flacon; aucun dosage hebdomadaire vérifié n’est attaché à cette entrée.",
    "Conseil : réserver à une eau pauvre en Ca/Mg ou à une carence identifiée; tenir compte de la dureté et de l’EC."
  ),
  "manual-1790420235934": describe(
    "Rôle : amendement humique ajouté manuellement à la recette Black Flower Research.",
    "Composition : le nom suggère une matière humique, mais l’étiquette, la teneur en acides humiques et l’analyse NPK ne sont pas jointes; ne pas les supposer.",
    "Dose enregistrée dans votre recette : 0,2 g/L de Flo 1 à Flo 7; il s’agit de votre réglage, pas d’une dose fabricant vérifiée.",
    "Conseil : vérifier le dosage et la solubilité sur le sachet Hydro Bio avant de conserver cette fréquence."
  ),
  "manual-1790420317435": describe(
    "Rôle : extrait liquide d’algues ajouté manuellement comme fertilisant organique.",
    "Composition indiquée par le nom saisi : NPK 0,6–2–7; aucune analyse de lot ni source fabricant n’est jointe pour confirmer les unités ou les garanties.",
    "Dose enregistrée dans votre recette : 0,5 ml/L en Flo 2 seulement; c’est une valeur personnelle du tableau, pas une recommandation fournisseur vérifiée.",
    "Conseil : contrôler l’étiquette et éviter de superposer ce produit à d’autres apports riches en potassium sans suivre l’EC."
  ),
  "manual-1790429548131": describe(
    "Rôle : composant A de votre base Black Flower Research.",
    "Composition indiquée dans le nom : NPK 5–5–0,4; convention et analyse garanties à confirmer sur l’étiquette du fabricant.",
    "Dose enregistrée : 1,25 ml/L en Flo 1, 1,5 ml/L en Flo 2, 1,75 ml/L en Flo 3–6, puis 1,5 ml/L en Flo 7; cette recette n’est pas un tableau fabricant validé.",
    "Conseil : la note personnelle indique de ne jamais mélanger le concentré A avec B; diluer séparément dans l’eau et conserver des volumes A/B identiques selon votre recette."
  ),
  "manual-1790429586865": describe(
    "Rôle : composant B de votre base Black Flower Research, associé au composant A.",
    "Composition indiquée dans le nom : NPK 1–2–4,5; convention et analyse garanties à confirmer sur l’étiquette du fabricant.",
    "Dose enregistrée : même volume que A — 1,25 ml/L en Flo 1, 1,5 ml/L en Flo 2, 1,75 ml/L en Flo 3–6, puis 1,5 ml/L en Flo 7; recette personnelle non certifiée fabricant.",
    "Conseil : ne pas mélanger les concentrés A et B directement; verser dans l’eau l’un après l’autre. Le potassium plus élevé est déjà pris en compte dans la formule indiquée."
  ),
  "manual-1790429633381": describe(
    "Rôle : booster phosphore/potassium de floraison ajouté manuellement.",
    "Composition indiquée dans le nom : NPK 0–30–20; valeur recopiée du libellé, à confirmer sur l’étiquette et sa convention N–P₂O₅–K₂O.",
    "Dose enregistrée : 0,4 ml/L en Flo 3–6, puis 0,2 ml/L en Flo 7; cette dose de recette n’est pas vérifiée par le fabricant.",
    "Conseil : concentré PK — commencer bas, ne pas le combiner avec un autre booster PK et surveiller l’EC; arrêter si la plante montre des signes de surcharge."
  ),
  "manual-1790429680927": describe(
    "Rôle : produit NitroCarb ajouté à votre recette comme amplificateur de masse.",
    "Composition : la fiche fournisseur et l’analyse NPK ne sont pas présentes; le nom seul ne permet pas de déduire sa teneur en azote ou glucides.",
    "Dose enregistrée : 0,3 g/L en Flo 1–6; valeur issue de votre tableau, non confirmée par un guide officiel local.",
    "Conseil : vérifier si l’unité de l’étiquette est bien g/L avant emploi et éviter de répéter à intervalles rapprochés sans notice fabricant."
  ),
  "manual-1790429726811": describe(
    "Rôle : supplément de silice et potassium Emerald Harvest Sturdy Stalk.",
    "Composition : libellé du produit 0–0–1 + silice; le guide Emerald Harvest confirme un supplément de silicate de potassium, sans analyse complète dans la fiche jointe.",
    "Dosage fabricant du guide joint : 0,5–1,25 ml/L selon le besoin. Dose de votre recette : 1,25 ml/L en Flo 1–6, puis 1 ml/L en Flo 7.",
    "Conseil : le guide demande de ne pas prémélanger les concentrés; diluer les nutriments dans l’eau et contrôler le pH final. Source : Info EH Product Guide FR, 2017."
  ),
  "manual-1790429773432": describe(
    "Rôle : supplément de potassium ajouté manuellement à la recette.",
    "Composition indiquée dans le nom : NPK 0–0–5; forme du potassium, unités de garantie et analyse de lot à confirmer sur l’étiquette Nature’s Nectar.",
    "Dose enregistrée : 1 ml/L en Flo 2–4 et Flo 7, 3 ml/L en Flo 5–6; ces valeurs appartiennent à votre recette et ne sont pas confirmées par une fiche fournisseur jointe.",
    "Conseil : ne pas doubler sans notice et mesure d’EC; un excès de potassium peut gêner l’équilibre calcium/magnésium."
  ),
};