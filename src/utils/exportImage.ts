// Export utilities for PNG and JPG generation

import { RESOLUTION_DIMENSIONS, type ResolutionOption } from "@/types/map";

export interface ExportOptions {
  format: "png" | "jpg";
  resolution: ResolutionOption;
  background: { type: "transparent" | "solid"; color?: string };
  title?: string;
  subtitle?: string;
  titlePosition?: "top-left" | "top-center" | "hidden";
  fontFamily?: "sans" | "condensed" | "serif";
  fontSize?: "sm" | "md" | "lg";
  filename?: string;
}

const FONT_FAMILIES: Record<string, string> = {
  sans: "'Source Sans Pro', 'Segoe UI', system-ui, sans-serif",
  condensed: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  serif: "'Crimson Text', Georgia, serif",
};

const FONT_SIZES: Record<string, { title: number; subtitle: number }> = {
  sm: { title: 32, subtitle: 20 },
  md: { title: 48, subtitle: 28 },
  lg: { title: 64, subtitle: 36 },
};

/**
 * Export SVG element as PNG or JPG
 * This properly scales the SVG content to fill the export canvas
 */
export async function exportMapAsImage(
  svgElement: SVGSVGElement,
  options: ExportOptions
): Promise<void> {
  const { width: exportWidth, height: exportHeight } = RESOLUTION_DIMENSIONS[options.resolution];
  
  // Get the current SVG dimensions from attributes or computed style
  const svgWidth = svgElement.width.baseVal.value || svgElement.clientWidth || 960;
  const svgHeight = svgElement.height.baseVal.value || svgElement.clientHeight || 540;
  
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Get the current transform from the g element (zoom state)
  const gElement = svgClone.querySelector('g');
  const currentTransform = gElement?.getAttribute('transform') || '';

  // Parse existing transform to check if we're at zoom reset
  let existingScale = 1;
  let existingTranslateX = 0;
  let existingTranslateY = 0;

  const translateMatch = currentTransform.match(/translate\(([^,]+),?\s*([^)]*)\)/);
  const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);

  if (translateMatch) {
    existingTranslateX = parseFloat(translateMatch[1]) || 0;
    existingTranslateY = parseFloat(translateMatch[2]) || 0;
  }
  if (scaleMatch) {
    existingScale = parseFloat(scaleMatch[1]) || 1;
  }

  // Detect if we're at zoom reset (no zoom applied)
  const isZoomReset = Math.abs(existingScale - 1) < 0.01 && Math.abs(existingTranslateX) < 5 && Math.abs(existingTranslateY) < 5;

  // Calculate padding and title space
  // Use minimal padding for zoom reset to maximize map size
  const padding = isZoomReset
    ? Math.min(exportWidth, exportHeight) * 0.01  // 1% padding for full map
    : Math.min(exportWidth, exportHeight) * 0.02; // 2% padding for zoomed views
  const titleSpace = options.title && options.titlePosition !== "hidden" ? exportHeight * 0.1 : 0;

  // Available space for the map
  const availableWidth = exportWidth - (padding * 2);
  const availableHeight = exportHeight - (padding * 2) - titleSpace;

  // Calculate scale to maximize canvas usage
  // For zoom reset, use max scale; for zoomed views, preserve aspect ratio
  let scale: number;
  if (isZoomReset) {
    // Max scale to fill available space edge-to-edge
    const scaleX = availableWidth / svgWidth;
    const scaleY = availableHeight / svgHeight;
    scale = Math.max(scaleX, scaleY) * 0.98; // 98% to avoid any clipping
  } else {
    // Preserve aspect ratio for zoomed/panned views
    const scaleX = availableWidth / svgWidth;
    const scaleY = availableHeight / svgHeight;
    scale = Math.min(scaleX, scaleY);
  }
  
  // Calculate position to center the map
  const scaledWidth = svgWidth * scale;
  const scaledHeight = svgHeight * scale;
  const offsetX = padding + (availableWidth - scaledWidth) / 2;
  const offsetY = padding + titleSpace + (availableHeight - scaledHeight) / 2;
  
  // Update SVG attributes for export
  svgClone.setAttribute("width", String(exportWidth));
  svgClone.setAttribute("height", String(exportHeight));
  svgClone.setAttribute("viewBox", `0 0 ${exportWidth} ${exportHeight}`);
  
  // Apply new transform that combines zoom state with export scaling
  if (gElement) {
    // Combine transforms: position + existing zoom scaled
    const combinedTransform = `translate(${offsetX + existingTranslateX * scale}, ${offsetY + existingTranslateY * scale}) scale(${scale * existingScale})`;
    gElement.setAttribute('transform', combinedTransform);
  }
  
  // Update SVG background
  svgClone.style.backgroundColor = options.background.type === "solid" 
    ? (options.background.color ?? "#FEFDFB") 
    : "transparent";
  
  // Inline all styles to ensure they're captured in export
  inlineStyles(svgClone);
  
  // Serialize SVG to string
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgClone);
  
  // Ensure proper XML encoding
  if (!svgString.match(/^<\?xml/)) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>' + svgString;
  }
  
  // Add namespace if missing
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // Create blob URL
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  // Create image element
  const img = new Image();
  img.width = exportWidth;
  img.height = exportHeight;
  
  // Wait for image to load
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(new Error(`Failed to load SVG: ${e}`));
    img.src = svgUrl;
  });
  
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  
  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  
  // Fill background
  if (options.background.type === "solid") {
    ctx.fillStyle = options.background.color ?? "#FEFDFB";
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  } else if (options.format === "jpg") {
    // JPG doesn't support transparency, use white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, exportWidth, exportHeight);
  }
  
  // Draw SVG
  ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
  
  // Draw title and subtitle
  if (options.title && options.titlePosition !== "hidden") {
    const fontFamily = FONT_FAMILIES[options.fontFamily ?? "sans"];
    const sizes = FONT_SIZES[options.fontSize ?? "md"];
    
    // Scale font sizes based on resolution
    const scaleFactor = exportWidth / 1920;
    const titleSize = Math.round(sizes.title * scaleFactor);
    const subtitleSize = Math.round(sizes.subtitle * scaleFactor);
    const textPadding = Math.round(40 * scaleFactor);
    
    ctx.textBaseline = "top";
    
    const isCenter = options.titlePosition === "top-center";
    const x = isCenter ? exportWidth / 2 : textPadding;
    ctx.textAlign = isCenter ? "center" : "left";
    
    // Draw title with slight shadow for better visibility
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.font = `600 ${titleSize}px ${fontFamily}`;
    ctx.fillText(options.title, x + 1, textPadding + 1);
    
    ctx.fillStyle = "#1A1A19";
    ctx.fillText(options.title, x, textPadding);
    
    // Draw subtitle if provided
    if (options.subtitle) {
      ctx.fillStyle = "#6B6B63";
      ctx.font = `400 ${subtitleSize}px ${fontFamily}`;
      ctx.fillText(options.subtitle, x, textPadding + titleSize + 8 * scaleFactor);
    }
  }
  
  // Convert to blob and download
  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
  const quality = options.format === "jpg" ? 0.92 : undefined;
  
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        throw new Error("Failed to create image blob");
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${options.filename ?? "region-map"}.${options.format}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(svgUrl);
    },
    mimeType,
    quality
  );
}

/**
 * Inline computed styles into SVG elements for proper export
 */
function inlineStyles(element: Element): void {
  const computedStyle = window.getComputedStyle(element);
  
  // List of style properties we care about for SVG
  const styleProps = [
    'fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 
    'stroke-opacity', 'stroke-linecap', 'stroke-linejoin'
  ];
  
  let inlineStyle = '';
  for (const prop of styleProps) {
    const value = computedStyle.getPropertyValue(prop);
    if (value && value !== 'none' && value !== '') {
      inlineStyle += `${prop}:${value};`;
    }
  }
  
  if (inlineStyle && element instanceof SVGElement) {
    const existingStyle = element.getAttribute('style') || '';
    element.setAttribute('style', existingStyle + inlineStyle);
  }
  
  // Recursively process children
  Array.from(element.children).forEach(child => inlineStyles(child));
}

/**
 * Get dimensions for a resolution option
 */
export function getResolutionDimensions(
  resolution: ResolutionOption
): { width: number; height: number } {
  return RESOLUTION_DIMENSIONS[resolution];
}
