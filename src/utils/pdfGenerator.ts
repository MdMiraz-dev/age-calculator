import { jsPDF } from 'jspdf';
import { generateCertificateCanvas, CertificateData } from './canvasCertificate';

export async function downloadCertificatePdf(
  data: CertificateData
): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
  try {
    const canvas = await generateCertificateCanvas(data);
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    const cleanName = data.userName?.trim() ? data.userName.trim().replace(/\s+/g, '_') : 'My';
    const fileName = `${cleanName}_Age_Certificate.pdf`;

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // 1. Direct Anchor download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();

    // 2. jsPDF save
    try {
      pdf.save(fileName);
    } catch {
      // fallback handled by anchor
    }

    // 3. Mobile popup fallback
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) {
      setTimeout(() => {
        window.open(blobUrl, '_blank');
      }, 400);
    }

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);

    return { success: true, blobUrl };
  } catch (err: any) {
    console.error('PDF error:', err);
    return { success: false, error: err?.message || 'PDF Generation failed' };
  }
}

export async function downloadCertificateImage(
  data: CertificateData
): Promise<{ success: boolean; blobUrl?: string }> {
  try {
    const canvas = await generateCertificateCanvas(data);
    const dataUrl = canvas.toDataURL('image/png');
    const cleanName = data.userName?.trim() ? data.userName.trim().replace(/\s+/g, '_') : 'My';
    const fileName = `${cleanName}_Age_Certificate.png`;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 2000);

    return { success: true, blobUrl: dataUrl };
  } catch (err) {
    console.error('Image export error:', err);
    return { success: false };
  }
}

export async function printCertificateDirectly(data: CertificateData) {
  const canvas = await generateCertificateCanvas(data);
  const dataUrl = canvas.toDataURL('image/png');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="bn">
      <head>
        <title>বয়স ক্যালকুলেটর সনদ</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 0; }
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #ffffff; }
          img { width: 100vw; height: auto; max-height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" />
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
