import type { ChangeEvent } from 'react'
import {
  EMAIL_DOMAIN,
  normalizeEmailLocal,
  sanitizeDigits,
  sanitizePhone,
  type SignatureFormData,
} from '../types'
import { copy } from '../lib/i18n'
import { StepIcon } from './StepIcon'

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
          <p className="panel-eyebrow">
            <StepIcon kind="info" />
            {copy.stepInfo}
          </p>
          <h2>{copy.formTitle}</h2>
          <p>{copy.formHint}</p>
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="btn ghost btn-sm"
            onClick={onFillSample}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 3v5h5M9 13h6M9 17h4"
              />
            </svg>
            {copy.fillSample}
          </button>
          <button
            type="button"
            className="btn ghost btn-sm"
            onClick={onClear}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7h10zM10 11v6M14 11v6"
              />
            </svg>
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

        <div className="field field-phone">
          <span>{copy.phone}</span>
          <div className="phone-combo" dir="ltr">
            <input
              type="text"
              value={value.phone}
              onChange={(e) =>
                onChange({ ...value, phone: sanitizePhone(e.target.value) })
              }
              placeholder={copy.phPhone}
              inputMode="tel"
              autoComplete="tel"
              pattern="[0-9\-]*"
              aria-label={copy.phone}
            />
            <span className="phone-ext-sep" aria-hidden>
              {copy.phoneExt}
            </span>
            <input
              className="phone-ext-input"
              type="text"
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
              aria-label={copy.phoneExt}
            />
          </div>
        </div>

        <label className="field field-mobile">
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
