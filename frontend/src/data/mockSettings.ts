export interface ContractorSettings {
  company_name: string
  logo_url: string
  primary_color: string
  timezone: string
  default_language: 'en' | 'es'
  notification_email: string
  markup_multiplier: number
  range_buffer_percent: number
  phone: string
  website_url: string
  widget_title: string
  widget_intro: string
  require_phone: boolean
  show_estimate_range: boolean
  email_alerts: boolean
  daily_digest: boolean
  sms_notifications: boolean
  sms_phone: string
  webhook_url: string
  webhook_pushes: boolean
}

export const mockSettings: ContractorSettings = {
  company_name: 'Premier Construction Co.',
  logo_url: '',
  primary_color: '#2563EB',
  timezone: 'America/Chicago',
  default_language: 'en',
  notification_email: 'leads@premierconstruction.com',
  markup_multiplier: 1.35,
  range_buffer_percent: 12,
  phone: '(512) 555-0100',
  website_url: 'https://premierconstruction.com',
  widget_title: 'Get Your Free Estimate',
  widget_intro: 'Answer a few questions and get an instant ballpark estimate for your project.',
  require_phone: true,
  show_estimate_range: true,
  email_alerts: true,
  daily_digest: false,
  sms_notifications: false,
  sms_phone: '',
  webhook_url: '',
  webhook_pushes: false,
}

export interface MaterialOption {
  id: string
  name: string
  description: string
  low_rate: number
  high_rate: number
  unit: 'sqft' | 'lf'
  is_default: boolean
}

export interface AddonOption {
  id: string
  name: string
  description: string
  type: 'flat' | 'per-unit'
  low_price: number
  high_price: number
  unit: 'sqft' | 'lf' | 'project'
}

export interface TradePricing {
  trade: string
  base_rate_low: number
  base_rate_high: number
  base_unit: 'sqft' | 'lf'
  materials: MaterialOption[]
  addons: AddonOption[]
}

export const mockPricingConfigs: Record<string, TradePricing> = {
  concrete: {
    trade: 'Concrete',
    base_rate_low: 6.0,
    base_rate_high: 8.0,
    base_unit: 'sqft',
    materials: [
      { id: 'mat_c_1', name: 'Broom Finish', description: 'Classic brushed texture', low_rate: 0, high_rate: 0, unit: 'sqft', is_default: true },
      { id: 'mat_c_2', name: 'Stamped Concrete', description: 'Decorative stone patterns', low_rate: 4.0, high_rate: 5.0, unit: 'sqft', is_default: false },
      { id: 'mat_c_3', name: 'Exposed Aggregate', description: 'Stone pebble finish', low_rate: 6.0, high_rate: 7.0, unit: 'sqft', is_default: false },
    ],
    addons: [
      { id: 'add_c_1', name: 'Wire Mesh', description: 'Prevents cracking', type: 'per-unit', low_price: 1.5, high_price: 1.5, unit: 'sqft' },
      { id: 'add_c_2', name: 'Sealant', description: 'Protects surface', type: 'per-unit', low_price: 2.0, high_price: 2.0, unit: 'sqft' },
      { id: 'add_c_3', name: 'Tear-Out', description: 'Remove existing concrete', type: 'per-unit', low_price: 3.0, high_price: 3.0, unit: 'sqft' },
      { id: 'add_c_4', name: 'Expansion Joints', description: 'Control cuts every 10ft', type: 'per-unit', low_price: 1.0, high_price: 1.0, unit: 'sqft' },
    ],
  },
  asphalt: {
    trade: 'Asphalt',
    base_rate_low: 3.5,
    base_rate_high: 4.5,
    base_unit: 'sqft',
    materials: [
      { id: 'mat_a_1', name: 'Standard Asphalt', description: 'Commercial grade hot mix', low_rate: 0, high_rate: 0, unit: 'sqft', is_default: true },
      { id: 'mat_a_2', name: 'Premium Asphalt', description: 'Polymer modified mix', low_rate: 1.5, high_rate: 2.0, unit: 'sqft', is_default: false },
      { id: 'mat_a_3', name: 'Recycled Asphalt', description: 'Eco-friendly RAP mix', low_rate: -0.5, high_rate: -0.5, unit: 'sqft', is_default: false },
    ],
    addons: [
      { id: 'add_a_1', name: 'Sealcoating', description: 'Protective top coat', type: 'per-unit', low_price: 0.5, high_price: 0.5, unit: 'sqft' },
      { id: 'add_a_2', name: 'Crack Filling', description: 'Fill existing cracks', type: 'per-unit', low_price: 0.75, high_price: 0.75, unit: 'sqft' },
      { id: 'add_a_3', name: 'Line Striping', description: 'Parking space markings', type: 'flat', low_price: 300, high_price: 300, unit: 'project' },
    ],
  },
  landscape: {
    trade: 'Landscape',
    base_rate_low: 4.0,
    base_rate_high: 5.5,
    base_unit: 'sqft',
    materials: [
      { id: 'mat_l_1', name: 'Sod Installation', description: 'Premium Kentucky bluegrass', low_rate: 0, high_rate: 0, unit: 'sqft', is_default: true },
      { id: 'mat_l_2', name: 'Pavers Installation', description: 'Interlocking concrete pavers', low_rate: 5.0, high_rate: 6.0, unit: 'sqft', is_default: false },
      { id: 'mat_l_3', name: 'Artificial Turf', description: 'Synthetic grass, pet friendly', low_rate: 6.0, high_rate: 7.0, unit: 'sqft', is_default: false },
      { id: 'mat_l_4', name: 'Mulch Beds', description: 'Premium hardwood mulch', low_rate: 2.0, high_rate: 2.0, unit: 'sqft', is_default: false },
    ],
    addons: [
      { id: 'add_l_1', name: 'Irrigation System', description: 'Automatic sprinkler system', type: 'per-unit', low_price: 2.5, high_price: 2.5, unit: 'sqft' },
      { id: 'add_l_2', name: 'Landscape Lighting', description: 'LED path lighting', type: 'flat', low_price: 800, high_price: 800, unit: 'project' },
      { id: 'add_l_3', name: 'Retaining Wall', description: 'Segmental block wall', type: 'per-unit', low_price: 18.0, high_price: 18.0, unit: 'sqft' },
      { id: 'add_l_4', name: 'Drainage System', description: 'French drain installation', type: 'per-unit', low_price: 4.0, high_price: 4.0, unit: 'sqft' },
    ],
  },
  deck: {
    trade: 'Deck',
    base_rate_low: 22.0,
    base_rate_high: 28.0,
    base_unit: 'sqft',
    materials: [
      { id: 'mat_d_1', name: 'Pressure-Treated Pine', description: 'ACQ-treated lumber', low_rate: 0, high_rate: 0, unit: 'sqft', is_default: true },
      { id: 'mat_d_2', name: 'Composite Trex', description: 'Low-maintenance composite', low_rate: 16.0, high_rate: 18.0, unit: 'sqft', is_default: false },
      { id: 'mat_d_3', name: 'Redwood', description: 'Premium heartwood redwood', low_rate: 22.0, high_rate: 25.0, unit: 'sqft', is_default: false },
      { id: 'mat_d_4', name: 'Cedar', description: 'Western red cedar', low_rate: 14.0, high_rate: 16.0, unit: 'sqft', is_default: false },
    ],
    addons: [
      { id: 'add_d_1', name: 'Deck Railing', description: 'Composite rail system', type: 'per-unit', low_price: 18.0, high_price: 18.0, unit: 'lf' },
      { id: 'add_d_2', name: 'Built-in Lighting', description: 'Recessed LED deck lights', type: 'flat', low_price: 600, high_price: 600, unit: 'project' },
      { id: 'add_d_3', name: 'Staircase', description: 'Pressure-treated stairs', type: 'flat', low_price: 1200, high_price: 1200, unit: 'project' },
      { id: 'add_d_4', name: 'Pergola', description: 'Attached shade structure', type: 'flat', low_price: 2800, high_price: 2800, unit: 'project' },
    ],
  },
  roof: {
    trade: 'Roofing',
    base_rate_low: 3.5,
    base_rate_high: 4.5,
    base_unit: 'sqft',
    materials: [
      { id: 'mat_r_1', name: 'Architectural Shingles', description: 'Dimensional asphalt shingles', low_rate: 0, high_rate: 0, unit: 'sqft', is_default: true },
      { id: 'mat_r_2', name: 'Metal Roofing', description: 'Standing seam metal', low_rate: 5.0, high_rate: 6.0, unit: 'sqft', is_default: false },
      { id: 'mat_r_3', name: 'Slate Tiles', description: 'Natural stone slate', low_rate: 12.0, high_rate: 14.0, unit: 'sqft', is_default: false },
    ],
    addons: [
      { id: 'add_r_1', name: 'Ice & Water Shield', description: 'Leak barrier membrane', type: 'per-unit', low_price: 1.5, high_price: 1.5, unit: 'sqft' },
      { id: 'add_r_2', name: 'Ridge Vent', description: 'Attic ventilation system', type: 'flat', low_price: 400, high_price: 400, unit: 'project' },
      { id: 'add_r_3', name: 'Skylight Flashing', description: 'Additional leak protection', type: 'flat', low_price: 350, high_price: 350, unit: 'project' },
    ],
  },
  fence: {
    trade: 'Fencing',
    base_rate_low: 28.0,
    base_rate_high: 35.0,
    base_unit: 'lf',
    materials: [
      { id: 'mat_f_1', name: 'Wood Privacy', description: 'Cedar picket fence', low_rate: 0, high_rate: 0, unit: 'lf', is_default: true },
      { id: 'mat_f_2', name: 'Vinyl Privacy', description: 'Maintenance-free vinyl', low_rate: 8.0, high_rate: 10.0, unit: 'lf', is_default: false },
      { id: 'mat_f_3', name: 'Aluminum', description: 'Ornamental aluminum', low_rate: 22.0, high_rate: 25.0, unit: 'lf', is_default: false },
      { id: 'mat_f_4', name: 'Chain Link', description: 'Galvanized chain link', low_rate: -8.0, high_rate: -8.0, unit: 'lf', is_default: false },
    ],
    addons: [
      { id: 'add_f_1', name: 'Walk Gate', description: '4-foot access gate', type: 'flat', low_price: 350, high_price: 350, unit: 'project' },
      { id: 'add_f_2', name: 'Drive Gate', description: '10-foot vehicle gate', type: 'flat', low_price: 850, high_price: 850, unit: 'project' },
      { id: 'add_f_3', name: 'Post Caps', description: 'Decorative caps on all posts', type: 'flat', low_price: 150, high_price: 150, unit: 'project' },
      { id: 'add_f_4', name: 'Stain & Seal', description: 'Protective wood finish', type: 'per-unit', low_price: 3.0, high_price: 3.0, unit: 'lf' },
      { id: 'add_f_5', name: 'Automatic Opener', description: 'Gate opener system', type: 'flat', low_price: 2200, high_price: 2200, unit: 'project' },
    ],
  },
}

export const tradeNames: Record<string, string> = {
  concrete: 'Concrete',
  asphalt: 'Asphalt',
  landscape: 'Landscape',
  deck: 'Deck',
  roof: 'Roofing',
  fence: 'Fence',
}

export const tradeColors: Record<string, string> = {
  concrete: '#0F172A',
  asphalt: '#1E293B',
  landscape: '#16A34A',
  deck: '#D97706',
  roof: '#1A3A6B',
  fence: '#7C3AED',
}
