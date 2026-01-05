import jsPDF from "jspdf";

export interface PdfHeaderData {
  title?: string;
  organizationName?: string;
  // Optional common meta fields used by some reports
  gradeLabel?: string;
  classLabel?: string;
  yearLabel?: string;
  termLabel?: string;
}

const HEADER_HEIGHT = 38; // tighter header so divider appears higher

export const drawPdfHeader = (doc: jsPDF, headerData: PdfHeaderData = {}) => {
  const { organizationName = "Organization Name" } = headerData;
  const pageWidth = doc.internal.pageSize.getWidth();

  // White background header
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

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
