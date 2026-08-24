/**
 * Model Context Protocol endpoint.
 *
 * Exposes the Weng-Lin rating models as agent-callable tools over the
 * Streamable HTTP transport, so an agent can use OpenSkill without a Python
 * install. The maths is imported from the same module the /openskill page
 * uses, so it inherits the build-time check against openskill.py — the
 * endpoint cannot silently drift from the library.
 *
 * JSON-RPC 2.0. Handles initialize, tools/list and tools/call.
 */
import {
  rate, predictWin, ordinal, OPENSKILL_DEFAULTS,
  type Rating, type ModelName
} from '../../app/utils/openskill'

const PROTOCOL_VERSION = '2025-06-18'

/**
 * Hard limits. The rating maths is quadratic in team count, so an unbounded
 * public endpoint is a denial-of-service vector: measured 0.17s at 3,000 teams,
 * 0.64s at 6,000, and multi-minute CPU at six figures — enough to occupy and
 * bill a serverless function indefinitely. These caps sit far above any real
 * match and well below where the cost becomes interesting to an attacker.
 */
const LIMITS = {
  teams: 64,
  playersPerTeam: 64,
  totalPlayers: 512,
  batch: 16
}
const MODELS: ModelName[] = ['plackett_luce', 'thurstone_mosteller', 'bradley_terry']

const TEAM_SCHEMA = {
  type: 'array',
  description:
    'Teams in the match. Each team is an array of players; each player is {mu, sigma}. ' +
    `Defaults are mu=${OPENSKILL_DEFAULTS.mu}, sigma=25/3.`,
  items: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        mu: { type: 'number', description: 'Mean skill estimate.' },
        sigma: { type: 'number', description: 'Standard deviation; uncertainty about mu.' }
      },
      required: ['mu', 'sigma'],
      additionalProperties: false
    }
  },
  minItems: 2
}

const TOOLS = [
  {
    name: 'rate_match',
    description:
      'Update ratings from a finished match. Ranks are 1-based and ascending, so [1,2] means the ' +
      'first team won; equal values are a draw. Returns each player\'s new mu and sigma.',
    inputSchema: {
      type: 'object',
      properties: {
        teams: TEAM_SCHEMA,
        ranks: {
          type: 'array',
          items: { type: 'number' },
          description: 'Finishing position per team, 1-based ascending. Ties allowed.'
        },
        model: {
          type: 'string',
          enum: MODELS,
          description: 'Weng-Lin variant. Defaults to plackett_luce, as the library does.'
        }
      },
      required: ['teams', 'ranks'],
      additionalProperties: false
    }
  },
  {
    name: 'predict_win',
    description:
      'Probability that each team wins an upcoming match. Exact for two teams; the pairwise ' +
      'generalisation for three or more.',
    inputSchema: {
      type: 'object',
      properties: { teams: TEAM_SCHEMA },
      required: ['teams'],
      additionalProperties: false
    }
  },
  {
    name: 'compare_models',
    description:
      'Rate the same match under all three Weng-Lin models at once, to see where they diverge. ' +
      'Bradley-Terry and Plackett-Luce agree for two teams and separate for three or more.',
    inputSchema: {
      type: 'object',
      properties: { teams: TEAM_SCHEMA, ranks: { type: 'array', items: { type: 'number' } } },
      required: ['teams', 'ranks'],
      additionalProperties: false
    }
  },
  {
    name: 'ordinal',
    description:
      'Conservative single-number skill for display or sorting: mu - z*sigma, z=3 by default. ' +
      'Penalises players the system is still unsure about.',
    inputSchema: {
      type: 'object',
      properties: {
        mu: { type: 'number' },
        sigma: { type: 'number' },
        z: { type: 'number', description: 'Standard deviations to subtract. Default 3.' }
      },
      required: ['mu', 'sigma'],
      additionalProperties: false
    }
  }
]

const ok = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id, result })
const err = (id: unknown, code: number, message: string) => ({
  jsonrpc: '2.0', id, error: { code, message }
})
const text = (value: unknown) => ({
  content: [{ type: 'text', text: JSON.stringify(value, null, 2) }]
})

function assertTeams(teams: unknown): Rating[][] {
  if (!Array.isArray(teams) || teams.length < 2) {
    throw new Error('teams must be an array of at least two teams')
  }
  if (teams.length > LIMITS.teams) {
    throw new Error(`too many teams: ${teams.length} (limit ${LIMITS.teams})`)
  }
  let total = 0
  return teams.map((team, i) => {
    if (!Array.isArray(team) || !team.length) throw new Error(`team ${i} must be a non-empty array`)
    if (team.length > LIMITS.playersPerTeam) {
      throw new Error(`team ${i} has too many players: ${team.length} (limit ${LIMITS.playersPerTeam})`)
    }
    total += team.length
    if (total > LIMITS.totalPlayers) {
      throw new Error(`too many players in total (limit ${LIMITS.totalPlayers})`)
    }
    return team.map((p, j) => {
      const mu = Number((p as Rating)?.mu)
      const sigma = Number((p as Rating)?.sigma)
      if (!Number.isFinite(mu) || !Number.isFinite(sigma)) {
        throw new Error(`team ${i} player ${j} needs finite mu and sigma`)
      }
      if (sigma <= 0) throw new Error(`team ${i} player ${j}: sigma must be positive`)
      // sigma is squared internally; 1e308 overflows to Infinity and the tool
      // would return nulls with no error flag.
      if (Math.abs(mu) > 1e6 || sigma > 1e6) {
        throw new Error(`team ${i} player ${j}: mu and sigma must be within +/-1e6`)
      }
      return { mu, sigma }
    })
  })
}

function assertRanks(ranks: unknown, n: number): number[] {
  if (!Array.isArray(ranks) || ranks.length !== n) {
    throw new Error(`ranks must have one entry per team (${n})`)
  }
  return ranks.map((r) => {
    const v = Number(r)
    if (!Number.isFinite(v)) throw new Error('ranks must be finite numbers')
    return v
  })
}

function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'rate_match': {
      const teams = assertTeams(args.teams)
      const ranks = assertRanks(args.ranks, teams.length)
      const model = (args.model as ModelName) ?? 'plackett_luce'
      if (!MODELS.includes(model)) throw new Error(`unknown model: ${model}`)
      const rated = rate(teams, ranks, model)
      return text({
        model,
        teams: rated.map((team, i) =>
          team.map((r, j) => ({
            mu: r.mu,
            sigma: r.sigma,
            ordinal: ordinal(r),
            deltaMu: r.mu - teams[i]![j]!.mu,
            deltaSigma: r.sigma - teams[i]![j]!.sigma
          }))
        )
      })
    }
    case 'predict_win': {
      const teams = assertTeams(args.teams)
      return text({ probabilities: predictWin(teams) })
    }
    case 'compare_models': {
      const teams = assertTeams(args.teams)
      const ranks = assertRanks(args.ranks, teams.length)
      const byModel = Object.fromEntries(
        MODELS.map((m) => [m, rate(teams, ranks, m).map((t) => t.map((r) => ({ mu: r.mu, sigma: r.sigma })))])
      )
      return text({
        models: byModel,
        note:
          'Bradley-Terry and Plackett-Luce coincide for two teams and diverge for three or more.'
      })
    }
    case 'ordinal': {
      const mu = Number(args.mu)
      const sigma = Number(args.sigma)
      if (!Number.isFinite(mu) || !Number.isFinite(sigma)) throw new Error('mu and sigma required')
      const z = args.z === undefined ? 3 : Number(args.z)
      if (!Number.isFinite(z)) throw new Error('z must be a finite number')
      if (Math.abs(mu) > 1e6 || sigma <= 0 || sigma > 1e6) {
        throw new Error('mu and sigma must be finite, with sigma positive and within 1e6')
      }
      return text({ ordinal: ordinal({ mu, sigma }, z), z })
    }
    default:
      throw new Error(`unknown tool: ${name}`)
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, mcp-protocol-version',
    'Cache-Control': 'no-store'
  })

  const body = await readBody(event)
  const messages = Array.isArray(body) ? body : [body]

  if (messages.length > LIMITS.batch) {
    setResponseStatus(event, 400)
    return err(null, -32600, `batch too large: ${messages.length} (limit ${LIMITS.batch})`)
  }

  const responses: unknown[] = []

  for (const msg of messages) {
    // A non-object body destructures to undefined and would otherwise be
    // silently treated as a notification and 202'd.
    if (typeof msg !== 'object' || msg === null) {
      responses.push(err(null, -32600, 'invalid request: expected a JSON-RPC object'))
      continue
    }
    const { id, method, params } = msg
    // Notifications carry no id and expect no response.
    const isNotification = id === undefined || id === null

    try {
      if (method === 'initialize') {
        responses.push(
          ok(id, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: 'openskill', version: '1.0.0' },
            instructions:
              'Bayesian rating for asymmetric multi-team, multiplayer matches, implementing the ' +
              'Weng-Lin models. Same implementation as vivekjoshy.com/openskill, checked against ' +
              'openskill.py on every deploy.'
          })
        )
      } else if (method === 'tools/list') {
        responses.push(ok(id, { tools: TOOLS }))
      } else if (method === 'tools/call') {
        const { name, arguments: args } = params ?? {}
        try {
          responses.push(ok(id, callTool(name, args ?? {})))
        } catch (e) {
          // Tool failures are results with isError, not protocol errors.
          responses.push(
            ok(id, { content: [{ type: 'text', text: (e as Error).message }], isError: true })
          )
        }
      } else if (isNotification) {
        continue
      } else {
        responses.push(err(id, -32601, `method not found: ${method}`))
      }
    } catch (e) {
      if (!isNotification) responses.push(err(id, -32603, (e as Error).message))
    }
  }

  if (!responses.length) {
    setResponseStatus(event, 202)
    return null
  }
  return Array.isArray(body) ? responses : responses[0]
})
