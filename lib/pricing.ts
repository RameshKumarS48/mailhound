// Credit costs for metered tools. Tunable in one place so pricing can be
// adjusted without hunting through route handlers. Public teaser calls cost 0
// but are rate-limited and return truncated results.

export const DOMAIN_HEALTH_COST = 5
export const EMAIL_FINDER_COST = 10 // charged only on a verified hit
export const BLACKLIST_CHECK_COST = 3
