import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/**
 * Renders a report and opens it in a new tab, where the browser's own viewer
 * handles printing. Shared by every report so they all behave the same.
 */
export const openReport = async (
  document: ReactElement<DocumentProps>,
  fileName: string,
) => {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);

  const tab = window.open(url, '_blank');
  if (!tab) {
    // Pop-up blocked: fall back to downloading it
    const link = window.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }

  // Give the tab time to load before dropping the blob from memory
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/** Filenames without spaces or accents, so they survive any filesystem */
export const reportFileName = (parts: (string | number | undefined)[]) =>
  parts
    .filter(Boolean)
    .join('-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .toLowerCase() + '.pdf';
