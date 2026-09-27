import { useEffect, useRef, useState } from 'react'
import type { SignatureFormData, SignatureLang } from '../types'
import { EMAIL_DOMAIN, fullEmail } from '../types'
import { copy } from '../lib/i18n'
import {
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
  const timer = useRef<number | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const fromEmail = fullEmail(data.email) || `name${EMAIL_DOMAIN}`
  const fromName = displayName(data, signatureLang)
  const bodyText =
    signatureLang === 'fa' ? copy.mailBodyFa : copy.mailBodyEn
  const bodyDir = signatureLang === 'fa' ? 'rtl' : 'ltr'

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

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
          <p className="panel-eyebrow">{copy.stepPreview}</p>
          <h2>{copy.previewTitle}</h2>
          <p>{copy.copyHint}</p>
        </div>
      </div>

      <div className="lang-switch" role="group" aria-label={copy.signatureLang}>
        <span className="lang-switch-label">{copy.signatureLang}</span>
        <div className="segmented">
          <button
            type="button"
            className={signatureLang === 'fa' ? 'active' : ''}
            onClick={() => onSignatureLangChange('fa')}
          >
            {copy.langFa}
          </button>
          <button
            type="button"
            className={signatureLang === 'en' ? 'active' : ''}
            onClick={() => onSignatureLangChange('en')}
          >
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
            <div className="mail-message">
              {bodyText.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </div>

            <div
              ref={frameRef}
              className="signature-frame mail-signature"
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
          {status === 'ok' ? copy.copied : copy.copyHtml}
        </button>
        {!ready && <p className="hint">{copy.requiredNote}</p>}
        {status === 'err' && <p className="hint error">{copy.copyFailed}</p>}
      </div>
    </section>
  )
}
