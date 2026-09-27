/** Ensure Peyda weights used by the FA signature are ready before paint. */
export async function loadPeydaFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return

  try {
    await Promise.all([
      document.fonts.load("400 12px 'Peyda'"),
      document.fonts.load("500 12px 'Peyda'"),
      document.fonts.load("700 24px 'Peyda'"),
    ])
    await document.fonts.ready
  } catch {
    // Preview still works with Tahoma fallback
  }
}
