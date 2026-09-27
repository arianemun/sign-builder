import type { ChangeEvent } from 'react'
import {
  EMAIL_DOMAIN,
  normalizeEmailLocal,
  sanitizeDigits,
  sanitizePhone,
  type SignatureFormData,
} from '../types'
import { copy } from '../lib/i18n'

interface SignatureFormProps {
  value: SignatureFormData
  onChange: (next: SignatureFormData) => void
  onFillSample: () => void
  onClear: () => void
}

export function SignatureForm({
  value,
  onChange,
  onFillSample,
  onClear,
}: SignatureFormProps) {
  const setText =
    (key: 'nameFa' | 'nameEn' | 'titleFa' | 'titleEn') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [key]: event.target.value })
    }

  return (
    <section className="panel form-panel">
      <div className="panel-head">
        <div>
          <p className="panel-eyebrow">{copy.stepInfo}</p>
          <h2>{copy.formTitle}</h2>
          <p>{copy.formHint}</p>
        </div>
        <div className="panel-actions">
          <button type="button" className="btn ghost" onClick={onFillSample}>
            {copy.fillSample}
          </button>
          <button type="button" className="btn ghost" onClick={onClear}>
            {copy.clearForm}
          </button>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>{copy.nameFa}</span>
          <input
            dir="rtl"
            value={value.nameFa}
            onChange={setText('nameFa')}
            placeholder={copy.phNameFa}
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span>{copy.nameEn}</span>
          <input
            dir="ltr"
            value={value.nameEn}
            onChange={setText('nameEn')}
            placeholder={copy.phNameEn}
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span>{copy.titleFa}</span>
          <input
            dir="rtl"
            value={value.titleFa}
            onChange={setText('titleFa')}
            placeholder={copy.phTitleFa}
          />
        </label>

        <label className="field">
          <span>{copy.titleEn}</span>
          <input
            dir="ltr"
            value={value.titleEn}
            onChange={setText('titleEn')}
            placeholder={copy.phTitleEn}
          />
        </label>

        <label className="field">
          <span>{copy.phone}</span>
          <input
            dir="ltr"
            value={value.phone}
            onChange={(e) =>
              onChange({ ...value, phone: sanitizePhone(e.target.value) })
            }
            placeholder={copy.phPhone}
            inputMode="tel"
            autoComplete="tel"
            pattern="[0-9\-]*"
          />
        </label>

        <label className="field field-sm">
          <span>{copy.phoneExt}</span>
          <input
            dir="ltr"
            value={value.phoneExt}
            onChange={(e) =>
              onChange({
                ...value,
                phoneExt: sanitizeDigits(e.target.value, 6),
              })
            }
            placeholder={copy.phExt}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </label>

        <label className="field">
          <span>{copy.mobile}</span>
          <input
            dir="ltr"
            value={value.mobile}
            onChange={(e) =>
              onChange({
                ...value,
                mobile: sanitizeDigits(e.target.value, 11),
              })
            }
            placeholder={copy.phMobile}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="tel"
          />
        </label>

        <label className="field field-wide">
          <span>{copy.email}</span>
          <div className="email-combo" dir="ltr">
            <input
              type="text"
              value={value.email}
              onChange={(e) =>
                onChange({
                  ...value,
                  email: normalizeEmailLocal(e.target.value),
                })
              }
              placeholder={copy.phEmailLocal}
              autoComplete="username"
              spellCheck={false}
              aria-label={copy.email}
            />
            <span className="email-domain" aria-hidden>
              {EMAIL_DOMAIN}
            </span>
          </div>
          <span className="field-note">{copy.emailHint}</span>
        </label>
      </div>
    </section>
  )
}
