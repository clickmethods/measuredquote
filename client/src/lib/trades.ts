// Trade pricing catalog. Rates align with the rebuild spec defaults; markup
// and range buffer are tenant-configurable knobs in the calculation engine below.

export type MeasurementUnit = "sqft" | "lf";

export type Addon = {
  id: string;
  label: string;
  /** flat = single dollar amount, per_unit = $ per sqft/lf of measurement */
  type: "flat" | "per_unit";
  value: number;
  /** Tooltip helper shown on hover. */
  hint?: string;
};

export type Material = {
  id: string;
  label: string;
  rate: number; // $ per unit (sqft or lf)
  blurb: string;
};

export type Trade = {
  id: "concrete" | "asphalt" | "landscape" | "decks" | "roofing" | "fencing";
  name: string;
  tagline: string;
  unit: MeasurementUnit;
  unitLabel: string;
  defaultMeasurement: number; // starting slider value
  minMeasurement: number;
  maxMeasurement: number;
  step: number;
  iconKey: string;
  accent: string; // tailwind class fragment, e.g. "from-amber-500"
  materials: Material[];
  addons: Addon[];
  minProjectPrice: number;
};

export const TRADES: Record<Trade["id"], Trade> = {
  concrete: {
    id: "concrete",
    name: "Concrete Driveway",
    tagline: "Driveways, patios, sidewalks. Draw the slab, get the slab price.",
    unit: "sqft",
    unitLabel: "sq ft",
    defaultMeasurement: 600,
    minMeasurement: 100,
    maxMeasurement: 3000,
    step: 20,
    iconKey: "concrete",
    accent: "from-zinc-500",
    materials: [
      { id: "broom", label: "Broom finish", rate: 9, blurb: "Classic textured concrete, durable and budget-friendly." },
      { id: "stamped", label: "Stamped concrete", rate: 14, blurb: "Decorative pattern that mimics stone, brick, or tile." },
      { id: "exposed", label: "Exposed aggregate", rate: 12, blurb: "Pebble-finish surface with high traction and curb appeal." },
    ],
    addons: [
      { id: "mesh", label: "Wire mesh reinforcement", type: "per_unit", value: 1.5, hint: "Adds steel mesh in the slab. Recommended for driveways." },
      { id: "sealant", label: "Premium sealant", type: "flat", value: 450, hint: "Adds 5–7 years to surface life." },
      { id: "tearout", label: "Tear out existing concrete", type: "per_unit", value: 3, hint: "Demolition and haul-away of old slab." },
    ],
    minProjectPrice: 1800,
  },
  asphalt: {
    id: "asphalt",
    name: "Asphalt Paving",
    tagline: "Residential driveways and small parking lots. Outline and price.",
    unit: "sqft",
    unitLabel: "sq ft",
    defaultMeasurement: 900,
    minMeasurement: 200,
    maxMeasurement: 8000,
    step: 50,
    iconKey: "asphalt",
    accent: "from-slate-700",
    materials: [
      { id: "standard", label: "Standard 2\" hot mix", rate: 7, blurb: "Best for residential driveways and walkways." },
      { id: "heavy", label: "Heavy-duty 3\" asphalt", rate: 9.5, blurb: "Built for trucks, RVs, and small commercial use." },
    ],
    addons: [
      { id: "seal", label: "Sealcoating", type: "per_unit", value: 0.4, hint: "Protective top layer applied after paving." },
      { id: "crack", label: "Crack sealing", type: "flat", value: 350, hint: "Fills hairline cracks before paving." },
      { id: "tearout", label: "Surface removal", type: "per_unit", value: 2.5, hint: "Mill and haul existing asphalt." },
      { id: "striping", label: "Line striping", type: "flat", value: 800, hint: "Painted parking stalls and directional lines." },
    ],
    minProjectPrice: 2400,
  },
  landscape: {
    id: "landscape",
    name: "Landscape",
    tagline: "Sod, pavers, mulch beds. Pick the surface, draw the area.",
    unit: "sqft",
    unitLabel: "sq ft",
    defaultMeasurement: 400,
    minMeasurement: 50,
    maxMeasurement: 4000,
    step: 25,
    iconKey: "landscape",
    accent: "from-emerald-600",
    materials: [
      { id: "sod-blue", label: "Kentucky bluegrass sod", rate: 2.75, blurb: "Lush cool-season turf for moderate climates." },
      { id: "sod-bermuda", label: "Bermuda sod", rate: 2.5, blurb: "Heat-tolerant, fast-growing warm-season turf." },
      { id: "sod-zoysia", label: "Zoysia sod", rate: 3.25, blurb: "Dense, drought-tolerant, low-maintenance turf." },
      { id: "paver-concrete", label: "Concrete pavers", rate: 22, blurb: "Manufactured pavers in modular sizes." },
      { id: "paver-brick", label: "Clay brick pavers", rate: 26, blurb: "Traditional fired-clay brick, classic look." },
      { id: "paver-stone", label: "Natural stone", rate: 32, blurb: "Premium flagstone or bluestone surface." },
      { id: "mulch", label: "Mulch bed + weed mat", rate: 4.5, blurb: "Bark mulch with landscape fabric underneath." },
    ],
    addons: [
      { id: "topsoil", label: "Topsoil prep", type: "per_unit", value: 0.8, hint: "Grade, amend, and prep before installation." },
      { id: "removal", label: "Old lawn removal", type: "per_unit", value: 0.6, hint: "Strip and haul existing turf." },
    ],
    minProjectPrice: 1200,
  },
  decks: {
    id: "decks",
    name: "Decks",
    tagline: "Pressure-treated to Ipe. Square-foot estimating with railing add-ons.",
    unit: "sqft",
    unitLabel: "sq ft",
    defaultMeasurement: 280,
    minMeasurement: 80,
    maxMeasurement: 1500,
    step: 10,
    iconKey: "decks",
    accent: "from-amber-700",
    materials: [
      { id: "pt", label: "Pressure-treated pine", rate: 28, blurb: "Budget-friendly workhorse. 10–15 year lifespan." },
      { id: "cedar", label: "Cedar", rate: 42, blurb: "Natural rot resistance, classic warm tone." },
      { id: "composite", label: "Trex / TimberTech composite", rate: 48, blurb: "Low-maintenance, 25-year fade & stain warranty." },
      { id: "ipe", label: "Ipe hardwood", rate: 65, blurb: "Premium tropical hardwood, 50+ year lifespan." },
    ],
    addons: [
      { id: "rail-alu", label: "Aluminum railing", type: "flat", value: 2000, hint: "Powder-coated, code-compliant rails." },
      { id: "lights", label: "Step + post lighting", type: "flat", value: 480, hint: "Low-voltage LED lighting kit." },
    ],
    minProjectPrice: 4500,
  },
  roofing: {
    id: "roofing",
    name: "Roof Replacement",
    tagline: "Trace the roof from above. Material, tear-off, vents — all priced.",
    unit: "sqft",
    unitLabel: "sq ft",
    defaultMeasurement: 1800,
    minMeasurement: 400,
    maxMeasurement: 6000,
    step: 25,
    iconKey: "roofing",
    accent: "from-orange-600",
    materials: [
      { id: "3tab", label: "3-tab shingles", rate: 6, blurb: "Entry-level asphalt shingle. 15–20 year life." },
      { id: "arch", label: "Architectural shingles", rate: 8, blurb: "Dimensional shingle. Most popular choice." },
      { id: "luxury", label: "Luxury shingles", rate: 12, blurb: "Designer profile, 50-year warranty." },
      { id: "standing", label: "Standing-seam steel", rate: 18, blurb: "Premium metal panel. 50+ year life." },
      { id: "aluminum", label: "Aluminum metal", rate: 14, blurb: "Lightweight, corrosion-resistant metal roof." },
    ],
    addons: [
      { id: "tearoff", label: "Tear-off old roof", type: "per_unit", value: 1.5, hint: "Strip and dispose of existing roofing." },
      { id: "iceshield", label: "Ice & water shield", type: "per_unit", value: 0.85, hint: "Self-adhering membrane at eaves and valleys." },
      { id: "ridge", label: "Ridge vent", type: "flat", value: 650, hint: "Continuous attic ventilation at the peak." },
    ],
    minProjectPrice: 5500,
  },
  fencing: {
    id: "fencing",
    name: "Fence",
    tagline: "Trace the fence line. Linear-foot estimating with gates.",
    unit: "lf",
    unitLabel: "linear ft",
    defaultMeasurement: 160,
    minMeasurement: 30,
    maxMeasurement: 800,
    step: 5,
    iconKey: "fencing",
    accent: "from-yellow-700",
    materials: [
      { id: "pt", label: "Pressure-treated 6' privacy", rate: 28, blurb: "Budget-friendly wood privacy fence." },
      { id: "cedar", label: "Cedar 6' privacy", rate: 35, blurb: "Premium cedar with natural rot resistance." },
      { id: "vinyl", label: "Vinyl privacy", rate: 42, blurb: "Low-maintenance, 25-year color warranty." },
    ],
    addons: [
      { id: "walk", label: "Walk gate (3.5')", type: "flat", value: 400, hint: "Single pedestrian gate with hardware." },
      { id: "drive", label: "Double drive gate (10')", type: "flat", value: 950, hint: "Two-leaf vehicle gate with hardware." },
    ],
    minProjectPrice: 2200,
  },
};

export const TRADE_LIST: Trade[] = [
  TRADES.concrete,
  TRADES.asphalt,
  TRADES.landscape,
  TRADES.decks,
  TRADES.roofing,
  TRADES.fencing,
];

export type LineItem = { label: string; amount: number };

export type EstimateResult = {
  measurement: number;
  unit: MeasurementUnit;
  material: Material;
  addons: Addon[];
  base: number;
  addonsTotal: number;
  subtotal: number;
  marginAdjusted: number;
  low: number;
  high: number;
  lineItems: LineItem[];
};

/** Default tenant config — markup & buffer can be overridden in dashboard settings. */
export const DEFAULT_MARKUP = 1.15;
export const DEFAULT_BUFFER = 0.1;

export function calculateEstimate(
  trade: Trade,
  measurement: number,
  materialId: string,
  addonIds: string[],
  opts: { markup?: number; buffer?: number; regional?: number } = {},
): EstimateResult {
  const material = trade.materials.find((m) => m.id === materialId) ?? trade.materials[0];
  const addons = trade.addons.filter((a) => addonIds.includes(a.id));
  const markup = opts.markup ?? DEFAULT_MARKUP;
  const buffer = opts.buffer ?? DEFAULT_BUFFER;
  const regional = opts.regional ?? 1;

  const base = measurement * material.rate;
  const addonsTotal = addons.reduce((sum, a) => sum + (a.type === "flat" ? a.value : a.value * measurement), 0);
  const subtotal = (base + addonsTotal) * regional;
  const marginAdjusted = Math.max(subtotal * markup, trade.minProjectPrice);
  const low = Math.round(marginAdjusted * (1 - buffer));
  const high = Math.round(marginAdjusted * (1 + buffer));

  const lineItems: LineItem[] = [
    { label: `${material.label} @ $${material.rate}/${trade.unit === "sqft" ? "sqft" : "lf"}`, amount: Math.round(base) },
    ...addons.map((a) => ({
      label: a.type === "flat" ? `${a.label} (flat)` : `${a.label} @ $${a.value}/${trade.unit === "sqft" ? "sqft" : "lf"}`,
      amount: Math.round(a.type === "flat" ? a.value : a.value * measurement),
    })),
  ];

  return { measurement, unit: trade.unit, material, addons, base, addonsTotal, subtotal, marginAdjusted, low, high, lineItems };
}

/** I18N for the homeowner-facing widget (English, Spanish, French, Portuguese). */
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇲🇽" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const I18N: Record<LanguageCode, Record<string, string>> = {
  en: {
    welcome: "Get an instant estimate",
    subtitle: "Draw your project on the satellite view. Get a ballpark price in 60 seconds.",
    start: "Start my estimate",
    pickLanguage: "Choose your language",
    yourDetails: "A few quick details",
    yourDetailsHelp: "We send results to your phone and email so you can save them.",
    fullName: "Full name",
    email: "Email",
    phone: "Phone number",
    address: "Project address",
    continue: "Continue",
    back: "Back",
    measureTitle: "Outline the project area",
    measureTitleLinear: "Trace the fence line",
    measureHelp: "Click corners on the map to add points. We'll measure as you go.",
    measureHelpLinear: "Click each post location. We'll measure linear footage.",
    chooseMaterial: "Pick a material",
    addOns: "Add-ons",
    seeResults: "See my estimate",
    resultsTitle: "Your ballpark estimate",
    resultsBlurb: "This is a project-range estimate. A contractor will confirm the final price after a quick on-site visit.",
    bookVisit: "Book my free on-site visit",
    saved: "We've sent this to you",
    savedBlurb: "A contractor will reach out within 1 business day.",
    statTime: "avg time to estimate",
    statLangs: "EN · ES · FR · PT",
    statAccuracy: "ballpark accuracy",
    startDisclaimer: "No account, no obligation. By starting, you agree to share your project details with the contractor.",
    nameRequired: "Required",
    emailInvalid: "Enter a valid email",
    phoneInvalid: "Enter a valid phone",
    addressRequired: "Required",
    startAnother: "Start another estimate",
    openInbox: "Open contractor inbox",
    lineItems: "Line items",
    measurementLabel: "Measurement",
    materialLabel: "Material",
  },
  es: {
    welcome: "Obtén un presupuesto al instante",
    subtitle: "Dibuja tu proyecto en la vista satelital. Recibe un rango en 60 segundos.",
    start: "Comenzar mi presupuesto",
    pickLanguage: "Elige tu idioma",
    yourDetails: "Algunos datos rápidos",
    yourDetailsHelp: "Te enviamos los resultados por teléfono y correo para que los guardes.",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono",
    address: "Dirección del proyecto",
    continue: "Continuar",
    back: "Atrás",
    measureTitle: "Marca el área del proyecto",
    measureTitleLinear: "Traza la línea de la cerca",
    measureHelp: "Haz clic en las esquinas del mapa. Medimos mientras avanzas.",
    measureHelpLinear: "Marca cada poste. Medimos en pies lineales.",
    chooseMaterial: "Elige un material",
    addOns: "Extras",
    seeResults: "Ver mi presupuesto",
    resultsTitle: "Tu rango estimado",
    resultsBlurb: "Es una estimación. Un contratista confirmará el precio final tras una visita rápida.",
    bookVisit: "Reservar visita gratuita",
    saved: "Te lo enviamos",
    savedBlurb: "Un contratista se pondrá en contacto en 1 día hábil.",
    statTime: "tiempo promedio",
    statLangs: "EN · ES · FR · PT",
    statAccuracy: "precisión aproximada",
    startDisclaimer: "Sin cuenta ni compromiso. Al continuar, aceptas compartir los detalles con el contratista.",
    nameRequired: "Obligatorio",
    emailInvalid: "Ingresa un correo válido",
    phoneInvalid: "Ingresa un teléfono válido",
    addressRequired: "Obligatorio",
    startAnother: "Crear otro presupuesto",
    openInbox: "Abrir bandeja del contratista",
    lineItems: "Detalle de partidas",
    measurementLabel: "Medición",
    materialLabel: "Material",
  },
  fr: {
    welcome: "Obtenez une estimation instantanée",
    subtitle: "Tracez votre projet sur la vue satellite. Fourchette de prix en 60 secondes.",
    start: "Démarrer mon estimation",
    pickLanguage: "Choisissez votre langue",
    yourDetails: "Quelques infos rapides",
    yourDetailsHelp: "Nous vous envoyons les résultats par téléphone et email.",
    fullName: "Nom complet",
    email: "Courriel",
    phone: "Téléphone",
    address: "Adresse du projet",
    continue: "Continuer",
    back: "Retour",
    measureTitle: "Délimitez la zone du projet",
    measureTitleLinear: "Tracez la ligne de clôture",
    measureHelp: "Cliquez sur les coins de la carte pour ajouter des points.",
    measureHelpLinear: "Cliquez sur chaque poteau. Nous mesurons en pieds linéaires.",
    chooseMaterial: "Choisissez un matériau",
    addOns: "Options",
    seeResults: "Voir mon estimation",
    resultsTitle: "Votre fourchette estimée",
    resultsBlurb: "Estimation indicative. Un entrepreneur confirmera le prix final lors d'une visite.",
    bookVisit: "Réserver une visite gratuite",
    saved: "C'est envoyé",
    savedBlurb: "Un entrepreneur vous contactera sous 1 jour ouvrable.",
    statTime: "temps moyen",
    statLangs: "EN · ES · FR · PT",
    statAccuracy: "précision indicative",
    startDisclaimer: "Sans compte, sans engagement. En commençant, vous acceptez de partager vos coordonnées avec l'entrepreneur.",
    nameRequired: "Requis",
    emailInvalid: "Saisissez un courriel valide",
    phoneInvalid: "Saisissez un téléphone valide",
    addressRequired: "Requis",
    startAnother: "Démarrer une autre estimation",
    openInbox: "Ouvrir la boîte de réception",
    lineItems: "Postes",
    measurementLabel: "Mesure",
    materialLabel: "Matériau",
  },
  pt: {
    welcome: "Receba uma estimativa instantânea",
    subtitle: "Desenhe seu projeto na vista de satélite. Faixa de preço em 60 segundos.",
    start: "Começar minha estimativa",
    pickLanguage: "Escolha seu idioma",
    yourDetails: "Alguns dados rápidos",
    yourDetailsHelp: "Enviamos os resultados por telefone e email.",
    fullName: "Nome completo",
    email: "E-mail",
    phone: "Telefone",
    address: "Endereço do projeto",
    continue: "Continuar",
    back: "Voltar",
    measureTitle: "Delimite a área do projeto",
    measureTitleLinear: "Trace a linha da cerca",
    measureHelp: "Clique nos cantos do mapa para adicionar pontos.",
    measureHelpLinear: "Clique em cada poste. Medimos em pés lineares.",
    chooseMaterial: "Escolha um material",
    addOns: "Adicionais",
    seeResults: "Ver minha estimativa",
    resultsTitle: "Sua faixa estimada",
    resultsBlurb: "Estimativa de referência. Um contratado confirmará após uma visita rápida.",
    bookVisit: "Agendar visita gratuita",
    saved: "Enviamos para você",
    savedBlurb: "Um contratado entrará em contato em 1 dia útil.",
    statTime: "tempo médio",
    statLangs: "EN · ES · FR · PT",
    statAccuracy: "precisão aproximada",
    startDisclaimer: "Sem conta, sem compromisso. Ao iniciar, você concorda em compartilhar os detalhes com o contratado.",
    nameRequired: "Obrigatório",
    emailInvalid: "Insira um e-mail válido",
    phoneInvalid: "Insira um telefone válido",
    addressRequired: "Obrigatório",
    startAnother: "Iniciar outra estimativa",
    openInbox: "Abrir caixa do contratado",
    lineItems: "Itens da estimativa",
    measurementLabel: "Medição",
    materialLabel: "Material",
  },
};
