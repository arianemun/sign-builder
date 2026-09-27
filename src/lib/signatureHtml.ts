import type { SignatureFormData, SignatureLang } from '../types'
import { fullEmail } from '../types'
import {
  SIGNATURE_BASE_EN_DATA_URL,
  SIGNATURE_BASE_FA_DATA_URL,
} from './logoData'

/** Official SEPEX SVG canvas */
export const SIGNATURE_WIDTH = 411
export const SIGNATURE_HEIGHT = 172

const INK = '#231F20'
const SITE_URL = 'https://sepex.net'

/** Clickable logo hotspots from EN.svg / FA.svg path boxes */
const LOGO_HIT = {
  en: {
    mark: { x: 23.38, y: 62.79, w: 101.71, h: 40.6 },
    wordmark: { x: 153.77, y: 126.46, w: 97.62, h: 22.77 },
  },
  fa: {
    mark: { x: 285.84, y: 62.79, w: 101.71, h: 40.6 },
    wordmark: { x: 159.61, y: 126.46, w: 97.62, h: 22.77 },
  },
} as const

/**
 * EN stays SVG <text> (Latin renders fine).
 * FA uses HTML overlay — mobile WebKit breaks Persian shaping in SVG <text>.
 */
const EN = {
  name: { x: 155.65, y: 38.8, fontSize: 24.55, letterSpacing: 0 },
  title: { x: 154.24, y: 58.11, fontSize: 9.9, letterSpacing: 0.017 },
  phoneLabel: { x: 154.62, y: 78.01, fontSize: 9.55, letterSpacing: -0.012 },
  phoneValue: { x: 185.42, y: 78.9, fontSize: 9.9, letterSpacing: 0.006 },
  mobile: { x: 185.42, y: 93.34, fontSize: 9.9, letterSpacing: 0.007 },
  emailLabel: { x: 154.62, y: 105.01, fontSize: 9.45, letterSpacing: 0.009 },
  emailValue: { x: 184.33, y: 105.75, fontSize: 10.5, letterSpacing: -0.001 },
  contactUs: { x: 276.01, y: 136.25, fontSize: 7.9, letterSpacing: -0.013 },
  website: { x: 275.92, y: 143.57, fontSize: 7.9, letterSpacing: 0.004 },
} as const

/** FA positions: ink-box tops + right edges from FA.svg (no letter-spacing — breaks Arabic join on mobile) */
const FA_HTML = {
  name: { right: 153.3, top: 22.5, fontSize: 24.85, weight: 700 },
  title: { right: 156.41, top: 50.2, fontSize: 9.7, weight: 500 },
  phoneLabel: { right: 153.88, top: 71.8, fontSize: 9.5, weight: 400 },
  phoneValue: { right: 177.07, top: 71.2, fontSize: 10.6, weight: 400 },
  mobile: { right: 178.04, top: 84.6, fontSize: 11.05, weight: 400 },
  emailLabel: { right: 154.76, top: 97.6, fontSize: 9.55, weight: 400 },
  emailValue: { right: 181.13, top: 97.2, fontSize: 10.5, weight: 400 },
  stayInTouch: { right: 277.26, top: 128.8, fontSize: 7.95, weight: 400 },
  website: { left: 97.56, top: 138.2, fontSize: 7.9, weight: 600 },
} as const

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toFaDigits(value: string): string {
  const map = '۰۱۲۳۴۵۶۷۸۹'
  return value.replace(/\d/g, (d) => map[Number(d)] ?? d)
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Iranian numbers → tel:+98… */
function toTelHref(raw: string): string {
  let n = digitsOnly(raw)
  if (!n) return ''
  if (n.startsWith('00')) n = n.slice(2)
  else if (n.startsWith('0')) n = `98${n.slice(1)}`
  else if (!n.startsWith('98')) n = `98${n}`
  return `tel:+${n}`
}

function formatMobileEn(mobile: string): string {
  const digits = digitsOnly(mobile)
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
  }
  return mobile
}

function formatPhoneValueEn(phone: string, ext: string): string {
  const base = phone.trim()
  if (ext.trim()) return `${base}(${ext.trim()})`
  return base
}

function formatPhoneValueFa(phone: string, ext: string): string {
  const base = toFaDigits(phone.trim())
  if (ext.trim()) return `${base}(${toFaDigits(ext.trim())})`
  return base
}

function svgLink(href: string, inner: string): string {
  const external = href.startsWith('http')
  const attrs = external
    ? ` href="${escapeXml(href)}" target="_blank" rel="noopener noreferrer"`
    : ` href="${escapeXml(href)}"`
  return `<a${attrs}>${inner}</a>`
}

function logoHitAreas(lang: SignatureLang): string {
  const hits = LOGO_HIT[lang]
  return [
    svgLink(
      SITE_URL,
      `<rect x="${hits.mark.x}" y="${hits.mark.y}" width="${hits.mark.w}" height="${hits.mark.h}" fill="#FFCC04" fill-opacity="0"/>`,
    ),
    svgLink(
      SITE_URL,
      `<rect x="${hits.wordmark.x}" y="${hits.wordmark.y}" width="${hits.wordmark.w}" height="${hits.wordmark.h}" fill="#FFCC04" fill-opacity="0"/>`,
    ),
  ].join('\n        ')
}

function htmlLogoHits(lang: SignatureLang): string {
  const hits = LOGO_HIT[lang]
  const linkStyle =
    'position:absolute;display:block;z-index:2;text-decoration:none;'
  return [
    `<a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="${linkStyle}left:${hits.mark.x}px;top:${hits.mark.y}px;width:${hits.mark.w}px;height:${hits.mark.h}px;" aria-label="SEPEX"></a>`,
    `<a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="${linkStyle}left:${hits.wordmark.x}px;top:${hits.wordmark.y}px;width:${hits.wordmark.w}px;height:${hits.wordmark.h}px;" aria-label="sepex.net"></a>`,
  ].join('')
}

function svgText(opts: {
  x: number
  y: number
  fontSize: number
  font: string
  weight?: number
  letterSpacing?: number
  anchor?: 'start' | 'end' | 'middle'
  direction?: 'ltr' | 'rtl'
  href?: string
  content: string
}): string {
  const weight = opts.weight ?? 400
  const anchor = opts.anchor ?? 'start'
  const tracking =
    opts.letterSpacing && Math.abs(opts.letterSpacing) > 0.0005
      ? ` letter-spacing="${opts.letterSpacing}"`
      : ''
  const dir = opts.direction ? ` direction="${opts.direction}"` : ''
  const unicodeBidi = opts.direction === 'ltr' ? ' unicode-bidi="isolate"' : ''

  const text = `<text x="${opts.x}" y="${opts.y}" text-anchor="${anchor}"${dir}${unicodeBidi} font-family="${opts.font}" font-size="${opts.fontSize}" font-weight="${weight}" fill="${INK}"${tracking}>${opts.content}</text>`

  if (opts.href) return svgLink(opts.href, text)
  return text
}

function htmlText(opts: {
  left?: number
  right?: number
  top: number
  fontSize: number
  font: string
  weight?: number
  align?: 'left' | 'right'
  dir?: 'ltr' | 'rtl'
  href?: string
  content: string
}): string {
  const weight = opts.weight ?? 400
  const align =
    opts.align ?? (opts.right !== undefined ? 'right' : 'left')
  const horiz =
    opts.right !== undefined
      ? `right:${opts.right}px;left:auto;`
      : `left:${opts.left ?? 0}px;`
  const dir = opts.dir ?? 'rtl'
  const isFa = dir === 'rtl' || /Peyda/i.test(opts.font)
  const style = `position:absolute;${horiz}top:${opts.top}px;z-index:1;margin:0;padding:0;font-family:${opts.font};font-size:${opts.fontSize}px;line-height:1.2;font-weight:${weight};color:${INK};white-space:nowrap;text-align:${align};letter-spacing:normal;unicode-bidi:isolate;-webkit-font-smoothing:antialiased;`
  const inner = opts.href
    ? `<a href="${escapeXml(opts.href)}"${opts.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} style="color:${INK};text-decoration:none;font:inherit;letter-spacing:normal;">${opts.content}</a>`
    : opts.content
  return `<div class="${isFa ? 'sig-fa' : 'sig-en'}" dir="${dir}" lang="${dir === 'rtl' ? 'fa' : 'en'}" style="${style}">${inner}</div>`
}

function wrapSvg(baseHref: string, body: string, lang: SignatureLang): string {
  return `
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;">
  <tr>
    <td style="padding:0;margin:0;line-height:0;font-size:0;">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SIGNATURE_WIDTH}" height="${SIGNATURE_HEIGHT}" viewBox="0 0 ${SIGNATURE_WIDTH} ${SIGNATURE_HEIGHT}" direction="ltr" style="display:block;max-width:100%;height:auto;" role="img" aria-label="SEPEX email signature">
        <image href="${baseHref}" xlink:href="${baseHref}" width="${SIGNATURE_WIDTH}" height="${SIGNATURE_HEIGHT}" preserveAspectRatio="none"/>
        ${logoHitAreas(lang)}
        ${body}
      </svg>
    </td>
  </tr>
</table>
  `.trim()
}

function wrapHtmlFa(body: string): string {
  /* Fixed canvas — never shrink the overlay box; preview scales the whole table. */
  return `
<table class="sig-table" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;border-spacing:0;mso-table-lspace:0;mso-table-rspace:0;width:${SIGNATURE_WIDTH}px;">
  <tr>
    <td style="padding:0;margin:0;width:${SIGNATURE_WIDTH}px;height:${SIGNATURE_HEIGHT}px;">
      <div class="sig-root" dir="rtl" lang="fa" style="position:relative;width:${SIGNATURE_WIDTH}px;height:${SIGNATURE_HEIGHT}px;overflow:hidden;line-height:normal;font-size:0;-webkit-text-size-adjust:100%;text-size-adjust:100%;">
        <img class="sig-bg" src="${SIGNATURE_BASE_FA_DATA_URL}" width="${SIGNATURE_WIDTH}" height="${SIGNATURE_HEIGHT}" alt="" draggable="false" style="position:absolute;left:0;top:0;width:${SIGNATURE_WIDTH}px;height:${SIGNATURE_HEIGHT}px;max-width:none;display:block;border:0;outline:none;" />
        ${htmlLogoHits('fa')}
        ${body}
      </div>
    </td>
  </tr>
</table>
  `.trim()
}

function buildEn(data: SignatureFormData): string {
  const name = escapeXml(data.nameEn || data.nameFa || 'Your Name')
  const title = escapeXml(data.titleEn || data.titleFa || '')
  const phoneRaw = data.phone || '021-62040'
  const mobileRaw = data.mobile || ''
  const phoneValue = escapeXml(formatPhoneValueEn(phoneRaw, data.phoneExt))
  const mobile = escapeXml(formatMobileEn(mobileRaw))
  const emailAddr = fullEmail(data.email)
  const email = escapeXml(emailAddr)
  const phoneTel = toTelHref(phoneRaw)
  const mobileTel = toTelHref(mobileRaw)
  const font = 'Helvetica, Arial, sans-serif'

  const body = [
    svgText({ ...EN.name, font, weight: 700, content: name }),
    svgText({ ...EN.title, font, content: title }),
    svgText({ ...EN.phoneLabel, font, content: 'Phone:' }),
    svgText({
      ...EN.phoneValue,
      font,
      href: phoneTel || undefined,
      content: phoneValue,
    }),
    svgText({
      ...EN.mobile,
      font,
      href: mobileTel || undefined,
      content: mobile,
    }),
    svgText({ ...EN.emailLabel, font, content: 'Email:' }),
    svgText({
      ...EN.emailValue,
      font,
      href: emailAddr ? `mailto:${emailAddr}` : undefined,
      content: email,
    }),
    svgText({
      ...EN.contactUs,
      font,
      href: SITE_URL,
      content: 'Contact Us',
    }),
    svgText({
      ...EN.website,
      font,
      weight: 600,
      href: SITE_URL,
      content: 'sepex.net',
    }),
  ].join('\n        ')

  return wrapSvg(SIGNATURE_BASE_EN_DATA_URL, body, 'en')
}

function buildFa(data: SignatureFormData): string {
  const name = escapeXml(data.nameFa || data.nameEn || 'نام شما')
  const title = escapeXml(data.titleFa || data.titleEn || '')
  const phoneRaw = data.phone || '021-62040'
  const mobileRaw = data.mobile || ''
  const phoneValue = escapeXml(formatPhoneValueFa(phoneRaw, data.phoneExt))
  const mobile = escapeXml(toFaDigits(mobileRaw))
  const emailAddr = fullEmail(data.email)
  const email = escapeXml(emailAddr)
  const phoneTel = toTelHref(phoneRaw)
  const mobileTel = toTelHref(mobileRaw)
  const font = "'Peyda', Tahoma, Arial, sans-serif"
  const enFont = 'Helvetica, Arial, sans-serif'

  const body = [
    htmlText({ ...FA_HTML.name, font, dir: 'rtl', align: 'right', content: name }),
    htmlText({ ...FA_HTML.title, font, dir: 'rtl', align: 'right', content: title }),
    htmlText({
      ...FA_HTML.phoneLabel,
      font,
      dir: 'rtl',
      align: 'right',
      content: 'تلفن:',
    }),
    htmlText({
      ...FA_HTML.phoneValue,
      font,
      dir: 'ltr',
      align: 'right',
      href: phoneTel || undefined,
      content: phoneValue,
    }),
    htmlText({
      ...FA_HTML.mobile,
      font,
      dir: 'ltr',
      align: 'right',
      href: mobileTel || undefined,
      content: mobile,
    }),
    htmlText({
      ...FA_HTML.emailLabel,
      font,
      dir: 'rtl',
      align: 'right',
      content: 'ایمیل:',
    }),
    htmlText({
      ...FA_HTML.emailValue,
      font: enFont,
      dir: 'ltr',
      align: 'right',
      href: emailAddr ? `mailto:${emailAddr}` : undefined,
      content: email,
    }),
    htmlText({
      ...FA_HTML.stayInTouch,
      font,
      dir: 'rtl',
      align: 'right',
      href: SITE_URL,
      content: 'با ما در ارتباط باشید',
    }),
    htmlText({
      ...FA_HTML.website,
      font: enFont,
      dir: 'ltr',
      align: 'left',
      href: SITE_URL,
      content: 'sepex.net',
    }),
  ].join('')

  return wrapHtmlFa(body)
}

export function buildSignatureHtml(
  data: SignatureFormData,
  lang: SignatureLang,
): string {
  return lang === 'fa' ? buildFa(data) : buildEn(data)
}

export function canCopySignature(
  data: SignatureFormData,
  lang: SignatureLang,
): boolean {
  const name =
    lang === 'fa' ? data.nameFa || data.nameEn : data.nameEn || data.nameFa
  return Boolean(name.trim() && fullEmail(data.email))
}
