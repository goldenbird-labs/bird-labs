const tools = [
  { name: 'GPT-4o', color: '#10b981' },
  { name: 'Claude', color: '#a855f7' },
  { name: 'Gemini', color: '#3b82f6' },
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'n8n', color: '#ea4b71' },
  { name: 'Make.com', color: '#9333ea' },
  { name: 'Stripe', color: '#635bff' },
  { name: 'Shopify', color: '#96bf48' },
  { name: 'Zapier', color: '#ff4a00' },
  { name: 'Tailwind CSS', color: '#38bdf8' },
  { name: 'Framer Motion', color: '#ec4899' },
  { name: 'OpenAI', color: '#10b981' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'HubSpot', color: '#ff7a59' },
  { name: 'Intercom', color: '#286efa' },
]

// Duplicate for seamless loop
const items = [...tools, ...tools]

export default function TechStrip() {
  return (
    <div className="relative py-5 overflow-hidden border-y border-purple-900/20 bg-[#0a0a1a]/60">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080818] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080818] to-transparent z-10 pointer-events-none" />

      <div className="marquee-track flex gap-10 items-center whitespace-nowrap">
        {items.map((tool, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: tool.color, boxShadow: `0 0 6px ${tool.color}` }}
            />
            <span className="text-sm font-medium text-gray-400 tracking-wide">{tool.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
