import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportElementToPdf(
  elementId: string,
  fileName: string = 'Age_Certificate_Report.pdf'
): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, error: 'Element not found' };
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        const container = clonedDoc.getElementById('printable-container');
        if (container) {
          container.style.position = 'static';
          container.style.zIndex = '9999';
          container.style.opacity = '1';
          container.style.display = 'block';
        }

        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.opacity = '1';
        }

        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((style) => {
          if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('color-mix'))) {
            style.textContent = style.textContent
              .replace(/oklch\([^)]+\)/g, '#262626')
              .replace(/color-mix\([^)]+\)/g, '#f5f5f5');
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);

    return { success: true, blobUrl };
  } catch (err: any) {
    console.error('Error generating PDF:', err);
    return { success: false, error: err?.message || 'Generation failed' };
  }
}

export async function exportElementToImage(
  elementId: string,
  fileName: string = 'Age_Certificate.png'
): Promise<{ success: boolean; blobUrl?: string }> {
  const element = document.getElementById(elementId);
  if (!element) return { success: false };

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedElement) => {
        const container = clonedDoc.getElementById('printable-container');
        if (container) {
          container.style.position = 'static';
          container.style.zIndex = '9999';
          container.style.opacity = '1';
          container.style.display = 'block';
        }
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.opacity = '1';
        }
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((style) => {
          if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('color-mix'))) {
            style.textContent = style.textContent
              .replace(/oklch\([^)]+\)/g, '#262626')
              .replace(/color-mix\([^)]+\)/g, '#f5f5f5');
          }
        });
      },
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);

    return { success: true, blobUrl: dataUrl };
  } catch (err) {
    console.error('Image export error:', err);
    return { success: false };
  }
}

export function printElementViaIframe(elementId: string) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="bn">
      <head>
        <title>বয়স ক্যালকুলেটর সনদ</title>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Hind Siliguri', -apple-system, sans-serif;
            background: #ffffff;
            color: #171717;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${el.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 4000);
  }, 400);
}
