import { AnalysisResults } from '@shared/schema';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportAnalysisToPDF(
  analysisResults: AnalysisResults, 
  startupIdea: string,
  username: string
) {
  // Create a PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set document properties
  doc.setProperties({
    title: 'GENIQL Startup Analysis',
    subject: startupIdea.substring(0, 50) + (startupIdea.length > 50 ? '...' : ''),
    author: 'GENIQL AI',
    creator: 'GENIQL',
  });
  
  // Helper function to add text with proper wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * lineHeight);
  };
  
  // Color definitions
  doc.setDrawColor(90, 65, 230); // Purple border
  doc.setFillColor(32, 27, 64); // Dark purple background
  
  // Add header
  doc.setFillColor(90, 65, 230);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('GENIQL Startup Analysis', 15, 15);
  
  // Add startup idea
  doc.setFillColor(42, 37, 74);
  doc.rect(0, 25, 210, 22, 'F');
  doc.setFontSize(11);
  doc.text('STARTUP IDEA', 15, 32);
  doc.setFontSize(13);
  let yPos = addWrappedText(startupIdea, 15, 38, 180, 6);
  
  // Add analysis date and user
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, yPos + 5);
  doc.text(`Generated for: ${username}`, 15, yPos + 10);
  
  // Success Rate
  if (analysisResults.successRate) {
    yPos = yPos + 20;
    doc.setFillColor(42, 37, 74);
    doc.rect(0, yPos, 210, 40, 'F');
    doc.setFontSize(14);
    doc.text('Success Rate', 15, yPos + 8);
    
    // Draw success rate circle
    const percentage = analysisResults.successRate?.percentage || 0;
    const color = percentage > 70 ? '#4CAF50' : percentage > 50 ? '#FF9800' : '#F44336';
    
    doc.setDrawColor(200, 200, 200);
    doc.circle(40, yPos + 22, 12, 'D');
    doc.setDrawColor(color);
    doc.setLineWidth(2);
    
    // Draw circle with color instead of arc since setLineDash and arc are not reliably supported
    doc.circle(40, yPos + 22, 12 * (percentage / 100), 'D');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`${percentage}%`, 35, yPos + 24);
    
    doc.setFontSize(11);
    yPos = addWrappedText(analysisResults.successRate.message, 65, yPos + 20, 130, 5);
  }
  
  // Competitors
  if (analysisResults.competitors) {
    yPos = yPos + 15;
    doc.setFillColor(42, 37, 74);
    doc.rect(0, yPos, 210, 50, 'F');
    doc.setFontSize(14);
    doc.text('Market Competitors', 15, yPos + 8);
    
    let competitorY = yPos + 18;
    analysisResults.competitors.competitors.slice(0, 4).forEach(competitor => {
      doc.setFontSize(11);
      doc.text(competitor.name, 15, competitorY);
      doc.text(`${competitor.marketShare}%`, 100, competitorY);
      
      // Draw bar
      doc.setFillColor(90, 65, 230);
      doc.rect(120, competitorY - 3, competitor.marketShare, 3, 'F');
      
      competitorY += 7;
    });
    
    if (analysisResults.competitors.message) {
      doc.setFontSize(10);
      yPos = addWrappedText(analysisResults.competitors.message, 15, competitorY + 5, 180, 5);
    }
  }
  
  // Market Viability
  if (analysisResults.marketViability) {
    yPos = Math.min(yPos + 15, 220); // Check for page overflow
    
    // Add new page if near bottom
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFillColor(42, 37, 74);
    doc.rect(0, yPos, 210, 45, 'F');
    doc.setFontSize(14);
    doc.text('Market Viability', 15, yPos + 8);
    
    let pointY = yPos + 18;
    analysisResults.marketViability.points.slice(0, 3).forEach(point => {
      const color = point.type === 'success' ? '#4CAF50' : 
                  point.type === 'warning' ? '#FF9800' : '#F44336';
      
      doc.setFillColor(color);
      doc.circle(15, pointY, 2, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(point.title, 20, pointY);
      
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(point.subtitle, 20, pointY + 5);
      
      pointY += 12;
    });
  }
  
  // Footer
  doc.setFillColor(42, 37, 74);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('GENIQL - Generative Execution Network for Intelligent Query Learning', 15, 287);
  doc.text('Powered by AI | geniql.com', 15, 292);
  
  // Save the PDF
  return doc.save('GENIQL-Startup-Analysis.pdf');
}

export async function captureAndExportElement(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found`);
  }
  
  try {
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    });
    
    // Create a PDF from the canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Calculate dimensions to fit in PDF
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add image to first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add new pages if the image is taller than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

export function downloadCSV(analysisResults: AnalysisResults, startupIdea: string) {
  // Create CSV content
  let csvContent = 'Category,Metric,Value\n';
  
  // Add startup idea
  csvContent += `General,Startup Idea,"${startupIdea.replace(/"/g, '""')}"\n`;
  csvContent += `General,Date,"${new Date().toISOString()}"\n`;
  
  // Add success rate
  if (analysisResults.successRate) {
    csvContent += `Success Rate,Percentage,${analysisResults.successRate.percentage}\n`;
    csvContent += `Success Rate,Message,"${analysisResults.successRate.message?.replace(/"/g, '""')}"\n`;
  }
  
  // Add competitors
  if (analysisResults.competitors?.competitors) {
    analysisResults.competitors.competitors.forEach((competitor, index) => {
      csvContent += `Competitor,Name ${index + 1},"${competitor.name}"\n`;
      csvContent += `Competitor,Market Share ${index + 1},${competitor.marketShare}\n`;
    });
    
    if (analysisResults.competitors.message) {
      csvContent += `Competitor,Overview,"${analysisResults.competitors.message.replace(/"/g, '""')}"\n`;
    }
  }
  
  // Add market viability
  if (analysisResults.marketViability?.points) {
    analysisResults.marketViability.points.forEach((point, index) => {
      csvContent += `Market Viability,Point ${index + 1},"${point.title}"\n`;
      csvContent += `Market Viability,Description ${index + 1},"${point.subtitle}"\n`;
      csvContent += `Market Viability,Type ${index + 1},${point.type}\n`;
    });
  }
  
  // Add CAGR
  if (analysisResults.cagr) {
    csvContent += `Growth,Industry Average,${analysisResults.cagr.industryAverage}\n`;
    csvContent += `Growth,Potential,${analysisResults.cagr.potential}\n`;
    
    // Add yearly data
    if (analysisResults.cagr.data?.years) {
      const { years, industryAverageData, potentialData } = analysisResults.cagr.data;
      years.forEach((year, index) => {
        csvContent += `Growth,Year,${year}\n`;
        if (industryAverageData && industryAverageData[index] !== undefined) {
          csvContent += `Growth,Industry Value,${industryAverageData[index]}\n`;
        }
        if (potentialData && potentialData[index] !== undefined) {
          csvContent += `Growth,Potential Value,${potentialData[index]}\n`;
        }
      });
    }
  }
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'GENIQL-Analysis.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add dependencies to package.json
// npm install html2canvas jspdf