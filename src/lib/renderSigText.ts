/** Render Persian/English text to PNG with correct shaping (browser fonts). */

export interface RenderedTextPng {
  dataUrl: string
  width: number
  height: number
}

export const PEYDA_STACK = "'Peyda', Tahoma, Arial, sans-serif"
export const HELVETICA_STACK = 'Helvetica, Arial, sans-serif'

export interface TextSegment {
  text: string
  fontSize: number
  fontWeight?: number
  fontFamily?: string
  dir?: 'rtl' | 'ltr'
}

export async function renderTextPng(opts: {
  text: string
  fontSize: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  dir?: 'rtl' | 'ltr'
}): Promise<RenderedTextPng> {
  const dir = opts.dir ?? 'rtl'
  return renderSegmentsPng({
    dir,
    color: opts.color,
    segments: [
      {
        text: opts.text,
        fontSize: opts.fontSize,
        fontWeight: opts.fontWeight ?? 700,
        fontFamily: opts.fontFamily,
        dir,
      },
    ],
  })
}

/**
 * Draw several runs on one baseline. In an RTL line the first segment sits
 * on the right, so "label, value" renders like the Persian template.
 */
export async function renderSegmentsPng(opts: {
  segments: TextSegment[]
  dir?: 'rtl' | 'ltr'
  gap?: number
  color?: string
}): Promise<RenderedTextPng> {
  const dir = opts.dir ?? 'rtl'
  const gap = opts.gap ?? 3
  const color = opts.color ?? '#231F20'
  const segments = opts.segments
    .map((s) => ({ ...s, text: s.text.trim() }))
    .filter((s) => s.text)
  if (!segments.length) {
    return { dataUrl: '', width: 0, height: 0 }
  }

  const fontOf = (s: TextSegment) =>
    `${s.fontWeight ?? 400} ${s.fontSize}px ${s.fontFamily ?? PEYDA_STACK}`

  await Promise.all(segments.map((s) => document.fonts.load(fontOf(s), s.text)))

  const measure = document.createElement('canvas')
  const mctx = measure.getContext('2d')
  if (!mctx) throw new Error('canvas unsupported')

  const measured = segments.map((s) => {
    mctx.font = fontOf(s)
    mctx.direction = s.dir ?? dir
    const m = mctx.measureText(s.text)
    return {
      seg: s,
      width: Math.ceil(
        Math.max(m.width, m.actualBoundingBoxLeft + m.actualBoundingBoxRight),
      ),
      ascent: Math.ceil(m.actualBoundingBoxAscent || s.fontSize * 0.8),
      descent: Math.ceil(m.actualBoundingBoxDescent || s.fontSize * 0.25),
    }
  })

  const padX = 2
  const padY = 2
  const ascent = Math.max(...measured.map((m) => m.ascent))
  const descent = Math.max(...measured.map((m) => m.descent))
  const textW =
    measured.reduce((sum, m) => sum + m.width, 0) + gap * (measured.length - 1)
  const cssW = Math.max(1, textW + padX * 2)
  const cssH = Math.max(1, ascent + descent + padY * 2)
  const dpr = 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(cssW * dpr)
  canvas.height = Math.ceil(cssH * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unsupported')

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, cssW, cssH)
  ctx.fillStyle = color
  ctx.textBaseline = 'alphabetic'

  const baseline = padY + ascent
  let x = dir === 'rtl' ? cssW - padX : padX
  for (const m of measured) {
    ctx.font = fontOf(m.seg)
    ctx.direction = m.seg.dir ?? dir
    if (dir === 'rtl') {
      ctx.textAlign = 'right'
      ctx.direction = 'rtl'
      // Keep LTR runs (numbers, email) in logical order inside the RTL line
      if ((m.seg.dir ?? dir) === 'ltr') {
        ctx.direction = 'ltr'
        ctx.textAlign = 'left'
        ctx.fillText(m.seg.text, x - m.width, baseline)
      } else {
        ctx.fillText(m.seg.text, x, baseline)
      }
      x -= m.width + gap
    } else {
      ctx.textAlign = 'left'
      ctx.fillText(m.seg.text, x, baseline)
      x += m.width + gap
    }
  }

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
