const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;

// Forces the capture to render at the desktop (xl) breakpoint's multi-column
// layout regardless of the visitor's actual viewport, so the PDF always
// looks like the polished desktop page rather than a squished mobile one.
const CAPTURE_WINDOW_WIDTH = 1440;
const CAPTURE_WINDOW_HEIGHT = 900;
const CAPTURE_SCALE = 2;

/** Only these become clickable in the PDF; in-app routes have no meaning outside the site. */
const PDF_LINK_PATTERN = /^(https?:|mailto:|tel:)/;

/** A link's box in CSS px, relative to the captured element's top-left corner. */
interface CapturedLink {
  readonly url: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Runs inside html2canvas's cloned document, already laid out at the capture
 * width. Entrance animations would restart there from their first keyframe
 * (e.g. invisible), so they're switched off; then every visible external,
 * mailto: or tel: link is measured so the PDF can make it clickable.
 */
function prepareClone(clonedDoc: Document, clonedElement: HTMLElement): CapturedLink[] {
  const style = clonedDoc.createElement('style');
  style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; }';
  clonedDoc.head.appendChild(style);

  const origin = clonedElement.getBoundingClientRect();
  return Array.from(clonedElement.querySelectorAll('a[href]'))
    .map((anchor) => ({ url: anchor.getAttribute('href') ?? '', rect: anchor.getBoundingClientRect() }))
    .filter(({ url, rect }) => PDF_LINK_PATTERN.test(url) && rect.width > 0 && rect.height > 0)
    .map(({ url, rect }) => ({
      url,
      x: rect.left - origin.left,
      y: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
    }));
}

/**
 * Renders `element` (the live /work-with-alex DOM) to a canvas via
 * html2canvas-pro (needed for Tailwind v4's oklch() colors, which the
 * classic html2canvas can't parse) and slices it into A4-height pages of
 * a jsPDF document, so the downloaded CV visually matches the page itself.
 * Links are laid over the image as clickable areas on whichever page they land.
 */
export async function buildCvPdfBlob(element: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  let links: CapturedLink[] = [];
  const canvas = await html2canvas(element, {
    backgroundColor: '#f8fafc',
    scale: CAPTURE_SCALE,
    windowWidth: CAPTURE_WINDOW_WIDTH,
    windowHeight: CAPTURE_WINDOW_HEIGHT,
    useCORS: true,
    onclone: (clonedDoc, clonedElement) => {
      links = prepareClone(clonedDoc, clonedElement);
    },
  });

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageHeightPx = Math.floor((canvas.width * A4_HEIGHT_PT) / A4_WIDTH_PT);
  const ptPerCanvasPx = A4_WIDTH_PT / canvas.width;

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

    for (const link of links) {
      const top = link.y * CAPTURE_SCALE;
      const bottom = top + link.height * CAPTURE_SCALE;
      if (bottom <= renderedPx || top >= renderedPx + sliceHeight) continue;
      pdf.link(
        link.x * CAPTURE_SCALE * ptPerCanvasPx,
        (top - renderedPx) * ptPerCanvasPx,
        link.width * CAPTURE_SCALE * ptPerCanvasPx,
        link.height * CAPTURE_SCALE * ptPerCanvasPx,
        { url: link.url },
      );
    }

    renderedPx += sliceHeight;
    isFirstPage = false;
  }

  return pdf.output('blob');
}
