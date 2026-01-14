// PDF Report Generator for HealthWise.AI
// Generates professional health reports as downloadable PDFs

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable: { finalY: number };
    }
}

export interface ReportData {
    userName?: string;
    date: string;
    severity: 'green' | 'yellow' | 'red';
    keyFindings: Array<{
        item: string;
        status: 'high' | 'low' | 'normal';
        normalRange?: string;
    }>;
    dos: string[];
    donts: string[];
    exercises: string[];
    diet: {
        include: string[];
        avoid: string[];
    };
}

const SEVERITY_COLORS: Record<string, [number, number, number]> = {
    green: [34, 197, 94],
    yellow: [234, 179, 8],
    red: [239, 68, 68]
};

const STATUS_LABELS: Record<string, string> = {
    high: '↑ High',
    low: '↓ Low',
    normal: '✓ Normal'
};

/**
 * Generate a health report PDF
 */
export const generateHealthReport = (data: ReportData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // === HEADER ===
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo text
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthWise.AI', 20, 25);

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Health Analysis Report', 20, 33);

    // Date on right
    doc.setFontSize(10);
    doc.text(data.date, pageWidth - 20, 25, { align: 'right' });

    yPos = 55;

    // === SEVERITY BADGE ===
    const severityColor = SEVERITY_COLORS[data.severity];
    const severityLabel = data.severity.toUpperCase() + ' ALERT';

    doc.setFillColor(...severityColor);
    doc.roundedRect(20, yPos, 60, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(severityLabel, 50, yPos + 8, { align: 'center' });

    yPos += 25;

    // === KEY FINDINGS TABLE ===
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Findings', 20, yPos);
    yPos += 8;

    const findingsData = data.keyFindings.map(f => [
        f.item,
        STATUS_LABELS[f.status] || f.status,
        f.normalRange || 'N/A'
    ]);

    doc.autoTable({
        startY: yPos,
        head: [['Parameter', 'Status', 'Normal Range']],
        body: findingsData,
        theme: 'striped',
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 4
        },
        columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 40 },
            2: { cellWidth: 60 }
        },
        margin: { left: 20, right: 20 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // === RECOMMENDATIONS SECTION ===
    const leftColX = 20;
    const rightColX = pageWidth / 2 + 5;
    const colWidth = (pageWidth - 50) / 2;

    // Do's
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(leftColX, yPos, colWidth, 10, 2, 2, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("✓ Do's", leftColX + 5, yPos + 7);

    // Don'ts
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(rightColX, yPos, colWidth, 10, 2, 2, 'F');
    doc.setTextColor(153, 27, 27);
    doc.text("✗ Don'ts", rightColX + 5, yPos + 7);

    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Do's list
    doc.setTextColor(30, 41, 59);
    data.dos.forEach((item, i) => {
        if (yPos + (i * 6) < 270) {
            doc.text(`• ${item}`, leftColX + 5, yPos + (i * 6));
        }
    });

    // Don'ts list
    data.donts.forEach((item, i) => {
        if (yPos + (i * 6) < 270) {
            doc.text(`• ${item}`, rightColX + 5, yPos + (i * 6));
        }
    });

    yPos += Math.max(data.dos.length, data.donts.length) * 6 + 15;

    // === EXERCISES ===
    if (data.exercises.length > 0 && yPos < 250) {
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(leftColX, yPos, colWidth, 10, 2, 2, 'F');
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('🏃 Exercises', leftColX + 5, yPos + 7);

        yPos += 15;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);

        data.exercises.forEach((item, i) => {
            if (yPos + (i * 6) < 270) {
                doc.text(`• ${item}`, leftColX + 5, yPos + (i * 6));
            }
        });
    }

    // === DIET ===
    if (yPos < 250) {
        doc.setFillColor(219, 234, 254);
        doc.roundedRect(rightColX, yPos - (data.exercises.length > 0 ? 15 : 0), colWidth, 10, 2, 2, 'F');
        doc.setTextColor(30, 64, 175);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('🥗 Diet', rightColX + 5, yPos - (data.exercises.length > 0 ? 15 : 0) + 7);

        const dietY = yPos;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);

        doc.text('Include:', rightColX + 5, dietY);
        data.diet.include.slice(0, 3).forEach((item, i) => {
            doc.text(`  • ${item}`, rightColX + 5, dietY + 5 + (i * 5));
        });

        const avoidY = dietY + 5 + (Math.min(data.diet.include.length, 3) * 5) + 5;
        doc.text('Avoid:', rightColX + 5, avoidY);
        data.diet.avoid.slice(0, 3).forEach((item, i) => {
            doc.text(`  • ${item}`, rightColX + 5, avoidY + 5 + (i * 5));
        });
    }

    // === FOOTER ===
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 280, pageWidth, 20, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
        'This report is AI-generated for informational purposes only. Consult a healthcare professional for medical advice.',
        pageWidth / 2,
        288,
        { align: 'center' }
    );
    doc.text(
        'Generated by HealthWise.AI',
        pageWidth / 2,
        294,
        { align: 'center' }
    );

    return doc;
};

/**
 * Download the health report as PDF
 */
export const downloadHealthReport = (data: ReportData): void => {
    const doc = generateHealthReport(data);
    const fileName = `HealthWise_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

/**
 * Get PDF as blob for preview/sharing
 */
export const getReportBlob = (data: ReportData): Blob => {
    const doc = generateHealthReport(data);
    return doc.output('blob');
};
