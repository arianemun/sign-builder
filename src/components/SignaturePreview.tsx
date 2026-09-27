import { useEffect, useRef, useState } from 'react'
import type { SignatureFormData, SignatureLang } from '../types'
import { EMAIL_DOMAIN, fullEmail } from '../types'
import { copy } from '../lib/i18n'
import { loadPeydaFonts } from '../lib/loadPeyda'
import { StepIcon } from './StepIcon'
import {
  SIGNATURE_HEIGHT,
  SIGNATURE_WIDTH,
  buildSignatureHtml,
  canCopySignature,
} from '../lib/signatureHtml'

interface SignaturePreviewProps {
  signatureLang: SignatureLang
  onSignatureLangChange: (lang: SignatureLang) => void
  data: SignatureFormData
}

async function copySignatureFromElement(
  element: HTMLElement,
  html: string,
): Promise<boolean> {
  try {
    if (navigator.clipboard && 'write' in navigator.clipboard) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([html], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      return true
    }
  } catch {
    // fall through to selection copy
  }

  try {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(element)
    selection?.removeAllRanges()
    selection?.addRange(range)
    const ok = document.execCommand('copy')
    selection?.removeAllRanges()
    if (ok) return true
  } catch {
    // fall through
  }

  try {
    await navigator.clipboard.writeText(html)
    return true
  } catch {
    return false
  }
}

function displayName(data: SignatureFormData, lang: SignatureLang): string {
  if (lang === 'fa') {
    return data.nameFa.trim() || data.nameEn.trim() || 'نام شما'
  }
  return data.nameEn.trim() || data.nameFa.trim() || 'Your Name'
}

function initialOf(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'S'
  return trimmed[0]!.toUpperCase()
}

export function SignaturePreview({
  signatureLang,
  onSignatureLangChange,
  data,
}: SignaturePreviewProps) {
  const html = buildSignatureHtml(data, signatureLang)
  const ready = canCopySignature(data, signatureLang)
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const [fontsReady, setFontsReady] = useState(false)
  const timer = useRef<number | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const fromEmail = fullEmail(data.email) || `name${EMAIL_DOMAIN}`
  const fromName = displayName(data, signatureLang)
  const bodyText =
    signatureLang === 'fa' ? copy.mailBodyFa : copy.mailBodyEn
  const bodyDir = signatureLang === 'fa' ? 'rtl' : 'ltr'

  useEffect(() => {
    let cancelled = false
    void loadPeydaFonts().then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  /* Scale FA HTML signature as one unit — never let the bg image shrink alone */
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const fit = () => {
      const table = frame.querySelector('table')
      if (!table) return

      const isFaHtml = Boolean(frame.querySelector('.sig-root'))
      const available = frame.clientWidth || SIGNATURE_WIDTH
      const scale = isFaHtml
        ? Math.min(1, available / SIGNATURE_WIDTH)
        : 1

      table.style.transformOrigin =
        signatureLang === 'fa' ? 'top right' : 'top left'
      table.style.transform = scale < 0.999 ? `scale(${scale})` : ''
      frame.style.height = isFaHtml
        ? `${Math.round(SIGNATURE_HEIGHT * scale)}px`
        : ''
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [html, signatureLang, fontsReady])

  const handleCopy = async () => {
    if (!ready || !frameRef.current) return
    const ok = await copySignatureFromElement(frameRef.current, html)
    setStatus(ok ? 'ok' : 'err')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), 2200)
  }

  return (
    <section className="panel preview-panel">
      <div className="panel-head">
        <div>
          <p className="panel-eyebrow">
            <StepIcon kind="preview" />
            {copy.stepPreview}
          </p>
          <h2>{copy.previewTitle}</h2>
          <p>{copy.copyHint}</p>
        </div>
      </div>

      <div className="lang-switch" role="group" aria-label={copy.signatureLang}>
        <span className="lang-switch-label">
          <svg className="lang-switch-icon" viewBox="0 0 24 24" aria-hidden>
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"
            />
          </svg>
          {copy.signatureLang}
        </span>
        <div className="segmented">
          <button
            type="button"
            className={signatureLang === 'fa' ? 'active' : ''}
            onClick={() => onSignatureLangChange('fa')}
          >
            <svg className="lang-opt-icon" viewBox="0 0 24 16" aria-hidden>
              <rect width="24" height="16" rx="2" fill="#239F40" />
              <rect y="5.33" width="24" height="5.34" fill="#fff" />
              <rect y="10.67" width="24" height="5.33" fill="#DA0000" />
              <circle cx="12" cy="8" r="1.35" fill="none" stroke="#DA0000" strokeWidth="0.7" />
            </svg>
            {copy.langFa}
          </button>
          <button
            type="button"
            className={signatureLang === 'en' ? 'active' : ''}
            onClick={() => onSignatureLangChange('en')}
          >
            <svg className="lang-opt-icon" viewBox="0 0 24 16" aria-hidden>
              <rect width="24" height="16" rx="2" fill="#012169" />
              <path stroke="#fff" strokeWidth="2.6" d="M0 0l24 16M24 0L0 16" />
              <path stroke="#C8102E" strokeWidth="1.3" d="M0 0l24 16M24 0L0 16" />
              <path fill="#fff" d="M9.5 0h5v16h-5zM0 5.5h24v5H0z" />
              <path fill="#C8102E" d="M10.5 0h3v16h-3zM0 6.5h24v3H0z" />
            </svg>
            {copy.langEn}
          </button>
        </div>
      </div>

      <div
        className="mail-demo"
        aria-label={`${copy.mailApp} — ${copy.mailWindowTitle}`}
      >
        <div className="mail-window" dir="ltr">
          <header className="mail-titlebar">
            <p className="mail-title">
              <span className="mail-app-mark" aria-hidden>
                ✉
              </span>
              {copy.mailWindowTitle}
            </p>
            <div className="mail-win-controls" aria-hidden>
              <span className="mail-win-min" />
              <span className="mail-win-max" />
              <span className="mail-win-close" />
            </div>
          </header>

          <div className="mail-chrome">
            <div className="mail-actionbar">
              <button type="button" className="mail-send" tabIndex={-1}>
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
                  />
                </svg>
                <span>{copy.mailSend}</span>
              </button>
              <div className="mail-action-group" aria-hidden>
                <span className="mail-action">{copy.mailAttach}</span>
                <span className="mail-action muted">{copy.mailDiscard}</span>
              </div>
              <span className="mail-format-hint" aria-hidden>
                {copy.mailHtmlBadge}
              </span>
            </div>

            <div className="mail-tabs" aria-hidden>
              <span className="active">{copy.mailTabMessage}</span>
              <span>{copy.mailInsert}</span>
              <span>{copy.mailOptions}</span>
              <span>{copy.mailFormat}</span>
            </div>

            <div className="mail-formatbar" aria-hidden>
              <span className="mail-font">Calibri</span>
              <span className="mail-size">11</span>
              <span className="mail-sep" />
              <b>B</b>
              <i>I</i>
              <u>U</u>
              <span className="mail-sep" />
              <span className="mail-swatch" />
              <span className="mail-swatch accent" />
            </div>
          </div>

          <div className="mail-fields">
            <div className="mail-row">
              <span className="mail-label">{copy.mailFrom}</span>
              <div className="mail-from-value">
                <span className="mail-avatar" aria-hidden>
                  {initialOf(fromName)}
                </span>
                <p className="mail-from-text">
                  <strong>{fromName}</strong>
                  <span>&lt;{fromEmail}&gt;</span>
                </p>
              </div>
            </div>
            <div className="mail-row">
              <span className="mail-label">{copy.mailTo}</span>
              <span className="mail-chip">
                {copy.mailToPlaceholder}
                <em aria-hidden>×</em>
              </span>
            </div>
            <div className="mail-row">
              <span className="mail-label">{copy.mailCc}</span>
              <span className="mail-field-empty" />
            </div>
            <div className="mail-row mail-row-subject">
              <span className="mail-label">{copy.mailSubject}</span>
              <span className="mail-subject">{copy.mailSubjectPlaceholder}</span>
            </div>
          </div>

          <div className="mail-body" dir={bodyDir}>
            <div
              className={`mail-message${signatureLang === 'fa' ? ' is-fa' : ''}`}
            >
              {bodyText.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>

            <div
              ref={frameRef}
              className={`signature-frame mail-signature${fontsReady ? ' is-fonts-ready' : ''}`}
              dir={bodyDir}
              style={{ unicodeBidi: 'isolate' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>

      <div className="copy-row">
        <button
          type="button"
          className="btn primary"
          onClick={handleCopy}
          disabled={!ready}
        >
          {status === 'ok' ? (
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden>
              <rect
                x="8"
                y="8"
                width="12"
                height="12"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16V6a2 2 0 0 1 2-2h10"
              />
            </svg>
          )}
          {status === 'ok' ? copy.copied : copy.copyHtml}
        </button>
        {!ready && <p className="hint">{copy.requiredNote}</p>}
        {status === 'err' && <p className="hint error">{copy.copyFailed}</p>}
      </div>
    </section>
  )
}
