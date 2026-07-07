import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PDFLineItem {
  label: string;
  amountLow: number;
  amountHigh: number;
}

export interface PDFAddon {
  name: string;
  rate: number;
  type: 'flat' | 'per-unit';
  price: number;
}

export interface EstimatePDFProps {
  contractorName: string;
  contractorPhone: string;
  contractorEmail: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  tradeName: string;
  tradeNameEs?: string;
  measurement: number;
  measurementUnit: string; // 'sq ft' | 'linear ft'
  materialName: string;
  materialRate: number;
  addons: PDFAddon[];
  subtotal: number;
  markupPercent: number;
  lowPrice: number;
  highPrice: number;
  lineItems: PDFLineItem[];
  date: string;
  lang: 'en' | 'es';
}

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

// Use Helvetica (built into react-pdf / PDF standard)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// ---------------------------------------------------------------------------
// Color tokens
// ---------------------------------------------------------------------------

const COLORS = {
  primary: '#2563EB',
  navy: '#0F172A',
  gray: '#64748B',
  grayLight: '#94A3B8',
  grayBg: '#F1F5F9',
  green: '#16A34A',
  amber: '#D97706',
  border: '#E2E8F0',
  white: '#FFFFFF',
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.navy,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'Helvetica-Bold',
  },
  headerMeta: {
    alignItems: 'flex-end',
  },
  estimateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.navy,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  docNumber: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 4,
  },

  // Section titles
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Project info
  infoGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: COLORS.navy,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  infoValueSmall: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 2,
  },

  // Measurement summary
  measurementBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  measurementLabel: {
    fontSize: 9,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },

  // Table
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderCell: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: '#FAFBFC',
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.navy,
  },
  tableCellRight: {
    fontSize: 9,
    color: COLORS.navy,
    textAlign: 'right',
  },
  tableCellBold: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },
  tableCellBoldRight: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    textAlign: 'right',
  },

  // Summary rows
  subtotalRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: COLORS.grayBg,
  },
  markupRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#FEF3C7',
  },
  totalRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#DBEAFE',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textAlign: 'right',
  },

  // Price range box
  priceRangeBox: {
    marginVertical: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.green,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  priceRangeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.gray,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRangeValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    color: COLORS.green,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 8,
    color: COLORS.gray,
    fontStyle: 'italic',
    lineHeight: 1.5,
    marginTop: 8,
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.grayLight,
  },
  footerCenter: {
    fontSize: 8,
    color: COLORS.grayLight,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },

  // Spacer to prevent content overlap with footer
  footerSpacer: {
    height: 30,
  },
});

// ---------------------------------------------------------------------------
// Column widths for table
// ---------------------------------------------------------------------------

const COL_DESC = '50%';
const COL_RATE = '20%';
const COL_CALC = '15%';
const COL_SUB = '15%';

// ---------------------------------------------------------------------------
// Document component
// ---------------------------------------------------------------------------

export default function EstimatePDF({
  clientName,
  clientEmail,
  clientPhone,
  projectAddress,
  tradeName,
  tradeNameEs,
  measurement,
  measurementUnit,
  materialName,
  materialRate,
  subtotal,
  markupPercent,
  lowPrice,
  highPrice,
  lineItems,
  date,
  lang,
}: EstimatePDFProps) {
  const displayTradeName = lang === 'es' && tradeNameEs ? tradeNameEs : tradeName;
  const displayMaterialName = materialName;
  const measurementDisplay = measurementUnit === 'sq ft'
    ? `${measurement.toLocaleString()} sq ft`
    : `${measurement.toLocaleString()} linear ft`;

  const unitLabel = measurementUnit === 'sq ft' ? 'sq ft' : 'linear ft';
  const materialSubtotalLow = lineItems[0]?.amountLow ?? 0;
  const materialSubtotalHigh = lineItems[0]?.amountHigh ?? 0;

  // Addon line items (skip index 0 which is base material)
  const addonLineItems = lineItems.slice(1);

  const translations = {
    en: {
      projectInfo: 'Project Information',
      client: 'Client',
      address: 'Project Address',
      trade: 'Trade',
      date: 'Date',
      language: 'Language',
      measurement: 'Measurement Summary',
      lineItems: 'Line Items',
      description: 'Description',
      rate: 'Rate',
      calculation: 'Qty',
      subtotal: 'Subtotal',
      addons: 'Add-Ons',
      markupLabel: `Contractor Margin (${markupPercent}%)`,
      total: 'Total Estimate',
      priceRange: 'Estimated Price Range',
      disclaimer:
        'This is a ballpark estimate only. Final pricing requires an on-site evaluation. Valid for 30 days. Prices subject to change based on final scope, site conditions, and material availability.',
      generatedBy: 'Generated by Measured Quote',
      website: 'draw-to-quote.com',
      page: 'Page',
      of: 'of',
    },
    es: {
      projectInfo: 'Informacion del Proyecto',
      client: 'Cliente',
      address: 'Direccion del Proyecto',
      trade: 'Oficio',
      date: 'Fecha',
      language: 'Idioma',
      measurement: 'Resumen de Medicion',
      lineItems: 'Desglose',
      description: 'Descripcion',
      rate: 'Tarifa',
      calculation: 'Cant',
      subtotal: 'Subtotal',
      addons: 'Opciones Adicionales',
      markupLabel: `Margen del Contratista (${markupPercent}%)`,
      total: 'Estimacion Total',
      priceRange: 'Rango de Precio Estimado',
      disclaimer:
        'Esta es solo una estimacion aproximada. El precio final requiere una evaluacion en sitio. Valido por 30 dias. Los precios estan sujetos a cambios segun el alcance final, las condiciones del sitio y la disponibilidad de materiales.',
      generatedBy: 'Generado por Measured Quote',
      website: 'draw-to-quote.com',
      page: 'Pagina',
      of: 'de',
    },
  };

  const tx = translations[lang];

  return (
    <Document title={`Measured Quote Estimate - ${clientName}`}>
      <Page size="LETTER" style={styles.page} wrap>
        {/* ── HEADER ── */}
        <View style={styles.header} fixed>
          <View style={styles.headerBrand}>
            <View style={styles.logoBox} />
            <Text style={styles.brandName}>Measured Quote</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.estimateTitle}>Project Estimate</Text>
            <Text style={styles.docNumber}>EST-{Date.now()}</Text>
          </View>
        </View>

        {/* ── PROJECT INFO ── */}
        <Text style={styles.sectionTitle}>{tx.projectInfo}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>{tx.client}</Text>
            <Text style={styles.infoValue}>{clientName}</Text>
            <Text style={styles.infoValueSmall}>{clientEmail}</Text>
            <Text style={styles.infoValueSmall}>{clientPhone}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>{tx.address}</Text>
            <Text style={styles.infoValue}>{projectAddress}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>{tx.trade}</Text>
            <Text style={styles.infoValue}>{displayTradeName}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>{tx.date}</Text>
            <Text style={styles.infoValue}>{date}</Text>
            <Text style={styles.infoValueSmall}>
              {lang === 'es' ? 'Espanol' : 'English'}
            </Text>
          </View>
        </View>

        {/* ── MEASUREMENT SUMMARY ── */}
        <Text style={styles.sectionTitle}>{tx.measurement}</Text>
        <View style={styles.measurementBox}>
          <Text style={styles.measurementLabel}>
            {displayTradeName} — {tx.measurement}
          </Text>
          <Text style={styles.measurementValue}>{measurementDisplay}</Text>
        </View>

        {/* ── LINE ITEMS TABLE ── */}
        <Text style={styles.sectionTitle}>{tx.lineItems}</Text>
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: COL_DESC }]}>{tx.description}</Text>
            <Text style={[styles.tableHeaderCell, { width: COL_RATE, textAlign: 'right' }]}>{tx.rate}</Text>
            <Text style={[styles.tableHeaderCell, { width: COL_CALC, textAlign: 'right' }]}>{tx.calculation}</Text>
            <Text style={[styles.tableHeaderCell, { width: COL_SUB, textAlign: 'right' }]}>{tx.subtotal}</Text>
          </View>

          {/* Material row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: COL_DESC }]}>
              {displayMaterialName}
            </Text>
            <Text style={[styles.tableCellRight, { width: COL_RATE }]}>
              ${materialRate.toLocaleString()}/{unitLabel}
            </Text>
            <Text style={[styles.tableCellRight, { width: COL_CALC }]}>
              {measurement.toLocaleString()} {unitLabel}
            </Text>
            <Text style={[styles.tableCellRight, { width: COL_SUB }]}>
              ${materialSubtotalLow.toLocaleString()}
              {materialSubtotalHigh !== materialSubtotalLow && ` - $${materialSubtotalHigh.toLocaleString()}`}
            </Text>
          </View>

          {/* Addon rows */}
          {addonLineItems.map((item, idx) => (
            <View style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={idx}>
              <Text style={[styles.tableCell, { width: COL_DESC }]}>{item.label}</Text>
              <Text style={[styles.tableCellRight, { width: COL_RATE }]}>—</Text>
              <Text style={[styles.tableCellRight, { width: COL_CALC }]}>—</Text>
              <Text style={[styles.tableCellRight, { width: COL_SUB }]}>
                ${item.amountLow.toLocaleString()}
                {item.amountHigh !== item.amountLow && ` - $${item.amountHigh.toLocaleString()}`}
              </Text>
            </View>
          ))}

          {/* Subtotal row */}
          <View style={styles.subtotalRow}>
            <Text style={[styles.tableCellBold, { width: '70%' }]}>Subtotal</Text>
            <Text style={[styles.tableCellBoldRight, { width: '30%' }]}>
              ${subtotal.toLocaleString()}
            </Text>
          </View>

          {/* Markup row */}
          <View style={styles.markupRow}>
            <Text style={[styles.tableCellBold, { width: '70%' }]}>{tx.markupLabel}</Text>
            <Text style={[styles.tableCellBoldRight, { width: '30%' }]}>
              Included
            </Text>
          </View>

          {/* Total row */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { width: '70%' }]}>{tx.total}</Text>
            <Text style={[styles.totalValue, { width: '30%' }]}>
              ${lowPrice.toLocaleString()} - ${highPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ── PRICE RANGE ── */}
        <View style={styles.priceRangeBox}>
          <Text style={styles.priceRangeLabel}>{tx.priceRange}</Text>
          <Text style={styles.priceRangeValue}>
            ${lowPrice.toLocaleString()} - ${highPrice.toLocaleString()}
          </Text>
        </View>

        {/* ── DISCLAIMER ── */}
        <Text style={styles.disclaimer}>*{tx.disclaimer}</Text>

        {/* ── FOOTER SPACER ── */}
        <View style={styles.footerSpacer} />

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{tx.generatedBy}</Text>
          <Text style={styles.footerCenter}>{tx.website}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `${tx.page} ${pageNumber} ${tx.of} ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
