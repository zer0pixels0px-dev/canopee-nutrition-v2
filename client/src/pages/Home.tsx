import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Beaker,
  BookmarkPlus,
  BookOpen,
  Camera,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  LayoutDashboard,
  Library,
  Download,
  Droplets,
  FileUp,
  FlaskConical,
  History,
  Image as ImageIcon,
  Info,
  Leaf,
  MessageCircle,
  Settings,
  Pencil,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { isWikiKnowledgeSources, type WikiKnowledgeSource } from "@shared/wiki-knowledge";
import { MAX_DIAGNOSTIC_IMAGE_DATA_URL_LENGTH } from "@shared/botany-assistant";
import type { ManufacturerProductCandidate, ManufacturerSearchResult } from "@shared/manufacturer-search";

type Product = {
  id: string;
  name: string;
  brand: string;
  range: string;
  role: string;
  unit: "ml" | "g";
  color: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
  packageQuantity?: string;
  sourceVerified?: boolean;
  doseSourceUrl?: string;
  doseVerified?: boolean;
  application?: string;
  nutrientProfile?: string;
};

type TableProduct = Product & { doses: number[]; enabled: boolean };
type ProductCategory = "base" | "flowering" | "root" | "pk-booster" | "organic" | "mineral-salts" | "beneficials" | "enzymes" | "silicon" | "ph-adjustment" | "vitamins" | "hormones" | "cloning-seed" | "pest-disease" | "humic";
type WeekPhase = "vegetative" | "flowering" | "flush" | "other";
type NutritionTable = {
  id: string;
  name: string;
  brand: string;
  brandImageUrl?: string;
  medium: string;
  description: string;
  weeks: string[];
  weekPhases?: WeekPhase[];
  chartId?: string;
  chartSourceUrl?: string;
  chartNotes?: string;
  chartStageKeys?: (string | null)[];
  manufacturerPageUrl?: string;
  products: TableProduct[];
  custom?: boolean;
};

type WateringRecord = {
  id: string;
  createdAt: string;
  tableName: string;
  week: string;
  liters: number;
  products: { name: string; dosePerLiter: number; total: number; unit: "ml" | "g" }[];
};

type JournalCategory = "observation" | "environment" | "maintenance" | "note";
type CultureJournalEntry = {
  id: string;
  createdAt: string;
  title: string;
  category: JournalCategory;
  plantName: string;
  details: string;
  temperature?: number;
  humidity?: number;
};

type JournalDraft = Omit<CultureJournalEntry, "id" | "createdAt" | "temperature" | "humidity"> & {
  dateTime: string;
  temperature: string;
  humidity: string;
};

type CycleTemplate = {
  id: string;
  name: string;
  savedAt: string;
  table: NutritionTable;
};

type CalendarTask = {
  id: string;
  title: string;
  kind: "watering" | "feeding" | "maintenance" | "note";
  startsAt: string;
  timeZone: string;
  tableId: string;
  tableName: string;
  week: string;
  note: string;
  completed: boolean;
};

type UserPreferences = {
  experience: "novice" | "expert";
  theme: "dark" | "light";
  defaultLiters: number;
  showManufacturerDetails: boolean;
  compactMode: boolean;
};

type AppPage = "nutrition" | "library" | "calendar" | "journal" | "wiki" | "assistant" | "settings";

type WikiCategory = "legalite" | "securite" | "carnet" | "glossaire";
type WikiArticle = {
  id: string;
  title: string;
  category: WikiCategory;
  summary: string;
  content: string;
  updatedAt: string;
};

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type SearchMode = "all" | "range" | "product";

const appBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const isStaticPagesDeployment = import.meta.env.BASE_URL !== "/";

function getAppPath() {
  const pathname = window.location.pathname;
  return appBasePath && (pathname === appBasePath || pathname.startsWith(`${appBasePath}/`))
    ? pathname.slice(appBasePath.length) || "/"
    : pathname;
}

const WEEK_LABELS = [
  "Veg 1",
  "Veg 2",
  "Veg 3",
  "Veg 4",
  "Flo 1",
  "Flo 2",
  "Flo 3",
  "Flo 4",
  "Flo 5",
  "Flo 6",
  "Flo 7",
  "Flush",
];

const PRODUCT_REFERENCES: Partial<Record<string, Pick<Product, "imageUrl" | "sourceUrl" | "sourceVerified">>> = {
  "bb-grow": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/bio-grow-packshot.jpg", sourceUrl: "https://biobizz.com/products/bio-grow", sourceVerified: true },
  "bb-bloom": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/bio-bloom-packshot.jpg", sourceUrl: "https://biobizz.com/products/bio-bloom", sourceVerified: true },
  "bb-topmax": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/top-max-packshot.jpg", sourceUrl: "https://biobizz.com/products/top-max", sourceVerified: true },
  "bb-heaven": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/bio-heaven-packshot.jpg", sourceUrl: "https://biobizz.com/products/bio-heaven", sourceVerified: true },
  "bb-root": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/root-juice-packshot.jpg", sourceUrl: "https://biobizz.com/products/root-juice", sourceVerified: true },
  "bb-acti-vera": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/acti-vera-packshot.jpg", sourceUrl: "https://biobizz.com/products/acti-vera", sourceVerified: true },
  "bb-fish-mix": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/fish-mix-packshot.jpg", sourceUrl: "https://biobizz.com/products/fish-mix", sourceVerified: true },
  "bb-alga-mic": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/alg-a-mic-packshot.jpg", sourceUrl: "https://biobizz.com/products/alg-a-mic", sourceVerified: true },
  "bb-microbes": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/microbes-packshot.jpg", sourceUrl: "https://biobizz.com/products/microbes", sourceVerified: true },
  "bb-up": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/bio-up-packshot.jpg", sourceUrl: "https://biobizz.com/products/bio-up", sourceVerified: true },
  "bb-down": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/bio-down-packshot.jpg", sourceUrl: "https://biobizz.com/products/bio-down", sourceVerified: true },
  "bb-calmag": { imageUrl: "https://zeqtxovzgd8vuuw9.public.blob.vercel-storage.com/calmag-packshot.png", sourceUrl: "https://biobizz.com/products/calmag", sourceVerified: true },
  "canna-a": { imageUrl: "https://www.cannagardening.com/sites/united_states/files/styles/unformatted_list_470_500_/public/2023-12/prod-canna-coco-ab.png.webp?itok=aA2tTPKf", sourceUrl: "https://www.cannagardening.com/canna-coco", sourceVerified: true },
  "canna-b": { imageUrl: "https://www.cannagardening.com/sites/united_states/files/styles/unformatted_list_470_500_/public/2023-12/prod-canna-coco-ab.png.webp?itok=aA2tTPKf", sourceUrl: "https://www.cannagardening.com/canna-coco", sourceVerified: true },
  "canna-rhizo": { imageUrl: "https://www.cannagardening.com/sites/united_states/files/styles/product_banner_detail_640x640_/public/2023-12/prod-additives-canna-rhizotonic.png.webp?itok=MH6ZlEE5", sourceUrl: "https://www.cannagardening.com/canna-rhizotonic", sourceVerified: true },
  "canna-pk": { imageUrl: `${import.meta.env.BASE_URL}knowledge/pk-1314.png`, sourceUrl: "https://www.cannagardening.com/canna-additives", sourceVerified: true },
  "canna-boost": { imageUrl: "https://www.cannagardening.com/sites/united_states/files/styles/product_banner_detail_640x640_/public/2023-12/prod-additives-cannaboost.png.webp?itok=KKDFCm0D", sourceUrl: "https://www.cannagardening.com/cannaboost", sourceVerified: true },
  "canna-zym": { imageUrl: "https://www.cannagardening.com/sites/united_states/files/styles/product_banner_detail_640x640_/public/2023-12/prod-additives-cannazym.png.webp?itok=ZYBmaNAC", sourceUrl: "https://www.cannagardening.com/cannazym", sourceVerified: true },
  "an-grow-a": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/ph-perfect-sensi-grow-parts-a-b-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/", sourceVerified: true },
  "an-grow-b": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/ph-perfect-sensi-grow-parts-a-b-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/", sourceVerified: true },
  "an-bloom-a": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/ph-perfect-sensi-grow-parts-a-b-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/", sourceVerified: true },
  "an-bloom-b": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/ph-perfect-sensi-grow-parts-a-b-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/ph-perfect-sensi-grow-bloom/", sourceVerified: true },
  "an-bigbud": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/big-bud-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/big-bud/", sourceVerified: true },
  "an-voodoo": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/voodoo-juice-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/voodoo-juice/", sourceVerified: true },
  "an-tarantula": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/tarantula-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/tarantula/", sourceVerified: true },
  "an-piranha": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/piranha-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/piranha/", sourceVerified: true },
  "an-rhino": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/rhino-skin-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/rhino-skin/", sourceVerified: true },
  "an-sensizym": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/sensizym-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/sensizym/", sourceVerified: true },
  "an-bud-candy": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/bud-candy-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/bud-candy/", sourceVerified: true },
  "an-b52": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/b-52-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/b-52/", sourceVerified: true },
  "an-bud-factor-x": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/bud-factor-x-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/bud-factor-x/", sourceVerified: true },
  "an-bud-ignitor": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/bud-ignitor-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/bud-ignitor/", sourceVerified: true },
  "an-overdrive": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/overdrive-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/overdrive/", sourceVerified: true },
  "an-flawless-finish": { imageUrl: "https://www.advancednutrients.com/wp-content/uploads/2021/10/flawless-finish-1200x630-1.jpg", sourceUrl: "https://www.advancednutrients.com/products/flawless-finish/", sourceVerified: true },
};

const CATALOG: Product[] = ([
  { id: "bb-grow", name: "Bio·Grow", brand: "BioBizz", range: "BioBizz · Organics", role: "Base croissance", unit: "ml", color: "#9aad78", description: "Base organique pour soutenir la croissance et le feuillage." },
  { id: "bb-bloom", name: "Bio·Bloom", brand: "BioBizz", range: "BioBizz · Organics", role: "Base floraison", unit: "ml", color: "#c5a574", description: "Formule de floraison à monter progressivement." },
  { id: "bb-topmax", name: "Top·Max", brand: "BioBizz", range: "BioBizz · Organics", role: "Booster floraison", unit: "ml", color: "#b78168", description: "Booster de floraison pour la seconde moitié du cycle." },
  { id: "bb-heaven", name: "Bio·Heaven", brand: "BioBizz", range: "BioBizz · Organics", role: "Acides aminés", unit: "ml", color: "#8298a8", description: "Acides aminés et oligoéléments pour la vitalité." },
  { id: "bb-root", name: "Root·Juice", brand: "BioBizz", range: "BioBizz · Organics", role: "Racines", unit: "ml", color: "#8a9a72", description: "Stimulateur racinaire pour le démarrage et les reprises." },
  { id: "bb-acti-vera", name: "Acti·Vera", brand: "BioBizz", range: "BioBizz · Organics", role: "Vitalité", unit: "ml", color: "#81a777", description: "BioBizz 2026 : dosage officiel pour chaque étape du cycle." },
  { id: "bb-fish-mix", name: "Fish·Mix", brand: "BioBizz", range: "BioBizz · Organics", role: "Base croissance", unit: "ml", color: "#a18b68", description: "BioBizz indique 2 ml/L en propagation et croissance, puis recommande Bio·Grow en floraison." },
  { id: "bb-alga-mic", name: "Alg·A·Mic", brand: "BioBizz", range: "BioBizz · Organics", role: "Vitalité", unit: "ml", color: "#73a6a0", description: "BioBizz 2026 Light·Mix : dosage officiel pour chaque étape du cycle." },
  { id: "bb-microbes", name: "Microbes", brand: "BioBizz", range: "BioBizz · Organics", role: "Micro-organismes", unit: "g", color: "#a18e70", description: "Dosage officiel BioBizz exprimé en grammes par litre (g/L), pas en ml/L." },
  { id: "bb-up", name: "Bio·Up", brand: "BioBizz", range: "BioBizz · Organics", role: "Correcteur pH+", unit: "ml", color: "#a6a56b", description: "Correcteur pH officiel BioBizz. Aucun dosage de nutrition par semaine n’est publié dans le tableau Light·Mix." },
  { id: "bb-down", name: "Bio·Down", brand: "BioBizz", range: "BioBizz · Organics", role: "Correcteur pH−", unit: "ml", color: "#8c9f9c", description: "Correcteur pH officiel BioBizz. Aucun dosage de nutrition par semaine n’est publié dans le tableau Light·Mix." },
  { id: "bb-calmag", name: "Calmag", brand: "BioBizz", range: "BioBizz · Organics", role: "Calcium / magnésium", unit: "ml", color: "#7aa5a7", description: "Complément BioBizz officiel. Aucun dosage hebdomadaire n’est indiqué dans le tableau Light·Mix consulté." },
  { id: "canna-a", name: "CANNA COCO A", brand: "Canna", range: "CANNA · COCO", role: "Base A", unit: "ml", color: "#85a4a1", description: "Composant A de la base COCO. Ajouter séparément avant le composant B." },
  { id: "canna-b", name: "CANNA COCO B", brand: "Canna", range: "CANNA · COCO", role: "Base B", unit: "ml", color: "#6e8f8a", description: "Composant B de la base COCO, dosé séparément selon le tableau fabricant." },
  { id: "canna-rhizo", name: "Rhizotonic", brand: "Canna", range: "Canna · Coco", role: "Racines", unit: "ml", color: "#b8a574", description: "Extrait d'algues pour accompagner le système racinaire." },
  { id: "canna-pk", name: "PK 13/14", brand: "Canna", range: "Canna · Coco", role: "Booster PK", unit: "ml", color: "#c98b73", description: "Booster concentré à réserver à une fenêtre courte." },
  { id: "canna-boost", name: "CANNA BOOST", brand: "Canna", range: "CANNA · Additifs", role: "Booster floraison", unit: "ml", color: "#d28f76", description: "Stimulateur de floraison CANNA. Consultez la fiche officielle pour les supports compatibles, la période d’utilisation et le dosage adaptés." },
  { id: "canna-zym", name: "CANNAZYM", brand: "Canna", range: "CANNA · Additifs", role: "Enzymes", unit: "ml", color: "#b8a574", description: "Préparation enzymatique destinée à soutenir l’activité du substrat. Les consignes et fréquences dépendent de l’étiquette et du support." },
  { id: "an-grow-a", name: "Sensi Grow A", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Base croissance · partie A", unit: "ml", color: "#9a8ac2", description: "Dose par composant selon le tableau Sensi Master Recipe Global." },
  { id: "an-grow-b", name: "Sensi Grow B", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Base croissance · partie B", unit: "ml", color: "#8777b3", description: "Dose par composant selon le tableau Sensi Master Recipe Global." },
  { id: "an-bloom-a", name: "Sensi Bloom A", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Base floraison · partie A", unit: "ml", color: "#d1879d", description: "Dose par composant selon le tableau Sensi Master Recipe Global." },
  { id: "an-bloom-b", name: "Sensi Bloom B", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Base floraison · partie B", unit: "ml", color: "#c7768d", description: "Dose par composant selon le tableau Sensi Master Recipe Global." },
  { id: "an-bigbud", name: "Big Bud", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Booster PK", unit: "ml", color: "#c2a36b", description: "Booster de floraison à intégrer selon la réponse de la plante." },
  { id: "an-voodoo", name: "Voodoo Juice", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Micro-organismes", unit: "ml", color: "#87a981", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-tarantula", name: "Tarantula", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Micro-organismes", unit: "ml", color: "#79a16f", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-piranha", name: "Piranha", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Micro-organismes", unit: "ml", color: "#9e9b6b", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-rhino", name: "Rhino Skin", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Silicium", unit: "ml", color: "#67968d", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-sensizym", name: "SensiZym", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Enzymes", unit: "ml", color: "#b8a574", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-bud-candy", name: "Bud Candy", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Additif floraison", unit: "ml", color: "#d28f76", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-b52", name: "B-52", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Vitamines", unit: "ml", color: "#c29e63", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-bud-factor-x", name: "Bud Factor X", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Additif floraison", unit: "ml", color: "#bb827b", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-nirvana", name: "Nirvana", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Additif floraison", unit: "ml", color: "#89986d", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-bud-ignitor", name: "Bud Ignitor", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Début de floraison", unit: "ml", color: "#d0a27a", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-overdrive", name: "Overdrive", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Maturation", unit: "ml", color: "#bf8768", description: "Dosages par semaine vérifiés dans le tableau Sensi Master Recipe Global." },
  { id: "an-flawless-finish", name: "Flawless Finish", brand: "Advanced Nutrients", range: "Advanced Nutrients · pH Perfect", role: "Rinçage", unit: "ml", color: "#84a0aa", description: "Inclusion et dose de rinçage vérifiées dans le tableau Sensi Master Recipe Global." },
  { id: "custom-calmag", name: "CalMag", brand: "Générique", range: "Compléments", role: "Calcium / magnésium", unit: "ml", color: "#7aa5a7", description: "Complément calcium et magnésium pour eau douce ou osmosée." },
] satisfies Product[]).map((product) => ({ ...product, ...PRODUCT_REFERENCES[product.id] }));

function withCatalogReferences(product: TableProduct): TableProduct {
  const reference = CATALOG.find((item) => item.id === product.id);
  if (!reference) return product;
  return {
    ...product,
    imageUrl: product.imageUrl ?? reference.imageUrl,
    sourceUrl: reference.sourceUrl ?? product.sourceUrl,
    sourceVerified: reference.sourceVerified ?? product.sourceVerified,
  };
}

type OfficialChartDefinition = {
  stages: string[];
  doses: Record<string, number[]>;
};

const BIOBIZZ_STAGES = ["Propagation", "Veg", "Flo 1", "Flo 2", "Flo 3", "Flo 4", "Flo 5", "Flo 6", "Flo 7", "Flo 8", "Wash", "Harvest"];
const CANNA_STAGES = ["Root D1-5", "Veg D6-25", "Gen I W1", "Gen I W2", "Gen II W3", "Gen II W4", "Gen II W5", "Gen II W6", "Gen III W7", "Gen IV W8", "W9", "Flush"];
const ADVANCED_NUTRIENTS_STAGES = ["Grow W1", "Grow W2", "Grow W3", "Grow W4", "Bloom W1", "Bloom W2", "Bloom W3", "Bloom W4", "Bloom W5", "Bloom W6", "Bloom W7", "Flush"];

const OFFICIAL_CHARTS: Record<string, OfficialChartDefinition> = {
  "biobizz-light-2026": {
    stages: BIOBIZZ_STAGES,
    doses: {
      "bb-root": [4, 4, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
      "bb-grow": [2, 2, 3, 3, 4, 4, 4, 3, 3, 2, 0, 0],
      "bb-bloom": [0, 0, 3, 4, 4, 4, 4, 3, 3, 2, 0, 0],
      "bb-topmax": [0, 0, 1, 1, 1, 2, 2, 3, 3, 2, 0, 0],
      "bb-heaven": [2, 2, 2, 3, 4, 4, 3, 2, 2, 2, 0, 0],
      "bb-acti-vera": [2, 2, 3, 3, 4, 4, 3, 2, 2, 2, 0, 0],
      "bb-fish-mix": [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      "bb-alga-mic": [0, 2, 2, 2, 3, 3, 4, 4, 3, 2, 0, 0],
      "bb-microbes": [0.4, 0.4, 0.2, 0.2, 0.4, 0.4, 0.4, 0.2, 0.2, 0.2, 0, 0],
    },
  },
  "canna-coco-2026": {
    stages: CANNA_STAGES,
    doses: {
      "canna-a": [2.96, 2.96, 3.35, 3.35, 3.35, 3.35, 3.35, 3.35, 2.96, 2.96, 0, 0],
      "canna-b": [2.96, 2.96, 3.35, 3.35, 3.35, 3.35, 3.35, 3.35, 2.96, 2.96, 0, 0],
      "canna-rhizo": [3.96, 1.98, 1.98, 1.98, 0.53, 0.53, 0.53, 0.53, 0.53, 0, 0, 0],
      "canna-pk": [0, 0, 0, 0, 0, 0, 0, 1.51, 0, 0, 0, 0],
    },
  },
  "advanced-sensi-global": {
    stages: ADVANCED_NUTRIENTS_STAGES,
    doses: {
      "an-grow-a": [1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      "an-grow-b": [1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      "an-bloom-a": [0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0],
      "an-bloom-b": [0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0],
      "an-bigbud": [0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0],
      "an-voodoo": [2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
      "an-tarantula": [2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
      "an-piranha": [2, 2, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
      "an-rhino": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
      "an-sensizym": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
      "an-bud-candy": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
      "an-b52": [2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 0],
      "an-bud-factor-x": [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0],
      "an-nirvana": [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0],
      "an-bud-ignitor": [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
      "an-overdrive": [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
      "an-flawless-finish": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    },
  },
};

function officialDosesFor(table: NutritionTable, productId: string): number[] | undefined {
  if (!table.chartId) return undefined;
  const chart = OFFICIAL_CHARTS[table.chartId];
  const stageDoses = chart?.doses[productId];
  if (!chart || !stageDoses) return undefined;
  return table.weeks.map((_, index) => {
    const stageKey = table.chartStageKeys?.[index];
    const chartIndex = stageKey ? chart.stages.indexOf(stageKey) : -1;
    return chartIndex < 0 ? 0 : stageDoses[chartIndex] ?? 0;
  });
}

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const DEFAULT_TABLES: NutritionTable[] = [
  {
    id: "biobizz-light-2026",
    name: "BioBizz · Light·Mix Peat Free",
    brand: "BioBizz",
    medium: "Terreau Light·Mix sans tourbe",
    description: "Recette fabricant BioBizz 2026 pour Light·Mix sans tourbe. Les doses sont en ml/L sauf Microbes (g/L). Fish·Mix est limité à la croissance selon la note fabricant.",
    weeks: BIOBIZZ_STAGES,
    weekPhases: ["other", "vegetative", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flush", "other"],
    chartId: "biobizz-light-2026",
    chartSourceUrl: "https://biobizz.com/knowledge-base/nutrient-schedule-peat-free",
    chartNotes: "Tableau officiel 2026 Light·Mix Peat Free. Microbes est en g/L. Le graphique Fish·Mix en floraison contredit la note du fabricant; la recette suit la consigne écrite de passer à Bio·Grow.",
    chartStageKeys: BIOBIZZ_STAGES,
    products: CATALOG.filter((product) => OFFICIAL_CHARTS["biobizz-light-2026"].doses[product.id] !== undefined).map((product) => ({
      ...product,
      doses: OFFICIAL_CHARTS["biobizz-light-2026"].doses[product.id] ?? BIOBIZZ_STAGES.map(() => 0),
      enabled: true,
    })),
  },
  {
    id: "canna-coco-2026",
    name: "CANNA COCO · tableau officiel",
    brand: "Canna",
    medium: "Coco · drain-to-waste",
    description: "Recette du tableau officiel CANNA COCO v26.06. Doses d’origine en mL/US gal converties en ml/L (1 US gal = 3,78541 L).",
    weeks: CANNA_STAGES,
    weekPhases: ["other", "vegetative", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "other", "flush"],
    chartId: "canna-coco-2026",
    chartSourceUrl: "https://www.cannagardening.com/growguide",
    chartNotes: "Source CANNA COCO v26.06 : doses publiées en mL/US gal puis converties en ml/L. Seules les doses fixes sont préremplies; doses conditionnelles ou en fourchette omises.",
    chartStageKeys: CANNA_STAGES,
    products: CATALOG.filter((product) => ["canna-a", "canna-b", "canna-rhizo", "canna-pk"].includes(product.id)).map((product) => ({
      ...product,
      doses: OFFICIAL_CHARTS["canna-coco-2026"].doses[product.id] ?? CANNA_STAGES.map(() => 0),
      enabled: true,
    })),
  },
  {
    id: "advanced-sensi-global",
    name: "Advanced Nutrients · Sensi Master Recipe",
    brand: "Advanced Nutrients",
    medium: "Recette Global · support non précisé",
    description: "Tableau fabricant Sensi Master Recipe Global. Les doses des composants A et B sont indiquées séparément.",
    weeks: ADVANCED_NUTRIENTS_STAGES,
    weekPhases: ["vegetative", "vegetative", "vegetative", "vegetative", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flowering", "flush"],
    chartId: "advanced-sensi-global",
    chartSourceUrl: "https://www.advancednutrients.com/feeding/",
    chartNotes: "Sensi Master Recipe Global, doses en ml/L. Le tableau ne précise pas le substrat. Flush W8 inclut Flawless Finish à 2 ml/L.",
    chartStageKeys: ADVANCED_NUTRIENTS_STAGES,
    products: CATALOG.filter((product) => OFFICIAL_CHARTS["advanced-sensi-global"].doses[product.id] !== undefined).map((product) => ({
      ...product,
      doses: OFFICIAL_CHARTS["advanced-sensi-global"].doses[product.id] ?? ADVANCED_NUTRIENTS_STAGES.map(() => 0),
      enabled: true,
    })),
  },
];

const STORAGE_KEY = "canopee-nutrition-v2-tables";
const WATERING_STORAGE_KEY = "canopee-nutrition-v2-waterings";
const CYCLE_TEMPLATES_STORAGE_KEY = "canopee-nutrition-v2-cycle-templates";
const CALENDAR_STORAGE_KEY = "canopee-nutrition-v2-calendar";
const WIKI_STORAGE_KEY = "canopee-nutrition-v2-wiki";
const ASSISTANT_STORAGE_KEY = "canopee-nutrition-v2-botany-chat";
const PREFERENCES_STORAGE_KEY = "canopee-nutrition-v2-preferences";
const JOURNAL_STORAGE_KEY = "canopee-nutrition-v2-journal";
const BACKUP_VERSION = 1;
const WIKI_CATEGORY_LABELS: Record<WikiCategory, string> = {
  legalite: "Cadre légal",
  securite: "Sécurité",
  carnet: "Carnet personnel",
  glossaire: "Glossaire",
};
const DEFAULT_WIKI_UPDATED_AT = new Date().toISOString();

const DEFAULT_WIKI_ARTICLES: WikiArticle[] = [
  {
    id: "wiki-legalite",
    title: "Cadre légal et règles locales",
    category: "legalite",
    summary: "Vérifier les règles applicables avant tout projet.",
    content: "Les règles liées au cannabis varient selon le pays, la région et la situation personnelle. Vérifiez les sources officielles locales concernant l’autorisation, les quantités, l’âge requis et les restrictions de lieu. En cas de doute, demandez conseil à un professionnel qualifié. Cette page est un aide-mémoire à compléter, pas un avis juridique.",
    updatedAt: DEFAULT_WIKI_UPDATED_AT,
  },
  {
    id: "wiki-securite",
    title: "Sécurité et responsabilité",
    category: "securite",
    summary: "Garder les produits et le matériel hors de portée des enfants et des animaux.",
    content: "Conservez les produits dans leur emballage d’origine, avec l’étiquette lisible, dans un endroit fermé et inaccessible aux enfants et aux animaux. Respectez les consignes de protection et d’élimination du fabricant. Ne consommez pas et ne distribuez pas un produit dont la composition ou la provenance est incertaine.",
    updatedAt: DEFAULT_WIKI_UPDATED_AT,
  },
  {
    id: "wiki-notes",
    title: "Mon carnet de notes",
    category: "carnet",
    summary: "Ajoutez ici vos observations et références personnelles.",
    content: "Utilisez cet espace pour noter des observations générales, vos questions et les sources consultées. Ajoutez une date et le contexte à chaque note afin de pouvoir la retrouver facilement.",
    updatedAt: DEFAULT_WIKI_UPDATED_AT,
  },
  {
    id: "wiki-glossaire",
    title: "Glossaire et sources",
    category: "glossaire",
    summary: "Centraliser les termes utiles et les liens de référence vérifiés.",
    content: "Ajoutez les termes que vous souhaitez clarifier ainsi que des liens vers des sources fiables, datées et pertinentes pour votre région. Privilégiez les autorités compétentes et la documentation publiée par les fabricants pour les informations concernant leurs produits.",
    updatedAt: DEFAULT_WIKI_UPDATED_AT,
  },
];

const DEFAULT_PREFERENCES: UserPreferences = {
  experience: "novice",
  theme: "dark",
  defaultLiters: 20,
  showManufacturerDetails: true,
  compactMode: false,
};

function savedPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return DEFAULT_PREFERENCES;
    const value = parsed as Partial<UserPreferences>;
    return {
      experience: value.experience === "expert" ? "expert" : "novice",
      theme: value.theme === "light" ? "light" : "dark",
      defaultLiters: typeof value.defaultLiters === "number" && Number.isFinite(value.defaultLiters)
        ? Math.min(1000, Math.max(0.5, value.defaultLiters))
        : DEFAULT_PREFERENCES.defaultLiters,
      showManufacturerDetails: value.showManufacturerDetails !== false,
      compactMode: value.compactMode === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  base: "Nutriments de base",
  flowering: "Floraison",
  root: "Racines",
  "pk-booster": "Booster PK · teneur exacte à vérifier",
  organic: "Organique",
  "mineral-salts": "Minéral / sels",
  beneficials: "Micro-organismes",
  enzymes: "Enzymes",
  silicon: "Silicium",
  "ph-adjustment": "Correction pH",
  vitamins: "Vitamines / vitalité",
  hormones: "Hormones",
  "cloning-seed": "Clonage & semis",
  "pest-disease": "Ravageurs & maladies",
  humic: "Acides humiques",
};

const PRODUCT_CATEGORY_FILTERS: { id: ProductCategory | "all"; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "base", label: "Bases nutritives" },
  { id: "flowering", label: "Floraison" },
  { id: "root", label: "Racines" },
  { id: "pk-booster", label: "Boosters PK" },
  { id: "organic", label: "Organiques" },
  { id: "mineral-salts", label: "Minéraux / sels" },
  { id: "beneficials", label: "Micro-organismes" },
  { id: "enzymes", label: "Enzymes" },
  { id: "silicon", label: "Silicium" },
  { id: "ph-adjustment", label: "pH" },
  { id: "vitamins", label: "Vitamines" },
  { id: "hormones", label: "Hormones" },
  { id: "cloning-seed", label: "Cloning & Seed Starting" },
  { id: "pest-disease", label: "Pest & Disease Control" },
  { id: "humic", label: "Vital Humic" },
];

function getProductCategories(product: Product): ProductCategory[] {
  const role = normalizeProductName(product.role);
  const id = normalizeProductName(product.id);
  const productText = normalizeProductName(`${product.name} ${product.role} ${product.description}`);
  const categories: ProductCategory[] = [];
  if (role.includes("base")) categories.push("base");
  if (role.includes("floraison") || role.includes("booster floraison") || role.includes("additif floraison")) categories.push("flowering");
  if (role.includes("racines")) categories.push("root");
  if (role.includes("booster pk") || id.includes("pk") || id.includes("bigbud")) categories.push("pk-booster");
  if (product.brand === "BioBizz" && normalizeProductName(product.range).includes("organics")) categories.push("organic");
  if (product.brand.toLowerCase() === "canna" && normalizeProductName(product.range).includes("coco")) categories.push("mineral-salts");
  if (role.includes("micro organisme")) categories.push("beneficials");
  if (role.includes("enzyme")) categories.push("enzymes");
  if (role.includes("silicium")) categories.push("silicon");
  if (role.includes("ph") || role.includes("correcteur")) categories.push("ph-adjustment");
  if (role.includes("vitamine") || role.includes("vitalite") || role.includes("acides amines")) categories.push("vitamins");
  if (role.includes("hormone")) categories.push("hormones");
  if (/cloning|clone|seed starting|semis|bouturage/.test(productText)) categories.push("cloning-seed");
  if (/pest|disease|insect|fungicide|fongicide|ravageur|maladie/.test(productText)) categories.push("pest-disease");
  if (/humic|fulvic|humique|fulvique/.test(productText)) categories.push("humic");
  return categories;
}

function getProductUsage(product: Product) {
  const role = normalizeProductName(product.role);
  if (role.includes("base")) return "Utilisez comme base nutritive uniquement si le support et le stade correspondent au tableau du fabricant. Mélangez chaque composant séparément dans l’eau.";
  if (role.includes("booster pk")) return "Réservez à la fenêtre et au dosage explicitement indiqués sur l’étiquette ou le tableau officiel. La mention PK décrit sa famille, pas sa teneur exacte.";
  if (role.includes("racines")) return "Destiné à accompagner l’installation racinaire. Vérifiez les consignes de dilution, la compatibilité du support et la fréquence sur l’étiquette officielle.";
  if (role.includes("micro organisme")) return "Respectez la dose, la conservation et les conditions d’utilisation indiquées par le fabricant; ne convertissez pas les grammes en millilitres.";
  if (role.includes("correcteur")) return "À utiliser progressivement pour ajuster la solution, avec mesure adaptée; suivez la plage et les précautions indiquées sur l’étiquette.";
  if (role.includes("silicium")) return "Suivez l’ordre de mélange recommandé par le fabricant et incorporez séparément pour éviter les incompatibilités.";
  if (role.includes("enzyme")) return "Respectez le dosage et la fréquence propres au produit, sans les déduire d’une autre gamme.";
  return "Consultez l’étiquette fabricant pour le dosage, le stade et la fréquence. La description de bibliothèque ne remplace pas les instructions officielles.";
}

function savedCycleTemplates(): CycleTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CYCLE_TEMPLATES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is CycleTemplate =>
      Boolean(item && typeof item === "object" && "id" in item && "name" in item && "table" in item && isNutritionTable(item.table))) : [];
  } catch {
    return [];
  }
}

function savedCalendarTasks(): CalendarTask[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CALENDAR_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is CalendarTask =>
      Boolean(item && typeof item === "object" && "id" in item && "title" in item && "startsAt" in item && "timeZone" in item
        && typeof item.id === "string" && typeof item.title === "string" && typeof item.startsAt === "string"
        && typeof item.timeZone === "string" && Number.isFinite(Date.parse(item.startsAt)))) : [];
  } catch {
    return [];
  }
}

function isWikiCategory(value: unknown): value is WikiCategory {
  return value === "legalite" || value === "securite" || value === "carnet" || value === "glossaire";
}

function savedWikiArticles(): WikiArticle[] {
  if (typeof window === "undefined") return DEFAULT_WIKI_ARTICLES;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(WIKI_STORAGE_KEY) ?? "null");
    if (!Array.isArray(parsed)) return DEFAULT_WIKI_ARTICLES;
    return parsed.filter((item): item is WikiArticle =>
      Boolean(item && typeof item === "object" && "id" in item && "title" in item && "category" in item
        && "summary" in item && "content" in item && "updatedAt" in item
        && typeof item.id === "string" && typeof item.title === "string" && isWikiCategory(item.category)
        && typeof item.summary === "string" && typeof item.content === "string" && typeof item.updatedAt === "string"));
  } catch {
    return DEFAULT_WIKI_ARTICLES;
  }
}

function savedAssistantMessages(): AssistantMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(ASSISTANT_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is AssistantMessage =>
      Boolean(item && typeof item === "object" && "role" in item && "content" in item && "createdAt" in item
        && (item.role === "user" || item.role === "assistant") && typeof item.content === "string"
        && typeof item.createdAt === "string")) : [];
  } catch {
    return [];
  }
}

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localTimeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function createJournalDraft(): JournalDraft {
  const now = new Date();
  return {
    title: "",
    category: "observation",
    plantName: "",
    details: "",
    dateTime: `${localDateValue(now)}T${localTimeValue(now)}`,
    temperature: "",
    humidity: "",
  };
}

function journalDraftFromEntry(entry: CultureJournalEntry): JournalDraft {
  const date = new Date(entry.createdAt);
  return {
    title: entry.title,
    category: entry.category,
    plantName: entry.plantName,
    details: entry.details,
    dateTime: `${localDateValue(date)}T${localTimeValue(date)}`,
    temperature: entry.temperature === undefined ? "" : String(entry.temperature),
    humidity: entry.humidity === undefined ? "" : String(entry.humidity),
  };
}

function calendarTaskDate(task: CalendarTask, timeZone = task.timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(task.startsAt));
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function calendarTaskTime(task: CalendarTask, timeZone = task.timeZone) {
  return new Intl.DateTimeFormat("fr-FR", { timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date(task.startsAt));
}

const savedTables = (): NutritionTable[] => {
  if (typeof window === "undefined") return DEFAULT_TABLES;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_TABLES;
    const saved = (parsed as NutritionTable[]).map((item) => {
      const withReferences = { ...item, products: item.products.map(withCatalogReferences) };
      if ((item.id === "biobizz-light" || item.id === "canna-coco") && !item.chartId) {
        return {
          ...withReferences,
          name: `${item.name} · sauvegardée`,
          description: `${item.description} Recette conservée de votre session précédente; dosages non vérifiés par rapport aux tableaux officiels.`,
          custom: true,
        };
      }
      return withReferences;
    });
    const savedIds = new Set(saved.map((item) => item.id));
    return [...DEFAULT_TABLES.filter((item) => !savedIds.has(item.id)), ...saved];
  } catch {
    return DEFAULT_TABLES;
  }
};

function savedWaterings(): WateringRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(WATERING_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as WateringRecord[] : [];
  } catch {
    return [];
  }
}

function isJournalCategory(value: unknown): value is JournalCategory {
  return value === "observation" || value === "environment" || value === "maintenance" || value === "note";
}

function isCultureJournalEntry(value: unknown): value is CultureJournalEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<CultureJournalEntry>;
  return typeof entry.id === "string" && typeof entry.createdAt === "string" && Number.isFinite(Date.parse(entry.createdAt))
    && typeof entry.title === "string" && isJournalCategory(entry.category)
    && typeof entry.plantName === "string" && typeof entry.details === "string"
    && (entry.temperature === undefined || (typeof entry.temperature === "number" && Number.isFinite(entry.temperature)))
    && (entry.humidity === undefined || (typeof entry.humidity === "number" && Number.isFinite(entry.humidity)));
}

function savedJournalEntries(): CultureJournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(JOURNAL_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCultureJournalEntry) : [];
  } catch {
    return [];
  }
}

function isWateringRecord(value: unknown): value is WateringRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WateringRecord>;
  return typeof record.id === "string" && typeof record.createdAt === "string" && Number.isFinite(Date.parse(record.createdAt))
    && typeof record.tableName === "string" && typeof record.week === "string"
    && typeof record.liters === "number" && Number.isFinite(record.liters)
    && Array.isArray(record.products) && record.products.every((product) =>
      product && typeof product.name === "string" && typeof product.dosePerLiter === "number"
      && typeof product.total === "number" && (product.unit === "ml" || product.unit === "g"));
}

function isCalendarTask(value: unknown): value is CalendarTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<CalendarTask>;
  return typeof task.id === "string" && typeof task.title === "string"
    && (task.kind === "watering" || task.kind === "feeding" || task.kind === "maintenance" || task.kind === "note")
    && typeof task.startsAt === "string" && Number.isFinite(Date.parse(task.startsAt))
    && typeof task.timeZone === "string" && isValidTimeZone(task.timeZone) && typeof task.tableId === "string"
    && typeof task.tableName === "string" && typeof task.week === "string"
    && typeof task.note === "string" && typeof task.completed === "boolean";
}

function isCycleTemplate(value: unknown): value is CycleTemplate {
  if (!value || typeof value !== "object") return false;
  const template = value as Partial<CycleTemplate>;
  return typeof template.id === "string" && typeof template.name === "string"
    && typeof template.savedAt === "string" && isNutritionTable(template.table);
}

function isWikiArticle(value: unknown): value is WikiArticle {
  if (!value || typeof value !== "object") return false;
  const article = value as Partial<WikiArticle>;
  return typeof article.id === "string" && typeof article.title === "string" && isWikiCategory(article.category)
    && typeof article.summary === "string" && typeof article.content === "string" && typeof article.updatedAt === "string";
}

function isAssistantMessage(value: unknown): value is AssistantMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<AssistantMessage>;
  return (message.role === "user" || message.role === "assistant")
    && typeof message.content === "string" && typeof message.createdAt === "string";
}

function isValidHttpUrl(value: unknown): value is string | undefined {
  if (value === undefined) return true;
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isUserPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== "object") return false;
  const preferences = value as Partial<UserPreferences>;
  return (preferences.experience === "novice" || preferences.experience === "expert")
    && (preferences.theme === "dark" || preferences.theme === "light")
    && typeof preferences.defaultLiters === "number" && Number.isFinite(preferences.defaultLiters)
    && typeof preferences.showManufacturerDetails === "boolean" && typeof preferences.compactMode === "boolean";
}

function isAppBackup(value: unknown): value is {
  version: number;
  data: {
    tables: NutritionTable[];
    waterings: WateringRecord[];
    cycleTemplates: CycleTemplate[];
    calendarTasks: CalendarTask[];
    wikiArticles: WikiArticle[];
    assistantMessages: AssistantMessage[];
    journalEntries: CultureJournalEntry[];
    preferences: UserPreferences;
  };
} {
  if (!value || typeof value !== "object") return false;
  const backup = value as { version?: unknown; data?: Record<string, unknown> };
  const data = backup.data;
  return backup.version === BACKUP_VERSION && !!data
    && Array.isArray(data.tables) && data.tables.length > 0 && data.tables.every(isNutritionTable)
    && new Set(data.tables.map((table) => table.id)).size === data.tables.length
    && Array.isArray(data.waterings) && data.waterings.every(isWateringRecord)
    && Array.isArray(data.cycleTemplates) && data.cycleTemplates.every(isCycleTemplate)
    && Array.isArray(data.calendarTasks) && data.calendarTasks.every(isCalendarTask)
    && Array.isArray(data.wikiArticles) && data.wikiArticles.every(isWikiArticle)
    && Array.isArray(data.assistantMessages) && data.assistantMessages.every(isAssistantMessage)
    && Array.isArray(data.journalEntries) && data.journalEntries.every(isCultureJournalEntry)
    && isUserPreferences(data.preferences);
}

function csvCell(value: string | number | boolean) {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

function isNutritionTable(value: unknown): value is NutritionTable {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NutritionTable>;
  return typeof candidate.id === "string" && typeof candidate.name === "string"
    && typeof candidate.brand === "string" && typeof candidate.medium === "string"
    && typeof candidate.description === "string"
    && isValidHttpUrl(candidate.chartSourceUrl) && isValidHttpUrl(candidate.manufacturerPageUrl)
    && (candidate.brandImageUrl === undefined || (typeof candidate.brandImageUrl === "string" && isValidImageReference(candidate.brandImageUrl)))
    && Array.isArray(candidate.weeks)
    && candidate.weeks.length > 0 && candidate.weeks.every((week) => typeof week === "string")
    && (candidate.weekPhases === undefined || (Array.isArray(candidate.weekPhases)
      && candidate.weekPhases.length === candidate.weeks.length
      && candidate.weekPhases.every((phase) => phase === "vegetative" || phase === "flowering" || phase === "flush" || phase === "other")))
    && (candidate.chartStageKeys === undefined || (Array.isArray(candidate.chartStageKeys)
      && candidate.chartStageKeys.length === candidate.weeks.length
      && candidate.chartStageKeys.every((stage) => stage === null || typeof stage === "string")))
    && Array.isArray(candidate.products)
    && candidate.products.every((product) => product && typeof product.id === "string"
      && typeof product.name === "string" && typeof product.brand === "string"
      && typeof product.range === "string" && typeof product.role === "string"
      && (product.unit === "ml" || product.unit === "g") && typeof product.color === "string"
      && typeof product.description === "string" && typeof product.enabled === "boolean"
      && isValidHttpUrl(product.sourceUrl) && isValidHttpUrl(product.doseSourceUrl)
      && (product.imageUrl === undefined || (typeof product.imageUrl === "string" && isValidImageReference(product.imageUrl)))
      && (product.sourceVerified === undefined || typeof product.sourceVerified === "boolean")
      && (product.doseVerified === undefined || typeof product.doseVerified === "boolean")
      && Array.isArray(product.doses) && product.doses.length === candidate.weeks?.length
      && product.doses.every((dose) => typeof dose === "number" && Number.isFinite(dose) && dose >= 0));
}

async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choisissez un fichier image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("L’image doit faire moins de 8 Mo.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Impossible de préparer cette image.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressDiagnosticImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choisissez une image JPEG, PNG ou WebP.");
  }
  if (file.size > 12 * 1024 * 1024) throw new Error("L’image d’origine doit faire moins de 12 Mo.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Impossible de préparer cette image.");
    let scale = Math.min(1, 1440 / Math.max(image.naturalWidth, image.naturalHeight));
    let quality = 0.82;
    let dataUrl = "";
    for (let attempt = 0; attempt < 4; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length <= MAX_DIAGNOSTIC_IMAGE_DATA_URL_LENGTH) return dataUrl;
      scale *= 0.8;
      quality *= 0.88;
    }
    throw new Error("Cette image est trop détaillée pour l’analyse. Choisissez une photo plus petite.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function isValidImageReference(value: string) {
  if (!value) return true;
  if (/^data:image\/jpeg;base64,[a-z0-9+/]+=*$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatDose(value: number) {
  if (value === 0) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function isManufacturerSearchResult(value: unknown): value is ManufacturerSearchResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ManufacturerSearchResult>;
  return typeof candidate.query === "string" && typeof candidate.searchedAt === "string"
    && Array.isArray(candidate.products) && Array.isArray(candidate.unavailableSources);
}

function normalizeProductName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function officialChartForRange(candidate: ManufacturerProductCandidate) {
  const name = normalizeProductName(candidate.name);
  const chartId = candidate.brand === "CANNA" && name.includes("canna coco")
    ? "canna-coco-2026"
    : candidate.brand === "BioBizz" && name.includes("light mix")
      ? "biobizz-light-2026"
      : candidate.brand === "Advanced Nutrients" && name.includes("sensi")
        ? "advanced-sensi-global"
        : undefined;
  return chartId ? DEFAULT_TABLES.find((table) => table.chartId === chartId) : undefined;
}

function getWeekPhase(table: NutritionTable, index: number): WeekPhase {
  const storedPhase = table.weekPhases?.[index];
  if (storedPhase) return storedPhase;
  const label = table.weeks[index]?.toLowerCase() ?? "";
  if (/flush|rinçage|rincage/.test(label)) return "flush";
  if (/veg/.test(label)) return "vegetative";
  if (/flo|bloom|pk|mûr|mur/.test(label)) return "flowering";
  return "other";
}

function getWeekPhases(table: NutritionTable): WeekPhase[] {
  return table.weeks.map((_, index) => getWeekPhase(table, index));
}

function getWeekPhaseLabel(phase: WeekPhase) {
  if (phase === "vegetative") return "Végétatif";
  if (phase === "flowering") return "Floraison";
  if (phase === "flush") return "Flush";
  return "Autre";
}

export default function Home() {
  const [location, setLocation] = useState(() => typeof window === "undefined" ? "/" : getAppPath());
  const [preferences, setPreferences] = useState<UserPreferences>(savedPreferences);
  const [navigationCollapsed, setNavigationCollapsed] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("canopee-nutrition-v2-navigation-collapsed") === "true");
  const [libraryCollapsed, setLibraryCollapsed] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("canopee-nutrition-v2-library-collapsed") === "true");
  const [tables, setTables] = useState<NutritionTable[]>(savedTables);
  const [selectedTableId, setSelectedTableId] = useState("biobizz-light-2026");
  const [weekIndex, setWeekIndex] = useState(0);
  const [liters, setLiters] = useState(() => savedPreferences().defaultLiters);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [productCategory, setProductCategory] = useState<ProductCategory | "all">("all");
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [showEditTable, setShowEditTable] = useState(false);
  const [showCycleSettings, setShowCycleSettings] = useState(false);
  const [showCycleTemplates, setShowCycleTemplates] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [showManualProduct, setShowManualProduct] = useState(false);
  const [mobileCatalog, setMobileCatalog] = useState(false);
  const [manufacturerSearchResult, setManufacturerSearchResult] = useState<ManufacturerSearchResult | null>(null);
  const [manufacturerSearchLoading, setManufacturerSearchLoading] = useState(false);
  const [selectedManufacturerProduct, setSelectedManufacturerProduct] = useState<ManufacturerProductCandidate | null>(null);
  const [manufacturerProductUnit, setManufacturerProductUnit] = useState<"ml" | "g">("ml");
  const [waterings, setWaterings] = useState<WateringRecord[]>(savedWaterings);
  const [journalEntries, setJournalEntries] = useState<CultureJournalEntry[]>(savedJournalEntries);
  const [journalDraft, setJournalDraft] = useState<JournalDraft>(createJournalDraft);
  const [editingJournalEntryId, setEditingJournalEntryId] = useState<string | null>(null);
  const [journalSearch, setJournalSearch] = useState("");
  const [cycleTemplates, setCycleTemplates] = useState<CycleTemplate[]>(savedCycleTemplates);
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>(savedCalendarTasks);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>(savedWikiArticles);
  const [wikiKnowledgeSources, setWikiKnowledgeSources] = useState<WikiKnowledgeSource[]>([]);
  const [wikiKnowledgeLoading, setWikiKnowledgeLoading] = useState(false);
  const [wikiKnowledgeError, setWikiKnowledgeError] = useState("");
  const [wikiKnowledgeSearch, setWikiKnowledgeSearch] = useState("");
  const [selectedWikiKnowledgeSource, setSelectedWikiKnowledgeSource] = useState<WikiKnowledgeSource | null>(null);
  const [wikiKnowledgeContent, setWikiKnowledgeContent] = useState("");
  const [wikiKnowledgeContentLoading, setWikiKnowledgeContentLoading] = useState(false);
  const [wikiKnowledgeContentError, setWikiKnowledgeContentError] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>(savedAssistantMessages);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantImageDataUrl, setAssistantImageDataUrl] = useState<string | null>(null);
  const [assistantImageLoading, setAssistantImageLoading] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [wikiSearch, setWikiSearch] = useState("");
  const [wikiCategory, setWikiCategory] = useState<WikiCategory | "all">("all");
  const [selectedWikiArticleId, setSelectedWikiArticleId] = useState("");
  const [showWikiEditor, setShowWikiEditor] = useState(false);
  const [editedWikiArticle, setEditedWikiArticle] = useState<WikiArticle | null>(null);
  const [cycleTemplateName, setCycleTemplateName] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => localDateValue(new Date()));
  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarKind, setCalendarKind] = useState<CalendarTask["kind"]>("watering");
  const [calendarDate, setCalendarDate] = useState(() => localDateValue(new Date()));
  const [calendarTime, setCalendarTime] = useState(() => localTimeValue(new Date()));
  const [calendarNote, setCalendarNote] = useState("");
  const [newTable, setNewTable] = useState({ name: "", brand: "", medium: "", description: "" });
  const [editedTable, setEditedTable] = useState({ name: "", brand: "", brandImageUrl: "", medium: "", description: "" });
  const [manualProduct, setManualProduct] = useState({ name: "", brand: "", role: "", unit: "ml" as "ml" | "g" });

  const pageFromPath: Record<string, AppPage> = {
    "/": "nutrition",
    "/nutrition": "nutrition",
    "/bibliotheque": "library",
    "/calendrier": "calendar",
    "/journal": "journal",
    "/wiki": "wiki",
    "/assistant-botanique": "assistant",
    "/parametres": "settings",
  };
  const activePage = pageFromPath[location] ?? "nutrition";
  const showCollapsedLibraryRail = activePage === "nutrition" && libraryCollapsed && !mobileCatalog;
  const navigationItems: { id: AppPage; label: string; path: string; icon: typeof LayoutDashboard }[] = [
    { id: "nutrition", label: "Nutrition", path: "/nutrition", icon: LayoutDashboard },
    { id: "library", label: "Bibliothèque", path: "/bibliotheque", icon: Library },
    { id: "calendar", label: "Calendrier", path: "/calendrier", icon: CalendarDays },
    { id: "journal", label: "Journal", path: "/journal", icon: ClipboardList },
    { id: "wiki", label: "Wiki", path: "/wiki", icon: BookOpen },
    { id: "assistant", label: "Assistant IA", path: "/assistant-botanique", icon: MessageCircle },
    { id: "settings", label: "Paramètres", path: "/parametres", icon: Settings },
  ];
  const gridColumns = activePage !== "nutrition"
    ? navigationCollapsed ? "lg:grid-cols-[76px_minmax(0,1fr)]" : "lg:grid-cols-[240px_minmax(0,1fr)]"
    : navigationCollapsed
      ? libraryCollapsed ? "lg:grid-cols-[76px_minmax(0,1fr)_76px]" : "lg:grid-cols-[76px_minmax(0,1fr)_340px]"
      : libraryCollapsed ? "lg:grid-cols-[240px_minmax(0,1fr)_76px]" : "lg:grid-cols-[240px_minmax(0,1fr)_340px]";
  function navigateTo(path: string) {
    const browserPath = `${appBasePath}${path}`;
    if (window.location.pathname !== browserPath) window.history.pushState({}, "", browserPath);
    setLocation(path);
    setMobileCatalog(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const table = tables.find((item) => item.id === selectedTableId) ?? tables[0];
  const week = table.weeks[Math.min(weekIndex, table.weeks.length - 1)] ?? "Semaine 1";
  const currentProducts = table.products.filter((product) => product.enabled);
  const currentDose = (product: TableProduct) => product.doses[Math.min(weekIndex, product.doses.length - 1)] ?? 0;
  const totalMlPerLiter = currentProducts.filter((product) => product.unit === "ml").reduce((sum, product) => sum + currentDose(product), 0);
  const totalGramsPerLiter = currentProducts.filter((product) => product.unit === "g").reduce((sum, product) => sum + currentDose(product), 0);
  const calendarTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const visibleWikiArticles = wikiArticles.filter((article) => {
    const matchesCategory = wikiCategory === "all" || article.category === wikiCategory;
    const normalizedSearch = normalizeProductName(wikiSearch);
    const matchesSearch = !normalizedSearch || normalizeProductName(`${article.title} ${article.summary} ${article.content} ${WIKI_CATEGORY_LABELS[article.category]}`).includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
  const selectedWikiArticle = visibleWikiArticles.find((article) => article.id === selectedWikiArticleId) ?? visibleWikiArticles[0] ?? null;
  const visibleWikiKnowledgeSources = wikiKnowledgeSources.filter((source) => normalizeProductName(source.title).includes(normalizeProductName(wikiKnowledgeSearch)));
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: offset + dayCount }, (_, index) =>
      index < offset ? null : new Date(year, month, index - offset + 1));
  }, [calendarMonth]);
  const selectedDayTasks = useMemo(() => calendarTasks
    .filter((task) => calendarTaskDate(task, calendarTimeZone) === selectedCalendarDate)
    .sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt)), [calendarTasks, selectedCalendarDate, calendarTimeZone]);
  const visibleJournalEntries = useMemo(() => {
    const term = normalizeProductName(journalSearch);
    return journalEntries
      .filter((entry) => !term || normalizeProductName(`${entry.title} ${entry.plantName} ${entry.details} ${entry.category}`).includes(term))
      .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
  }, [journalEntries, journalSearch]);
  const calendarMonthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: calendarTimeZone }).format(calendarMonth);
  const selectedProductName = selectedManufacturerProduct ? normalizeProductName(selectedManufacturerProduct.name) : "";
  const selectedCatalogProduct = selectedManufacturerProduct ? CATALOG.find((product) => product.brand.toLowerCase() === selectedManufacturerProduct.brand.toLowerCase()
    && (selectedProductName === normalizeProductName(product.name) || selectedProductName.startsWith(`${normalizeProductName(product.name)} `))) : undefined;
  const selectedProductDoses = selectedCatalogProduct ? officialDosesFor(table, selectedCatalogProduct.id) : undefined;
  const selectedRangeChart = selectedManufacturerProduct?.kind === "range" ? officialChartForRange(selectedManufacturerProduct) : undefined;
  const filteredCatalog = useMemo(() => {
    const term = normalizeProductName(search);
    const compactTerm = term.replace(/\s/g, "");
    const matches = (value: string) => {
      const normalized = normalizeProductName(value);
      return normalized.includes(term) || normalized.replace(/\s/g, "").includes(compactTerm);
    };
    const categoriesFromSearch = (value: string): ProductCategory[] => {
      if (/hormone/.test(value)) return ["hormones"];
      if (/cloning|clone|seed starting|semis|bouturage/.test(value)) return ["cloning-seed"];
      if (/organique|organic/.test(value)) return ["organic"];
      if (/sels?|mineraux|mineral/.test(value)) return ["mineral-salts"];
      if (/pest|disease|insect|ravageur|maladie/.test(value)) return ["pest-disease"];
      if (/vital humic|humic|fulvic|humique|fulvique/.test(value)) return ["humic"];
      if (/teneur (elevee|forte) en (p|k)|forte teneur en (p|k)|phosphore|potassium|high (in )?(p|k|phosphorus|potassium)|p k|pk/.test(value)) return ["pk-booster"];
      if (/fertilisant|nutriment|nutrient|nutrition/.test(value)) return ["base", "flowering", "pk-booster", "root", "beneficials"];
      if (/racine|root/.test(value)) return ["root"];
      if (/floraison|flower/.test(value)) return ["flowering"];
      if (/micro organisme|microbe/.test(value)) return ["beneficials"];
      if (/enzyme/.test(value)) return ["enzymes"];
      if (/silicium|silicon/.test(value)) return ["silicon"];
      if (/ph/.test(value)) return ["ph-adjustment"];
      if (/vitamine|vitalite/.test(value)) return ["vitamins"];
      return [];
    };
    const searchedCategories = categoriesFromSearch(term);
    return CATALOG.filter((product) => {
      const categories = getProductCategories(product);
      if (productCategory !== "all" && !categories.includes(productCategory)) return false;
      if (!term) return true;
      if (searchedCategories.some((category) => categories.includes(category))) return true;
      if (searchMode === "range") return matches(product.range) || matches(product.brand);
      if (searchMode === "product") return matches(product.name);
      return [product.name, product.brand, product.range, product.role, ...categories.map((category) => PRODUCT_CATEGORY_LABELS[category])].some(matches);
    });
  }, [search, searchMode, productCategory]);

  useEffect(() => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.classList.toggle("light-theme", preferences.theme === "light");
  }, [preferences]);

  useEffect(() => {
    window.localStorage.setItem("canopee-nutrition-v2-navigation-collapsed", String(navigationCollapsed));
  }, [navigationCollapsed]);

  useEffect(() => {
    window.localStorage.setItem("canopee-nutrition-v2-library-collapsed", String(libraryCollapsed));
  }, [libraryCollapsed]);

  useEffect(() => {
    const pageLabel = navigationItems.find((item) => item.id === activePage)?.label ?? "Nutrition";
    document.title = `Canopée — ${pageLabel}`;
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "wiki") return;
    let cancelled = false;
    setWikiKnowledgeLoading(true);
    setWikiKnowledgeError("");
    fetch(`${import.meta.env.BASE_URL}knowledge/index.json`)
      .then(async (response) => {
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Impossible de charger le dossier documentaire.";
          throw new Error(message);
        }
        if (!isWikiKnowledgeSources(payload)) throw new Error("L’index du dossier documentaire est invalide.");
        if (!cancelled) setWikiKnowledgeSources(payload);
      })
      .catch((error: unknown) => {
        if (!cancelled) setWikiKnowledgeError(error instanceof Error ? error.message : "Impossible de charger le dossier documentaire.");
      })
      .finally(() => {
        if (!cancelled) setWikiKnowledgeLoading(false);
      });
    return () => { cancelled = true; };
  }, [activePage]);

  useEffect(() => {
    const source = selectedWikiKnowledgeSource;
    if (!source || source.kind !== "markdown") {
      setWikiKnowledgeContent("");
      setWikiKnowledgeContentError("");
      setWikiKnowledgeContentLoading(false);
      return;
    }
    const controller = new AbortController();
    setWikiKnowledgeContent("");
    setWikiKnowledgeContentError("");
    setWikiKnowledgeContentLoading(true);
    const sourceUrl = `${import.meta.env.BASE_URL}knowledge/${encodeURIComponent(source.filename)}`;
    fetch(sourceUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Le document « ${source.title} » est inaccessible (HTTP ${response.status}).`);
        return response.text();
      })
      .then((content) => setWikiKnowledgeContent(content))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setWikiKnowledgeContentError(error instanceof Error ? error.message : "Impossible de lire ce document.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setWikiKnowledgeContentLoading(false);
      });
    return () => controller.abort();
  }, [selectedWikiKnowledgeSource]);

  useEffect(() => {
    const handlePopState = () => setLocation(getAppPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function updatePreferences(update: Partial<UserPreferences>) {
    setPreferences((current) => {
      const next = { ...current, ...update };
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (update.defaultLiters !== undefined) setLiters(update.defaultLiters);
    if (update.theme !== undefined) document.documentElement.classList.toggle("light-theme", update.theme === "light");
  }

  function persist(next: NutritionTable[]) {
    setTables(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function persistCycleTemplates(next: CycleTemplate[]) {
    setCycleTemplates(next);
    window.localStorage.setItem(CYCLE_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
  }

  function persistWikiArticles(next: WikiArticle[]) {
    setWikiArticles(next);
    window.localStorage.setItem(WIKI_STORAGE_KEY, JSON.stringify(next));
  }

  function startWikiArticle() {
    setEditedWikiArticle({
      id: `wiki-${Date.now()}`,
      title: "",
      category: "carnet",
      summary: "",
      content: "",
      updatedAt: new Date().toISOString(),
    });
    setShowWikiEditor(true);
  }

  function editWikiArticle(article: WikiArticle) {
    setEditedWikiArticle({ ...article });
    setShowWikiEditor(true);
  }

  function saveWikiArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editedWikiArticle?.title.trim() || !editedWikiArticle.content.trim()) {
      toast.error("Ajoutez un titre et du contenu à votre article.");
      return;
    }
    const article: WikiArticle = {
      ...editedWikiArticle,
      title: editedWikiArticle.title.trim(),
      summary: editedWikiArticle.summary.trim() || "Article personnel",
      content: editedWikiArticle.content.trim(),
      updatedAt: new Date().toISOString(),
    };
    const exists = wikiArticles.some((item) => item.id === article.id);
    persistWikiArticles(exists
      ? wikiArticles.map((item) => item.id === article.id ? article : item)
      : [article, ...wikiArticles]);
    setSelectedWikiArticleId(article.id);
    setShowWikiEditor(false);
    setEditedWikiArticle(null);
    toast.success(exists ? "Article Wiki mis à jour." : "Article ajouté au Wiki.");
  }

  function deleteWikiArticle(article: WikiArticle) {
    if (!window.confirm(`Supprimer l’article « ${article.title} » ? Cette action est irréversible.`)) return;
    const next = wikiArticles.filter((item) => item.id !== article.id);
    persistWikiArticles(next);
    if (selectedWikiArticleId === article.id) setSelectedWikiArticleId(next[0]?.id ?? "");
    toast.success("Article supprimé du Wiki.");
  }

  function clearAssistantConversation() {
    setAssistantMessages([]);
    window.localStorage.removeItem(ASSISTANT_STORAGE_KEY);
    setAssistantError("");
    toast.success("Conversation effacée de cet appareil.");
  }

  async function selectAssistantImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setAssistantImageLoading(true);
    setAssistantError("");
    try {
      const imageDataUrl = await compressDiagnosticImage(file);
      setAssistantImageDataUrl(imageDataUrl);
      if (!assistantQuestion.trim()) setAssistantQuestion("Veuillez analyser cette plante et relever le texte utile visible sur la photo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de préparer cette image.");
    } finally {
      setAssistantImageLoading(false);
    }
  }

  async function askBotanyAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isStaticPagesDeployment) {
      setAssistantError("L’assistant botanique nécessite un serveur et n’est pas disponible sur cette version GitHub Pages.");
      return;
    }
    const question = assistantQuestion.trim() || (assistantImageDataUrl ? "Analysez la plante visible et relevez le texte utile sur la photo." : "");
    if (!question) {
      toast.error("Écrivez une question avant l’envoi.");
      return;
    }
    if (question.length > 2000) {
      toast.error("La question ne peut pas dépasser 2 000 caractères.");
      return;
    }

    const userMessage: AssistantMessage = { role: "user", content: question, createdAt: new Date().toISOString() };
    const conversation = [...assistantMessages, userMessage].slice(-12);
    setAssistantMessages(conversation);
    window.localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(conversation));
    setAssistantQuestion("");
    setAssistantError("");
    setAssistantLoading(true);
    try {
      const response = await fetch("/api/botany-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({ role, content })),
          ...(assistantImageDataUrl ? { imageDataUrl: assistantImageDataUrl } : {}),
        }),
      });
      const payload: unknown = await response.json();
      const errorMessage = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "L’assistant n’a pas pu répondre.";
      if (!response.ok) throw new Error(errorMessage);
      if (!payload || typeof payload !== "object" || !("reply" in payload) || typeof payload.reply !== "string" || !payload.reply.trim()) {
        throw new Error("La réponse de l’assistant est invalide.");
      }
      const next = [...conversation, { role: "assistant" as const, content: payload.reply.trim(), createdAt: new Date().toISOString() }].slice(-12);
      setAssistantMessages(next);
      window.localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(next));
      setAssistantImageDataUrl(null);
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : "Une erreur empêche de joindre l’assistant.");
    } finally {
      setAssistantLoading(false);
    }
  }

  function saveCycleTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = cycleTemplateName.trim();
    if (!name) {
      toast.error("Donnez un nom à ce modèle de cycle.");
      return;
    }
    const template: CycleTemplate = {
      id: `cycle-template-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      table: {
        ...table,
        weeks: [...table.weeks],
        weekPhases: getWeekPhases(table),
        products: table.products.map((product) => ({ ...product, doses: [...product.doses] })),
      },
    };
    persistCycleTemplates([template, ...cycleTemplates]);
    setCycleTemplateName("");
    toast.success(`Cycle « ${name} » enregistré dans vos modèles.`);
  }

  function applyCycleTemplate(template: CycleTemplate) {
    const restored: NutritionTable = {
      ...template.table,
      id: `cycle-${Date.now()}`,
      name: template.name,
      weeks: [...template.table.weeks],
      weekPhases: getWeekPhases(template.table),
      products: template.table.products.map((product) => ({ ...withCatalogReferences(product), doses: [...product.doses] })),
      custom: true,
    };
    persist([...tables, restored]);
    setSelectedTableId(restored.id);
    setWeekIndex(0);
    setShowCycleTemplates(false);
    toast.success(`Le cycle « ${template.name} » est maintenant votre table active.`);
  }

  function renameCycleTemplate(template: CycleTemplate, name: string) {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === template.name) return;
    persistCycleTemplates(cycleTemplates.map((item) => item.id === template.id ? { ...item, name: trimmedName } : item));
    toast.success("Nom du modèle mis à jour.");
  }

  function deleteCycleTemplate(template: CycleTemplate) {
    if (!window.confirm(`Supprimer le modèle « ${template.name} » ?`)) return;
    persistCycleTemplates(cycleTemplates.filter((item) => item.id !== template.id));
    toast.success("Modèle de cycle supprimé.");
  }

  function persistCalendarTasks(next: CalendarTask[]) {
    setCalendarTasks(next);
    window.localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(next));
  }

  function saveJournalEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = journalDraft.title.trim();
    const createdAt = new Date(journalDraft.dateTime);
    const temperature = journalDraft.temperature === "" ? undefined : Number(journalDraft.temperature);
    const humidity = journalDraft.humidity === "" ? undefined : Number(journalDraft.humidity);
    if (!title || !Number.isFinite(createdAt.getTime())) {
      toast.error("Ajoutez un titre et une date valides à cette note.");
      return;
    }
    if (temperature !== undefined && (!Number.isFinite(temperature) || temperature < -50 || temperature > 80)) {
      toast.error("La température doit être comprise entre −50 et 80 °C.");
      return;
    }
    if (humidity !== undefined && (!Number.isFinite(humidity) || humidity < 0 || humidity > 100)) {
      toast.error("L’humidité doit être comprise entre 0 et 100 %.");
      return;
    }
    const entry: CultureJournalEntry = {
      id: editingJournalEntryId ?? `journal-${Date.now()}`,
      createdAt: createdAt.toISOString(),
      title,
      category: journalDraft.category,
      plantName: journalDraft.plantName.trim(),
      details: journalDraft.details.trim(),
      ...(temperature === undefined ? {} : { temperature }),
      ...(humidity === undefined ? {} : { humidity }),
    };
    const next = editingJournalEntryId
      ? journalEntries.map((item) => item.id === editingJournalEntryId ? entry : item)
      : [entry, ...journalEntries];
    setJournalEntries(next);
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(next));
    setJournalDraft(createJournalDraft());
    setEditingJournalEntryId(null);
    toast.success(editingJournalEntryId ? "Note de culture mise à jour." : "Note ajoutée au journal.");
  }

  function editJournalEntry(entry: CultureJournalEntry) {
    setJournalDraft(journalDraftFromEntry(entry));
    setEditingJournalEntryId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteJournalEntry(entry: CultureJournalEntry) {
    if (!window.confirm(`Supprimer la note « ${entry.title} » ?`)) return;
    const next = journalEntries.filter((item) => item.id !== entry.id);
    setJournalEntries(next);
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(next));
    if (editingJournalEntryId === entry.id) {
      setEditingJournalEntryId(null);
      setJournalDraft(createJournalDraft());
    }
    toast.success("Note supprimée du journal.");
  }

  function addCalendarTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!calendarTitle.trim()) {
      toast.error("Donnez un titre à cet événement.");
      return;
    }
    const localStart = new Date(`${calendarDate}T${calendarTime}:00`);
    if (!Number.isFinite(localStart.getTime()) || localDateValue(localStart) !== calendarDate || localTimeValue(localStart) !== calendarTime) {
      toast.error("Cette heure locale n’existe pas dans le fuseau sélectionné (changement d’heure).");
      return;
    }
    const task: CalendarTask = {
      id: `calendar-${Date.now()}`,
      title: calendarTitle.trim(),
      kind: calendarKind,
      startsAt: localStart.toISOString(),
      timeZone: calendarTimeZone,
      tableId: table.id,
      tableName: table.name,
      week,
      note: calendarNote.trim(),
      completed: false,
    };
    persistCalendarTasks([...calendarTasks, task]);
    setSelectedCalendarDate(calendarDate);
    setCalendarMonth(new Date(`${calendarDate}T12:00:00`));
    setCalendarTitle("");
    setCalendarNote("");
    toast.success("Événement ajouté au calendrier local.");
  }

  function toggleCalendarTask(taskId: string) {
    persistCalendarTasks(calendarTasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task));
  }

  function deleteCalendarTask(task: CalendarTask) {
    if (!window.confirm(`Supprimer « ${task.title} » du calendrier ?`)) return;
    persistCalendarTasks(calendarTasks.filter((item) => item.id !== task.id));
    toast.success("Événement supprimé.");
  }

  function exportCalendar() {
    const escapeIcs = (value: string) => value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replace(/\r?\n/g, "\\n");
    const icsDate = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const events = calendarTasks.map((task) => {
      const end = new Date(Date.parse(task.startsAt) + 30 * 60 * 1000).toISOString();
      const description = [task.tableName, task.week, task.note].filter(Boolean).join(" · ");
      return [
        "BEGIN:VEVENT",
        `UID:${task.id}@canopee.local`,
        `DTSTAMP:${icsDate(new Date().toISOString())}`,
        `DTSTART:${icsDate(task.startsAt)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:${escapeIcs(task.title)}`,
        `DESCRIPTION:${escapeIcs(description)}`,
        `X-WR-TIMEZONE:${escapeIcs(task.timeZone)}`,
        "END:VEVENT",
      ].join("\r\n");
    });
    const contents = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Canopee//Calendar//FR", `X-WR-TIMEZONE:${escapeIcs(calendarTimeZone)}`, ...events, "END:VCALENDAR"].join("\r\n");
    downloadFile(contents, "canopee-calendrier.ics", "text/calendar;charset=utf-8");
    toast.success("Fichier calendrier exporté; les horaires sont convertis en UTC pour préserver le fuseau local.");
  }

  function updateTableProducts(nextProducts: TableProduct[]) {
    persist(tables.map((item) => item.id === table.id ? { ...item, products: nextProducts } : item));
  }

  async function searchManufacturerCatalog() {
    if (isStaticPagesDeployment) {
      toast.info("La recherche fabricants en ligne nécessite un serveur. Le catalogue local reste disponible.");
      return;
    }
    const query = search.trim();
    if (query.length < 2 || query.length > 80) {
      toast.error("Saisissez entre 2 et 80 caractères pour rechercher un produit.");
      return;
    }
    setManufacturerSearchLoading(true);
    setManufacturerSearchResult(null);
    try {
      const response = await fetch(`/api/manufacturer-products?q=${encodeURIComponent(query)}`);
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : "La recherche auprès des fabricants a échoué.";
        throw new Error(message);
      }
      if (!isManufacturerSearchResult(payload)) throw new Error("La réponse des fabricants est invalide.");
      setManufacturerSearchResult(payload);
      if (!payload.products.length) toast.info("Aucune fiche produit exploitable n’a été trouvée sur les sites officiels accessibles.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La recherche des fabricants a échoué.");
    } finally {
      setManufacturerSearchLoading(false);
    }
  }

  function addManufacturerProduct(candidate: ManufacturerProductCandidate) {
    if (candidate.kind === "range") {
      const chart = officialChartForRange(candidate);
      const id = `official-range-${Date.now()}`;
      const created: NutritionTable = {
        id,
        name: candidate.name,
        brand: candidate.brand,
        medium: chart?.medium ?? "Support à préciser",
        description: candidate.description || `Gamme trouvée sur le site officiel de ${candidate.brand}.`,
        weeks: chart?.weeks ?? WEEK_LABELS,
        weekPhases: chart?.weekPhases ?? WEEK_LABELS.map((_, index) => index < 4 ? "vegetative" : index < 11 ? "flowering" : "flush"),
        chartId: chart?.chartId,
        chartSourceUrl: chart?.chartSourceUrl,
        chartNotes: chart?.chartNotes ?? "Page de gamme officielle. Aucun dosage n’est prérempli sans tableau fabricant vérifié pour cette recette.",
        chartStageKeys: chart?.chartStageKeys ?? WEEK_LABELS.map(() => null),
        manufacturerPageUrl: candidate.sourceUrl,
        products: [],
        custom: true,
      };
      persist([...tables, created]);
      setSelectedTableId(id);
      setWeekIndex(0);
      setSelectedManufacturerProduct(null);
      toast.success(chart
        ? `${candidate.name} ajouté avec son tableau fabricant correspondant. Ajoutez les produits de la gamme souhaités.`
        : `${candidate.name} ajouté comme gamme officielle. Ses doses restent à zéro faute de tableau compatible vérifié.`);
      return;
    }

    const normalizedName = normalizeProductName(candidate.name);
    const knownProduct = CATALOG.find((product) => {
      const productName = normalizeProductName(product.name);
      return product.brand.toLowerCase() === candidate.brand.toLowerCase()
        && (normalizedName === productName || normalizedName.startsWith(`${productName} `));
    });
    const productId = knownProduct?.id ?? `official-${Date.now()}`;
    if (table.products.some((product) => product.id === productId)) {
      toast.info(`${knownProduct?.name ?? candidate.name} est déjà dans cette table.`);
      setSelectedManufacturerProduct(null);
      return;
    }
    const doses = knownProduct ? officialDosesFor(table, knownProduct.id) : undefined;
    const product: Product = knownProduct ? {
      ...knownProduct,
      sourceUrl: candidate.sourceUrl,
      packageQuantity: candidate.packageQuantity ?? undefined,
      sourceVerified: true,
      doseSourceUrl: doses ? table.chartSourceUrl : undefined,
      doseVerified: Boolean(doses),
    } : {
      id: productId,
      name: candidate.name,
      brand: candidate.brand,
      range: "Produit trouvé sur le site officiel",
      role: "Produit fabricant",
      unit: manufacturerProductUnit,
      color: "#7aa5a7",
      description: candidate.description || "Description non publiée dans la fiche officielle consultée.",
      sourceUrl: candidate.sourceUrl,
      packageQuantity: candidate.packageQuantity ?? undefined,
      sourceVerified: true,
      doseVerified: false,
    };
    updateTableProducts([...table.products, {
      ...product,
      doses: doses ?? table.weeks.map(() => 0),
      enabled: true,
    }]);
    setSelectedManufacturerProduct(null);
    if (doses) {
      toast.success(`${product.name} ajouté avec les doses du tableau fabricant correspondant.`);
    } else {
      toast.warning(`${product.name} ajouté; aucun dosage compatible n’a pu être vérifié. Les doses restent à zéro.`);
    }
  }

  function addProduct(product: Product) {
    if (table.products.some((item) => item.id === product.id)) {
      toast.info(`${product.name} est déjà dans cette table.`);
      return;
    }
    const doses = officialDosesFor(table, product.id) ?? table.weeks.map(() => 0);
    const chartVerified = Boolean(table.chartId && OFFICIAL_CHARTS[table.chartId]?.doses[product.id]);
    updateTableProducts([...table.products, {
      ...product,
      doses,
      enabled: true,
      sourceUrl: product.sourceUrl ?? table.chartSourceUrl,
      sourceVerified: product.sourceVerified ?? chartVerified,
      doseSourceUrl: chartVerified ? table.chartSourceUrl : undefined,
      doseVerified: chartVerified,
    }]);
    if (chartVerified) {
      toast.success(`${product.name} ajouté avec les dosages du tableau fabricant associé.`);
    } else {
      toast.success(`${product.name} ajouté sans dosage fabricant vérifié pour ce tableau.`);
    }
  }

  function removeProduct(id: string) {
    const product = table.products.find((item) => item.id === id);
    updateTableProducts(table.products.filter((item) => item.id !== id));
    if (product) toast(`${product.name} retiré de la recette.`);
  }

  function toggleProduct(id: string) {
    updateTableProducts(table.products.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
  }

  function updateDose(id: string, value: number) {
    updateTableProducts(table.products.map((item) => {
      if (item.id !== id) return item;
      const doses = [...item.doses];
      doses[weekIndex] = Math.max(0, Number.isFinite(value) ? value : 0);
      return { ...item, doses };
    }));
  }

  function updateWeekLabel(index: number, label: string) {
    persist(tables.map((item) => item.id === table.id ? {
      ...item,
      weeks: item.weeks.map((weekLabel, weekPosition) => weekPosition === index ? label : weekLabel),
      weekPhases: getWeekPhases(item),
    } : item));
  }

  function updateWeekPhase(index: number, phase: WeekPhase) {
    const phases = getWeekPhases(table);
    phases[index] = phase;
    persist(tables.map((item) => item.id === table.id ? { ...item, weekPhases: phases } : item));
  }

  function addCycleWeek(phase: WeekPhase) {
    const phases = getWeekPhases(table);

    const phaseOrder: Record<WeekPhase, number> = { vegetative: 0, flowering: 1, flush: 2, other: 3 };
    const lastInPhase = phases.lastIndexOf(phase);
    const nextLaterPhase = phases.findIndex((item) => phaseOrder[item] > phaseOrder[phase]);
    const insertAt = lastInPhase >= 0 ? lastInPhase + 1 : nextLaterPhase >= 0 ? nextLaterPhase : table.weeks.length;
    const prefix = phase === "vegetative" ? "Veg" : phase === "flowering" ? "Flo" : phase === "flush" ? "Flush" : "Semaine";
    const existingNumbers = table.weeks.flatMap((label, index) => {
      if (phases[index] !== phase) return [];
      const match = label.match(new RegExp(`^${prefix}\\s+(\\d+)$`, "i"));
      return match ? [Number(match[1])] : [];
    });
    let weekNumber = 1;
    while (existingNumbers.includes(weekNumber)) weekNumber += 1;
    const nextWeeks = [...table.weeks];
    const nextPhases = [...phases];
    const nextChartStageKeys = table.chartStageKeys ? [...table.chartStageKeys] : undefined;
    nextWeeks.splice(insertAt, 0, `${prefix} ${weekNumber}`);
    nextPhases.splice(insertAt, 0, phase);
    nextChartStageKeys?.splice(insertAt, 0, null);
    const nextProducts = table.products.map((product) => {
      const doses = [...product.doses];
      doses.splice(insertAt, 0, 0);
      return { ...product, doses };
    });

    persist(tables.map((item) => item.id === table.id
      ? { ...item, weeks: nextWeeks, weekPhases: nextPhases, ...(nextChartStageKeys ? { chartStageKeys: nextChartStageKeys } : {}), products: nextProducts }
      : item));
    if (insertAt <= weekIndex) setWeekIndex(weekIndex + 1);
    toast.success(`Semaine ${prefix} ${weekNumber} ajoutée.`);
  }

  function deleteCycleWeek(index: number) {
    if (table.weeks.length <= 1) {
      toast.error("Un cycle doit contenir au moins une semaine.");
      return;
    }
    const label = table.weeks[index];
    if (!window.confirm(`Supprimer « ${label} » et ses dosages ? Cette action est irréversible.`)) return;

    const nextWeeks = table.weeks.filter((_, weekPosition) => weekPosition !== index);
    const nextPhases = getWeekPhases(table).filter((_, weekPosition) => weekPosition !== index);
    const nextChartStageKeys = table.chartStageKeys?.filter((_, weekPosition) => weekPosition !== index);
    const nextProducts = table.products.map((product) => ({
      ...product,
      doses: product.doses.filter((_, weekPosition) => weekPosition !== index),
    }));
    persist(tables.map((item) => item.id === table.id
      ? { ...item, weeks: nextWeeks, weekPhases: nextPhases, ...(nextChartStageKeys ? { chartStageKeys: nextChartStageKeys } : {}), products: nextProducts }
      : item));
    setWeekIndex((current) => Math.min(current > index ? current - 1 : current, nextWeeks.length - 1));
    toast.success(`Semaine « ${label} » supprimée.`);
  }

  function createTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTable.name.trim()) return;
    const id = `custom-${Date.now()}`;
    const created: NutritionTable = {
      id,
      name: newTable.name.trim(),
      brand: newTable.brand.trim() || "Ma gamme",
      medium: newTable.medium.trim() || "À préciser",
      description: newTable.description.trim() || "Table personnalisée créée dans Canopée.",
      weeks: WEEK_LABELS,
      weekPhases: WEEK_LABELS.map((_, index) => index < 4 ? "vegetative" : index < 11 ? "flowering" : "flush"),
      products: [],
      custom: true,
    };
    persist([...tables, created]);
    setSelectedTableId(id);
    setWeekIndex(0);
    setNewTable({ name: "", brand: "", medium: "", description: "" });
    setShowCreateTable(false);
    toast.success("Votre table de nutrition est prête.");
  }

  function openEditTable() {
    setEditedTable({ name: table.name, brand: table.brand, brandImageUrl: table.brandImageUrl ?? "", medium: table.medium, description: table.description });
    setShowEditTable(true);
  }

  function updateTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editedTable.name.trim()) {
      toast.error("Le nom de la table est obligatoire.");
      return;
    }
    if (!isValidImageReference(editedTable.brandImageUrl)) {
      toast.error("L’image de la marque doit être une URL HTTP(S) valide ou une image téléversée.");
      return;
    }
    persist(tables.map((item) => item.id === table.id ? {
      ...item,
      name: editedTable.name.trim(),
      brand: editedTable.brand.trim() || "Ma gamme",
      brandImageUrl: editedTable.brandImageUrl || undefined,
      medium: editedTable.medium.trim() || "À préciser",
      description: editedTable.description.trim() || "Table personnalisée créée dans Canopée.",
    } : item));
    setShowEditTable(false);
    toast.success("Table mise à jour.");
  }

  function openEditProduct(product: TableProduct) {
    setEditedProduct({ ...product });
  }

  function updateProductDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editedProduct?.name.trim()) {
      toast.error("Le nom du produit est obligatoire.");
      return;
    }
    if (!isValidImageReference(editedProduct.imageUrl ?? "")) {
      toast.error("L’image du produit doit être une URL HTTP(S) valide ou une image téléversée.");
      return;
    }
    const updatedProduct = {
      ...editedProduct,
      name: editedProduct.name.trim(),
      brand: editedProduct.brand.trim() || "Personnalisé",
      range: editedProduct.range.trim() || "Personnalisé",
      role: editedProduct.role.trim() || "Produit personnalisé",
      description: editedProduct.description.trim(),
    };
    updateTableProducts(table.products.map((product) => {
      if (product.id !== updatedProduct.id) return product;
      const unitChanged = product.unit !== updatedProduct.unit;
      return {
        ...product,
        ...updatedProduct,
        ...(unitChanged ? { doseVerified: false, doseSourceUrl: undefined } : {}),
      };
    }));
    setEditedProduct(null);
    toast.success(`${updatedProduct.name} mis à jour dans « ${table.name} ».`);
  }

  function deleteTable() {
    if (!table.custom || !window.confirm(`Supprimer la table « ${table.name} » ? Cette action est irréversible.`)) return;
    const remaining = tables.filter((item) => item.id !== table.id);
    persist(remaining);
    setSelectedTableId(remaining[0].id);
    setWeekIndex(0);
    toast.success("Table personnalisée supprimée.");
  }

  function downloadFile(contents: string, fileName: string, mimeType: string) {
    const url = URL.createObjectURL(new Blob([contents], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJson() {
    downloadFile(JSON.stringify(table, null, 2), `${table.name.replace(/[^a-z0-9-_]+/gi, "-")}.json`, "application/json");
  }

  function exportBackup() {
    const backup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        tables,
        waterings,
        cycleTemplates,
        calendarTasks,
        wikiArticles,
        assistantMessages,
        journalEntries,
        preferences,
      },
    };
    downloadFile(JSON.stringify(backup, null, 2), `canopee-sauvegarde-${localDateValue(new Date())}.json`, "application/json");
    toast.success("Sauvegarde complète téléchargée sur cet appareil.");
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("La sauvegarde dépasse la limite de 25 Mo.");
      return;
    }
    if (!window.confirm("Restaurer cette sauvegarde remplacera les données locales actuelles de Canopée. Exportez d’abord une sauvegarde si vous souhaitez les conserver. Continuer ?")) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isAppBackup(parsed)) throw new Error("Sauvegarde invalide ou version non prise en charge.");
      if (parsed.data.preferences.defaultLiters < 0.5 || parsed.data.preferences.defaultLiters > 1000) {
        throw new Error("Le volume par défaut de cette sauvegarde est invalide.");
      }
      const { data } = parsed;
      const entries: [string, string][] = [
        [STORAGE_KEY, JSON.stringify(data.tables)],
        [WATERING_STORAGE_KEY, JSON.stringify(data.waterings)],
        [CYCLE_TEMPLATES_STORAGE_KEY, JSON.stringify(data.cycleTemplates)],
        [CALENDAR_STORAGE_KEY, JSON.stringify(data.calendarTasks)],
        [WIKI_STORAGE_KEY, JSON.stringify(data.wikiArticles)],
        [ASSISTANT_STORAGE_KEY, JSON.stringify(data.assistantMessages)],
        [JOURNAL_STORAGE_KEY, JSON.stringify(data.journalEntries)],
        [PREFERENCES_STORAGE_KEY, JSON.stringify(data.preferences)],
      ];
      const previousValues = entries.map(([key]) => [key, window.localStorage.getItem(key)] as const);
      try {
        for (const [key, value] of entries) window.localStorage.setItem(key, value);
      } catch (error) {
        try {
          for (const [key, value] of previousValues) {
            if (value === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, value);
          }
        } catch {
          throw new Error("Le stockage est plein et la restauration de sauvegarde n’a pas pu être terminée.");
        }
        throw error;
      }
      setTables(data.tables);
      setSelectedTableId(data.tables[0].id);
      setWeekIndex(0);
      setWaterings(data.waterings);
      setCycleTemplates(data.cycleTemplates);
      setCalendarTasks(data.calendarTasks);
      setWikiArticles(data.wikiArticles);
      setAssistantMessages(data.assistantMessages);
      setJournalEntries(data.journalEntries);
      setPreferences(data.preferences);
      setLiters(data.preferences.defaultLiters);
      toast.success("Sauvegarde restaurée. Vos données locales ont été remplacées.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de restaurer cette sauvegarde.");
    }
  }

  function exportCsv() {
    const headers = ["table_name", "brand", "medium", "description", "chart_id", "chart_source", "chart_notes", "manufacturer_page_url", "week", "week_phase", "chart_stage", "product_id", "product_name", "product_brand", "range", "role", "unit", "color", "enabled", "source_url", "package_quantity", "source_verified", "dose_source_url", "dose_verified", "dose"];
    const rows = table.weeks.flatMap((weekLabel, index) => (table.products.length ? table.products : [null]).map((product) => [
      table.name, table.brand, table.medium, table.description, table.chartId ?? "", table.chartSourceUrl ?? "", table.chartNotes ?? "", table.manufacturerPageUrl ?? "", weekLabel, getWeekPhase(table, index), table.chartStageKeys?.[index] ?? "",
      product?.id ?? "", product?.name ?? "", product?.brand ?? "", product?.range ?? "", product?.role ?? "",
      product?.unit ?? "ml", product?.color ?? "", product?.enabled ?? false, product?.sourceUrl ?? "", product?.packageQuantity ?? "",
      product?.sourceVerified ?? false, product?.doseSourceUrl ?? "", product?.doseVerified ?? false, product?.doses[index] ?? 0,
    ]));
    downloadFile([headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n"), `${table.name.replace(/[^a-z0-9-_]+/gi, "-")}.csv`, "text/csv;charset=utf-8");
  }

  function importCsv(text: string): NutritionTable {
    const [headers = [], ...rows] = parseCsv(text);
    const columns = new Map(headers.map((header, index) => [header.trim().toLowerCase(), index]));
    const get = (row: string[], key: string) => row[columns.get(key) ?? -1] ?? "";
    if (!columns.has("table_name") || !columns.has("week") || !columns.has("dose")) throw new Error("Colonnes CSV non reconnues.");
    const weeks = [...new Set(rows.map((row) => get(row, "week")).filter(Boolean))];
    if (!weeks.length) throw new Error("Le fichier CSV ne contient aucune semaine.");
    const productsById = new Map<string, TableProduct>();
    for (const row of rows) {
      const productName = get(row, "product_name");
      if (!productName) continue;
      const productId = get(row, "product_id") || `import-${productName}`;
      const weekIndex = weeks.indexOf(get(row, "week"));
      const existing = productsById.get(productId);
      if (existing) {
        existing.doses[weekIndex] = Number(get(row, "dose")) || 0;
      } else {
        productsById.set(productId, {
          id: productId,
          name: productName,
          brand: get(row, "product_brand") || "Personnalisé",
          range: get(row, "range") || "Import CSV",
          role: get(row, "role") || "Produit personnalisé",
          unit: get(row, "unit") === "g" ? "g" : "ml",
          color: get(row, "color") || "#a796c5",
          description: "Produit importé depuis un fichier CSV.",
          enabled: get(row, "enabled").toLowerCase() !== "false",
          ...(get(row, "source_url") ? { sourceUrl: get(row, "source_url") } : {}),
          ...(get(row, "package_quantity") ? { packageQuantity: get(row, "package_quantity") } : {}),
          sourceVerified: get(row, "source_verified").toLowerCase() === "true",
          ...(get(row, "dose_source_url") ? { doseSourceUrl: get(row, "dose_source_url") } : {}),
          doseVerified: get(row, "dose_verified").toLowerCase() === "true",
          doses: weeks.map((_, currentIndex) => currentIndex === weekIndex ? Number(get(row, "dose")) || 0 : 0),
        });
      }
    }
    const first = rows[0] ?? [];
    return {
      id: `imported-${Date.now()}`,
      name: get(first, "table_name") || "Recette importée",
      brand: get(first, "brand") || "Import CSV",
      medium: get(first, "medium") || "À préciser",
      description: get(first, "description") || "Recette importée depuis un fichier CSV.",
      manufacturerPageUrl: get(first, "manufacturer_page_url") || undefined,
      weeks,
      ...(get(first, "chart_id") ? { chartId: get(first, "chart_id"), chartSourceUrl: get(first, "chart_source") || (get(first, "chart_id") === "biobizz-light-2026"
        ? "https://biobizz.com/knowledge-base/nutrient-schedule-peat-free"
        : get(first, "chart_id") === "canna-coco-2026"
          ? "https://www.cannagardening.com/growguide"
          : get(first, "chart_id") === "advanced-sensi-global"
            ? "https://www.advancednutrients.com/feeding/"
            : undefined), chartNotes: get(first, "chart_notes") || undefined } : {}),
      chartStageKeys: weeks.map((label) => {
        const row = rows.find((item) => get(item, "week") === label);
        return get(row ?? [], "chart_stage") || null;
      }),
      weekPhases: weeks.map((label) => {
        const phase = get(rows.find((row) => get(row, "week") === label) ?? [], "week_phase");
        if (phase === "vegetative" || phase === "flowering" || phase === "flush" || phase === "other") return phase;
        if (/flush|rinçage|rincage/i.test(label)) return "flush";
        if (/veg/i.test(label)) return "vegetative";
        if (/flo|bloom|pk|mûr|mur/i.test(label)) return "flowering";
        return "other";
      }),
      products: [...productsById.values()],
      custom: true,
    };
  }

  async function importRecipes(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      let imported: NutritionTable[];
      if (file.name.toLowerCase().endsWith(".csv")) {
        imported = [importCsv(text)];
      } else {
        const parsed: unknown = JSON.parse(text);
        const candidates = Array.isArray(parsed) ? parsed : [parsed];
        if (!candidates.length || !candidates.every(isNutritionTable)) throw new Error("Le JSON ne contient pas de recette Canopée valide.");
        imported = candidates.map((candidate, index) => ({ ...candidate, id: `imported-${Date.now()}-${index}`, custom: true }));
      }
      const normalized = imported.map((item) => ({ ...item, id: item.id.startsWith("imported-") ? item.id : `imported-${Date.now()}`, custom: true }));
      persist([...tables, ...normalized]);
      setSelectedTableId(normalized[0].id);
      setWeekIndex(0);
      toast.success(`${normalized.length} recette${normalized.length > 1 ? "s" : ""} importée${normalized.length > 1 ? "s" : ""}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de lire ce fichier.");
    }
  }

  function logWatering() {
    const record: WateringRecord = {
      id: `watering-${Date.now()}`,
      createdAt: new Date().toISOString(),
      tableName: table.name,
      week,
      liters,
      products: currentProducts.filter((product) => (product.doses[weekIndex] ?? 0) > 0).map((product) => ({
        name: product.name,
        dosePerLiter: product.doses[weekIndex] ?? 0,
        total: (product.doses[weekIndex] ?? 0) * liters,
        unit: product.unit,
      })),
    };
    const next = [record, ...waterings];
    setWaterings(next);
    window.localStorage.setItem(WATERING_STORAGE_KEY, JSON.stringify(next));
    toast.success("Arrosage ajouté à l’historique.");
  }

  async function copyRecipe() {
    const lines = [
      `${table.name} · ${week}`,
      `Volume d’eau : ${formatDose(liters)} L`,
      ...currentProducts
        .filter((product) => currentDose(product) > 0)
        .map((product) => `${product.name} : ${formatDose(currentDose(product))} ${product.unit}/L · ${formatDose(currentDose(product) * liters)} ${product.unit} au total`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Recette copiée dans le presse-papiers.");
    } catch {
      toast.error("Impossible d’accéder au presse-papiers. Vérifiez les autorisations du navigateur.");
    }
  }

  function createManualProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualProduct.name.trim()) return;
    const product: Product = {
      id: `manual-${Date.now()}`,
      name: manualProduct.name.trim(),
      brand: manualProduct.brand.trim() || "Personnalisé",
      range: "Ajout manuel",
      role: manualProduct.role.trim() || "Produit personnalisé",
      unit: manualProduct.unit,
      color: "#a796c5",
      description: "Produit créé manuellement pour votre table.",
    };
    updateTableProducts([...table.products, { ...product, doses: table.weeks.map(() => 0), enabled: true }]);
    setManualProduct({ name: "", brand: "", role: "", unit: "ml" });
    setShowManualProduct(false);
    toast.success(`${product.name} ajouté manuellement.`);
  }

  return (
    <div className={cn("min-h-screen bg-bg text-fg", preferences.compactMode && "compact-mode")}>
      <header className="border-b border-border/80 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-fg shadow-[0_10px_30px_rgba(138,154,114,0.18)]"><Leaf className="size-5" /></div>
            <div>
              <div className="font-display text-xl tracking-tight">Canopée</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-subtle">atelier nutrition</div>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-xs text-muted sm:flex">
            <span className="rounded-full border border-border px-3 py-1.5">Données locales</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-ok" /> Prêt à doser</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border px-3 py-1.5 text-[11px] text-muted sm:inline-flex">{preferences.experience === "novice" ? "Mode novice" : "Mode expert"}</span>
            <Button type="button" variant="outline" size="icon" className="border-border bg-elevated/60 text-fg hover:bg-chip" onClick={() => navigateTo("/parametres")} aria-label="Ouvrir les paramètres"><Settings className="size-4" /></Button>
            {activePage === "nutrition" && <Button variant="outline" size="sm" className="border-border bg-elevated/60 text-fg hover:bg-chip" onClick={() => setShowCreateTable(true)}><Plus className="size-4" /><span className="hidden sm:inline">Nouvelle table</span></Button>}
          </div>
        </div>
      </header>

      {showWikiEditor && editedWikiArticle && <Modal title={wikiArticles.some((article) => article.id === editedWikiArticle.id) ? "Modifier un article Wiki" : "Nouvel article Wiki"} onClose={() => { setShowWikiEditor(false); setEditedWikiArticle(null); }}><form onSubmit={saveWikiArticle} className="space-y-4"><Field label="Titre"><Input aria-label="Titre de l’article Wiki" autoFocus required maxLength={120} value={editedWikiArticle.title} onChange={(event) => setEditedWikiArticle({ ...editedWikiArticle, title: event.target.value })} /></Field><Field label="Catégorie"><select aria-label="Catégorie de l’article Wiki" value={editedWikiArticle.category} onChange={(event) => { if (isWikiCategory(event.target.value)) setEditedWikiArticle({ ...editedWikiArticle, category: event.target.value }); }} className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg"><option value="legalite">Cadre légal</option><option value="securite">Sécurité</option><option value="carnet">Carnet personnel</option><option value="glossaire">Glossaire</option></select></Field><Field label="Résumé"><Input aria-label="Résumé de l’article Wiki" maxLength={200} value={editedWikiArticle.summary} onChange={(event) => setEditedWikiArticle({ ...editedWikiArticle, summary: event.target.value })} placeholder="En quelques mots…" /></Field><Field label="Contenu"><textarea aria-label="Contenu de l’article Wiki" required maxLength={12000} rows={10} value={editedWikiArticle.content} onChange={(event) => setEditedWikiArticle({ ...editedWikiArticle, content: event.target.value })} className="min-h-48 w-full resize-y rounded-xl border border-border bg-elevated px-3 py-3 text-sm leading-relaxed text-fg outline-none focus-visible:ring-2 focus-visible:ring-primary" /></Field><p className="text-[10px] text-subtle">Texte brut, jusqu’à 12 000 caractères. Enregistrement local à cet appareil.</p><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => { setShowWikiEditor(false); setEditedWikiArticle(null); }}>Annuler</Button><Button type="submit"><Pencil className="size-4" /> Enregistrer</Button></div></form></Modal>}

      <nav aria-label="Navigation principale" className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto border-b border-border/70 px-4 py-2 lg:hidden">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} type="button" onClick={() => navigateTo(item.path)} aria-current={activePage === item.id ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs transition", activePage === item.id ? "bg-primary/15 text-primary" : "text-muted hover:bg-elevated hover:text-fg")}><Icon className="size-4" />{item.label}</button>;
        })}
      </nav>

      <div className={cn("mx-auto grid max-w-[1500px] gap-0", gridColumns)}>
        <aside className={cn("hidden border-r border-border/70 py-7 lg:block", navigationCollapsed ? "px-2" : "px-5")}>
          <nav aria-label="Navigation principale" className="mb-8 space-y-1">
            <div className={cn("mb-3 flex items-center", navigationCollapsed ? "justify-center" : "justify-between")}>
              {!navigationCollapsed && <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Espace de travail</p>}
              <button type="button" onClick={() => setNavigationCollapsed((collapsed) => !collapsed)} aria-label={navigationCollapsed ? "Déployer la navigation latérale" : "Réduire la navigation latérale"} title={navigationCollapsed ? "Déployer la navigation" : "Réduire la navigation"} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-fg"><ChevronLeft className={cn("size-4 transition-transform", navigationCollapsed && "rotate-180")} /></button>
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => navigateTo(item.path)} aria-current={activePage === item.id ? "page" : undefined} aria-label={item.label} title={navigationCollapsed ? item.label : undefined} className={cn("flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm transition", navigationCollapsed ? "justify-center px-0" : "px-3", activePage === item.id ? "bg-primary/12 text-primary" : "text-muted hover:bg-surface hover:text-fg")}><Icon className="size-4 shrink-0" />{!navigationCollapsed && item.label}</button>;
            })}
          </nav>
          {!navigationCollapsed && <div className="mb-7">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Vos tables</p>
            <div className="space-y-2">
              {tables.map((item) => (
                <button key={item.id} type="button" onClick={() => { setSelectedTableId(item.id); setWeekIndex(0); }} className={cn("group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition", selectedTableId === item.id ? "bg-elevated shadow-[var(--shadow-border)]" : "hover:bg-surface") }>
                  <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: item.custom ? "#a796c5" : item.brand === "Canna" ? "#85a4a1" : "#9aad78" }} />
                  <span className="min-w-0"><span className={cn("block truncate text-sm", selectedTableId === item.id ? "text-fg" : "text-muted")}>{item.name}</span><span className="mt-1 block truncate text-[11px] text-subtle">{item.brand} · {item.medium}</span></span>
                </button>
              ))}
            </div>
          </div>
          }
          {!navigationCollapsed && <button type="button" onClick={() => setShowCreateTable(true)} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border px-3 py-3 text-sm text-muted transition hover:border-primary/50 hover:bg-surface hover:text-fg"><Plus className="size-4" /> Créer ma table</button>}
          {!navigationCollapsed && <div className="mt-12 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <Sparkles className="mb-3 size-4 text-primary" />
            <p className="text-sm font-medium">Un tableau à votre image</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Ajoutez une gamme complète, un seul produit ou vos propres dosages.</p>
          </div>}
        </aside>

        <main className={cn("min-w-0 px-5 py-7 lg:px-8 lg:py-9", activePage === "library" && "hidden")}>
          {activePage === "nutrition" && <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2"><Badge className="border border-primary/20 bg-primary/10 text-primary">{table.custom ? "Table personnelle" : "Table recommandée"}</Badge>{table.brandImageUrl && <img src={table.brandImageUrl} alt={`Logo ${table.brand}`} className="size-7 rounded-lg border border-border/70 bg-white object-contain p-0.5" /> }<span className="text-xs text-subtle">{table.brand}</span></div>
              <h1 className="font-display text-4xl leading-none tracking-tight sm:text-5xl">{table.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{table.description}</p>
              {table.products.some((product) => product.imageUrl) && <div className="mt-4 flex flex-wrap gap-2">{table.products.filter((product) => product.imageUrl).map((product) => <div key={product.id} className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface px-2 py-1.5"><img src={product.imageUrl} alt={`Image de ${product.name}`} loading="lazy" className="size-8 rounded-lg bg-white object-contain" /><span className="max-w-32 truncate text-[11px] text-muted">{product.name}</span></div>)}</div>}
              {preferences.showManufacturerDetails && (table.chartSourceUrl || table.manufacturerPageUrl) && <div className="mt-3 max-w-2xl rounded-xl border border-border/70 bg-surface px-3 py-2.5">{table.chartSourceUrl && <a href={table.chartSourceUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary underline-offset-4 hover:underline">Consulter le tableau officiel du fabricant ↗</a>}{table.manufacturerPageUrl && <a href={table.manufacturerPageUrl} target="_blank" rel="noreferrer" className="ml-3 text-xs font-medium text-primary underline-offset-4 hover:underline">Fiche officielle de la gamme ↗</a>}{preferences.experience === "expert" && table.chartNotes && <p className="mt-1 text-[11px] leading-relaxed text-muted">{table.chartNotes}</p>}</div>}
            </div>
            <div className="flex shrink-0 gap-1"><button type="button" onClick={openEditTable} className="rounded-xl p-2 text-muted transition hover:bg-elevated hover:text-fg" aria-label="Modifier la table" title="Modifier la table"><Pencil className="size-4" /></button>{table.custom && <button type="button" onClick={deleteTable} className="rounded-xl p-2 text-muted transition hover:bg-red-500/10 hover:text-red-600" aria-label="Supprimer la table" title="Supprimer la table"><Trash2 className="size-4" /></button>}</div>
          </div>

          <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 lg:hidden">
            {tables.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedTableId(item.id); setWeekIndex(0); }} className={cn("shrink-0 rounded-full px-3 py-2 text-xs", item.id === table.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted")}>{item.name}</button>)}
          </div>

          <section className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3" aria-live="polite">
            <p className="text-xs font-medium text-fg">{preferences.experience === "novice" ? "Votre repère de préparation" : "Vue experte · données du cycle"}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{preferences.experience === "novice"
              ? "Choisissez votre semaine, indiquez le volume d’eau, puis suivez les doses affichées. En cas de doute, vérifiez toujours l’étiquette du fabricant."
              : `${table.weeks.length} semaines · ${table.products.length} produits configurés · ${table.medium}. Les badges de vérification indiquent la correspondance réelle avec les sources.`}</p>
          </section>

          <section className="mb-6 overflow-hidden rounded-[1.6rem] bg-surface shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary"><Droplets className="size-5" /></div><div><p className="text-sm font-medium">Volume de solution</p><p className="text-xs text-muted">La recette se recalcule en temps réel</p></div></div>
              <div className="flex items-baseline gap-1 font-mono"><span className="text-3xl font-medium tabular-nums text-fg">{liters}</span><span className="text-sm text-muted">litres</span></div>
            </div>
            <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_150px] lg:items-center">
              <div><input aria-label="Volume d'eau en litres" type="range" min="0.5" max="1000" step="0.5" value={liters} onChange={(event) => setLiters(Math.min(1000, Math.max(0.5, Number(event.target.value))))} style={{ background: `linear-gradient(90deg, var(--primary) ${Math.max(0, Math.min(100, ((liters - 0.5) / 999.5) * 100))}%, var(--elevated) ${Math.max(0, Math.min(100, ((liters - 0.5) / 999.5) * 100))}%)` }} className="water-slider h-2 w-full accent-primary" /><div className="mt-2 flex justify-between text-[11px] text-subtle"><span>0,5 L</span><span>250 L</span><span>500 L</span><span>750 L</span><span>1 000 L</span></div></div>
              <div className="relative"><Input type="number" min="0.5" max="1000" step="0.5" value={liters} onChange={(event) => setLiters(Math.min(1000, Math.max(0.5, Number(event.target.value) || 0.5)))} className="h-12 border-border bg-elevated pr-10 font-mono text-right text-fg" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">L</span></div>
            </div>
            <div className="flex items-center gap-2 bg-primary/8 px-5 py-3 text-xs text-primary sm:px-6"><Droplets className="size-3.5" /> Jusqu’à <strong>1 000 L</strong> — pratique pour les gros réservoirs et les séries.</div>
          </section>

          <section className="mb-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">Cycle de culture</p><p className="text-xs text-muted">Sélectionnez la semaine à préparer</p></div><div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={() => { setCycleTemplateName(table.name); setShowCycleTemplates(true); }} aria-label="Enregistrer ou charger un cycle personnalisé"><BookmarkPlus className="size-3.5" /> Mes cycles</Button><Button type="button" variant="outline" size="sm" onClick={() => setShowCycleSettings(true)} aria-label="Modifier les semaines du cycle"><SlidersHorizontal className="size-3.5" /> Paramètres</Button><Badge className="bg-elevated text-muted">{week}</Badge></div></div>
            <div className="flex gap-2 overflow-x-auto pb-1">{table.weeks.map((label, index) => { const phase = getWeekPhase(table, index); return <button key={`${label}-${index}`} type="button" onClick={() => setWeekIndex(index)} className={cn("min-w-[72px] shrink-0 rounded-xl px-3 py-3 text-left transition", index === weekIndex ? "bg-primary text-primary-fg shadow-[0_8px_24px_rgba(138,154,114,0.15)]" : "bg-surface text-muted shadow-[var(--shadow-border)] hover:bg-elevated")}><span className="block text-[10px] uppercase tracking-wider opacity-70">{phase === "other" && index === table.weeks.length - 1 ? "Fin" : getWeekPhaseLabel(phase)}</span><span className="mt-1 block text-xs font-medium">{label}</span></button>; })}</div>
          </section>

          <section className="rounded-[1.6rem] bg-surface shadow-[var(--shadow-border)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6"><div><div className="flex items-center gap-2"><FlaskConical className="size-4 text-primary" /><p className="text-sm font-medium">Recette de la semaine</p></div><p className="mt-1 text-xs text-muted">Dosage par litre et quantité totale pour {liters} L</p></div>{preferences.experience === "expert" && <div className="flex flex-wrap gap-2">{totalMlPerLiter > 0 && <Badge className="bg-chip text-fg">{totalMlPerLiter.toFixed(1)} ml/L actif</Badge>}{totalGramsPerLiter > 0 && <Badge className="bg-chip text-fg">{totalGramsPerLiter.toFixed(1)} g/L actif</Badge>}</div>}</div>
            <div className="divide-y divide-border/60">
              {table.products.length === 0 ? <div className="px-6 py-14 text-center"><Beaker className="mx-auto mb-3 size-8 text-subtle" /><p className="text-sm font-medium">Votre table est vide</p><p className="mt-1 text-xs text-muted">Ajoutez une gamme ou créez votre premier produit dans la bibliothèque.</p></div> : table.products.map((product) => { const dose = product.doses[weekIndex] ?? 0; return <div key={product.id} className={cn("group grid gap-3 px-5 py-4 transition sm:grid-cols-[minmax(0,1fr)_110px_100px_64px] sm:items-center sm:px-6", preferences.compactMode && "py-2.5", !product.enabled && "opacity-45") }><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => toggleProduct(product.id)} aria-label={product.enabled ? `Désactiver ${product.name}` : `Activer ${product.name}`} aria-pressed={product.enabled} className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition", product.enabled ? "bg-chip" : "bg-elevated")}><span className="size-2.5 rounded-full" style={{ background: product.color }} /></button><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="truncate text-xs text-muted">{product.role} · {product.brand}</p>{preferences.showManufacturerDetails && (product.sourceUrl || product.doseVerified !== undefined || product.packageQuantity) && <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">{product.sourceUrl && <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">Fiche fabricant</a>}{product.doseVerified && <span className="text-ok">Dosage officiel vérifié</span>}{product.sourceVerified && !product.doseVerified && <span className="text-muted">Dosage non vérifié</span>}{product.packageQuantity && <span className="text-muted">Format : {product.packageQuantity}</span>}</div>}</div></div><div className="flex items-center justify-between sm:block"><span className="text-[10px] uppercase tracking-wider text-subtle sm:hidden">Dose / L</span><div className="flex items-center gap-2"><Input aria-label={`Dose par litre de ${product.name}`} type="number" min="0" step="0.1" value={dose} onChange={(event) => updateDose(product.id, Number(event.target.value))} className="h-9 w-20 border-border bg-elevated px-2 text-right font-mono text-sm" /><span className="text-xs text-muted">{product.unit}/L</span></div></div><div className="flex items-center justify-between text-right sm:block"><span className="text-[10px] uppercase tracking-wider text-subtle sm:hidden">Total</span><span className="font-mono text-sm tabular-nums text-fg">{formatDose(dose * liters)} <span className="text-xs text-muted">{product.unit}</span></span></div><div className="flex items-center justify-end gap-1"><button type="button" onClick={() => openEditProduct(product)} aria-label={`Modifier ${product.name}`} title={`Modifier ${product.name}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-chip hover:text-fg"><Pencil className="size-3.5" /></button><button type="button" onClick={() => removeProduct(product.id)} aria-label={`Retirer ${product.name}`} title={`Retirer ${product.name}`} className="grid size-8 place-items-center rounded-lg text-subtle transition hover:bg-red-500/10 hover:text-red-600"><Trash2 className="size-4" /></button></div></div>; })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4 sm:px-6"><p className="text-xs text-muted">Eau → bases → additifs → pH. Mélangez chaque produit séparément.</p><div className="flex flex-wrap items-center gap-3"><button type="button" className="flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-fg" onClick={logWatering}><Droplets className="size-3.5" /> Enregistrer l’arrosage</button><button type="button" className="flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-fg" onClick={copyRecipe}><Sparkles className="size-3.5" /> Copier la recette</button><button type="button" className="flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-fg" onClick={() => navigateTo("/journal")}><ClipboardList className="size-3.5" /> Journal de culture</button></div></div>
          </section>

          <section className="mt-6 rounded-[1.6rem] bg-surface px-5 py-5 shadow-[var(--shadow-border)] sm:px-6">
            <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><History className="size-4 text-primary" /><h2 className="text-sm font-medium">Historique des arrosages</h2></div><Badge className="bg-elevated text-muted">{waterings.length}</Badge></div>
            {waterings.length === 0 ? <p className="py-5 text-center text-xs text-muted">Aucun arrosage enregistré pour le moment.</p> : <div className="divide-y divide-border/60">{waterings.map((record) => <article key={record.id} className="py-3 first:pt-0 last:pb-0"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-sm font-medium">{record.tableName} <span className="font-normal text-muted">· {record.week}</span></p><time className="text-[11px] text-subtle" dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time></div><p className="mt-1 text-xs text-muted">{record.liters} L · {record.products.length ? record.products.map((product) => `${product.name} ${formatDose(product.total)} ${product.unit}`).join(" · ") : "Aucun produit dosé"}</p></article>)}</div>}
          </section>
          </>}

          {activePage === "calendar" && <section aria-labelledby="calendar-heading" className="rounded-[1.6rem] bg-surface px-5 py-5 shadow-[var(--shadow-border)] sm:px-6">
            <h1 id="calendar-heading" className="mb-5 font-display text-4xl tracking-tight">Calendrier</h1>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary"><CalendarDays className="size-5" /></div><div><h2 className="text-sm font-medium">Calendrier de culture</h2><p className="mt-1 text-xs text-muted">Arrosages, recettes et rappels conservés sur cet appareil.</p><p className="mt-1 flex items-center gap-1.5 text-[10px] text-subtle"><Clock3 className="size-3" /> Fuseau détecté : {calendarTimeZone}</p></div></div>
              <Button type="button" variant="outline" size="sm" disabled={!calendarTasks.length} onClick={exportCalendar}><Download className="size-3.5" /> Exporter .ics</Button>
            </div>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.85fr)]">
              <div className="rounded-2xl border border-border/70 bg-elevated/35 p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2"><Button type="button" variant="ghost" size="sm" aria-label="Mois précédent" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft className="size-4" /></Button><p className="text-sm font-medium capitalize">{calendarMonthLabel}</p><Button type="button" variant="ghost" size="sm" aria-label="Mois suivant" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight className="size-4" /></Button></div>
                <div role="grid" aria-label={`Calendrier ${calendarMonthLabel}`} className="space-y-1 text-center">
                  <div role="row" className="grid grid-cols-7 gap-1">{["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <div role="columnheader" key={`${day}-${index}`} className="py-1 text-[10px] font-medium text-subtle">{day}</div>)}</div>
                  {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => <div role="row" key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">{calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                    if (!day) return <div role="gridcell" key={`empty-${weekIndex}-${dayIndex}`} aria-hidden="true" />;
                    const dayValue = localDateValue(day);
                    const dayTasks = calendarTasks.filter((task) => calendarTaskDate(task, calendarTimeZone) === dayValue);
                    const isSelected = selectedCalendarDate === dayValue;
                    const isToday = localDateValue(new Date()) === dayValue;
                    return <div role="gridcell" key={dayValue}>
                      <button type="button" aria-label={`${day.toLocaleDateString("fr-FR", { dateStyle: "full" })}${dayTasks.length ? `, ${dayTasks.length} événement${dayTasks.length > 1 ? "s" : ""}` : ""}`} aria-pressed={isSelected} onClick={() => { setSelectedCalendarDate(dayValue); setCalendarDate(dayValue); }} className={cn("relative mx-auto grid size-9 place-items-center rounded-xl text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", isSelected ? "bg-primary text-primary-fg" : isToday ? "border border-primary/50 text-fg hover:bg-chip" : "text-muted hover:bg-chip")}>
                        {day.getDate()}
                        {dayTasks.length > 0 && <span aria-hidden="true" className={cn("absolute bottom-1 size-1 rounded-full", isSelected ? "bg-primary-fg" : "bg-primary")} />}
                      </button>
                    </div>;
                  })}</div>)}
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-subtle">Les rendez-vous sont stockés comme instants UTC avec leur fuseau IANA d’origine; leur affichage reste cohérent lors des changements d’heure.</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 p-4">
                  <h3 className="text-sm font-medium">Ajouter un événement</h3>
                  <p className="mt-1 text-[11px] text-muted">Contexte associé : {table.name} · {week}</p>
                  <form onSubmit={addCalendarTask} className="mt-3 space-y-3">
                    <div><Label htmlFor="calendar-title" className="text-[11px] text-muted">Titre</Label><Input id="calendar-title" required maxLength={100} value={calendarTitle} onChange={(event) => setCalendarTitle(event.target.value)} placeholder="Ex. Préparer la solution nutritive" className="mt-1 h-10 border-border bg-elevated text-sm" /></div>
                    <div><Label htmlFor="calendar-kind" className="text-[11px] text-muted">Type</Label><select id="calendar-kind" value={calendarKind} onChange={(event) => { const value = event.target.value; if (value === "watering" || value === "feeding" || value === "maintenance" || value === "note") setCalendarKind(value); }} className="mt-1 h-10 w-full rounded-lg border border-border bg-elevated px-3 text-sm text-fg"><option value="watering">Arrosage</option><option value="feeding">Recette nutritive</option><option value="maintenance">Entretien</option><option value="note">Rappel / note</option></select></div>
                    <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="calendar-date" className="text-[11px] text-muted">Date locale</Label><Input id="calendar-date" type="date" required value={calendarDate} onChange={(event) => { setCalendarDate(event.target.value); setSelectedCalendarDate(event.target.value); }} className="mt-1 h-10 border-border bg-elevated px-2 text-xs" /></div><div><Label htmlFor="calendar-time" className="text-[11px] text-muted">Heure locale</Label><Input id="calendar-time" type="time" required value={calendarTime} onChange={(event) => setCalendarTime(event.target.value)} className="mt-1 h-10 border-border bg-elevated px-2 text-xs" /></div></div>
                    <div><Label htmlFor="calendar-note" className="text-[11px] text-muted">Note (facultatif)</Label><Input id="calendar-note" maxLength={240} value={calendarNote} onChange={(event) => setCalendarNote(event.target.value)} placeholder="Détail utile…" className="mt-1 h-10 border-border bg-elevated text-sm" /></div>
                    <Button type="submit" className="w-full"><Plus className="size-4" /> Ajouter au calendrier</Button>
                  </form>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-medium">{new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString("fr-FR", { dateStyle: "full" })}</h3><Badge className="bg-elevated text-muted">{selectedDayTasks.length}</Badge></div>
                  {selectedDayTasks.length === 0 ? <p className="rounded-xl bg-elevated/50 px-3 py-4 text-center text-xs text-muted">Aucun événement prévu pour cette date.</p> : <div className="space-y-2">{selectedDayTasks.map((task) => <article key={task.id} className="flex items-start gap-2 rounded-xl border border-border/70 bg-elevated/35 p-3"><button type="button" onClick={() => toggleCalendarTask(task.id)} aria-label={task.completed ? `Marquer ${task.title} comme à faire` : `Marquer ${task.title} comme terminé`} aria-pressed={task.completed} className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition", task.completed ? "border-primary bg-primary text-primary-fg" : "border-border text-transparent hover:border-primary")}><Check className="size-3.5" /></button><div className="min-w-0 flex-1"><p className={cn("text-xs font-medium", task.completed && "text-muted line-through")}>{calendarTaskTime(task, calendarTimeZone)} · {task.title}</p><p className="mt-1 text-[10px] text-muted">{task.kind === "watering" ? "Arrosage" : task.kind === "feeding" ? "Recette nutritive" : task.kind === "maintenance" ? "Entretien" : "Rappel"} · {task.tableName} · {task.week}</p>{task.note && <p className="mt-1 text-[10px] leading-relaxed text-subtle">{task.note}</p>}</div><button type="button" onClick={() => deleteCalendarTask(task)} aria-label={`Supprimer ${task.title}`} className="rounded-md p-1 text-subtle hover:bg-red-500/10 hover:text-red-600"><Trash2 className="size-3.5" /></button></article>)}</div>}
                </div>
              </div>
            </div>
          </section>}

          {activePage === "journal" && <section aria-labelledby="journal-heading" className="mx-auto max-w-5xl">
            <div className="mb-7 flex items-start gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><ClipboardList className="size-6" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Suivi personnel</p><h1 id="journal-heading" className="mt-2 font-display text-4xl tracking-tight">Journal de culture</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Consignez observations, mesures d’ambiance et interventions pour retrouver facilement l’évolution de chaque plante ou zone.</p></div></div>
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
              <section aria-labelledby="journal-form-heading" className="rounded-2xl border border-border/70 bg-surface p-5">
                <h2 id="journal-form-heading" className="text-base font-medium">{editingJournalEntryId ? "Modifier la note" : "Nouvelle note"}</h2>
                <p className="mt-1 text-xs text-muted">Les entrées restent privées sur cet appareil.</p>
                <form onSubmit={saveJournalEntry} className="mt-4 space-y-3">
                  <div><Label htmlFor="journal-title" className="text-xs text-muted">Titre</Label><Input id="journal-title" required maxLength={100} value={journalDraft.title} onChange={(event) => setJournalDraft({ ...journalDraft, title: event.target.value })} placeholder="Ex. Observation du feuillage" className="mt-1 border-border bg-elevated" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label htmlFor="journal-category" className="text-xs text-muted">Catégorie</Label><select id="journal-category" value={journalDraft.category} onChange={(event) => { if (isJournalCategory(event.target.value)) setJournalDraft({ ...journalDraft, category: event.target.value }); }} className="mt-1 h-10 w-full rounded-md border border-border bg-elevated px-2 text-xs text-fg"><option value="observation">Observation</option><option value="environment">Mesure d’ambiance</option><option value="maintenance">Intervention</option><option value="note">Note libre</option></select></div>
                    <div><Label htmlFor="journal-plant" className="text-xs text-muted">Plante ou zone</Label><Input id="journal-plant" maxLength={60} value={journalDraft.plantName} onChange={(event) => setJournalDraft({ ...journalDraft, plantName: event.target.value })} placeholder="Ex. Zone A" className="mt-1 border-border bg-elevated" /></div>
                  </div>
                  <div><Label htmlFor="journal-date" className="text-xs text-muted">Date et heure locales</Label><Input id="journal-date" type="datetime-local" required value={journalDraft.dateTime} onChange={(event) => setJournalDraft({ ...journalDraft, dateTime: event.target.value })} className="mt-1 border-border bg-elevated" /></div>
                  <fieldset className="grid grid-cols-2 gap-3">
                    <legend className="mb-2 text-xs text-muted">Mesures facultatives</legend>
                    <div><Label htmlFor="journal-temperature" className="text-[11px] text-muted">Température (°C)</Label><Input id="journal-temperature" type="number" min="-50" max="80" step="0.1" value={journalDraft.temperature} onChange={(event) => setJournalDraft({ ...journalDraft, temperature: event.target.value })} placeholder="—" className="mt-1 border-border bg-elevated" /></div>
                    <div><Label htmlFor="journal-humidity" className="text-[11px] text-muted">Humidité (%)</Label><Input id="journal-humidity" type="number" min="0" max="100" step="0.1" value={journalDraft.humidity} onChange={(event) => setJournalDraft({ ...journalDraft, humidity: event.target.value })} placeholder="—" className="mt-1 border-border bg-elevated" /></div>
                  </fieldset>
                  <div><Label htmlFor="journal-details" className="text-xs text-muted">Détails</Label><textarea id="journal-details" maxLength={2000} rows={5} value={journalDraft.details} onChange={(event) => setJournalDraft({ ...journalDraft, details: event.target.value })} placeholder="Observations, contexte ou action réalisée…" className="mt-1 w-full resize-y rounded-xl border border-border bg-elevated px-3 py-2.5 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-primary" /></div>
                  <div className="flex gap-2"><Button type="submit" className="flex-1">{editingJournalEntryId ? <><Check className="size-4" /> Enregistrer</> : <><Plus className="size-4" /> Ajouter au journal</>}</Button>{editingJournalEntryId && <Button type="button" variant="outline" onClick={() => { setEditingJournalEntryId(null); setJournalDraft(createJournalDraft()); }}>Annuler</Button>}</div>
                </form>
              </section>
              <section aria-labelledby="journal-history-heading" className="rounded-2xl border border-border/70 bg-surface p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 id="journal-history-heading" className="text-base font-medium">Historique</h2><p className="mt-1 text-xs text-muted">{journalEntries.length} entrée{journalEntries.length === 1 ? "" : "s"} enregistrée{journalEntries.length === 1 ? "" : "s"}</p></div><div className="relative w-full sm:w-56"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" /><Input aria-label="Rechercher dans le journal" value={journalSearch} onChange={(event) => setJournalSearch(event.target.value)} placeholder="Rechercher…" className="border-border bg-elevated pl-9" /></div></div>
                {journalEntries.length === 0 ? <div className="rounded-xl bg-elevated/50 px-4 py-10 text-center"><ClipboardList className="mx-auto mb-3 size-7 text-subtle" /><p className="text-sm font-medium">Votre journal est prêt</p><p className="mt-1 text-xs text-muted">Ajoutez une première observation pour commencer le suivi.</p></div> : visibleJournalEntries.length === 0 ? <p className="rounded-xl bg-elevated/50 px-4 py-8 text-center text-xs text-muted">Aucune note ne correspond à cette recherche.</p> : <div className="space-y-3">{visibleJournalEntries.map((entry) => <article key={entry.id} className="rounded-xl border border-border/70 bg-elevated/35 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-medium">{entry.title}</h3><Badge className="bg-primary/10 text-primary">{entry.category === "observation" ? "Observation" : entry.category === "environment" ? "Ambiance" : entry.category === "maintenance" ? "Intervention" : "Note"}</Badge></div><p className="mt-1 text-[11px] text-muted"><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time>{entry.plantName && ` · ${entry.plantName}`}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => editJournalEntry(entry)} aria-label={`Modifier ${entry.title}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-chip hover:text-fg"><Pencil className="size-3.5" /></button><button type="button" onClick={() => deleteJournalEntry(entry)} aria-label={`Supprimer ${entry.title}`} className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-600"><Trash2 className="size-3.5" /></button></div></div>{(entry.temperature !== undefined || entry.humidity !== undefined) && <p className="mt-3 flex flex-wrap gap-2 text-xs text-fg">{entry.temperature !== undefined && <span className="rounded-lg bg-elevated px-2 py-1">{entry.temperature} °C</span>}{entry.humidity !== undefined && <span className="rounded-lg bg-elevated px-2 py-1">{entry.humidity} % humidité</span>}</p>}{entry.details && <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted">{entry.details}</p>}</article>)}</div>}
              </section>
            </div>
          </section>}

          {activePage === "wiki" && <section aria-labelledby="wiki-heading" className="mx-auto max-w-5xl">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><BookOpen className="size-6" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Espace de travail</p><h1 id="wiki-heading" className="mt-2 font-display text-4xl tracking-tight">Wiki · Cultiver Cannabis</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Un espace personnel pour organiser vos notes, références et glossaire. Vos articles restent enregistrés sur cet appareil.</p></div></div>
              <Button type="button" onClick={startWikiArticle}><Plus className="size-4" /> Nouvel article</Button>
            </div>
            <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted">Consignez les règles locales et vos sources officielles. Les règles varient selon les territoires; ce wiki personnel ne remplace ni un avis juridique ni les consignes de sécurité des fabricants.</div>
            <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.5fr)]">
              <aside aria-label="Liste des articles Wiki" className="rounded-2xl border border-border/70 bg-surface p-3">
                <div className="space-y-2">
                  <Input aria-label="Rechercher dans le Wiki" value={wikiSearch} onChange={(event) => setWikiSearch(event.target.value)} placeholder="Rechercher un article…" />
                  <select aria-label="Filtrer les articles par catégorie" value={wikiCategory} onChange={(event) => { const value = event.target.value; if (value === "all" || isWikiCategory(value)) setWikiCategory(value); }} className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="all">Toutes les catégories</option>
                    {Object.entries(WIKI_CATEGORY_LABELS).map(([category, label]) => <option key={category} value={category}>{label}</option>)}
                  </select>
                </div>
                <p className="px-1 pb-2 pt-3 text-[10px] uppercase tracking-[0.16em] text-subtle">{visibleWikiArticles.length} article{visibleWikiArticles.length === 1 ? "" : "s"}</p>
                <div className="max-h-[55vh] space-y-1 overflow-y-auto" role="list">
                  {visibleWikiArticles.map((article) => <button key={article.id} type="button" role="listitem" onClick={() => { setSelectedWikiKnowledgeSource(null); setSelectedWikiArticleId(article.id); }} aria-current={!selectedWikiKnowledgeSource && selectedWikiArticle?.id === article.id ? "true" : undefined} className={cn("w-full rounded-xl px-3 py-3 text-left transition", !selectedWikiKnowledgeSource && selectedWikiArticle?.id === article.id ? "bg-primary/10 text-fg" : "text-muted hover:bg-elevated hover:text-fg")}><span className="block text-[10px] text-primary">{WIKI_CATEGORY_LABELS[article.category]}</span><span className="mt-1 block text-sm font-medium">{article.title}</span><span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-subtle">{article.summary}</span></button>)}
                  {visibleWikiArticles.length === 0 && <p className="px-3 py-7 text-center text-xs text-muted">Aucun article ne correspond à cette recherche.</p>}
                </div>
                <Separator className="my-4 bg-border/70" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2"><h2 className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-subtle">Dossier knowledge</h2><Badge className="bg-elevated text-muted">{wikiKnowledgeSources.length}</Badge></div>
                  <p className="px-1 text-[10px] leading-relaxed text-subtle">Sources en lecture seule depuis client/public/knowledge</p>
                  <Input aria-label="Rechercher un document du dossier knowledge" value={wikiKnowledgeSearch} onChange={(event) => setWikiKnowledgeSearch(event.target.value)} placeholder="Rechercher un PDF ou Markdown…" />
                  {wikiKnowledgeLoading && <p role="status" className="px-2 py-3 text-xs text-muted">Indexation du dossier…</p>}
                  {wikiKnowledgeError && <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">{wikiKnowledgeError}</p>}
                  {!wikiKnowledgeLoading && !wikiKnowledgeError && <div className="max-h-[35vh] space-y-1 overflow-y-auto" role="list" aria-label="Documents de référence">
                    {visibleWikiKnowledgeSources.map((source) => <button key={source.id} type="button" role="listitem" onClick={() => { setSelectedWikiArticleId(""); setSelectedWikiKnowledgeSource(source); }} aria-current={selectedWikiKnowledgeSource?.id === source.id ? "true" : undefined} className={cn("w-full rounded-xl px-3 py-2.5 text-left transition", selectedWikiKnowledgeSource?.id === source.id ? "bg-primary/10 text-fg" : "text-muted hover:bg-elevated hover:text-fg")}><span className="block text-[10px] uppercase tracking-wider text-primary">{source.kind === "markdown" ? "Markdown" : "PDF"}</span><span className="mt-1 block break-words text-xs font-medium">{source.title}</span></button>)}
                    {visibleWikiKnowledgeSources.length === 0 && <p className="px-3 py-5 text-center text-xs text-muted">{wikiKnowledgeSources.length ? "Aucun document ne correspond à cette recherche." : "Aucun fichier .md ou .pdf trouvé dans le dossier."}</p>}
                  </div>}
                </div>
              </aside>
              <article className="min-h-[360px] rounded-2xl border border-border/70 bg-surface p-5 sm:p-7">
                {selectedWikiKnowledgeSource ? <><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge className="bg-primary/10 text-primary">{selectedWikiKnowledgeSource.kind === "markdown" ? "Document Markdown" : "Document PDF"}</Badge><h2 className="mt-4 break-words font-display text-3xl tracking-tight">{selectedWikiKnowledgeSource.title}</h2><p className="mt-2 break-all text-[11px] text-subtle">{selectedWikiKnowledgeSource.filename}</p></div><a href={`${import.meta.env.BASE_URL}knowledge/${encodeURIComponent(selectedWikiKnowledgeSource.filename)}`} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-fg transition hover:bg-elevated"><Download className="size-3.5" /> {selectedWikiKnowledgeSource.kind === "pdf" ? "Ouvrir / télécharger" : "Ouvrir le fichier"}</a></div><Separator className="my-5 bg-border/70" /><div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[11px] leading-relaxed text-muted">Document fourni dans le dossier knowledge : son contenu est affiché comme référence, pas comme validation officielle. Les doses et conseils des rapports ou notes doivent être vérifiés auprès du fabricant avant utilisation.</div>{selectedWikiKnowledgeSource.kind === "markdown" ? wikiKnowledgeContentLoading ? <p role="status" className="py-8 text-center text-sm text-muted">Chargement du document…</p> : wikiKnowledgeContentError ? <p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">{wikiKnowledgeContentError}</p> : <MarkdownDocument content={wikiKnowledgeContent} /> : <iframe title={`Aperçu PDF : ${selectedWikiKnowledgeSource.title}`} src={`${import.meta.env.BASE_URL}knowledge/${encodeURIComponent(selectedWikiKnowledgeSource.filename)}`} className="h-[70vh] w-full rounded-xl border border-border/70 bg-white" />}</> : selectedWikiArticle ? <><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge className="bg-primary/10 text-primary">{WIKI_CATEGORY_LABELS[selectedWikiArticle.category]}</Badge><h2 className="mt-4 font-display text-3xl tracking-tight">{selectedWikiArticle.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{selectedWikiArticle.summary}</p><p className="mt-2 text-[10px] text-subtle">Mis à jour le {new Date(selectedWikiArticle.updatedAt).toLocaleDateString("fr-FR")}</p></div><div className="flex shrink-0 gap-1"><Button type="button" variant="outline" size="sm" onClick={() => editWikiArticle(selectedWikiArticle)} aria-label={`Modifier ${selectedWikiArticle.title}`}><Pencil className="size-3.5" /> Modifier</Button><Button type="button" variant="ghost" size="icon" onClick={() => deleteWikiArticle(selectedWikiArticle)} aria-label={`Supprimer ${selectedWikiArticle.title}`}><Trash2 className="size-4" /></Button></div></div><Separator className="my-6 bg-border/70" /><div className="whitespace-pre-wrap break-words text-sm leading-7 text-fg">{selectedWikiArticle.content}</div></> : <div className="grid min-h-[310px] place-items-center text-center"><div><BookOpen className="mx-auto size-8 text-subtle" /><h2 className="mt-3 text-base font-medium">Aucun article</h2><p className="mt-1 text-sm text-muted">Créez une page pour commencer votre Wiki.</p><Button type="button" className="mt-4" onClick={startWikiArticle}><Plus className="size-4" /> Créer un article</Button></div></div>}
              </article>
            </div>
          </section>}

          {activePage === "assistant" && <section aria-labelledby="assistant-heading" className="mx-auto max-w-4xl">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><MessageCircle className="size-6" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Conseiller botanique</p><h1 id="assistant-heading" className="mt-2 font-display text-4xl tracking-tight">Assistant IA botanique</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">Posez vos questions de botanique, santé des plantes, sols et horticulture responsable.</p></div></div>
              {assistantMessages.length > 0 && <Button type="button" variant="outline" onClick={clearAssistantConversation}><Trash2 className="size-4" /> Effacer la conversation</Button>}
            </div>
            <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted">Les réponses sont générées par le fournisseur IA configuré par l’administrateur et peuvent contenir des erreurs. Pour un diagnostic visuel, joignez une photo nette de la plante entière et des symptômes; l’assistant peut aussi lire le texte visible (OCR visuel). La photo est envoyée au fournisseur IA uniquement avec votre demande et n’est pas conservée dans l’historique. Les recettes et les autres données locales ne sont pas envoyées. Un diagnostic sur photo reste indicatif : confirmez les causes importantes auprès d’un spécialiste.</div>
            <div className="overflow-hidden rounded-[1.6rem] border border-border/70 bg-surface shadow-[var(--shadow-border)]">
              <div className="max-h-[55vh] min-h-[300px] space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite" aria-label="Conversation avec l’assistant">
                {assistantMessages.length === 0 ? <div className="mx-auto max-w-xl py-9 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Leaf className="size-7" /></div><h2 className="mt-4 font-display text-2xl">Comment puis-je vous aider ?</h2><p className="mt-2 text-sm leading-relaxed text-muted">Commencez par une question botanique. Pour un diagnostic végétal, indiquez les symptômes observés, le contexte et depuis quand ils sont présents.</p><div className="mt-5 flex flex-wrap justify-center gap-2">{["Comment reconnaître une carence nutritive ?", "Quelles informations noter pour diagnostiquer une plante ?", "Comment améliorer la structure d’un sol ?"].map((prompt) => <button key={prompt} type="button" onClick={() => setAssistantQuestion(prompt)} className="rounded-full border border-border bg-elevated/60 px-3 py-2 text-left text-xs text-muted transition hover:border-primary/40 hover:text-fg">{prompt}</button>)}</div></div> : assistantMessages.map((message, index) => <div key={`${message.createdAt}-${index}`} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}><div className={cn("max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%]", message.role === "user" ? "bg-primary text-primary-fg" : "border border-border/70 bg-elevated/60 text-fg")}><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p><p className={cn("mt-2 text-right text-[10px]", message.role === "user" ? "text-primary-fg/70" : "text-subtle")}>{new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p></div></div>)}
                {assistantLoading && <div className="flex justify-start"><p className="rounded-2xl border border-border/70 bg-elevated/60 px-4 py-3 text-sm text-muted" role="status">L’assistant prépare une réponse…</p></div>}
              </div>
              {assistantError && <div role="alert" className="mx-4 mb-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-muted sm:mx-6">{assistantError} {assistantError.includes("AI_API_KEY") && <span>Configurez AI_API_KEY sur le serveur, puis redémarrez-le. Pour analyser des images, vérifiez aussi que le modèle AI_MODEL et le fournisseur AI_API_URL acceptent les images.</span>}</div>}
              <form onSubmit={askBotanyAssistant} className="border-t border-border/70 p-4 sm:p-5">
                <label htmlFor="assistant-question" className="mb-2 block text-xs font-medium text-muted">Votre question</label>
                <textarea id="assistant-question" maxLength={2000} rows={3} value={assistantQuestion} onChange={(event) => setAssistantQuestion(event.target.value)} placeholder="Décrivez les symptômes, leur ancienneté et vos conditions mesurées…" className="min-h-20 w-full resize-y rounded-xl border border-border bg-elevated px-3 py-3 text-sm text-fg outline-none placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-primary" />
                {assistantImageDataUrl && <div className="mt-3 flex items-center gap-3 rounded-xl border border-border/70 bg-elevated/50 p-2"><img src={assistantImageDataUrl} alt="Aperçu de la photo jointe au diagnostic botanique" className="size-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="text-xs font-medium">Photo prête pour l’analyse</p><p className="mt-1 text-[10px] leading-relaxed text-muted">Diagnostic visuel et lecture du texte lisible. L’image ne sera pas conservée dans l’historique.</p></div><Button type="button" variant="ghost" size="icon" disabled={assistantLoading} onClick={() => setAssistantImageDataUrl(null)} aria-label="Retirer la photo"><X className="size-4" /></Button></div>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2"><label htmlFor="assistant-image" className={cn("inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-elevated px-3 text-xs font-medium text-fg transition hover:bg-chip", (assistantLoading || assistantImageLoading) && "pointer-events-none opacity-50")}><Camera className="size-4" /> {assistantImageLoading ? "Préparation…" : "Joindre une photo"}</label><input id="assistant-image" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={assistantLoading || assistantImageLoading} onChange={selectAssistantImage} className="sr-only" /><span className="text-[10px] text-subtle">JPEG, PNG ou WebP · max 12 Mo</span></div>
                  <Button type="submit" disabled={assistantLoading || assistantImageLoading || (!assistantQuestion.trim() && !assistantImageDataUrl)} aria-label={assistantImageDataUrl ? "Envoyer pour analyse" : "Envoyer la question"} className="h-10"><Send className="size-4" /><span>{assistantImageDataUrl ? "Analyser la plante" : "Envoyer"}</span></Button>
                </div>
                <p className="mt-2 text-right text-[10px] text-subtle">{assistantQuestion.length}/2 000 caractères · conversation conservée sur cet appareil</p>
              </form>
            </div>
          </section>}

          {activePage === "settings" && <section aria-labelledby="settings-heading" className="mx-auto max-w-3xl">
            <div className="mb-7 flex items-start gap-4"><div className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Settings className="size-6" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Personnalisation</p><h1 id="settings-heading" className="mt-2 font-display text-4xl tracking-tight">Paramètres</h1><p className="mt-2 text-sm text-muted">Adaptez Canopée à votre expérience. Vos préférences sont enregistrées sur cet appareil.</p></div></div>
            <div className="space-y-4">
              <section className="rounded-2xl border border-border/70 bg-surface p-5"><div className="mb-4"><h2 className="text-base font-medium">Niveau d’accompagnement</h2><p className="mt-1 text-xs leading-relaxed text-muted">Choisissez la quantité de détails affichés. Vous pourrez changer à tout moment.</p></div><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => updatePreferences({ experience: "novice" })} aria-pressed={preferences.experience === "novice"} className={cn("rounded-2xl border p-4 text-left transition", preferences.experience === "novice" ? "border-primary bg-primary/10" : "border-border bg-elevated/40 hover:bg-elevated")}><span className="flex items-center justify-between"><span className="text-sm font-medium">Novice</span>{preferences.experience === "novice" && <Check className="size-4 text-primary" />}</span><span className="mt-2 block text-xs leading-relaxed text-muted">Repères guidés, termes expliqués et actions essentielles mises en avant.</span></button><button type="button" onClick={() => updatePreferences({ experience: "expert" })} aria-pressed={preferences.experience === "expert"} className={cn("rounded-2xl border p-4 text-left transition", preferences.experience === "expert" ? "border-primary bg-primary/10" : "border-border bg-elevated/40 hover:bg-elevated")}><span className="flex items-center justify-between"><span className="text-sm font-medium">Expert</span>{preferences.experience === "expert" && <Check className="size-4 text-primary" />}</span><span className="mt-2 block text-xs leading-relaxed text-muted">Sources, statuts de vérification et informations avancées affichés en priorité.</span></button></div></section>
              <section className="rounded-2xl border border-border/70 bg-surface p-5"><div className="mb-4"><h2 className="text-base font-medium">Interface</h2><p className="mt-1 text-xs text-muted">Apparence et confort d’affichage.</p></div><div className="divide-y divide-border/70"><div className="flex items-center justify-between gap-4 py-3 first:pt-0"><div><Label htmlFor="theme-setting" className="text-sm font-medium">Thème clair</Label><p className="mt-1 text-xs text-muted">Le thème sombre reste activé par défaut.</p></div><Switch id="theme-setting" checked={preferences.theme === "light"} onCheckedChange={(checked) => updatePreferences({ theme: checked ? "light" : "dark" })} aria-label="Activer le thème clair" /></div><div className="flex items-center justify-between gap-4 py-3"><div><Label htmlFor="compact-setting" className="text-sm font-medium">Affichage compact</Label><p className="mt-1 text-xs text-muted">Réduit les espacements des tableaux et listes.</p></div><Switch id="compact-setting" checked={preferences.compactMode} onCheckedChange={(checked) => updatePreferences({ compactMode: checked })} aria-label="Activer l’affichage compact" /></div><div className="flex items-center justify-between gap-4 py-3 last:pb-0"><div><Label htmlFor="manufacturer-details-setting" className="text-sm font-medium">Détails des fabricants</Label><p className="mt-1 text-xs text-muted">Afficher liens de sources et statuts de vérification.</p></div><Switch id="manufacturer-details-setting" checked={preferences.showManufacturerDetails} onCheckedChange={(checked) => updatePreferences({ showManufacturerDetails: checked })} aria-label="Afficher les détails fabricants" /></div></div></section>
              <section className="rounded-2xl border border-border/70 bg-surface p-5"><div className="mb-4"><h2 className="text-base font-medium">Dosage</h2><p className="mt-1 text-xs text-muted">Volume proposé quand vous ouvrez Canopée.</p></div><div className="flex flex-wrap items-end gap-3"><div className="min-w-0 flex-1"><Label htmlFor="default-volume" className="text-xs text-muted">Volume par défaut</Label><div className="relative mt-1"><Input id="default-volume" type="number" min="0.5" max="1000" step="0.5" value={preferences.defaultLiters} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value) && value >= 0.5 && value <= 1000) updatePreferences({ defaultLiters: value }); }} className="border-border bg-elevated pr-10" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">L</span></div></div><Button type="button" variant="outline" onClick={() => setLiters(preferences.defaultLiters)}>Appliquer à cette recette</Button></div><p className="mt-2 text-[10px] text-subtle">Plage autorisée : 0,5 à 1 000 litres.</p></section>
              <section aria-labelledby="backup-heading" className="rounded-2xl border border-border/70 bg-surface p-5"><div className="mb-4"><h2 id="backup-heading" className="text-base font-medium">Sauvegarde et confidentialité</h2><p className="mt-1 text-xs leading-relaxed text-muted">Vos recettes, cycles, calendrier, journal, Wiki, conversation et préférences restent sur cet appareil. Exportez une copie pour les transférer ou les restaurer.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={exportBackup}><Download className="size-4" /> Exporter toutes mes données</Button><label htmlFor="restore-backup" className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-fg transition hover:bg-elevated"><FileUp className="size-4" /> Restaurer une sauvegarde</label><input id="restore-backup" type="file" accept=".json,application/json" onChange={importBackup} className="sr-only" /></div><p className="mt-3 text-[10px] leading-relaxed text-subtle">La restauration remplace les données locales et exige une confirmation. Les fichiers de référence du dossier knowledge ne sont pas inclus.</p></section>
              <div className="flex justify-end"><Button type="button" variant="outline" onClick={() => updatePreferences(DEFAULT_PREFERENCES)}>Réinitialiser les paramètres</Button></div>
            </div>
          </section>}
        </main>

        <aside role={activePage === "library" ? "main" : undefined} className={cn("border-l border-border/70 bg-bg/60 py-7 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto", showCollapsedLibraryRail ? "px-2" : "px-5", activePage === "library" ? "block lg:col-start-2 lg:max-h-none" : activePage === "nutrition" && mobileCatalog ? "fixed inset-0 z-30 overflow-y-auto bg-bg" : activePage === "nutrition" ? "hidden lg:block" : "hidden") }>
          {showCollapsedLibraryRail ? <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => setLibraryCollapsed(false)} aria-label="Déployer le panneau bibliothèque" title="Déployer la bibliothèque" className="grid size-10 place-items-center rounded-xl text-muted transition hover:bg-elevated hover:text-fg"><ChevronLeft className="size-4" /></button>
            <button type="button" onClick={() => navigateTo("/bibliotheque")} aria-label="Ouvrir la bibliothèque" title="Ouvrir la bibliothèque" className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition hover:bg-primary/20"><Library className="size-4" /></button>
          </div> : <>
          <div className="mb-6 flex items-start justify-between gap-3">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-subtle">Bibliothèque</p><h1 className={cn("mt-2 font-display text-2xl tracking-tight", activePage !== "library" && "hidden")}>Bibliothèque de produits</h1><h2 className={cn("mt-2 font-display text-2xl tracking-tight", activePage === "library" && "hidden")}>Ajouter un produit</h2><p className="mt-1 text-xs leading-relaxed text-muted">Catalogue local et recherche dans les sites officiels des fabricants.</p></div>
            <div className="flex shrink-0 items-center gap-1">
              {activePage === "nutrition" && <button type="button" onClick={() => setLibraryCollapsed(true)} className="hidden size-9 place-items-center rounded-lg text-muted transition hover:bg-elevated hover:text-fg lg:grid" aria-label="Réduire le panneau bibliothèque" title="Réduire le panneau bibliothèque"><ChevronRight className="size-4" /></button>}
              <button type="button" onClick={() => { setMobileCatalog(false); if (activePage === "library") navigateTo("/nutrition"); }} className="rounded-lg p-2 text-muted hover:bg-elevated hover:text-fg lg:hidden" aria-label="Fermer"><X className="size-5" /></button>
            </div>
          </div>
          <div className="rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" /><Input aria-label="Rechercher un produit, une gamme ou une catégorie" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchManufacturerCatalog(); } }} placeholder="Produit, marque, organique, P/K…" className="h-11 border-border bg-elevated pl-9 text-sm" /></div><Label htmlFor="product-category" className="mt-3 block text-[11px] text-muted">Type de produit</Label><select id="product-category" value={productCategory} onChange={(event) => { const selected = PRODUCT_CATEGORY_FILTERS.find((category) => category.id === event.target.value); if (selected) setProductCategory(selected.id); }} className="mt-1 h-10 w-full rounded-lg border border-border bg-elevated px-3 text-xs text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{PRODUCT_CATEGORY_FILTERS.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select><div className="mt-3 flex gap-1 rounded-xl bg-elevated p-1">{([ ["all", "Tout"], ["range", "Gamme"], ["product", "Produit"] ] as [SearchMode, string][]).map(([mode, label]) => <button key={mode} type="button" onClick={() => setSearchMode(mode)} aria-pressed={searchMode === mode} className={cn("flex-1 rounded-lg py-2 text-[11px] transition", searchMode === mode ? "bg-chip text-fg" : "text-subtle hover:text-muted")}>{label}</button>)}</div><p className="mt-2 text-[10px] leading-relaxed text-subtle">« P/K » filtre les boosters associés; vérifiez le profil NPK exact sur l’étiquette.</p><Button type="button" variant="outline" className="mt-3 w-full" disabled={manufacturerSearchLoading || search.trim().length < 2} onClick={searchManufacturerCatalog}><Search className="size-4" />{manufacturerSearchLoading ? "Recherche sur les sites officiels…" : "Rechercher chez les fabricants"}</Button></div>
          <p className="mt-3 text-[11px] text-muted" aria-live="polite">{filteredCatalog.length} produit{filteredCatalog.length > 1 ? "s" : ""} dans la bibliothèque</p>
          <div className="mt-2 space-y-2">{filteredCatalog.map((product) => { const added = table.products.some((item) => item.id === product.id); const chartDose = table.chartId ? OFFICIAL_CHARTS[table.chartId]?.doses[product.id] : undefined; const categories = getProductCategories(product); return <article key={product.id} className="group rounded-2xl border border-border/70 bg-surface p-3 transition hover:border-primary/35 hover:bg-elevated"><div className="flex items-start gap-3"><ProductArtwork product={product} className="size-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-elevated" /><div className="min-w-0 flex-1 pt-1"><p className="truncate text-sm font-medium">{product.name}</p><p className="mt-0.5 truncate text-[11px] text-muted">{product.brand} · {product.role}</p></div><button type="button" onClick={() => setSelectedProductDetails(product)} aria-label={`Informations et mode d’emploi de ${product.name}`} className="grid size-8 shrink-0 place-items-center rounded-lg bg-elevated text-muted transition hover:bg-chip hover:text-fg"><Info className="size-4" /></button><button type="button" disabled={added} onClick={() => addProduct(product)} aria-label={added ? `${product.name} déjà ajouté` : `Ajouter ${product.name}`} className={cn("grid size-8 shrink-0 place-items-center rounded-lg transition", added ? "bg-chip text-primary" : "bg-elevated text-muted hover:bg-primary hover:text-primary-fg")}>{added ? <Check className="size-4" /> : <Plus className="size-4" />}</button></div><p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-subtle">{product.description}</p><div className="mt-2 flex flex-wrap items-center gap-1.5"><Badge className="bg-chip px-2 py-0.5 text-[10px] text-muted">{product.range}</Badge>{categories.slice(0, 2).map((category) => <Badge key={category} className="bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{category === "pk-booster" ? "Booster PK · NPK à vérifier" : PRODUCT_CATEGORY_LABELS[category]}</Badge>)}<span className="font-mono text-[10px] text-subtle">{product.unit}</span>{product.sourceVerified && <Badge className="bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Source fabricant</Badge>}{chartDose && <Badge className="bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Dosage fabricant vérifié</Badge>}</div></article>; })}</div>
          {manufacturerSearchResult && <section aria-label="Résultats des sites officiels" className="mt-4 space-y-2"><div className="rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="text-xs font-medium text-fg">Résultats officiels pour « {manufacturerSearchResult.query} »</p><p className="mt-1 text-[11px] leading-relaxed text-muted">Les fiches sont récupérées depuis les domaines des fabricants. Le format n’est indiqué que s’il apparaît dans les données structurées de la page; un dosage est prérempli uniquement si un tableau officiel compatible est connu.</p></div>{manufacturerSearchResult.products.map((candidate) => { const normalizedName = normalizeProductName(candidate.name); const knownProduct = CATALOG.find((product) => product.brand.toLowerCase() === candidate.brand.toLowerCase() && (normalizedName === normalizeProductName(product.name) || normalizedName.startsWith(`${normalizeProductName(product.name)} `))); const hasDoseChart = Boolean(knownProduct && officialDosesFor(table, knownProduct.id)); return <article key={candidate.id} className="rounded-2xl border border-border/70 bg-surface p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-sm font-medium">{candidate.name}</h3><p className="text-[11px] text-muted">{candidate.brand} · {candidate.kind === "range" ? "gamme officielle" : "produit officiel"}</p></div><Button type="button" size="sm" variant="outline" onClick={() => { setSelectedManufacturerProduct(candidate); setManufacturerProductUnit(knownProduct?.unit ?? "ml"); }}>{candidate.kind === "range" ? "Vérifier la gamme" : "Vérifier le produit"}</Button></div><p className="mt-2 text-[11px] leading-relaxed text-muted">{candidate.description || "Le fabricant ne publie pas de description dans les métadonnées de cette page."}</p>{candidate.kind === "product" && <p className="mt-2 text-[11px] text-muted">Format emballage : {candidate.packageQuantity ?? "non indiqué par la page officielle"}</p>}<p className="mt-1 text-[11px]">{hasDoseChart ? <span className="text-ok">Dosage disponible dans le tableau officiel adapté à cette recette.</span> : candidate.kind === "range" && officialChartForRange(candidate) ? <span className="text-ok">Un tableau officiel correspondant sera associé à cette gamme.</span> : <span className="text-muted">Dosage non vérifié pour cette recette; aucun dosage ne sera inventé.</span>}</p><a href={candidate.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] text-primary underline-offset-2 hover:underline">Ouvrir la fiche officielle ↗</a></article>; })}{manufacturerSearchResult.unavailableSources.map((source) => <p key={source.brand} className="rounded-lg border border-border bg-elevated p-2 text-[11px] text-muted">{source.brand} : recherche indisponible — {source.message}</p>)}</section>}
          {filteredCatalog.length === 0 && <div className="py-10 text-center"><Search className="mx-auto mb-3 size-6 text-subtle" /><p className="text-sm text-muted">Aucun produit trouvé</p><button type="button" onClick={() => { setSearch(""); setShowManualProduct(true); }} className="mt-2 text-xs text-primary hover:underline">Ajouter manuellement</button></div>}
          <Separator className="my-5 bg-border/70" />
          <Button variant="outline" className="w-full border-dashed border-border bg-transparent text-muted hover:bg-elevated hover:text-fg" onClick={() => setShowManualProduct(true)}><Plus className="size-4" /> Ajouter manuellement</Button>
          <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/7 p-4"><div className="flex items-center gap-2 text-xs font-medium text-primary"><SlidersHorizontal className="size-3.5" /> Conseil Canopée</div><p className="mt-2 text-xs leading-relaxed text-muted">Ajoutez uniquement ce que vous utilisez vraiment. Une table lisible vaut mieux qu’un tableau surchargé.</p></div>
          </>}
        </aside>
      </div>

      {activePage === "nutrition" && <button type="button" onClick={() => setMobileCatalog(true)} className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-fg shadow-[0_12px_34px_rgba(138,154,114,0.28)] lg:hidden"><Search className="size-4" /> Ajouter un produit</button>}

      {activePage === "nutrition" && <section aria-label="Import et export des recettes" className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-2 px-5 pb-8 lg:px-8"><span className="mr-1 text-xs text-muted">Recette complète :</span><Button variant="outline" size="sm" onClick={exportJson}><Download className="size-4" /> JSON</Button><Button variant="outline" size="sm" onClick={exportCsv}><Download className="size-4" /> CSV</Button><label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-fg transition hover:bg-elevated"><FileUp className="size-4" /> Importer<input type="file" accept=".json,.csv,application/json,text/csv" onChange={importRecipes} className="sr-only" /></label></section>}

      {showCreateTable && <Modal title="Créer ma table de nutrition" onClose={() => setShowCreateTable(false)}><form onSubmit={createTable} className="space-y-4"><Field label="Nom de la table"><Input autoFocus required value={newTable.name} onChange={(event) => setNewTable({ ...newTable, name: event.target.value })} placeholder="Ex. Mon programme intérieur" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Gamme / marque"><Input value={newTable.brand} onChange={(event) => setNewTable({ ...newTable, brand: event.target.value })} placeholder="Ex. Maison, BioBizz…" /></Field><Field label="Support"><Input value={newTable.medium} onChange={(event) => setNewTable({ ...newTable, medium: event.target.value })} placeholder="Ex. Coco, terreau…" /></Field></div><Field label="Description"><textarea value={newTable.description} onChange={(event) => setNewTable({ ...newTable, description: event.target.value })} placeholder="Une note pour vous rappeler le contexte de cette table…" className="min-h-24 w-full resize-none rounded-xl border border-border bg-elevated px-3 py-3 text-sm text-fg outline-none placeholder:text-subtle focus:border-primary/60" /></Field><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setShowCreateTable(false)}>Annuler</Button><Button type="submit"><Plus className="size-4" /> Créer la table</Button></div></form></Modal>}
      {showEditTable && <Modal title="Modifier la table active" onClose={() => setShowEditTable(false)}><form onSubmit={updateTable} className="space-y-4"><Field label="Nom de la table"><Input autoFocus required value={editedTable.name} onChange={(event) => setEditedTable({ ...editedTable, name: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Gamme / marque"><Input value={editedTable.brand} onChange={(event) => setEditedTable({ ...editedTable, brand: event.target.value })} /></Field><Field label="Support"><Input value={editedTable.medium} onChange={(event) => setEditedTable({ ...editedTable, medium: event.target.value })} /></Field></div><ImageField label="Logo de la marque ou image de gamme" value={editedTable.brandImageUrl} onChange={(brandImageUrl) => setEditedTable({ ...editedTable, brandImageUrl })} /><Field label="Description"><textarea value={editedTable.description} onChange={(event) => setEditedTable({ ...editedTable, description: event.target.value })} className="min-h-24 w-full resize-none rounded-xl border border-border bg-elevated px-3 py-3 text-sm text-fg outline-none focus:border-primary/60" /></Field><p className="text-[11px] leading-relaxed text-muted">Logo enregistré sur cet appareil. Une image téléversée est redimensionnée et compressée.</p><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setShowEditTable(false)}>Annuler</Button><Button type="submit"><Pencil className="size-4" /> Enregistrer</Button></div></form></Modal>}
      {editedProduct && <Modal title={`Modifier ${editedProduct.name}`} onClose={() => setEditedProduct(null)}><form onSubmit={updateProductDetails} className="space-y-4"><Field label="Nom du produit"><Input aria-label="Nom du produit" autoFocus required maxLength={100} value={editedProduct.name} onChange={(event) => setEditedProduct({ ...editedProduct, name: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Marque"><Input aria-label="Marque du produit" maxLength={100} value={editedProduct.brand} onChange={(event) => setEditedProduct({ ...editedProduct, brand: event.target.value })} /></Field><Field label="Gamme"><Input aria-label="Gamme du produit" maxLength={120} value={editedProduct.range} onChange={(event) => setEditedProduct({ ...editedProduct, range: event.target.value })} /></Field></div><ImageField label="Image du produit" value={editedProduct.imageUrl ?? ""} onChange={(imageUrl) => setEditedProduct({ ...editedProduct, imageUrl: imageUrl || undefined })} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Rôle"><Input aria-label="Rôle du produit" maxLength={100} value={editedProduct.role} onChange={(event) => setEditedProduct({ ...editedProduct, role: event.target.value })} /></Field><Field label="Unité de dosage"><select aria-label="Unité de dosage du produit" value={editedProduct.unit} onChange={(event) => { const unit = event.target.value; if (unit === "ml" || unit === "g") setEditedProduct({ ...editedProduct, unit }); }} className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><option value="ml">ml/L</option><option value="g">g/L</option></select></Field></div><Field label="Description"><textarea aria-label="Description du produit" maxLength={500} value={editedProduct.description} onChange={(event) => setEditedProduct({ ...editedProduct, description: event.target.value })} className="min-h-24 w-full resize-none rounded-xl border border-border bg-elevated px-3 py-3 text-sm text-fg outline-none focus:border-primary/60" /></Field><p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-muted">Les changements s’appliquent à ce produit dans la table active seulement. Les doses existantes sont conservées; si vous changez l’unité, la vérification officielle du dosage est retirée. Vérifiez les quantités avant préparation. Les informations fabricant restent inchangées.</p><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setEditedProduct(null)}>Annuler</Button><Button type="submit"><Pencil className="size-4" /> Enregistrer</Button></div></form></Modal>}
      {showCycleTemplates && <Modal title="Mes cycles personnalisés" onClose={() => setShowCycleTemplates(false)}><div className="space-y-5"><form onSubmit={saveCycleTemplate} className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><p className="text-sm font-medium">Enregistrer le cycle actif</p><p className="mt-1 text-xs leading-relaxed text-muted">Les étapes, durées, produits et doses de « {table.name} » seront conservés comme modèle indépendant.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input required maxLength={80} aria-label="Nom du nouveau modèle de cycle" value={cycleTemplateName} onChange={(event) => setCycleTemplateName(event.target.value)} placeholder="Nom du modèle" className="min-w-0 border-border bg-elevated" /><Button type="submit" className="shrink-0"><BookmarkPlus className="size-4" /> Enregistrer</Button></div></form><div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-medium">Modèles enregistrés</h3><Badge className="bg-elevated text-muted">{cycleTemplates.length}</Badge></div>{cycleTemplates.length === 0 ? <p className="rounded-xl bg-elevated/50 px-3 py-5 text-center text-xs text-muted">Aucun modèle pour l’instant. Enregistrez votre cycle ci-dessus.</p> : <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">{cycleTemplates.map((template) => <article key={template.id} className="rounded-xl border border-border/70 bg-elevated/35 p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{template.name}</p><p className="mt-1 text-[11px] text-muted">{template.table.weeks.length} semaines · {template.table.products.length} produits · enregistré le {new Date(template.savedAt).toLocaleDateString("fr-FR")}</p><p className="mt-1 text-[10px] text-subtle">{template.table.brand} · {template.table.medium}</p></div><div className="flex shrink-0 gap-1"><Button type="button" size="sm" variant="outline" onClick={() => applyCycleTemplate(template)}>Charger</Button><button type="button" onClick={() => { const name = window.prompt("Nouveau nom du modèle", template.name); if (name !== null) renameCycleTemplate(template, name); }} aria-label={`Renommer le modèle ${template.name}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-chip hover:text-fg"><Pencil className="size-3.5" /></button><button type="button" onClick={() => deleteCycleTemplate(template)} aria-label={`Supprimer le modèle ${template.name}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600"><Trash2 className="size-3.5" /></button></div></div></article>)}</div>}</div><div className="flex justify-end"><Button type="button" variant="ghost" onClick={() => setShowCycleTemplates(false)}>Fermer</Button></div></div></Modal>}
      {selectedProductDetails && <Modal title="Fiche produit" onClose={() => setSelectedProductDetails(null)}><div className="space-y-4">
        <div className="flex items-start gap-4">
          <ProductArtwork product={selectedProductDetails} className="size-24 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-elevated sm:size-28" />
          <div className="min-w-0 pt-1">
            <h3 className="font-medium">{selectedProductDetails.name}</h3>
            <p className="mt-1 text-xs text-muted">{selectedProductDetails.brand} · {selectedProductDetails.role} · {selectedProductDetails.unit}/L</p>
            {selectedProductDetails.sourceVerified && <Badge className="mt-2 bg-primary/10 text-primary">Fiche fabricant vérifiée</Badge>}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted">{selectedProductDetails.description}</p>
        <div className="flex flex-wrap gap-1.5">{getProductCategories(selectedProductDetails).map((category) => <Badge key={category} className="bg-primary/10 text-primary">{category === "pk-booster" ? "Booster PK · teneur exacte à vérifier" : PRODUCT_CATEGORY_LABELS[category]}</Badge>)}</div>
        <div className="rounded-xl border border-border/70 bg-elevated/50 p-4"><p className="text-xs font-medium">Mode d’emploi — repères prudents</p><p className="mt-2 text-xs leading-relaxed text-muted">{selectedProductDetails.application || getProductUsage(selectedProductDetails)}</p><p className="mt-2 text-[10px] leading-relaxed text-subtle">Toujours suivre l’étiquette et le tableau officiels correspondant au produit et au support. Ne combinez pas des dosages provenant de tableaux différents.</p></div>
        {selectedProductDetails.nutrientProfile && <div className="rounded-xl bg-elevated p-3 text-xs text-muted"><span className="font-medium text-fg">Profil nutritif publié :</span> {selectedProductDetails.nutrientProfile}</div>}
        {selectedProductDetails.doseVerified ? <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-fg">Dosages hebdomadaires vérifiés pour {table.name}. <a href={selectedProductDetails.doseSourceUrl || table.chartSourceUrl} target="_blank" rel="noreferrer" className="ml-1 text-primary underline-offset-2 hover:underline">Voir le tableau fabricant ↗</a></p> : <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted">Aucun dosage officiel compatible n’est vérifié pour la table active. Ne pas extrapoler un dosage d’une autre gamme.</p>}
        {(selectedProductDetails.sourceUrl || table.chartSourceUrl) && <div className="flex flex-wrap gap-3 text-xs">{selectedProductDetails.sourceUrl && <a href={selectedProductDetails.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">{selectedProductDetails.sourceVerified ? "Fiche officielle du fabricant ↗" : "Fiche fabricant ↗"}</a>}{table.chartSourceUrl && <a href={table.chartSourceUrl} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">Tableau source de la recette ↗</a>}</div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setSelectedProductDetails(null)}>Fermer</Button>{!table.products.some((product) => product.id === selectedProductDetails.id) && <Button type="button" onClick={() => { addProduct(selectedProductDetails); setSelectedProductDetails(null); }}><Plus className="size-4" /> Ajouter à la recette</Button>}</div>
      </div></Modal>}
      {showCycleSettings && <Modal title="Paramètres du cycle" onClose={() => setShowCycleSettings(false)}><div className="space-y-4"><p className="text-sm leading-relaxed text-muted">Renommez, reclassifiez ou supprimez une semaine, ou ajoutez-en autant que nécessaire. Les semaines végétatives, de floraison et de Flush ne sont soumises à aucune limite.</p><div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">{table.weeks.map((label, index) => { const phase = getWeekPhase(table, index); return <div key={`${index}-${phase}`} className="flex items-center gap-2 rounded-xl border border-border/70 bg-elevated/50 p-2"><select aria-label={`Phase de la semaine ${index + 1}`} value={phase} onChange={(event) => { const value = event.target.value; if (value === "vegetative" || value === "flowering" || value === "flush" || value === "other") updateWeekPhase(index, value); }} className="h-9 w-28 shrink-0 rounded-md border border-border bg-surface px-2 text-xs text-fg"><option value="vegetative">Végétatif</option><option value="flowering">Floraison</option><option value="flush">Flush</option><option value="other">Autre</option></select><Input aria-label={`Nom de la semaine ${index + 1}`} maxLength={40} value={label} onChange={(event) => updateWeekLabel(index, event.target.value)} onBlur={(event) => { if (!event.target.value.trim()) updateWeekLabel(index, `${phase === "vegetative" ? "Veg" : phase === "flowering" ? "Flo" : phase === "flush" ? "Flush" : "Semaine"} ${index + 1}`); }} className="min-w-0 border-border bg-surface text-sm" /><button type="button" onClick={() => deleteCycleWeek(index)} className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-600" aria-label={`Supprimer ${label || `la semaine ${index + 1}`}`}><Trash2 className="size-4" /></button></div>; })}</div><div className="grid gap-2 sm:grid-cols-3"><Button type="button" variant="outline" onClick={() => addCycleWeek("vegetative")}><Plus className="size-4" /> Ajouter végétatif</Button><Button type="button" variant="outline" onClick={() => addCycleWeek("flowering")}><Plus className="size-4" /> Ajouter floraison</Button><Button type="button" variant="outline" onClick={() => addCycleWeek("flush")}><Plus className="size-4" /> Ajouter Flush</Button></div><div className="flex justify-end pt-1"><Button type="button" onClick={() => setShowCycleSettings(false)}>Terminé</Button></div></div></Modal>}
      {selectedManufacturerProduct && <Modal title={selectedManufacturerProduct.kind === "range" ? "Vérifier la gamme fabricant" : "Vérifier la fiche fabricant"} onClose={() => setSelectedManufacturerProduct(null)}><div className="space-y-4"><div><h3 className="font-medium">{selectedManufacturerProduct.name}</h3><p className="text-xs text-muted">{selectedManufacturerProduct.brand} · {selectedManufacturerProduct.kind === "range" ? "gamme" : "produit"} trouvé sur le domaine officiel</p></div><p className="text-sm leading-relaxed text-muted">{selectedManufacturerProduct.description || "Aucune description disponible dans les métadonnées de la page."}</p>{selectedManufacturerProduct.kind === "product" && <p className="rounded-xl bg-elevated p-3 text-xs text-muted">Quantité du conditionnement : <strong>{selectedManufacturerProduct.packageQuantity ?? "non publiée dans les données structurées"}</strong></p>}<a href={selectedManufacturerProduct.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-xs text-primary underline-offset-2 hover:underline">Vérifier la page source ↗</a><div className={cn("rounded-xl border p-3 text-xs leading-relaxed", selectedProductDoses || selectedRangeChart ? "border-primary/30 bg-primary/5 text-fg" : "border-amber-500/30 bg-amber-500/5 text-muted")}>{selectedManufacturerProduct.kind === "range" ? selectedRangeChart ? <><strong>Tableau fabricant compatible : {selectedRangeChart.name}.</strong><p className="mt-1">La gamme sera ajoutée avec ses étapes officielles. Choisissez ensuite les produits à doser dans la bibliothèque.</p></> : <><strong>Dosages non vérifiés pour cette gamme.</strong><p className="mt-1">Une table sera créée, mais aucun dosage ne sera inventé.</p></> : selectedProductDoses ? <><strong>Dosage fabricant trouvé pour cette recette.</strong><ul className="mt-2 grid grid-cols-2 gap-1">{table.weeks.map((stage, index) => selectedProductDoses[index] > 0 ? <li key={`${stage}-${index}`}>{stage} : {formatDose(selectedProductDoses[index])} {selectedCatalogProduct?.unit}/L</li> : null)}</ul></> : <><strong>Dosage non vérifié pour cette recette.</strong><p className="mt-1">Aucun dosage ne sera inventé : le produit sera ajouté avec des doses à zéro, à vérifier avant utilisation.</p></>}</div>{selectedManufacturerProduct.kind === "product" && !selectedCatalogProduct && <Field label="Unité pour saisir les doses"><select value={manufacturerProductUnit} onChange={(event) => setManufacturerProductUnit(event.target.value === "g" ? "g" : "ml")} className="h-10 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg"><option value="ml">ml/L</option><option value="g">g/L</option></select></Field>}<div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setSelectedManufacturerProduct(null)}>Annuler</Button><Button type="button" onClick={() => addManufacturerProduct(selectedManufacturerProduct)}><Plus className="size-4" /> {selectedManufacturerProduct.kind === "range" ? "Ajouter la gamme" : "Confirmer et ajouter"}</Button></div></div></Modal>}
      {showManualProduct && <Modal title="Ajouter un produit manuellement" onClose={() => setShowManualProduct(false)}><form onSubmit={createManualProduct} className="space-y-4"><Field label="Nom du produit"><Input autoFocus required value={manualProduct.name} onChange={(event) => setManualProduct({ ...manualProduct, name: event.target.value })} placeholder="Ex. Silice maison" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Marque"><Input value={manualProduct.brand} onChange={(event) => setManualProduct({ ...manualProduct, brand: event.target.value })} placeholder="Optionnel" /></Field><Field label="Rôle"><Input value={manualProduct.role} onChange={(event) => setManualProduct({ ...manualProduct, role: event.target.value })} placeholder="Booster, base…" /></Field></div><Field label="Unité"><div className="flex gap-2">{(["ml", "g"] as const).map((unit) => <button type="button" key={unit} onClick={() => setManualProduct({ ...manualProduct, unit })} className={cn("flex-1 rounded-xl border py-3 text-sm", manualProduct.unit === unit ? "border-primary bg-primary/10 text-primary" : "border-border bg-elevated text-muted")}>{unit}</button>)}</div></Field><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setShowManualProduct(false)}>Annuler</Button><Button type="submit"><Plus className="size-4" /> Ajouter au tableau</Button></div></form></Modal>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs font-medium text-muted">{label}</Label>{children}</div>;
}

function renderMarkdownInline(value: string): React.ReactNode[] {
  const parts = value.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      try {
        if (!/^https?:\/\//i.test(link[2])) return <span key={index}>{link[1]}</span>;
        const url = new URL(link[2], "https://wiki.local");
        if (url.protocol === "https:" || url.protocol === "http:") {
          return <a key={index} href={url.href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{link[1]}</a>;
        }
      } catch {
        return <span key={index}>{link[1]}</span>;
      }
      return <span key={index}>{link[1]}</span>;
    }
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index} className="font-semibold text-fg">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-elevated px-1 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownDocument({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) codeLines.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push(<pre key={blocks.length} className="overflow-x-auto rounded-xl bg-elevated/70 p-4 font-mono text-xs leading-relaxed">{codeLines.join("\n")}</pre>);
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)?.[0].length ?? 2;
      const Heading = `h${Math.min(level, 4)}` as "h1" | "h2" | "h3" | "h4";
      blocks.push(<Heading key={blocks.length} className="font-display text-xl leading-tight tracking-tight text-fg">{renderMarkdownInline(line.replace(/^#{1,6}\s+/, ""))}</Heading>);
      index += 1;
      continue;
    }
    if (/^(---+|\*\*\*+|___+)$/.test(line)) {
      blocks.push(<Separator key={blocks.length} className="bg-border/70" />);
      index += 1;
      continue;
    }
    if (line.startsWith("|") && index + 1 < lines.length && /^\|?\s*:?-{3,}/.test(lines[index + 1].trim())) {
      const parseCells = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
      const headers = parseCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) rows.push(parseCells(lines[index++]));
      blocks.push(<div key={blocks.length} className="overflow-x-auto rounded-xl border border-border/70"><table className="w-full border-collapse text-left text-xs"><thead className="bg-elevated"><tr>{headers.map((header, cellIndex) => <th key={cellIndex} scope="col" className="border-b border-border/70 px-3 py-2 font-semibold text-fg">{renderMarkdownInline(header)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-border/50 last:border-0">{headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top leading-relaxed text-muted">{renderMarkdownInline(row[cellIndex] ?? "")}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s/.test(lines[index].trim())) items.push(lines[index++].trim().replace(/^[-*+]\s+/, ""));
      blocks.push(<ul key={blocks.length} className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">{items.map((item, itemIndex) => <li key={itemIndex}>{renderMarkdownInline(item)}</li>)}</ul>);
      continue;
    }
    if (/^>\s?/.test(line)) {
      blocks.push(<blockquote key={blocks.length} className="border-l-2 border-primary/60 pl-4 text-sm italic leading-relaxed text-muted">{renderMarkdownInline(line.replace(/^>\s?/, ""))}</blockquote>);
      index += 1;
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,6}\s|^[-*+]\s|^>\s?|^```|^\|/.test(lines[index].trim())) paragraph.push(lines[index++].trim());
    blocks.push(<p key={blocks.length} className="text-sm leading-7 text-muted">{renderMarkdownInline(paragraph.join(" "))}</p>);
  }

  return <div className="max-h-[65vh] space-y-4 overflow-y-auto break-words rounded-xl bg-elevated/40 p-4 sm:p-5">{blocks}</div>;
}

function ProductArtwork({ product, className }: { product: Product; className: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={cn("grid place-items-center", className)}>
      {product.imageUrl && !imageFailed ? (
        <img
          src={product.imageUrl}
          alt={`Photo du produit ${product.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="size-full rounded-[inherit] bg-white object-contain p-1"
        />
      ) : (
        <div role="img" aria-label={`Photo indisponible pour ${product.name}`} className="flex size-full flex-col items-center justify-center gap-1 rounded-[inherit] bg-elevated text-subtle">
          <ImageIcon aria-hidden="true" className="size-5" />
          <span className="max-w-full truncate px-1 text-[8px]">{product.brand}</span>
        </div>
      )}
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const inputId = `image-upload-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      onChange(await compressImageFile(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de charger cette image.");
    }
  }

  return <div className="space-y-2">
    <Label className="text-xs font-medium text-muted">{label}</Label>
    <div className="space-y-2">
      <Input aria-label={`${label} — URL`} value={value.startsWith("data:") ? "" : value} onChange={(event) => onChange(event.target.value)} placeholder="https://exemple.com/image.jpg" />
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={inputId} className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-elevated px-3 text-xs font-medium text-fg transition hover:bg-chip">
          <ImageIcon className="size-4" /> Importer une image
        </label>
        <input id={inputId} aria-label={`${label} — fichier`} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
        {value && <button type="button" onClick={() => onChange("")} className="h-9 rounded-md px-3 text-xs text-muted transition hover:bg-red-500/10 hover:text-red-600">Retirer l’image</button>}
      </div>
      {value && <img src={value} alt={`Aperçu : ${label}`} className="h-24 max-w-full rounded-xl border border-border/70 bg-white object-contain p-1" />}
      <p className="text-[10px] leading-relaxed text-subtle">URL d’image publique ou fichier image (8 Mo maximum). Les fichiers téléversés sont redimensionnés et enregistrés sur cet appareil.</p>
    </div>
  </div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-[1.6rem] border border-border bg-surface p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-start justify-between gap-4"><h2 className="font-display text-2xl tracking-tight">{title}</h2><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-fg" aria-label="Fermer"><X className="size-5" /></button></div>{children}</div></div>;
}
