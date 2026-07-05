// Trade configuration for the estimator widget
// Each trade defines its own materials, add-ons, pricing model, and UI text

export interface MaterialOption {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  priceLow: number;
  priceHigh: number;
  unit: string;
  image?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  priceLow: number;
  priceHigh: number;
  unit: string;
  // For addons that have a quantity input (e.g., gates, fixtures)
  qtyDefault?: number;
  qtyMin?: number;
  qtyMax?: number;
  qtyLabel?: string;
  qtyLabelEs?: string;
  // Conditional visibility
  showWhen?: { materialId?: string; addonId?: string };
}

export interface SubOption {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  priceLow: number;
  priceHigh: number;
  unit: string;
}

export interface ProjectType {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  priceLow: number;
  priceHigh: number;
  unit: string;
  subOptions: SubOption[];
  subOptionLabel: string;
  subOptionLabelEs: string;
}

export type MeasurementType = 'area' | 'linear';

export interface TradeConfig {
  id: string;
  route: string;
  name: string;
  nameEs: string;
  pageTitle: string;
  pageDescription: string;
  breadcrumb: string;
  stats: { value: string; label: string }[];
  measurementType: MeasurementType;
  measurementLabel: string;
  measurementLabelEs: string;
  heroImage: string;
  // Widget
  materials: MaterialOption[];
  addons: AddonOption[];
  // For landscape-style conditional project types
  projectTypes?: ProjectType[];
  projectTypeLabel?: string;
  projectTypeLabelEs?: string;
  // Special: fence height options
  heightOptions?: { value: number; label: string; labelEs: string; multiplier: number }[];
  // How it works section
  howItWorksSteps: { title: string; titleEs: string; description: string; descriptionEs: string }[];
  // Pricing unit for results
  pricingUnit: string;
  pricingUnitEs: string;
}

// ──────────────────────────────────────────────────────────────
// CONCRETE
// ──────────────────────────────────────────────────────────────
const concreteConfig: TradeConfig = {
  id: 'concrete',
  route: '/demo/concrete',
  name: 'Concrete Driveway',
  nameEs: 'Entrada de Concreto',
  pageTitle: 'Concrete Driveway Estimator',
  pageDescription: 'Get an instant ballpark estimate for your concrete driveway project. Select your finish style, reinforcement, and additional options.',
  breadcrumb: 'Concrete Driveway',
  measurementType: 'area',
  measurementLabel: 'sq ft',
  measurementLabelEs: 'pies cuadrados',
  heroImage: '/concrete-hero.jpg',
  pricingUnit: 'sq ft',
  pricingUnitEs: 'pie cuadrado',
  stats: [
    { value: '~$8-10/sqft', label: 'typical range' },
    { value: 'Polygon area', label: 'measurement' },
    { value: '3 finish types', label: 'options' },
  ],
  materials: [
    {
      id: 'broom-finish',
      name: 'Broom Finish',
      nameEs: 'Acabado de Escoba',
      description: 'Classic brushed texture for slip resistance',
      descriptionEs: 'Textura clasica para resistencia al deslizamiento',
      priceLow: 8,
      priceHigh: 10,
      unit: 'sqft',
    },
    {
      id: 'stamped-concrete',
      name: 'Stamped Concrete',
      nameEs: 'Concreto Estampado',
      description: 'Decorative patterns that mimic stone or brick',
      descriptionEs: 'Patrones decorativos que imitan piedra o ladrillo',
      priceLow: 12,
      priceHigh: 17,
      unit: 'sqft',
    },
    {
      id: 'exposed-aggregate',
      name: 'Exposed Aggregate',
      nameEs: 'Agregado Expuesto',
      description: 'Stone pebbles visible for a premium look',
      descriptionEs: 'Guijarros visibles para un look premium',
      priceLow: 10,
      priceHigh: 14,
      unit: 'sqft',
    },
  ],
  addons: [
    {
      id: 'wire-mesh',
      name: 'Wire Mesh Reinforcement',
      nameEs: 'Malla de Refuerzo',
      description: 'Prevents cracking, extends lifespan',
      descriptionEs: 'Previene grietas, extiende la vida util',
      priceLow: 1,
      priceHigh: 2,
      unit: 'sqft',
    },
    {
      id: 'sealant',
      name: 'Premium Sealant',
      nameEs: 'Sellador Premium',
      description: 'Protects from stains and weather damage',
      descriptionEs: 'Protege de manchas y danos climaticos',
      priceLow: 1.5,
      priceHigh: 1.5,
      unit: 'sqft',
    },
    {
      id: 'tear-out',
      name: 'Tear-Out & Removal',
      nameEs: 'Demolicion y Remocion',
      description: 'Remove existing driveway',
      descriptionEs: 'Remueve la entrada existente',
      priceLow: 2,
      priceHigh: 4,
      unit: 'sqft',
    },
    {
      id: 'decorative-border',
      name: 'Decorative Border',
      nameEs: 'Borde Decorativo',
      description: 'Elegant accent border around edges',
      descriptionEs: 'Borde de acento elegante alrededor de los bordes',
      priceLow: 3,
      priceHigh: 5,
      unit: 'sqft',
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Homeowner enters their name, email, phone, and address. This becomes a qualified lead in your dashboard.',
      descriptionEs: 'El propietario ingresa su nombre, correo, telefono y direccion. Esto se convierte en un cliente calificado en su panel.',
    },
    {
      title: 'Area Measurement',
      titleEs: 'Medicion de Area',
      description: 'They draw their driveway on a satellite map. The system calculates square footage automatically.',
      descriptionEs: 'Dibujan su entrada en un mapa satelital. El sistema calcula los pies cuadrados automaticamente.',
    },
    {
      title: 'Material Selection',
      titleEs: 'Seleccion de Material',
      description: 'They choose broom, stamped, or exposed aggregate finish plus optional add-ons like reinforcement or sealant.',
      descriptionEs: 'Eligen acabado de escoba, estampado o agregado expuesto mas opciones adicionales como refuerzo o sellador.',
    },
    {
      title: 'Instant Estimate',
      titleEs: 'Estimacion Instantanea',
      description: 'A ballpark price range is calculated using your pricing rules and shown immediately.',
      descriptionEs: 'Un rango de precio aproximado se calcula usando sus reglas de precios y se muestra inmediatamente.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// ASPHALT
// ──────────────────────────────────────────────────────────────
const asphaltConfig: TradeConfig = {
  id: 'asphalt',
  route: '/demo/asphalt',
  name: 'Asphalt Paving',
  nameEs: 'Pavimentacion de Asfalto',
  pageTitle: 'Asphalt Paving Estimator',
  pageDescription: 'Get an instant ballpark estimate for your asphalt paving project. Choose your thickness, sealcoating, and additional services.',
  breadcrumb: 'Asphalt Paving',
  measurementType: 'area',
  measurementLabel: 'sq ft',
  measurementLabelEs: 'pies cuadrados',
  heroImage: '/asphalt-hero.jpg',
  pricingUnit: 'sq ft',
  pricingUnitEs: 'pie cuadrado',
  stats: [
    { value: '~$7-9/sqft', label: 'typical range' },
    { value: 'Polygon area', label: 'measurement' },
    { value: '2 depth options', label: 'options' },
  ],
  materials: [
    {
      id: 'standard-2in',
      name: 'Standard 2" Hot Mix',
      nameEs: 'Mezcla Caliente de 2"',
      description: 'Standard residential thickness, suitable for light vehicle traffic',
      descriptionEs: 'Espesor residencial estandar, adecuado para trafico ligero',
      priceLow: 7,
      priceHigh: 9,
      unit: 'sqft',
    },
    {
      id: 'heavy-3in',
      name: 'Heavy-Duty 3" Asphalt',
      nameEs: 'Asfalto Reforzado de 3"',
      description: 'Heavy-duty thickness for driveways with truck/RV traffic',
      descriptionEs: 'Espesor reforzado para entradas con trafico de camiones/RV',
      priceLow: 9,
      priceHigh: 12,
      unit: 'sqft',
    },
  ],
  addons: [
    {
      id: 'sealcoating',
      name: 'Sealcoating',
      nameEs: 'Sellado de Asfalto',
      description: 'Protects from oxidation and extends life 3-5 years',
      descriptionEs: 'Protege de la oxidacion y extiende la vida 3-5 anos',
      priceLow: 1,
      priceHigh: 2,
      unit: 'sqft',
    },
    {
      id: 'crack-sealing',
      name: 'Crack Sealing',
      nameEs: 'Sellado de Grietas',
      description: 'Prevents water damage and further deterioration',
      descriptionEs: 'Previene danos por agua y deterioro adicional',
      priceLow: 0.75,
      priceHigh: 0.75,
      unit: 'sqft',
    },
    {
      id: 'tear-out',
      name: 'Tear-Out & Removal',
      nameEs: 'Demolicion y Remocion',
      description: 'Remove and dispose of existing asphalt or concrete',
      descriptionEs: 'Remueve y dispone del asfalto o concreto existente',
      priceLow: 2,
      priceHigh: 3,
      unit: 'sqft',
    },
    {
      id: 'line-striping',
      name: 'Line Striping',
      nameEs: 'Lineas de Estacionamiento',
      description: 'For parking areas, includes layout and paint',
      descriptionEs: 'Para areas de estacionamiento, incluye diseno y pintura',
      priceLow: 500,
      priceHigh: 500,
      unit: 'flat',
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Homeowner contact details captured as a qualified lead.',
      descriptionEs: 'Los datos de contacto del propietario se capturan como cliente calificado.',
    },
    {
      title: 'Area Measurement',
      titleEs: 'Medicion de Area',
      description: 'Polygon drawn on satellite map, sq ft auto-calculated.',
      descriptionEs: 'Poligono dibujado en mapa satelital, pies cuadrados auto-calculados.',
    },
    {
      title: 'Material Selection',
      titleEs: 'Seleccion de Material',
      description: '2-inch or 3-inch hot mix, plus sealcoating, crack sealing, tear-out, line striping.',
      descriptionEs: 'Mezcla caliente de 2 o 3 pulgadas, mas sellado, sellado de grietas, demolicion, lineas.',
    },
    {
      title: 'Instant Estimate',
      titleEs: 'Estimacion Instantanea',
      description: 'Ballpark range using your pricing rules.',
      descriptionEs: 'Rango aproximado usando sus reglas de precios.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// LANDSCAPE
// ──────────────────────────────────────────────────────────────
const landscapeConfig: TradeConfig = {
  id: 'landscape',
  route: '/demo/landscape',
  name: 'Landscape',
  nameEs: 'Jardineria',
  pageTitle: 'Landscape Estimator',
  pageDescription: 'Get an instant ballpark estimate for your landscaping project. Choose sod, pavers, or mulch with options for every preference.',
  breadcrumb: 'Landscape',
  measurementType: 'area',
  measurementLabel: 'sq ft',
  measurementLabelEs: 'pies cuadrados',
  heroImage: '/landscape-hero.jpg',
  pricingUnit: 'sq ft',
  pricingUnitEs: 'pie cuadrado',
  stats: [
    { value: '~$2-35/sqft', label: 'typical range' },
    { value: 'Polygon area', label: 'measurement' },
    { value: '3 project types', label: 'options' },
  ],
  projectTypeLabel: 'Project Type',
  projectTypeLabelEs: 'Tipo de Proyecto',
  projectTypes: [
    {
      id: 'sod',
      name: 'Sod Installation',
      nameEs: 'Instalacion de Cesped',
      description: 'Replace or install new lawn with fresh sod',
      descriptionEs: 'Reemplace o instale cesped nuevo',
      priceLow: 2,
      priceHigh: 3.5,
      unit: 'sqft',
      subOptionLabel: 'Grass Type',
      subOptionLabelEs: 'Tipo de Cesped',
      subOptions: [
        {
          id: 'kentucky-bluegrass',
          name: 'Kentucky Bluegrass',
          nameEs: 'Kentucky Bluegrass',
          description: 'Lush, soft, ideal for cool climates',
          descriptionEs: 'Lujoso, suave, ideal para climas frios',
          priceLow: 0,
          priceHigh: 0,
          unit: 'sqft',
        },
        {
          id: 'bermuda',
          name: 'Bermuda',
          nameEs: 'Bermuda',
          description: 'Drought-tolerant, thrives in heat',
          descriptionEs: 'Resistente a sequias, prospera en calor',
          priceLow: 0.5,
          priceHigh: 0.5,
          unit: 'sqft',
        },
        {
          id: 'zoysia',
          name: 'Zoysia',
          nameEs: 'Zoysia',
          description: 'Dense, carpet-like, low maintenance',
          descriptionEs: 'Denso, tipo alfombra, bajo mantenimiento',
          priceLow: 1,
          priceHigh: 1,
          unit: 'sqft',
        },
      ],
    },
    {
      id: 'pavers',
      name: 'Paver Patio/Walkway',
      nameEs: 'Patio/Sendero de Adoquines',
      description: 'Hardscape surfaces with your choice of paver material',
      descriptionEs: 'Superficies de adoquines con material a su eleccion',
      priceLow: 18,
      priceHigh: 35,
      unit: 'sqft',
      subOptionLabel: 'Paver Material',
      subOptionLabelEs: 'Material de Adoquin',
      subOptions: [
        {
          id: 'concrete-pavers',
          name: 'Concrete Pavers',
          nameEs: 'Adoquines de Concreto',
          description: 'Affordable, versatile, many colors',
          descriptionEs: 'Asequible, versatil, muchos colores',
          priceLow: 0,
          priceHigh: 0,
          unit: 'sqft',
        },
        {
          id: 'clay-brick',
          name: 'Clay Brick Pavers',
          nameEs: 'Adoquines de Ladrillo',
          description: 'Classic look, rich color, very durable',
          descriptionEs: 'Look clasico, color intenso, muy duradero',
          priceLow: 8,
          priceHigh: 8,
          unit: 'sqft',
        },
        {
          id: 'natural-stone',
          name: 'Natural Stone',
          nameEs: 'Piedra Natural',
          description: 'Premium travertine or flagstone',
          descriptionEs: 'Travertino o laja premium',
          priceLow: 15,
          priceHigh: 15,
          unit: 'sqft',
        },
      ],
    },
    {
      id: 'mulch',
      name: 'Mulch Beds',
      nameEs: 'Camas de Mantillo',
      description: 'Decorative mulch for garden and tree beds',
      descriptionEs: 'Mantillo decorativo para jardines y alrededor de arboles',
      priceLow: 4,
      priceHigh: 7,
      unit: 'sqft',
      subOptionLabel: 'Mulch Type',
      subOptionLabelEs: 'Tipo de Mantillo',
      subOptions: [
        {
          id: 'shredded-hardwood',
          name: 'Shredded Hardwood',
          nameEs: 'Madera Triturada',
          description: 'Natural brown, breaks down to enrich soil',
          descriptionEs: 'Marron natural, enriquece el suelo',
          priceLow: 0,
          priceHigh: 0,
          unit: 'sqft',
        },
        {
          id: 'rubber-mulch',
          name: 'Rubber Mulch',
          nameEs: 'Mantillo de Caucho',
          description: 'Long-lasting, won\'t decompose, vivid colors',
          descriptionEs: 'Duradero, no se descompone, colores vividos',
          priceLow: 2,
          priceHigh: 2,
          unit: 'sqft',
        },
        {
          id: 'pine-straw',
          name: 'Pine Straw',
          nameEs: 'Paja de Pino',
          description: 'Natural Southern look, lightweight',
          descriptionEs: 'Look natural del Sur, ligero',
          priceLow: -0.5,
          priceHigh: -0.5,
          unit: 'sqft',
        },
      ],
    },
  ],
  // Landscape has project types instead of direct materials
  materials: [],
  addons: [
    {
      id: 'topsoil-prep',
      name: 'Topsoil & Grading Prep',
      nameEs: 'Preparacion de Tierra y Nivelacion',
      description: 'Proper base preparation ensures healthy growth',
      descriptionEs: 'Preparacion adecuada asegura crecimiento saludable',
      priceLow: 0.8,
      priceHigh: 0.8,
      unit: 'sqft',
    },
    {
      id: 'old-lawn-removal',
      name: 'Old Lawn/Weed Removal',
      nameEs: 'Remocion de Cesped/Malezas Viejo',
      description: 'Clear existing vegetation before installation',
      descriptionEs: 'Limpieza de vegetacion existente antes de instalacion',
      priceLow: 0.6,
      priceHigh: 0.6,
      unit: 'sqft',
    },
    {
      id: 'drainage-system',
      name: 'Drainage System',
      nameEs: 'Sistema de Drenaje',
      description: 'French drain or surface drainage solution',
      descriptionEs: 'Drenaje frances o solucion de drenaje superficial',
      priceLow: 800,
      priceHigh: 800,
      unit: 'flat',
      showWhen: { materialId: 'sod' },
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Contact details become a qualified lead.',
      descriptionEs: 'Los datos de contacto se convierten en cliente calificado.',
    },
    {
      title: 'Area Measurement',
      titleEs: 'Medicion de Area',
      description: 'Polygon on satellite map for sq ft.',
      descriptionEs: 'Poligono en mapa satelital para pies cuadrados.',
    },
    {
      title: 'Project & Material Selection',
      titleEs: 'Seleccion de Proyecto y Material',
      description: 'Sod/pavers/mulch with type-specific sub-options.',
      descriptionEs: 'Cesped/adoquines/mantillo con sub-opciones especificas.',
    },
    {
      title: 'Instant Estimate',
      titleEs: 'Estimacion Instantanea',
      description: 'Ballpark range based on selections.',
      descriptionEs: 'Rango aproximado basado en selecciones.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// DECKS
// ──────────────────────────────────────────────────────────────
const deckConfig: TradeConfig = {
  id: 'decks',
  route: '/demo/decks',
  name: 'Decks',
  nameEs: 'Cubiertas',
  pageTitle: 'Deck Estimator',
  pageDescription: 'Get an instant ballpark estimate for your deck project. Choose your wood species, railing style, and extras.',
  breadcrumb: 'Decks',
  measurementType: 'area',
  measurementLabel: 'sq ft',
  measurementLabelEs: 'pies cuadrados',
  heroImage: '/deck-hero.jpg',
  pricingUnit: 'sq ft',
  pricingUnitEs: 'pie cuadrado',
  stats: [
    { value: '~$28-65/sqft', label: 'typical range' },
    { value: 'Polygon area', label: 'measurement' },
    { value: '4 materials', label: 'options' },
  ],
  materials: [
    {
      id: 'pressure-treated-pine',
      name: 'Pressure-Treated Pine',
      nameEs: 'Pino Tratado a Presion',
      description: 'Affordable, widely available, pressure-treated for durability',
      descriptionEs: 'Asequible, ampliamente disponible, tratado a presion para durabilidad',
      priceLow: 28,
      priceHigh: 35,
      unit: 'sqft',
    },
    {
      id: 'cedar',
      name: 'Cedar',
      nameEs: 'Cedro',
      description: 'Natural beauty, insect-resistant, weathers to silver-gray',
      descriptionEs: 'Belleza natural, resistente a insectos, envejece a gris plateado',
      priceLow: 42,
      priceHigh: 50,
      unit: 'sqft',
    },
    {
      id: 'ipe-hardwood',
      name: 'Ipe (Brazilian Hardwood)',
      nameEs: 'Ipe (Madera Dura Brasilena)',
      description: 'Premium hardwood, 50+ year lifespan, rich walnut color',
      descriptionEs: 'Madera dura premium, vida util 50+ anos, color nogal rico',
      priceLow: 60,
      priceHigh: 75,
      unit: 'sqft',
    },
    {
      id: 'composite',
      name: 'Composite (Trex/TimberTech)',
      nameEs: 'Compuesto (Trex/TimberTech)',
      description: 'Low maintenance, no staining, consistent color, 25-year warranty',
      descriptionEs: 'Bajo mantenimiento, sin tinte, color consistente, garantia de 25 anos',
      priceLow: 45,
      priceHigh: 55,
      unit: 'sqft',
    },
  ],
  addons: [
    {
      id: 'aluminum-railing',
      name: 'Aluminum Railing',
      nameEs: 'Barandal de Aluminio',
      description: 'Sleek, low-maintenance, code-compliant railing system',
      descriptionEs: 'Sistema de barandal elegante y de bajo mantenimiento',
      priceLow: 18,
      priceHigh: 25,
      unit: 'linear',
      qtyDefault: 20,
      qtyMin: 0,
      qtyMax: 200,
      qtyLabel: 'Linear feet of railing',
      qtyLabelEs: 'Pies lineales de barandal',
    },
    {
      id: 'step-lighting',
      name: 'Step Lighting',
      nameEs: 'Iluminacion de Escalones',
      description: 'LED recessed lights on stair risers',
      descriptionEs: 'Luces LED empotradas en contrahuellas',
      priceLow: 85,
      priceHigh: 85,
      unit: 'per-fixture',
      qtyDefault: 4,
      qtyMin: 1,
      qtyMax: 50,
      qtyLabel: 'Number of fixtures',
      qtyLabelEs: 'Numero de luminarias',
    },
    {
      id: 'stairs',
      name: 'Stair Upgrade',
      nameEs: 'Escaleras Mejoradas',
      description: 'Wide stairs with landing platform',
      descriptionEs: 'Escaleras anchas con plataforma de descanso',
      priceLow: 150,
      priceHigh: 150,
      unit: 'per-step',
      qtyDefault: 4,
      qtyMin: 1,
      qtyMax: 20,
      qtyLabel: 'Number of steps',
      qtyLabelEs: 'Numero de escalones',
    },
    {
      id: 'skirting',
      name: 'Deck Skirting',
      nameEs: 'Enrejado de Cubierta',
      description: 'Lattice or solid skirting to conceal underside',
      descriptionEs: 'Celosia o enrejado solido para ocultar la parte inferior',
      priceLow: 12,
      priceHigh: 12,
      unit: 'sqft',
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Full contact details as a qualified lead.',
      descriptionEs: 'Datos de contacto completos como cliente calificado.',
    },
    {
      title: 'Area Measurement',
      titleEs: 'Medicion de Area',
      description: 'Polygon on satellite map for sq ft.',
      descriptionEs: 'Poligono en mapa satelital para pies cuadrados.',
    },
    {
      title: 'Material Selection',
      titleEs: 'Seleccion de Material',
      description: 'Pine, cedar, Ipe, or composite with railing and lighting options.',
      descriptionEs: 'Pino, cedro, Ipe o compuesto con opciones de barandal e iluminacion.',
    },
    {
      title: 'Instant Estimate',
      titleEs: 'Estimacion Instantanea',
      description: 'Ballpark range with line-item breakdown.',
      descriptionEs: 'Rango aproximado con desglose por linea.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// ROOFING
// ──────────────────────────────────────────────────────────────
const roofingConfig: TradeConfig = {
  id: 'roofing',
  route: '/demo/roofing',
  name: 'Roof Replacement',
  nameEs: 'Reemplazo de Techo',
  pageTitle: 'Roof Replacement Estimator',
  pageDescription: 'Get an instant ballpark estimate for your roof replacement. Choose your shingle type, underlayment, and additional protection.',
  breadcrumb: 'Roof Replacement',
  measurementType: 'area',
  measurementLabel: 'sq ft',
  measurementLabelEs: 'pies cuadrados',
  heroImage: '/roofing-hero.jpg',
  pricingUnit: 'sq ft',
  pricingUnitEs: 'pie cuadrado',
  stats: [
    { value: '~$6-8/sqft', label: 'typical range' },
    { value: 'Polygon area', label: 'measurement' },
    { value: '3 shingle types', label: 'options' },
  ],
  materials: [
    {
      id: '3-tab-shingles',
      name: '3-Tab Asphalt Shingles',
      nameEs: 'Tejas Asfalticas de 3 Pestanas',
      description: 'Classic look, 20-25 year lifespan, most economical option',
      descriptionEs: 'Look clasico, vida util 20-25 anos, opcion mas economica',
      priceLow: 5.5,
      priceHigh: 7,
      unit: 'sqft',
    },
    {
      id: 'architectural-shingles',
      name: 'Architectural Shingles',
      nameEs: 'Tejas Arquitectonicas',
      description: 'Dimensional appearance, 30-50 year lifespan, better wind resistance',
      descriptionEs: 'Apariencia dimensional, vida util 30-50 anos, mejor resistencia al viento',
      priceLow: 7.5,
      priceHigh: 9.5,
      unit: 'sqft',
    },
    {
      id: 'luxury-shingles',
      name: 'Luxury/Designer Shingles',
      nameEs: 'Tejas de Lujo/Disenador',
      description: 'Premium slate or shake appearance, 50-year lifespan',
      descriptionEs: 'Apariencia premium de pizarra o madera, 50 anos de vida util',
      priceLow: 11,
      priceHigh: 14,
      unit: 'sqft',
    },
    {
      id: 'standing-seam-steel',
      name: 'Standing-Seam Steel',
      nameEs: 'Acero de Costura Vertical',
      description: 'Modern, 50+ year lifespan, energy-efficient, premium appearance',
      descriptionEs: 'Moderno, vida util 50+ anos, eficiente energeticamente',
      priceLow: 10,
      priceHigh: 13,
      unit: 'sqft',
    },
    {
      id: 'aluminum-metal',
      name: 'Aluminum Shingles',
      nameEs: 'Tejas de Aluminio',
      description: 'Lightweight, corrosion-resistant, mimics traditional shingle look',
      descriptionEs: 'Ligero, resistente a corrosion, imita look de teja tradicional',
      priceLow: 9,
      priceHigh: 12,
      unit: 'sqft',
    },
  ],
  addons: [
    {
      id: 'tear-off',
      name: 'Tear-Off & Disposal',
      nameEs: 'Remocion y Disposicion',
      description: 'Remove existing shingles to deck, haul away debris',
      descriptionEs: 'Remueve tejas existentes hasta la cubierta, desecha escombros',
      priceLow: 1.5,
      priceHigh: 1.5,
      unit: 'sqft',
    },
    {
      id: 'ice-water-shield',
      name: 'Ice & Water Shield',
      nameEs: 'Escudo de Hielo y Agua',
      description: 'Critical protection in valleys and eaves for cold climates',
      descriptionEs: 'Proteccion critica en valles y aleros para climas frios',
      priceLow: 0.85,
      priceHigh: 0.85,
      unit: 'sqft',
    },
    {
      id: 'ridge-vent',
      name: 'Ridge Vent Installation',
      nameEs: 'Instalacion de Ventilacion de Cumbrera',
      description: 'Improves attic ventilation, extends roof life',
      descriptionEs: 'Mejora ventilacion del atico, extiende vida del techo',
      priceLow: 650,
      priceHigh: 650,
      unit: 'flat',
    },
    {
      id: 'new-flashing',
      name: 'New Flashing',
      nameEs: 'Nuevo Flashing',
      description: 'Replace chimney, vent, and valley flashing',
      descriptionEs: 'Reemplaza flashing de chimenea, ventilacion y valles',
      priceLow: 450,
      priceHigh: 450,
      unit: 'flat',
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Contact details captured as qualified lead.',
      descriptionEs: 'Datos de contacto capturados como cliente calificado.',
    },
    {
      title: 'Area Measurement',
      titleEs: 'Medicion de Area',
      description: 'Roof footprint drawn on satellite map (pitch multiplier applied).',
      descriptionEs: 'Huella del techo dibujada en mapa satelital (multiplicador de inclinacion aplicado).',
    },
    {
      title: 'Material Selection',
      titleEs: 'Seleccion de Material',
      description: 'Shingle (3-tab, architectural, luxury) or metal (standing-seam, aluminum) with underlayment options.',
      descriptionEs: 'Teja (3 pestanas, arquitectonica, lujo) o metal (costura vertical, aluminio) con opciones de capa base.',
    },
    {
      title: 'Instant Estimate',
      titleEs: 'Estimacion Instantanea',
      description: 'Ballpark range with tear-off and deck repair factored in.',
      descriptionEs: 'Rango aproximado con remocion y reparacion de cubierta incluidos.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// FENCING
// ──────────────────────────────────────────────────────────────
const fencingConfig: TradeConfig = {
  id: 'fencing',
  route: '/demo/fencing',
  name: 'Fencing',
  nameEs: 'Cercas',
  pageTitle: 'Fence Estimator',
  pageDescription: 'Get an instant ballpark estimate for your fence project. Choose your material style and gate options.',
  breadcrumb: 'Fencing',
  measurementType: 'linear',
  measurementLabel: 'linear ft',
  measurementLabelEs: 'pies lineales',
  heroImage: '/fencing-hero.jpg',
  pricingUnit: 'linear ft',
  pricingUnitEs: 'pie lineal',
  stats: [
    { value: '~$25-50/lf', label: 'typical range' },
    { value: 'Polyline length', label: 'measurement' },
    { value: '3 materials', label: 'options' },
  ],
  heightOptions: [
    { value: 4, label: '4 feet', labelEs: '4 pies', multiplier: 0.85 },
    { value: 6, label: '6 feet (standard)', labelEs: '6 pies (estandar)', multiplier: 1 },
    { value: 8, label: '8 feet (tall privacy)', labelEs: '8 pies (privacidad alta)', multiplier: 1.25 },
  ],
  materials: [
    {
      id: 'pressure-treated-pine',
      name: 'Pressure-Treated Pine 6\'',
      nameEs: 'Pino Tratado a Presion 6\'',
      description: 'Classic wood fence, pressure-treated for rot resistance',
      descriptionEs: 'Cerca de madera clasica, tratada a presion para resistencia a la podredumbre',
      priceLow: 25,
      priceHigh: 30,
      unit: 'linear',
    },
    {
      id: 'cedar-privacy',
      name: 'Cedar 6\' Privacy',
      nameEs: 'Cedro 6\' Privacidad',
      description: 'Natural beauty, insect-resistant, tight privacy boards',
      descriptionEs: 'Belleza natural, resistente a insectos, tablas de privacidad ajustadas',
      priceLow: 30,
      priceHigh: 40,
      unit: 'linear',
    },
    {
      id: 'vinyl-privacy',
      name: 'Vinyl 6\' Privacy',
      nameEs: 'Vinilo 6\' Privacidad',
      description: 'Zero maintenance, won\'t rot or fade, lifetime appearance',
      descriptionEs: 'Cero mantenimiento, no se pudre ni decolora',
      priceLow: 35,
      priceHigh: 50,
      unit: 'linear',
    },
  ],
  addons: [
    {
      id: 'walk-gate',
      name: 'Walk Gate (4ft)',
      nameEs: 'Puerta Peatonal (4 pies)',
      description: 'Standard pedestrian gate with hardware',
      descriptionEs: 'Puerta peatonal estandar con herrajes',
      priceLow: 350,
      priceHigh: 450,
      unit: 'per-gate',
      qtyDefault: 1,
      qtyMin: 1,
      qtyMax: 10,
      qtyLabel: 'Number of gates',
      qtyLabelEs: 'Numero de puertas',
    },
    {
      id: 'drive-gate',
      name: 'Double Drive Gate (10ft)',
      nameEs: 'Puerta Doble para Vehiculos (10 pies)',
      description: 'Vehicle access gate with heavy-duty hinges',
      descriptionEs: 'Puerta de acceso para vehiculos con bisagras reforzadas',
      priceLow: 950,
      priceHigh: 1200,
      unit: 'per-gate',
      qtyDefault: 0,
      qtyMin: 0,
      qtyMax: 5,
      qtyLabel: 'Number of gates',
      qtyLabelEs: 'Numero de puertas',
    },
    {
      id: 'auto-opener',
      name: 'Automatic Gate Opener',
      nameEs: 'Abridor de Puerta Automatico',
      description: 'Motorized opener for drive gate with remote',
      descriptionEs: 'Abridor motorizado para puerta de vehiculos con control remoto',
      priceLow: 1200,
      priceHigh: 1200,
      unit: 'flat',
      showWhen: { addonId: 'drive-gate' },
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Contact details as qualified lead.',
      descriptionEs: 'Datos de contacto como cliente calificado.',
    },
    {
      title: 'Line Measurement',
      titleEs: 'Medicion de Linea',
      description: 'Polyline on satellite map for linear ft (unique to fencing).',
      descriptionEs: 'Polilinea en mapa satelital para pies lineales (unico para cercas).',
    },
    {
      title: 'Material Selection',
      titleEs: 'Seleccion de Material',
      description: 'Pine, cedar, or vinyl with height and gate options.',
      descriptionEs: 'Pino, cedro o vinilo con opciones de altura y puertas.',
    },
    {
      title: 'Instant Estimate',
      titleEs: 'Estimacion Instantanea',
      description: 'Ballpark range with per-linear-foot pricing.',
      descriptionEs: 'Rango aproximado con precio por pie lineal.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// TEMP FENCE (rental) — flow modeled on National Construction
// Rentals' FenceLogic tool: draw perimeter → chain link vs.
// panels → 6'/8' height → windscreen/gate options.
// Rates are seed market values (per LF for a standard rental
// period); tenant pricing overrides apply as with other trades.
// ──────────────────────────────────────────────────────────────

const tempFenceConfig: TradeConfig = {
  id: 'temp-fence',
  route: '/demo/temp-fence',
  name: 'Temp Fence',
  nameEs: 'Cerca Temporal',
  pageTitle: 'Temporary Fence Rental Estimator',
  pageDescription: 'Draw your jobsite perimeter on the map and get an instant ballpark for temporary fence rental — chain link or freestanding panels, with windscreen and gate options.',
  breadcrumb: 'Temp Fence',
  measurementType: 'linear',
  measurementLabel: 'linear ft',
  measurementLabelEs: 'pies lineales',
  heroImage: '/fencing-hero.jpg',
  pricingUnit: 'linear ft',
  pricingUnitEs: 'pie lineal',
  stats: [
    { value: '~$3-8/lf', label: 'typical rental range' },
    { value: 'Polyline length', label: 'measurement' },
    { value: '2 fence types', label: 'options' },
  ],
  heightOptions: [
    { value: 6, label: '6 feet (standard)', labelEs: '6 pies (estandar)', multiplier: 1 },
    { value: 8, label: '8 feet (high security)', labelEs: '8 pies (alta seguridad)', multiplier: 1.3 },
  ],
  materials: [
    {
      id: 'chain-link-posts',
      name: 'Chain Link (driven posts)',
      nameEs: 'Malla Ciclonica (postes clavados)',
      description: 'In-ground driven posts, most secure for longer projects on soil',
      descriptionEs: 'Postes clavados en tierra, mas seguro para proyectos largos en suelo',
      priceLow: 3,
      priceHigh: 5,
      unit: 'linear',
    },
    {
      id: 'freestanding-panels',
      name: 'Freestanding Panels',
      nameEs: 'Paneles Independientes',
      description: 'No digging — installs on concrete, asphalt, or any surface; easy to reposition',
      descriptionEs: 'Sin excavacion — se instala sobre concreto, asfalto o cualquier superficie; facil de reposicionar',
      priceLow: 4,
      priceHigh: 8,
      unit: 'linear',
    },
  ],
  addons: [
    {
      id: 'windscreen',
      name: 'Privacy Windscreen',
      nameEs: 'Malla de Privacidad',
      description: 'Fabric screening for privacy, dust control, and jobsite branding',
      descriptionEs: 'Malla de tela para privacidad, control de polvo y marca en el sitio',
      priceLow: 1,
      priceHigh: 2,
      unit: 'linear',
    },
    {
      id: 'walk-gate',
      name: 'Pedestrian Gate',
      nameEs: 'Puerta Peatonal',
      description: 'Walk-through access gate with latch',
      descriptionEs: 'Puerta de acceso peatonal con pestillo',
      priceLow: 75,
      priceHigh: 125,
      unit: 'per-gate',
      qtyDefault: 1,
      qtyMin: 0,
      qtyMax: 10,
      qtyLabel: 'Number of gates',
      qtyLabelEs: 'Numero de puertas',
    },
    {
      id: 'vehicle-gate',
      name: 'Vehicle Gate (12-20ft)',
      nameEs: 'Puerta para Vehiculos (12-20 pies)',
      description: 'Wide access gate for trucks and equipment',
      descriptionEs: 'Puerta ancha para camiones y equipo',
      priceLow: 150,
      priceHigh: 300,
      unit: 'per-gate',
      qtyDefault: 0,
      qtyMin: 0,
      qtyMax: 5,
      qtyLabel: 'Number of gates',
      qtyLabelEs: 'Numero de puertas',
    },
    {
      id: 'sandbags',
      name: 'Sandbags / Ballast',
      nameEs: 'Sacos de Arena / Lastre',
      description: 'Panel stabilization for wind and safety compliance',
      descriptionEs: 'Estabilizacion de paneles para viento y cumplimiento de seguridad',
      priceLow: 0.5,
      priceHigh: 1,
      unit: 'linear',
      showWhen: { materialId: 'freestanding-panels' },
    },
  ],
  howItWorksSteps: [
    {
      title: 'Lead Capture',
      titleEs: 'Captura de Cliente',
      description: 'Contact details as qualified rental lead.',
      descriptionEs: 'Datos de contacto como cliente de renta calificado.',
    },
    {
      title: 'Perimeter Drawing',
      titleEs: 'Dibujo de Perimetro',
      description: 'Trace the jobsite fence line on the satellite map for linear ft.',
      descriptionEs: 'Trace la linea de cerca del sitio en el mapa satelital para pies lineales.',
    },
    {
      title: 'Fence Type & Options',
      titleEs: 'Tipo de Cerca y Opciones',
      description: 'Chain link or panels, 6\' or 8\', windscreen and gates.',
      descriptionEs: 'Malla ciclonica o paneles, 6\' u 8\', malla de privacidad y puertas.',
    },
    {
      title: 'Instant Rental Estimate',
      titleEs: 'Estimacion de Renta Instantanea',
      description: 'Ballpark range for a standard rental period.',
      descriptionEs: 'Rango aproximado para un periodo de renta estandar.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────
// EXPORT ALL
// ──────────────────────────────────────────────────────────────

export const tradeConfigs: Record<string, TradeConfig> = {
  concrete: concreteConfig,
  asphalt: asphaltConfig,
  landscape: landscapeConfig,
  decks: deckConfig,
  roofing: roofingConfig,
  fencing: fencingConfig,
  'temp-fence': tempFenceConfig,
};

// Helper: get config by trade ID
export function getTradeConfig(tradeId: string): TradeConfig | undefined {
  return tradeConfigs[tradeId];
}

// All configs as array for DemoHub
export const allTradeConfigs: TradeConfig[] = Object.values(tradeConfigs);
