export type SignatureLang = 'fa' | 'en'

export const EMAIL_DOMAIN = '@sepex.net'
export const APP_VERSION = '1.0.0'

export interface SignatureFormData {
  nameFa: string
  nameEn: string
  titleFa: string
  titleEn: string
  phone: string
  phoneExt: string
  mobile: string
  /** Local-part only; domain is always @sepex.net */
  email: string
}

/** Invented demo identity — not a real employee */
export const SAMPLE_FORM: SignatureFormData = {
  nameFa: 'نگار کاویانی',
  nameEn: 'Negar Kaviani',
  titleFa: 'کارشناس ارتباطات',
  titleEn: 'Communications Specialist',
  phone: '021-62040',
  phoneExt: '218',
  mobile: '09123456789',
  email: 'negark',
}

export const EMPTY_FORM: SignatureFormData = {
  nameFa: '',
  nameEn: '',
  titleFa: '',
  titleEn: '',
  phone: '',
  phoneExt: '',
  mobile: '',
  email: '',
}

/** @deprecated use SAMPLE_FORM */
export const DEFAULT_FORM = SAMPLE_FORM

export function normalizeEmailLocal(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/@.*$/u, '')
    .replace(/[^a-z0-9._+-]/gu, '')
}

export function fullEmail(local: string): string {
  const clean = normalizeEmailLocal(local)
  return clean ? `${clean}${EMAIL_DOMAIN}` : ''
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (d) => {
    const fa = FA_DIGITS.indexOf(d)
    if (fa >= 0) return String(fa)
    const ar = AR_DIGITS.indexOf(d)
    return ar >= 0 ? String(ar) : d
  })
}

/** Landline: digits and a single style hyphen */
export function sanitizePhone(value: string): string {
  const latin = toLatinDigits(value)
  let out = ''
  let sawHyphen = false
  for (const ch of latin) {
    if (/\d/.test(ch)) out += ch
    else if (ch === '-' && !sawHyphen && out.length > 0) {
      out += '-'
      sawHyphen = true
    }
  }
  return out.slice(0, 12)
}

export function sanitizeDigits(value: string, maxLen: number): string {
  return toLatinDigits(value).replace(/\D/g, '').slice(0, maxLen)
}
