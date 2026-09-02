const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

// Forces the capture to render at the desktop (xl) breakpoint's multi-column
// layout regardless of the visitor's actual viewport, so the PDF always
// looks like the polished desktop page rather than a squished mobile one.
const CAPTURE_WINDOW_WIDTH = 1440;
const CAPTURE_WINDOW_HEIGHT = 900;
const CAPTURE_SCALE = 2;

/**
 * Renders `element` (the live /work-with-alex DOM) to a canvas via
 * html2canvas-pro (needed for Tailwind v4's oklch() colors, which the
 * classic html2canvas can't parse) and slices it into A4-height pages of
 * a jsPDF document, so the downloaded CV visually matches the page itself.
 */
export async function buildCvPdfBlob(element: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: '#f8fafc',
    scale: CAPTURE_SCALE,
    windowWidth: CAPTURE_WINDOW_WIDTH,
    windowHeight: CAPTURE_WINDOW_HEIGHT,
    useCORS: true,
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageHeightPx = Math.floor((canvas.width * A4_HEIGHT_PT) / A4_WIDTH_PT);

  const pageCanvas = document.createElement('canvas');
  pageCanvas.width = canvas.width;
  const pageCtx = pageCanvas.getContext('2d')!;

  let renderedPx = 0;
  let isFirstPage = true;
  while (renderedPx < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedPx);
    pageCanvas.height = sliceHeight;
    pageCtx.clearRect(0, 0, pageCanvas.width, sliceHeight);
    pageCtx.drawImage(
      canvas,
      0,
      renderedPx,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.92);
    if (!isFirstPage) pdf.addPage();
    const pageHeightPt = (sliceHeight * A4_WIDTH_PT) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_PT, pageHeightPt);

    renderedPx += sliceHeight;
    isFirstPage = false;
  }

  return pdf.output('blob');
}
