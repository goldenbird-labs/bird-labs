// Starter content added once to a fresh database. Edit or close these roles any time in
// /admin → Careers → Jobs; they are never re-added after the first run.
import { store } from './store.js'

const STARTER_JOBS = [
  {
    title: 'Business Development Representative',
    type: 'Part-time',
    location: 'Niagara Falls, ON',
    summary: 'Help local businesses across the Niagara region get more customers — and grow Bird Labs while you do it.',
    description: `Bird Labs builds websites, AI chatbots and automations for small businesses on simple monthly plans, starting at $99/month. We're looking for a part-time Business Development Representative in Niagara Falls to grow our client base across the Niagara region.

You'll be the local face of Bird Labs: meeting business owners, understanding what's holding them back online, and showing them how we can help.

## What you'll do
- Find and reach out to local small businesses — restaurants, clinics, salons, trades, real estate, retail and more
- Visit businesses, attend networking events and build relationships with local business groups
- Run discovery conversations and short demos of our websites and AI chatbots
- Turn interest into signed monthly plans (Starter, Growth and Pro)
- Keep track of leads and follow-ups in our CRM
- Build referral partnerships with complementary local businesses
- Share what you hear from customers so we can keep improving our offer

## What we're looking for
- Experience in sales, business development, account management or another customer-facing role
- A confident, friendly communicator — in person, on the phone and by email
- Self-motivated and organised, comfortable managing your own schedule and goals
- Interest in technology — you don't need to be technical, but you should enjoy explaining it simply
- Knowledge of the Niagara business community is a big plus
- Reliable transportation for local visits is an asset

## Details
- Part-time with flexible hours
- Based in Niagara Falls, ON, working with local businesses in person
- Compensation will be discussed during the interview`,
  },
  {
    title: 'Web & AI Developer',
    type: 'Full-time',
    location: 'Remote — India',
    summary: 'Build websites, AI chatbots and automations for small businesses in North America — fully remote from anywhere in India.',
    description: `Bird Labs builds websites, AI chatbots and automations for small businesses, mostly in Canada and the US. We're hiring a full-time Web & AI Developer who can work remotely from anywhere in India.

You'll build and launch client projects end to end and work closely with our team in Canada, so excellent written and spoken English is essential.

## What you'll do
- Build fast, mobile-friendly websites with React, Tailwind CSS and Node.js/Express
- Set up and customise AI chatbots with the OpenAI API — knowledge bases, prompts and lead capture
- Build automations: email and SMS follow-ups, CRM integrations, forms and booking flows
- Deploy and maintain client sites (GitHub, Hostinger, MySQL) and keep them secure and up to date
- Handle client update requests from our client portal quickly and carefully
- Communicate directly with clients and the team in clear, professional English

## What we're looking for
- 3+ years of professional web development experience with React, JavaScript and Node.js
- Solid experience with REST APIs, MySQL and Git
- Hands-on experience with AI/LLM APIs (OpenAI or similar) is a strong plus
- Excellent written and spoken English — you'll write to clients and join calls with North American customers
- A good eye for clean, modern design and close attention to detail
- Reliable and self-managed, with a proven track record of working remotely
- A portfolio or GitHub profile showing real projects

## Details
- Full-time, fully remote from anywhere in India
- Some overlap with Eastern Time (Toronto) business hours for calls
- Please include links to your portfolio or GitHub when you apply
- Compensation will be discussed during the interview`,
  },
]

export async function seedOnce() {
  const flag = await store.list('meta', { where: { name: 'starter_jobs_seeded' }, limit: 1 })
  if (flag.length) return
  const now = new Date()
  for (const job of STARTER_JOBS) await store.insert('jobs', { ...job, status: 'open', updated_at: now })
  await store.insert('meta', { name: 'starter_jobs_seeded', value: now.toISOString() })
  console.log(`Added ${STARTER_JOBS.length} starter job postings.`)
}
