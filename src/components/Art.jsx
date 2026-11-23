// Hand-built illustrations for the service cards. Pure SVG/CSS, so they stay crisp and weigh almost nothing.
import { Mail, MessageSquare, Smartphone, CalendarCheck, FileText, Bot, Database } from 'lucide-react'
import { BirdMark } from './Logo'

function Panel({ children, className = '' }) {
  return (
    <div className={`relative isolate h-44 overflow-hidden rounded-xl ${className}`} aria-hidden="true">
      <div className="grid-lines grid-lines-light" />
      {children}
    </div>
  )
}

// Laptop + phone showing a responsive site.
export function WebsiteArt() {
  return (
    <Panel className="bg-gradient-to-br from-brand-50 via-white to-sky-50">
      <div className="absolute left-1/2 top-6 w-[78%] -translate-x-[56%] transition-transform duration-500 group-hover:-translate-y-1">
        <div className="overflow-hidden rounded-t-lg border border-ink-200 bg-white shadow-lg">
          <div className="flex items-center gap-1 border-b border-ink-100 px-2 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" /><span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" /><span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex gap-2 p-2.5">
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-3/4 rounded-full bg-ink-800" />
              <div className="h-2 w-1/2 rounded-full bg-ink-800" />
              <div className="h-1.5 w-full rounded-full bg-ink-200" />
              <div className="h-1.5 w-5/6 rounded-full bg-ink-200" />
              <div className="mt-2 h-4 w-14 rounded bg-gradient-to-r from-brand-600 to-fuchsia-500" />
            </div>
            <div className="h-[4.5rem] w-[42%] rounded-md bg-gradient-to-br from-brand-300 via-fuchsia-200 to-sky-200" />
          </div>
        </div>
        <div className="mx-auto h-2 w-[112%] -translate-x-[5%] rounded-b-lg bg-gradient-to-b from-ink-300 to-ink-400" />
      </div>
      <div className="absolute bottom-3 right-[9%] w-[22%] rounded-[0.9rem] border-[3px] border-ink-900 bg-white p-1.5 shadow-xl transition-transform duration-500 group-hover:-translate-y-2">
        <div className="mx-auto mb-1 h-1 w-5 rounded-full bg-ink-900" />
        <div className="h-8 rounded bg-gradient-to-br from-brand-300 via-fuchsia-200 to-sky-200" />
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-800" />
        <div className="mt-1 h-1 w-3/4 rounded-full bg-ink-200" />
        <div className="mt-1.5 h-2.5 w-full rounded bg-gradient-to-r from-brand-600 to-fuchsia-500" />
      </div>
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-green-700 shadow-sm ring-1 ring-green-200">● Fast · 98</span>
    </Panel>
  )
}

// A live chat that turns into a booking.
export function ChatArt() {
  return (
    <Panel className="bg-gradient-to-br from-[#1a1033] via-[#120c26] to-[#0b1630]">
      <div className="aurora-blob -right-10 -top-10 h-40 w-40 bg-brand-600" style={{ filter: 'blur(40px)' }} />
      <div className="aurora-blob -bottom-16 left-0 h-40 w-40 bg-sky-500" style={{ filter: 'blur(40px)', opacity: 0.35 }} />
      <div className="absolute inset-x-5 top-4 space-y-2 text-[11px] leading-snug">
        <div className="flex items-end gap-1.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white"><BirdMark size={16} /></span>
          <p className="rounded-xl rounded-bl-sm bg-white/10 px-2.5 py-1.5 text-white/90 ring-1 ring-white/10">Hi! How can I help today?</p>
        </div>
        <p className="ml-auto w-fit rounded-xl rounded-br-sm bg-gradient-to-br from-brand-500 to-fuchsia-600 px-2.5 py-1.5 text-white">How much is a deep clean?</p>
        <div className="flex items-end gap-1.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white"><BirdMark size={16} /></span>
          <p className="rounded-xl rounded-bl-sm bg-white/10 px-2.5 py-1.5 text-white/90 ring-1 ring-white/10">$149 — I can book you Thursday at 2 PM?</p>
        </div>
        <div className="flex items-center gap-1.5 pl-7">
          <span className="flex gap-1 rounded-xl bg-white/10 px-2.5 py-2 ring-1 ring-white/10">
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white" /><span className="typing-dot h-1.5 w-1.5 rounded-full bg-white" /><span className="typing-dot h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-green-400/15 px-2 py-0.5 text-[10px] font-semibold text-green-300 ring-1 ring-green-400/30"><CalendarCheck size={11} /> Lead captured</span>
        </div>
      </div>
    </Panel>
  )
}

// Form → AI → phone / email / CRM, with data flowing along the lines.
export function AutomationArt() {
  const node = 'absolute flex items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-ink-200'
  return (
    <Panel className="bg-gradient-to-br from-sky-50 via-white to-brand-50">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 176" preserveAspectRatio="none">
        <defs>
          <linearGradient id="flowGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#flowGrad)" strokeWidth="2" strokeLinecap="round">
          <path className="flow-line" d="M62 88 H128" />
          <path className="flow-line" d="M172 88 C200 88 205 38 236 38" />
          <path className="flow-line" d="M172 88 H236" />
          <path className="flow-line" d="M172 88 C200 88 205 138 236 138" />
        </g>
      </svg>
      <div className={`${node} left-[6%] top-1/2 h-12 w-12 -translate-y-1/2 text-brand-700`}><FileText size={20} /></div>
      <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-600 text-white shadow-[0_10px_30px_-6px_rgba(124,58,237,0.7)]">
        <Bot size={24} />
      </div>
      <div className={`${node} right-[6%] top-[10%] h-10 w-10 text-green-600`}><Smartphone size={18} /></div>
      <div className={`${node} right-[6%] top-1/2 h-10 w-10 -translate-y-1/2 text-sky-600`}><Mail size={18} /></div>
      <div className={`${node} bottom-[10%] right-[6%] h-10 w-10 text-amber-600`}><Database size={18} /></div>
      <span className="absolute bottom-3 left-4 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink-700 shadow-sm ring-1 ring-ink-200"><MessageSquare size={10} /> Replied in 4 sec</span>
    </Panel>
  )
}
