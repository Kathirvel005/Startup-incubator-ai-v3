import { jsPDF } from 'jspdf';

export   const downloadPDFReport = (report) => {
    if (!report) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 0;

    const addHeader = () => {
      // Header Background
      doc.setFillColor(15, 23, 42); // Dark slate
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("LAUNCHMIND AI", margin, 22);

      // Subtitle & Date
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Comprehensive Startup Feasibility Report", margin, 29);
      
      doc.text(`Generated: ${new Date(report.timestamp).toLocaleDateString()}`, pageWidth - margin - 40, 29);
      y = 55;
    };

    addHeader();

    // Utility for adding new pages
    const checkPageBreak = (spaceNeeded) => {
      if (y + spaceNeeded > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // --- Concept Overview ---
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    
    // Title wrapping
    const titleLines = doc.splitTextToSize(report.title, pageWidth - margin * 2);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 7) + 5;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const descLines = doc.splitTextToSize(`"${report.explanation}"`, pageWidth - margin * 2);
    doc.text(descLines, margin, y);
    y += (descLines.length * 5) + 12;

    // --- Key Metrics Section ---
    checkPageBreak(50);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 35, 3, 3, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Executive Scoring", margin + 5, y + 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Metric 1: Success
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Success Probability: ${report.successRate}%`, margin + 5, y + 16);
    doc.setFillColor(220, 253, 230); doc.rect(margin + 5, y + 19, 50, 4, 'F');
    doc.setFillColor(34, 197, 94); doc.rect(margin + 5, y + 19, 50 * (report.successRate/100), 4, 'F');

    // Metric 2: Risk
    doc.setTextColor(249, 115, 22); // Orange
    doc.text(`Risk Coefficient: ${report.riskRate}%`, margin + 65, y + 16);
    doc.setFillColor(255, 237, 213); doc.rect(margin + 65, y + 19, 50, 4, 'F');
    doc.setFillColor(249, 115, 22); doc.rect(margin + 65, y + 19, 50 * (report.riskRate/100), 4, 'F');

    // Metric 3: Innovation
    doc.setTextColor(59, 130, 246); // Blue
    doc.text(`Innovation Score: ${report.innovationScore}%`, margin + 125, y + 16);
    doc.setFillColor(219, 234, 254); doc.rect(margin + 125, y + 19, 45, 4, 'F');
    doc.setFillColor(59, 130, 246); doc.rect(margin + 125, y + 19, 45 * (report.innovationScore/100), 4, 'F');

    y += 45;

    // --- Market & Financials ---
    checkPageBreak(50);
    
    // Market Size
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Market Potential", margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    if (report.marketSize) {
      doc.text(`Total Addressable Market (TAM): ${report.marketSize.tam}`, margin, y); y += 6;
      doc.text(`Serviceable Available Market (SAM): ${report.marketSize.sam}`, margin, y); y += 6;
      doc.text(`Serviceable Obtainable Market (SOM): ${report.marketSize.som}`, margin, y); y += 12;
    } else {
      doc.text("Market sizing details unavailable.", margin, y); y += 12;
    }

    // Capital Budget
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Financial Assessment", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    doc.text(`Self-Funded Investment: $${report.amount.toLocaleString()}`, margin, y); y += 6;
    doc.text(`Required Market Budget: $${report.requiredAmount.toLocaleString()}`, margin, y); y += 8;

    if (report.isBudgetSufficient) {
      doc.setTextColor(34, 197, 94);
      doc.setFont("helvetica", "bold");
      doc.text("Status: Budget is sufficient to construct the target MVP.", margin, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.setFont("helvetica", "bold");
      doc.text(`Status: Insufficient budget. Deficit: $${report.remainingAmount.toLocaleString()}`, margin, y);
    }
    y += 12;

    // --- Recommendations ---
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Strategic Recommendations", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);

    report.recommendations.forEach((rec, idx) => {
      const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - margin * 2);
      checkPageBreak(recLines.length * 5 + 5);
      doc.text(recLines, margin, y);
      y += (recLines.length * 5) + 3;
    });

    y += 8;
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(139, 92, 246); // Violet
    doc.text(`Projected Success Post-Optimization: ${report.projectedSuccessRate}%`, margin, y);
    y += 15;

    // --- Action Plan ---
    doc.addPage();
    y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Implementation Roadmap", margin, y);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 15;

    report.steps.forEach((step) => {
      checkPageBreak(30);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`${step.phase} (${step.duration})`, margin, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      step.tasks.forEach((task) => {
        const taskLines = doc.splitTextToSize(`• ${task}`, pageWidth - margin * 2 - 5);
        checkPageBreak(taskLines.length * 5 + 5);
        doc.text(taskLines, margin + 5, y);
        y += (taskLines.length * 5) + 2;
      });
      y += 8;
    });

    // Save report
    doc.save(`LaunchMind-AI-${report.title.replace(/\s+/g, '-')}.pdf`);
  };
