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
            <div key={guide.id} className={`guide-item${open ? ' open' : ''}`}>
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
                <span className="guide-expand" aria-hidden>
                  <svg viewBox="0 0 24 24" className="guide-expand-svg">
                    <path
                      className="guide-expand-h"
                      d="M6 12h12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      className="guide-expand-v"
                      d="M12 6v12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              <div className="guide-panel-body">
                <div className="guide-panel-inner">
                  <ol className="guide-steps">
                    {guide.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
