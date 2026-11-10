// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { siteSectionSaveError } from './site-section-store'
import { defaultSettings, parseSiteSettings, prepareSiteSection, SITE_SECTION_LIMITS } from './site-settings'

// save_site_section enforces the same rules server-side. These checks fail when
// one side changes without the other.
const sql = readFileSync(resolve(process.cwd(), 'scripts/save-site-section.sql'), 'utf8')
const raised = Array.from(sql.matchAll(/raise exception '([^']+)'/g), match => match[1])

describe('Site section rules: TS and save_site_section agree', () => {
  it('accepts exactly the Site section keys', () => {
    const keys = Object.keys(defaultSettings).sort()
    for (const list of sql.match(/not in \(([^)]+)\)/g)!.filter(list => list.includes("'hero'"))) {
      expect(list.match(/'([^']+)'/g)!.map(key => key.slice(1, -1)).sort()).toEqual(keys)
    }
  })

  it('uses the same limits', () => {
    expect(sql).toContain(`jsonb_array_length(p_value) > ${SITE_SECTION_LIMITS.maxClients}`)
    expect(sql).toContain(`not between 1 and ${SITE_SECTION_LIMITS.maxCompanyLength}`)
    expect(sql).toContain(`octet_length(p_value::text) > ${SITE_SECTION_LIMITS.maxSectionBytes}`)
  })

  it('treats category ID 0 as invalid on write, on read and in SQL', () => {
    expect(sql).toContain("v !~ '^[1-9][0-9]*$'")
    expect(() => prepareSiteSection({ key: 'category_order', value: [0, 1] })).toThrow('orden')
    expect(parseSiteSettings([{ key: 'category_order', value: [0, 1] }]).category_order).toEqual([1])
  })

  it('rejects in TS what SQL would reject for clients, before any request', () => {
    const client = (id: string, company = 'Co') => ({ id, company, logo: '', link: '' })
    const many = Array.from({ length: SITE_SECTION_LIMITS.maxClients + 1 }, (_, index) => client(String(index)))
    expect(() => prepareSiteSection({ key: 'clients', value: many })).toThrow(String(SITE_SECTION_LIMITS.maxClients))
    expect(() => prepareSiteSection({ key: 'clients', value: [client('1', 'x'.repeat(SITE_SECTION_LIMITS.maxCompanyLength + 1))] })).toThrow()
    expect(() => prepareSiteSection({ key: 'clients', value: [client('1', 'x'.repeat(SITE_SECTION_LIMITS.maxCompanyLength))] })).not.toThrow()
    expect(() => prepareSiteSection({ key: 'clients', value: [client('1'), client('1')] })).toThrow('repetidas')
    expect(() => prepareSiteSection({ key: 'clients', value: [client('')] })).toThrow()
  })

  it('maps every exception save_site_section raises to an admin message', () => {
    expect(raised.length).toBeGreaterThan(5)
    const session = siteSectionSaveError({})
    for (const message of raised) {
      const shown = siteSectionSaveError({ message, code: message === 'Admin session required' ? '42501' : 'P0001' })
      if (message === 'Admin session required') expect(shown).toBe(session)
      else expect(shown, message).not.toBe(session)
    }
  })
})
