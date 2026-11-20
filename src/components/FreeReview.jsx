import { useState } from 'react'
import { ArrowRight, CheckCircle2, Search } from 'lucide-react'
import { submitLead } from '../lib/leads'

export default function FreeReview() {
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const onSubmit = async e => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await submitLead({ source: 'review', website, email, company_site: trap, message: `Free review request for: ${website || 'no website yet'}` })
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <section aria-labelledby="review-title" className="container-site -mt-6 relative z-10">
      <div className="card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex items-start gap-4 lg:max-w-md">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:flex">
            <Search size={22} />
          </span>
          <div>
            <h2 id="review-title" className="text-xl font-bold sm:text-2xl">Not ready for a call? Get a free review.</h2>
            <p className="mt-1.5 text-ink-600">
              Send us your website (or tell us you don't have one). We'll reply within one business day with 3 practical ways to win more customers online.
            </p>
          </div>
        </div>

        {status === 'done' ? (
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800" role="status">
            <CheckCircle2 size={22} className="shrink-0" />
            <p><strong>Got it!</strong> Your review is on its way — check your inbox within one business day.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3 sm:flex-row" noValidate={false}>
            <label className="sr-only" htmlFor="review-website">Your website</label>
            <input id="review-website" className="input sm:flex-1" placeholder="yourwebsite.com — or “none yet”" value={website} onChange={e => setWebsite(e.target.value)} maxLength={300} />
            <label className="sr-only" htmlFor="review-email">Your email</label>
            <input id="review-email" type="email" required className="input sm:flex-1" placeholder="you@email.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={trap} onChange={e => setTrap(e.target.value)} name="company_site" />
            <button type="submit" disabled={status === 'loading'} className="btn-primary shrink-0 whitespace-nowrap">
              {status === 'loading' ? 'Sending…' : <>Get my free review <ArrowRight size={17} /></>}
            </button>
          </form>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </section>
  )
}
