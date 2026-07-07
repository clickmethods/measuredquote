import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EstimatePDF from './EstimatePDF';
import type { EstimatePDFProps } from './EstimatePDF';

interface Props extends EstimatePDFProps {
  filename?: string;
}

export default function PDFDownloadButton(props: Props) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    filename,
    // Destructure the rest to pass to EstimatePDF
    contractorName,
    contractorPhone,
    contractorEmail,
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
    addons,
    subtotal,
    markupPercent,
    lowPrice,
    highPrice,
    lineItems,
    date,
    lang,
  } = props;

  // Generate a safe filename if not provided
  // Format: estimate-{trade}-{lastname}-{date}.pdf
  const safeFilename = (() => {
    if (filename) return filename;
    const lastName = clientName.split(' ').slice(-1)[0] || 'Client';
    const safeTrade = tradeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const safeLast = lastName.replace(/[^a-zA-Z0-9]/g, '');
    const dateStr = new Date().toISOString().split('T')[0];
    return `estimate-${safeTrade}-${safeLast}-${dateStr}.pdf`;
  })();

  const pdfProps: EstimatePDFProps = {
    contractorName,
    contractorPhone,
    contractorEmail,
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
    addons,
    subtotal,
    markupPercent,
    lowPrice,
    highPrice,
    lineItems,
    date,
    lang,
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <PDFDownloadLink
        document={<EstimatePDF {...pdfProps} />}
        fileName={safeFilename}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#2563EB] text-white font-semibold text-base py-3.5 px-6 rounded-full transition-all duration-200 hover:bg-[#1D4ED8] hover:-translate-y-0.5 hover:shadow-lg cursor-pointer no-underline"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>
          {lang === 'es' ? 'Descargar PDF de Estimacion' : 'Download PDF Estimate'}
        </span>
      </PDFDownloadLink>

      {/* Tooltip */}
      {isHovered && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10 pointer-events-none"
          style={{ animation: 'fadeIn 150ms ease-out' }}
        >
          {lang === 'es'
            ? 'Guarde esta estimacion como PDF'
            : 'Save this estimate as a PDF'}
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0F172A] rotate-45" />
        </div>
      )}
    </div>
  );
}
