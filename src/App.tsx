import { useState } from 'react'
import { SignatureForm } from './components/SignatureForm'
import { SignaturePreview } from './components/SignaturePreview'
import { InstallGuide } from './components/InstallGuide'
import { StepIcon } from './components/StepIcon'
import {
  EMPTY_FORM,
  SAMPLE_FORM,
  type SignatureFormData,
  type SignatureLang,
} from './types'
import { copy } from './lib/i18n'
import './App.css'

function App() {
  const [signatureLang, setSignatureLang] = useState<SignatureLang>('fa')
  const [form, setForm] = useState<SignatureFormData>(EMPTY_FORM)

  return (
    <div className="app" dir="rtl" lang="fa">
      <div className="bg-glow" aria-hidden />
      <div className="bg-glow bg-glow-alt" aria-hidden />
      <div className="bg-grid" aria-hidden />

      <main className="layout">
        <section className="hero">
          <p className="lede">{copy.appSubtitle}</p>
          <nav className="steps" aria-label="مراحل">
            <span>
              <em>
                <StepIcon kind="info" />
              </em>
              {copy.stepInfo}
            </span>
            <span>
              <em>
                <StepIcon kind="preview" />
              </em>
              {copy.stepPreview}
            </span>
            <span>
              <em>
                <StepIcon kind="guide" />
              </em>
              {copy.stepGuide}
            </span>
          </nav>
        </section>

        <div className="workbench">
          <div className="workbench-form">
            <SignatureForm
              value={form}
              onChange={setForm}
              onFillSample={() => setForm(SAMPLE_FORM)}
              onClear={() => setForm(EMPTY_FORM)}
            />
          </div>

          <div className="workbench-preview">
            <SignaturePreview
              signatureLang={signatureLang}
              onSignatureLangChange={setSignatureLang}
              data={form}
            />
          </div>
        </div>

        <InstallGuide />
      </main>

      <footer className="footer">
        <p className="footer-credit">
          <span>{copy.footerMade}</span>{' '}
          <span className="heart" aria-hidden>
            💛
          </span>{' '}
          <span>{copy.footerBy}</span>
          <span className="footer-sep" aria-hidden>
            |
          </span>
          <span className="footer-ver">{copy.footerVersion}</span>
        </p>
      </footer>
    </div>
  )
}

export default App
