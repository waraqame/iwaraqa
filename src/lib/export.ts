import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import html2canvas from 'html2canvas';

interface Section {
  title: string;
  content: string;
}

export async function exportToPDF(sections: Section[], title: string, author: string) {
  try {
    // Create a temporary div to render the content
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '595px'; // A4 width in pixels
    tempDiv.style.padding = '40px';
    tempDiv.style.direction = 'rtl';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Add content
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">${title}</h1>
        <p style="font-size: 16px;">${author}</p>
      </div>
      ${sections.map(section => `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 15px;">${section.title}</h2>
          <p style="font-size: 14px; line-height: 1.6;">${section.content}</p>
        </div>
      `).join('')}
    `;

    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    document.body.removeChild(tempDiv);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    // Add canvas as image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const aspectRatio = canvas.height / canvas.width;
    
    let currentHeight = 0;
    const pageHeight = pdfHeight - 20; // Margin
    const imgWidth = pdfWidth - 20; // Margin
    const imgHeight = imgWidth * aspectRatio;
    
    for (let pos = 0; pos < canvas.height; pos += pageHeight * canvas.width / imgWidth) {
      if (currentHeight > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(
        imgData,
        'JPEG',
        10,
        10,
        imgWidth,
        imgHeight,
        undefined,
        'FAST',
        0,
        -pos * imgWidth / canvas.width
      );
      
      currentHeight += pageHeight;
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('PDF Export error:', error);
    throw error;
  }
}

export async function exportToWord(sections: Section[], title: string, author: string) {
  try {
    const doc = new Document({
      sections: [
        {
          properties: { rtl: true },
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: 'center',
            }),
            new Paragraph({
              text: author,
              alignment: 'center',
            }),
            ...sections.flatMap((section) => [
              new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_1,
              }),
              new Paragraph({
                text: section.content,
              }),
            ]),
          ],
        },
      ],
    });

    return await Packer.toBlob(doc);
  } catch (error) {
    console.error('Word Export error:', error);
    throw error;
  }
}