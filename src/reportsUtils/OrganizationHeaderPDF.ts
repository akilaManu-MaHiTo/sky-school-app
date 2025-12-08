import jsPDF from "jspdf";

type LogoSource =
  | string
  | File
  | {
      signedUrl?: string;
      imageUrl?: string;
      gsutil_uri?: string;
    };

type LogoInput = LogoSource | LogoSource[];

export interface PdfHeaderData {
  title?: string;
  organizationName?: string;
  logoUrl?: LogoInput; // optional, supports multiple source formats
}

const resolveLogoUrl = (logo?: LogoInput): string | undefined => {
  if (!logo) return undefined;

  if (Array.isArray(logo)) return resolveLogoUrl(logo[0]);
  if (typeof logo === "string") return logo;
  if (logo instanceof File) return URL.createObjectURL(logo);
  if (typeof logo === "object") return logo.signedUrl || logo.imageUrl || logo.gsutil_uri;

  return undefined;
};

const shouldRevokeLogoUrl = (logo?: LogoInput): boolean => {
  if (!logo) return false;
  if (Array.isArray(logo)) return shouldRevokeLogoUrl(logo[0]);
  return logo instanceof File;
};

const HEADER_HEIGHT = 38; // tighter header so divider appears higher
const LOGO_PADDING_X = 15;
const LOGO_PADDING_Y = 8;
const LOGO_SIZE = 28;

export const drawPdfHeader = (doc: jsPDF, headerData: PdfHeaderData = {}) => {
  const { organizationName = "Organization Name", logoUrl } = headerData;
  const pageWidth = doc.internal.pageSize.getWidth();
  const resolvedLogoUrl = resolveLogoUrl(logoUrl);

  // White background header
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  // Logo
  if (resolvedLogoUrl) {
    try {
      doc.addImage(resolvedLogoUrl, "JPEG", LOGO_PADDING_X, LOGO_PADDING_Y, LOGO_SIZE, LOGO_SIZE, undefined, "FAST");
      if (shouldRevokeLogoUrl(logoUrl)) URL.revokeObjectURL(resolvedLogoUrl);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }
  }

  // Organization name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14); // smaller
  doc.setFont("helvetica", "bold");
  doc.text(organizationName, 50, 18);

  // Subtitle
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("School Management System", 50, 25);

  // Date and generation info - right aligned
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  const dateText = `${dateStr}`;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - dateWidth - 15, 18);

  const generatedText = "E-Class Software";
  const generatedWidth = doc.getTextWidth(generatedText);
  doc.text(generatedText, pageWidth - generatedWidth - 15, 25);

  doc.setDrawColor(200, 200, 200); // subtle divider color
  doc.line(0, HEADER_HEIGHT, pageWidth, HEADER_HEIGHT);
 
};
