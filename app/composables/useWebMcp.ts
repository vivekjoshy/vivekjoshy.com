/**
 * WebMCP — expose page tools to an agent browsing this site.
 *
 * WebMCP is a W3C proposal (Google/Microsoft) adding `document.modelContext`,
 * letting a page register tools an AI agent can discover and call, with the
 * browser mediating consent. It is distinct from the server endpoint at
 * /api/mcp: that one is called over HTTP by an agent anywhere, this one is
 * callable by an agent that is already looking at the page.
 *
 * Both are backed by app/utils/openskill.ts — the same module the visible
 * playground uses, and the one checked against openskill.py on every build. So
 * the page, the HTTP endpoint and the browser tools cannot disagree.
 *
 * Behind a flag in Chrome at time of writing, so this is strictly progressive:
 * unsupported browsers get a no-op.
 */
import {
  rate, predictWin, ordinal, type Rating, type ModelName
} from '~/utils/openskill'

interface ModelContextTool {
  name: string
  title?: string
  description: string
  inputSchema?: object
  execute: (input: any, options?: { signal: AbortSignal }) => Promise<unknown> | unknown
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean }
}

const MODELS: ModelName[] = ['plackett_luce', 'thurstone_mosteller', 'bradley_terry']

const TEAMS_SCHEMA = {
  type: 'array',
  description: 'Teams in the match; each team is an array of {mu, sigma} players.',
  items: {
    type: 'array',
    items: {
      type: 'object',
      properties: { mu: { type: 'number' }, sigma: { type: 'number' } },
      required: ['mu', 'sigma']
    }
  },
  minItems: 2
}

/** Same bounds as the HTTP endpoint: the maths is quadratic in team count. */
function assertTeams(teams: unknown): Rating[][] {
  if (!Array.isArray(teams) || teams.length < 2) throw new Error('need at least two teams')
  if (teams.length > 64) throw new Error(`too many teams: ${teams.length} (limit 64)`)
  return teams.map((t: any, i) => {
    if (!Array.isArray(t) || !t.length) throw new Error(`team ${i} must be non-empty`)
    return t.map((p: any, j: number) => {
      const mu = Number(p?.mu)
      const sigma = Number(p?.sigma)
      if (!Number.isFinite(mu) || !Number.isFinite(sigma) || sigma <= 0) {
        throw new Error(`team ${i} player ${j}: need finite mu and positive sigma`)
      }
      return { mu, sigma }
    })
  })
}

/**
 * The tool descriptors, built without touching the DOM so they can be verified
 * outside a browser — see scripts/verify-webmcp.mjs.
 */
export function buildWebMcpTools(): ModelContextTool[] {
  return [
    {
      name: 'openskill-rate-match',
        title: 'Rate a finished match',
        description:
          'Update Weng-Lin ratings from a match result. Ranks are 1-based ascending, so [1,2] ' +
          'means the first team won; equal values are a draw. Returns new mu and sigma per player.',
        inputSchema: {
          type: 'object',
          properties: {
            teams: TEAMS_SCHEMA,
            ranks: { type: 'array', items: { type: 'number' } },
            model: { type: 'string', enum: MODELS }
          },
          required: ['teams', 'ranks']
        },
        annotations: { readOnlyHint: true },
        execute: ({ teams, ranks, model }: any) => {
          const t = assertTeams(teams)
          if (!Array.isArray(ranks) || ranks.length !== t.length) {
            throw new Error(`ranks must have one entry per team (${t.length})`)
          }
          const m: ModelName = MODELS.includes(model) ? model : 'plackett_luce'
          return {
            model: m,
            teams: rate(t, ranks.map(Number), m).map((team) =>
              team.map((r) => ({ mu: r.mu, sigma: r.sigma, ordinal: ordinal(r) }))
            )
          }
        }
      },
    {
      name: 'openskill-predict-win',
        title: 'Predict win probabilities',
        description:
          'Probability each team wins an upcoming match. Exact for two teams, pairwise ' +
          'generalisation for three or more.',
        inputSchema: {
          type: 'object',
          properties: { teams: TEAMS_SCHEMA },
          required: ['teams']
        },
        annotations: { readOnlyHint: true },
        execute: ({ teams }: any) => ({ probabilities: predictWin(assertTeams(teams)) })
      },
    {
      name: 'openskill-compare-models',
        title: 'Compare the three Weng-Lin models',
        description:
          'Rate one match under Plackett-Luce, Thurstone-Mosteller and Bradley-Terry to see ' +
          'where they diverge. The last two agree for two teams and separate beyond that.',
        inputSchema: {
          type: 'object',
          properties: { teams: TEAMS_SCHEMA, ranks: { type: 'array', items: { type: 'number' } } },
          required: ['teams', 'ranks']
        },
        annotations: { readOnlyHint: true },
        execute: ({ teams, ranks }: any) => {
          const t = assertTeams(teams)
          const r = (ranks as number[]).map(Number)
          return Object.fromEntries(
            MODELS.map((m) => [m, rate(t, r, m).map((tm) => tm.map((x) => ({ mu: x.mu, sigma: x.sigma })))])
          )
        }
      }
  ]
}

export function useWebMcp() {
  onMounted(async () => {
    const mc = (document as any).modelContext
    if (!mc?.registerTool) return // not supported; nothing to do

    for (const tool of buildWebMcpTools()) {
      try {
        await mc.registerTool(tool)
      } catch (e) {
        // A duplicate name throws InvalidStateError; never break the page over it.
        console.debug('WebMCP registration skipped:', (e as Error).message)
      }
    }
  })
}
