// Each role has its own page: /careers/<id>-<title-slug>. Only the id matters; the slug is for people and search engines.
export function jobSlug(job) {
  return String(job.title || 'role').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 60) || 'role'
}

export function jobPath(job) {
  return `/careers/${job.id}-${jobSlug(job)}`
}

// "/careers/12-web-ai-developer" → 12
export function jobIdFromPath(pathname) {
  const m = pathname.match(/^\/careers\/(\d+)(?:-[^/]*)?\/?$/)
  return m ? Number(m[1]) : null
}
