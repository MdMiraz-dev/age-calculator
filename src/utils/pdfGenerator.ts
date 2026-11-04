import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportElementToPdf(
  elementId: string,
  fileName: string = 'Age_Certificate_Report.pdf'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    // Render the DOM element with high scale for crystal-sharp print quality
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for crispness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      onclone: (clonedDoc, clonedElement) => {
        // Fix cloned container position so html2canvas renders it in view
        const container = clonedDoc.getElementById('printable-container');
        if (container) {
          container.style.position = 'static';
          container.style.transform = 'none';
          container.style.zIndex = '9999';
          container.style.opacity = '1';
          container.style.display = 'block';
        }

        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
        }

        // Sanitize Tailwind v4 oklch colors in all cloned style tags
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((style) => {
          if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('color-mix'))) {
            style.textContent = style.textContent
              .replace(/oklch\([^)]+\)/g, '#262626')
              .replace(/color-mix\([^)]+\)/g, '#f5f5f5');
          }
        });

        // Ensure all elements inside have safe fallback colors
        const elements = clonedElement.querySelectorAll('*');
        elements.forEach((el: any) => {
          if (el.style) {
            if (el.style.color && el.style.color.includes('oklch')) {
              el.style.color = '#171717';
            }
            if (el.style.backgroundColor && el.style.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }
            if (el.style.borderColor && el.style.borderColor.includes('oklch')) {
              el.style.borderColor = '#e5e5e5';
            }
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

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Handle multiple pages if content extends beyond one A4 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const blob = pdf.output('blob');
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

    // If mobile supports Web Share API with file, try native share/save sheet
    if (isMobile && 'canShare' in navigator) {
      try {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if ((navigator as any).canShare({ files: [file] })) {
          await (navigator as any).share({
            title: 'Age Certificate PDF',
            text: 'বয়স ক্যালকুলেটর সনদ',
            files: [file],
          });
          return true;
        }
      } catch (shareErr) {
        // User cancelled or share failed, fallback to standard download below
        console.warn('Native share dismissed, falling back to blob download:', shareErr);
      }
    }

    // Standard download via blob url
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();

    // Fallback for mobile browsers where a.click() may be suppressed
    if (isMobile) {
      setTimeout(() => {
        window.open(blobUrl, '_blank');
      }, 300);
    }

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 60000);

    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
}
