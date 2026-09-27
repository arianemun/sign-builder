/** Render Persian/English text to PNG with correct shaping (browser fonts). */

export interface RenderedTextPng {
  dataUrl: string
  width: number
  height: number
}

export async function renderTextPng(opts: {
  text: string
  fontSize: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  dir?: 'rtl' | 'ltr'
}): Promise<RenderedTextPng> {
  const text = opts.text.trim()
  if (!text) {
    return { dataUrl: '', width: 0, height: 0 }
  }

  const fontWeight = opts.fontWeight ?? 700
  const fontFamily = opts.fontFamily ?? "'Peyda', Tahoma, Arial, sans-serif"
  const color = opts.color ?? '#231F20'
  const dir = opts.dir ?? 'rtl'
  const fontSize = opts.fontSize
  const dpr = 2

  await document.fonts.load(`${fontWeight} ${fontSize}px ${fontFamily}`)

  const measure = document.createElement('canvas')
  const mctx = measure.getContext('2d')
  if (!mctx) throw new Error('canvas unsupported')

  mctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  const metrics = mctx.measureText(text)
  const textW = Math.ceil(
    Math.max(metrics.width, metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight),
  )
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || fontSize * 0.8)
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || fontSize * 0.25)
  const padX = 2
  const padY = 2
  const cssW = Math.max(1, textW + padX * 2)
  const cssH = Math.max(1, ascent + descent + padY * 2)

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(cssW * dpr)
  canvas.height = Math.ceil(cssH * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unsupported')

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, cssW, cssH)
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textBaseline = 'alphabetic'
  ctx.direction = dir

  const x = dir === 'rtl' ? cssW - padX : padX
  ctx.textAlign = dir === 'rtl' ? 'right' : 'left'
  ctx.fillText(text, x, padY + ascent)

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: cssW,
    height: cssH,
  }
}

export async function uploadSigPng(
  dataUrl: string,
  uploadBase: string,
): Promise<string> {
  const base = uploadBase.replace(/\/$/, '')
  const res = await fetch(`${base}/upload-sig-text.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ png: dataUrl }),
  })
  if (!res.ok) {
    throw new Error(`upload failed: ${res.status}`)
  }
  const json = (await res.json()) as { url?: string; error?: string }
  if (!json.url) throw new Error(json.error || 'no url')
  return json.url
}
