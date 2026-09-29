export function openPdfPreview(pdfBlob: Blob, name?: string): void {
  const baseName =
    (name || "document").replace(/[\\/:*?"<>|]+/g, "-").trim() || "document";
  const fileName = baseName.toLowerCase().endsWith(".pdf")
    ? baseName
    : `${baseName}.pdf`;
  const file = new File([pdfBlob], fileName, { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(file);
  // Chrome's PDF viewer download button fetches this URL again.
  // Revoking it makes that request fail with a network error.
  window.open(blobUrl);
}
