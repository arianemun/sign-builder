import type { SignatureFormData, SignatureLang } from '../types'
import { fullEmail } from '../types'

/** Official SEPEX canvas size */
export const SIGNATURE_WIDTH = 411
export const SIGNATURE_HEIGHT = 172

const INK = '#231F20'
const YELLOW = '#FFCC04'
const SITE_URL = 'https://sepex.net'
/** Fallback when building outside the browser (or unknown host) */
const DEFAULT_ASSET_BASE = 'https://sign.sepfa.ir'

export interface SignatureHtmlOptions {
  /** Absolute origin for hosted PNG assets, e.g. https://sign.sepfa.ir */
  assetBase?: string
  /** Pre-rendered Peyda text images (hosted URLs) for FA name/title */
  textImages?: {
    name?: { src: string; width: number; height: number }
    title?: { src: string; width: number; height: number }
    stay?: { src: string; width: number; height: number }
  }
}

function resolveAssetBase(override?: string): string {
  if (override?.trim()) {
    const base = override.replace(/\/$/, '')
    // Pasted signatures cannot load localhost images inside Gmail/Outlook
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(base)) {
      return DEFAULT_ASSET_BASE
    }
    return base
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, '')
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return origin // preview still uses local assets
    }
    return origin
  }
  return DEFAULT_ASSET_BASE
}

function assetUrl(base: string, file: string): string {
  return `${base}/signature/${file}`
}

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

function mailLink(
  href: string,
  content: string,
  font: string,
  size: number,
  weight = 400,
): string {
  const extra = href.startsWith('http')
    ? ' target="_blank" rel="noopener noreferrer"'
    : ''
  return `<a href="${escapeXml(href)}"${extra} style="color:${INK};text-decoration:none;font-family:${font};font-size:${size}px;font-weight:${weight};line-height:1.25;">${content}</a>`
}

function imgTag(src: string, width: number, height: number, alt: string): string {
  return `<img src="${escapeXml(src)}" width="${width}" height="${height}" alt="${escapeXml(alt)}" border="0" style="display:block;border:0;outline:none;text-decoration:none;width:${width}px;height:${height}px;" />`
}

/**
 * Outlook + Gmail safe signature:
 * - nested tables + bgcolor (Outlook/Word)
 * - hosted PNG images with absolute https URLs (Gmail blocks data:/SVG)
 */
function buildFa(
  data: SignatureFormData,
  assetBase: string,
  textImages?: SignatureHtmlOptions['textImages'],
): string {
  const nameRaw = data.nameFa || data.nameEn || 'نام شما'
  const titleRaw = data.titleFa || data.titleEn || ''
  const name = escapeXml(nameRaw)
  const title = escapeXml(titleRaw)
  const phoneRaw = data.phone || '021-62040'
  const mobileRaw = data.mobile || ''
  const phoneValue = escapeXml(formatPhoneValueFa(phoneRaw, data.phoneExt))
  const mobile = escapeXml(toFaDigits(mobileRaw))
  const emailAddr = fullEmail(data.email)
  const email = escapeXml(emailAddr)
  const phoneTel = toTelHref(phoneRaw)
  const mobileTel = toTelHref(mobileRaw)

  const faFont = 'Tahoma, Arial, sans-serif'
  const enFont = 'Helvetica, Arial, sans-serif'
  const markSrc = assetUrl(assetBase, 'mark-fa.png')
  const wordSrc = assetUrl(assetBase, 'wordmark.png')

  const line = (
    content: string,
    size: number,
    weight = 400,
    padTop = 0,
  ) =>
    `<tr><td align="right" dir="rtl" style="padding:${padTop}px 0 0 0;margin:0;font-family:${faFont};font-size:${size}px;font-weight:${weight};line-height:1.25;color:${INK};mso-line-height-rule:exactly;">${content}</td></tr>`

  const nameCell = textImages?.name?.src
    ? imgTag(
        textImages.name.src,
        textImages.name.width,
        textImages.name.height,
        nameRaw,
      )
    : name
  const titleCell =
    titleRaw && textImages?.title?.src
      ? imgTag(
          textImages.title.src,
          textImages.title.width,
          textImages.title.height,
          titleRaw,
        )
      : title
  const stayCell = textImages?.stay?.src
    ? `<a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;outline:none;">${imgTag(textImages.stay.src, textImages.stay.width, textImages.stay.height, 'با ما در ارتباط باشید')}</a>`
    : mailLink(SITE_URL, 'با ما در ارتباط باشید', faFont, 8)

  const phoneCell = phoneTel
    ? `تلفن:&nbsp;${mailLink(phoneTel, phoneValue, faFont, 11)}`
    : `تلفن:&nbsp;${phoneValue}`
  const mobileCell = mobileTel
    ? mailLink(mobileTel, mobile, faFont, 11)
    : mobile
  const emailCell = emailAddr
    ? `ایمیل:&nbsp;${mailLink(`mailto:${emailAddr}`, email, enFont, 11)}`
    : `ایمیل:&nbsp;${email}`

  const textBlock = `
<table dir="rtl" lang="fa" cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  ${line(nameCell, 24, 700)}
  ${titleRaw ? line(titleCell, 10, 500, 6) : ''}
  ${line(phoneCell, 10, 400, 10)}
  ${mobile ? line(mobileCell, 11, 400, 3) : ''}
  ${line(emailCell, 10, 400, 3)}
</table>`.trim()

  return `
<table dir="rtl" lang="fa" cellpadding="0" cellspacing="0" border="0" width="${SIGNATURE_WIDTH}" role="presentation" style="width:${SIGNATURE_WIDTH}px;max-width:${SIGNATURE_WIDTH}px;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${YELLOW};">
  <tr>
    <td width="128" valign="middle" align="center" bgcolor="${YELLOW}" style="width:128px;padding:28px 14px 10px 10px;background-color:${YELLOW};">
      <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;outline:none;">
        ${imgTag(markSrc, 102, 41, 'SEPEX')}
      </a>
    </td>
    <td width="283" valign="top" bgcolor="${YELLOW}" style="width:283px;padding:16px 14px 6px 8px;background-color:${YELLOW};">
      ${textBlock}
    </td>
  </tr>
  <tr>
    <td colspan="2" bgcolor="${YELLOW}" style="padding:8px 16px 14px 16px;background-color:${YELLOW};">
      <table dir="rtl" cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;border-spacing:0;width:100%;">
        <tr>
          <td width="120" valign="bottom" align="right" style="padding:0;font-family:${faFont};font-size:8px;line-height:1.3;color:${INK};">
            ${stayCell}
          </td>
          <td width="171" valign="bottom" align="center" style="padding:0 6px;">
            <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;outline:none;">
              ${imgTag(wordSrc, 98, 23, 'SEPEX')}
            </a>
          </td>
          <td width="120" valign="bottom" align="left" dir="ltr" style="padding:0;font-family:${enFont};font-size:8px;font-weight:600;line-height:1.3;color:${INK};">
            ${mailLink(SITE_URL, 'sepex.net', enFont, 8, 600)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `.trim()
}

function buildEn(data: SignatureFormData, assetBase: string): string {
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
  const markSrc = assetUrl(assetBase, 'mark-en.png')
  const wordSrc = assetUrl(assetBase, 'wordmark.png')

  const line = (
    content: string,
    size: number,
    weight = 400,
    padTop = 0,
  ) =>
    `<tr><td align="left" dir="ltr" style="padding:${padTop}px 0 0 0;margin:0;font-family:${font};font-size:${size}px;font-weight:${weight};line-height:1.25;color:${INK};mso-line-height-rule:exactly;">${content}</td></tr>`

  const phoneCell = phoneTel
    ? `Phone:&nbsp;${mailLink(phoneTel, phoneValue, font, 10)}`
    : `Phone:&nbsp;${phoneValue}`
  const mobileCell = mobileTel
    ? mailLink(mobileTel, mobile, font, 10)
    : mobile
  const emailCell = emailAddr
    ? `Email:&nbsp;${mailLink(`mailto:${emailAddr}`, email, font, 10)}`
    : `Email:&nbsp;${email}`

  const textBlock = `
<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  ${line(name, 24, 700)}
  ${title ? line(title, 10, 400, 6) : ''}
  ${line(phoneCell, 10, 400, 10)}
  ${mobile ? line(mobileCell, 10, 400, 3) : ''}
  ${line(emailCell, 10, 400, 3)}
</table>`.trim()

  return `
<table dir="ltr" lang="en" cellpadding="0" cellspacing="0" border="0" width="${SIGNATURE_WIDTH}" role="presentation" style="width:${SIGNATURE_WIDTH}px;max-width:${SIGNATURE_WIDTH}px;border-collapse:collapse;border-spacing:0;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${YELLOW};">
  <tr>
    <td width="128" valign="middle" align="center" bgcolor="${YELLOW}" style="width:128px;padding:28px 10px 10px 14px;background-color:${YELLOW};">
      <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;outline:none;">
        ${imgTag(markSrc, 102, 41, 'SEPEX')}
      </a>
    </td>
    <td width="283" valign="top" bgcolor="${YELLOW}" style="width:283px;padding:16px 8px 6px 14px;background-color:${YELLOW};">
      ${textBlock}
    </td>
  </tr>
  <tr>
    <td colspan="2" bgcolor="${YELLOW}" style="padding:8px 16px 14px 16px;background-color:${YELLOW};">
      <table dir="ltr" cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="border-collapse:collapse;border-spacing:0;width:100%;">
        <tr>
          <td width="120" valign="bottom" align="left" style="padding:0;">
            <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;border:0;outline:none;">
              ${imgTag(wordSrc, 98, 23, 'SEPEX')}
            </a>
          </td>
          <td valign="bottom" align="right" style="padding:0;font-family:${font};font-size:8px;line-height:1.35;color:${INK};">
            ${mailLink(SITE_URL, 'Contact Us', font, 8)}<br />
            ${mailLink(SITE_URL, 'sepex.net', font, 8, 600)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `.trim()
}

export function buildSignatureHtml(
  data: SignatureFormData,
  lang: SignatureLang,
  options: SignatureHtmlOptions = {},
): string {
  const assetBase = resolveAssetBase(options.assetBase)
  const html =
    lang === 'fa'
      ? buildFa(data, assetBase, options.textImages)
      : buildEn(data, assetBase)
  /* Outer wrapper class for preview scaling only — Gmail strips class, keeps table */
  return html.replace('<table ', '<table class="sig-root" ')
}

export function canCopySignature(
  data: SignatureFormData,
  lang: SignatureLang,
): boolean {
  const name =
    lang === 'fa' ? data.nameFa || data.nameEn : data.nameEn || data.nameFa
  return Boolean(name.trim() && fullEmail(data.email))
}
