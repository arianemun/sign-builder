import { useState } from 'react'
import { copy } from '../lib/i18n'
import { INSTALL_GUIDES } from '../lib/guides'
import { GuideAppIcon } from './GuideAppIcon'
import { StepIcon } from './StepIcon'

export function InstallGuide() {
  const [openId, setOpenId] = useState(INSTALL_GUIDES[0]?.id ?? '')

  return (
    <section className="panel guide-panel">
      <div className="panel-head">
        <div>
          <p className="panel-eyebrow">
            <StepIcon kind="guide" />
            {copy.stepGuide}
          </p>
          <h2>{copy.guideTitle}</h2>
          <p>{copy.guideIntro}</p>
        </div>
      </div>

      <div className="guide-list">
        {INSTALL_GUIDES.map((guide) => {
          const open = openId === guide.id
          return (
            <div key={guide.id} className={`guide-item ${open ? 'open' : ''}`}>
              <button
                type="button"
                className="guide-toggle"
                aria-expanded={open}
                onClick={() => setOpenId(open ? '' : guide.id)}
              >
                <span className="guide-toggle-label">
                  <GuideAppIcon id={guide.id} />
                  {guide.title}
                </span>
                <span className="chevron" aria-hidden>
                  {open ? '−' : '+'}
                </span>
              </button>
              {open && (
                <ol className="guide-steps">
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
