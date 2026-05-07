import jsPDF from "jspdf";

export interface PDFExportOptions {
  filename: string;
  title: string;
  content: string;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string;
  };
}

export function exportToPDF(options: PDFExportOptions) {
  const { filename, title, content, metadata } = options;

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set metadata
    if (metadata) {
      pdf.setProperties({
        title: metadata.subject || title,
        subject: metadata.subject || "",
        author: metadata.author || "AI Content Engine",
        keywords: metadata.keywords || "",
        creator: "AI Content Engine",
      });
    }

    // Set font
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");

    // Add title
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    let yPosition = 20;
    const titleLines = pdf.splitTextToSize(title, maxWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 8 + 10;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);

    const timestamp = new Date().toLocaleString();
    pdf.text(`Generated: ${timestamp}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Source: AI Content Engine`, margin, yPosition);
    yPosition += 15;

    // Reset text color
    pdf.setTextColor(0, 0, 0);

    // Add content
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const contentLines = pdf.splitTextToSize(content, maxWidth);
    const lineHeight = 6;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 15;

    contentLines.forEach((line: string) => {
      if (yPosition + lineHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    // Add footer
    const pageCount = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Download PDF
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    return false;
  }
}

export function downloadAsText(filename: string, content: string) {
  try {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    return true;
  } catch (error) {
    console.error("Error downloading text:", error);
    return false;
  }
}
