import { d as defineEventHandler, s as setResponseHeaders, r as readBody, a as setResponseStatus } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const OPENSKILL_DEFAULTS = {
  mu: 25,
  beta: 25 / 6,
  tau: 25 / 300,
  kappa: 1e-4,
  epsilon: 0.1
};
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}
function phiMajor(x) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}
function phiMinor(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
const EPS = Number.EPSILON;
function v(x, t) {
  const xt = x - t;
  const denom = phiMajor(xt);
  return denom < EPS ? -xt : phiMinor(xt) / denom;
}
function w(x, t) {
  const xt = x - t;
  const denom = phiMajor(xt);
  if (denom < EPS) return x < 0 ? 1 : 0;
  const vv = v(x, t);
  return vv * (vv + xt);
}
function vt(x, t) {
  const xx = Math.abs(x);
  const b = phiMajor(t - xx) - phiMajor(-t - xx);
  if (b < 1e-5) return x < 0 ? -x - t : -x + t;
  const a = phiMinor(-t - xx) - phiMinor(t - xx);
  return (x < 0 ? -a : a) / b;
}
function wt(x, t) {
  const xx = Math.abs(x);
  const b = phiMajor(t - xx) - phiMajor(-t - xx);
  if (b < EPS) return 1;
  const vv = vt(x, t);
  return ((t - xx) * phiMinor(t - xx) + (t + xx) * phiMinor(-t - xx)) / b + vv * vv;
}
function calculateRankings(ranks) {
  const sorted = [...ranks].sort((a, b) => a - b);
  const rankMap = /* @__PURE__ */ new Map();
  sorted.forEach((value, index) => {
    if (!rankMap.has(value)) rankMap.set(value, index);
  });
  return ranks.map((r) => rankMap.get(r));
}
function calculateTeamRatings(teams, ranks) {
  const dense = calculateRankings(ranks);
  return teams.map((team, index) => {
    let mu = 0;
    let sigmaSquared = 0;
    for (const p of team) {
      mu += p.mu;
      sigmaSquared += p.sigma * p.sigma;
    }
    return { mu, sigmaSquared, team, rank: dense[index] };
  });
}
function applyTau(teams, tau) {
  const tauSq = tau * tau;
  return teams.map((t) => t.map((p) => ({ mu: p.mu, sigma: Math.sqrt(p.sigma * p.sigma + tauSq) })));
}
function applyUpdate(tr, omega, delta, kappa) {
  return tr.team.map((p) => {
    const sigmaSq = p.sigma * p.sigma;
    const share = sigmaSq / tr.sigmaSquared;
    const mu = p.mu + share * omega;
    const sigma = p.sigma * Math.sqrt(Math.max(1 - share * delta, kappa));
    return { mu, sigma };
  });
}
function ratePlackettLuce(teams, ranks) {
  const { beta, kappa } = OPENSKILL_DEFAULTS;
  const teamRatings = calculateTeamRatings(teams, ranks);
  let collective = 0;
  for (const t of teamRatings) collective += t.sigmaSquared + beta * beta;
  const c = Math.sqrt(collective);
  const sumQ = new Array(teamRatings.length).fill(0);
  for (const teamI of teamRatings) {
    const summed = Math.exp(teamI.mu / c);
    teamRatings.forEach((teamQ, q) => {
      if (teamI.rank >= teamQ.rank) sumQ[q] += summed;
    });
  }
  const a = teamRatings.map((i) => teamRatings.filter((q) => q.rank === i.rank).length);
  return teamRatings.map((teamI, i) => {
    let omega = 0;
    let delta = 0;
    const iMuOverC = Math.exp(teamI.mu / c);
    teamRatings.forEach((teamQ, q) => {
      const quotient = iMuOverC / sumQ[q];
      if (teamQ.rank <= teamI.rank) {
        delta += quotient * (1 - quotient) / a[q];
        omega += q === i ? (1 - quotient) / a[q] : -quotient / a[q];
      }
    });
    omega *= teamI.sigmaSquared / c;
    delta *= teamI.sigmaSquared / (c * c);
    delta *= Math.sqrt(teamI.sigmaSquared) / c;
    return applyUpdate(teamI, omega, delta, kappa);
  });
}
function rateThurstoneMosteller(teams, ranks) {
  const { beta, kappa, epsilon } = OPENSKILL_DEFAULTS;
  const teamRatings = calculateTeamRatings(teams, ranks);
  return teamRatings.map((teamI, i) => {
    let omega = 0;
    let delta = 0;
    teamRatings.forEach((teamQ, q) => {
      if (q === i) return;
      const cIq = Math.sqrt(teamI.sigmaSquared + teamQ.sigmaSquared + 2 * beta * beta);
      const deltaMu = (teamI.mu - teamQ.mu) / cIq;
      const sigmaSqToCiq = teamI.sigmaSquared / cIq;
      const gamma = Math.sqrt(teamI.sigmaSquared) / cIq;
      const epsOverCiq = epsilon / cIq;
      if (teamQ.rank > teamI.rank) {
        omega += sigmaSqToCiq * v(deltaMu, epsOverCiq);
        delta += gamma * sigmaSqToCiq / cIq * w(deltaMu, epsOverCiq);
      } else if (teamQ.rank < teamI.rank) {
        omega += -sigmaSqToCiq * v(-deltaMu, epsOverCiq);
        delta += gamma * sigmaSqToCiq / cIq * w(-deltaMu, epsOverCiq);
      } else {
        omega += sigmaSqToCiq * vt(deltaMu, epsOverCiq);
        delta += gamma * sigmaSqToCiq / cIq * wt(deltaMu, epsOverCiq);
      }
    });
    return applyUpdate(teamI, omega, delta, kappa);
  });
}
function rateBradleyTerry(teams, ranks) {
  const { beta, kappa } = OPENSKILL_DEFAULTS;
  const teamRatings = calculateTeamRatings(teams, ranks);
  return teamRatings.map((teamI, i) => {
    let omega = 0;
    let delta = 0;
    teamRatings.forEach((teamQ, q) => {
      if (q === i) return;
      const cIq = Math.sqrt(teamI.sigmaSquared + teamQ.sigmaSquared + 2 * beta * beta);
      const piq = 1 / (1 + Math.exp((teamQ.mu - teamI.mu) / cIq));
      const sigmaSqToCiq = teamI.sigmaSquared / cIq;
      const gamma = Math.sqrt(teamI.sigmaSquared) / cIq;
      let s = 0;
      if (teamQ.rank > teamI.rank) s = 1;
      else if (teamQ.rank === teamI.rank) s = 0.5;
      omega += sigmaSqToCiq * (s - piq);
      delta += gamma * sigmaSqToCiq / cIq * piq * (1 - piq);
    });
    return applyUpdate(teamI, omega, delta, kappa);
  });
}
function rate(teams, ranks, model = "plackett_luce") {
  const withTau = applyTau(teams, OPENSKILL_DEFAULTS.tau);
  if (model === "thurstone_mosteller") return rateThurstoneMosteller(withTau, ranks);
  if (model === "bradley_terry") return rateBradleyTerry(withTau, ranks);
  return ratePlackettLuce(withTau, ranks);
}
function predictWin(teams) {
  const { beta } = OPENSKILL_DEFAULTS;
  const agg = teams.map((team) => {
    let mu = 0;
    let sigmaSquared = 0;
    for (const p of team) {
      mu += p.mu;
      sigmaSquared += p.sigma * p.sigma;
    }
    return { mu, sigmaSquared };
  });
  if (agg.length === 2) {
    const [a, b] = agg;
    const p = phiMajor((a.mu - b.mu) / Math.sqrt(2 * beta * beta + a.sigmaSquared + b.sigmaSquared));
    return [p, 1 - p];
  }
  const n = agg.length;
  const pairwise = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const x = agg[i];
      const y = agg[j];
      pairwise.push(phiMajor((x.mu - y.mu) / Math.sqrt(2 * beta * beta + x.sigmaSquared + y.sigmaSquared)));
    }
  }
  const raw = [];
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = i * (n - 1); j < (i + 1) * (n - 1); j++) s += pairwise[j];
    raw.push(s / (n - 1));
  }
  const total = raw.reduce((x, y) => x + y, 0);
  return raw.map((p) => p / total);
}
function ordinal(r, z = 3) {
  return r.mu - z * r.sigma;
}

const PROTOCOL_VERSION = "2025-06-18";
const LIMITS = {
  teams: 64,
  playersPerTeam: 64,
  totalPlayers: 512,
  batch: 16
};
const MODELS = ["plackett_luce", "thurstone_mosteller", "bradley_terry"];
const TEAM_SCHEMA = {
  type: "array",
  description: `Teams in the match. Each team is an array of players; each player is {mu, sigma}. Defaults are mu=${OPENSKILL_DEFAULTS.mu}, sigma=25/3.`,
  items: {
    type: "array",
    items: {
      type: "object",
      properties: {
        mu: { type: "number", description: "Mean skill estimate." },
        sigma: { type: "number", description: "Standard deviation; uncertainty about mu." }
      },
      required: ["mu", "sigma"],
      additionalProperties: false
    }
  },
  minItems: 2
};
const TOOLS = [
  {
    name: "rate_match",
    description: "Update ratings from a finished match. Ranks are 1-based and ascending, so [1,2] means the first team won; equal values are a draw. Returns each player's new mu and sigma.",
    inputSchema: {
      type: "object",
      properties: {
        teams: TEAM_SCHEMA,
        ranks: {
          type: "array",
          items: { type: "number" },
          description: "Finishing position per team, 1-based ascending. Ties allowed."
        },
        model: {
          type: "string",
          enum: MODELS,
          description: "Weng-Lin variant. Defaults to plackett_luce, as the library does."
        }
      },
      required: ["teams", "ranks"],
      additionalProperties: false
    }
  },
  {
    name: "predict_win",
    description: "Probability that each team wins an upcoming match. Exact for two teams; the pairwise generalisation for three or more.",
    inputSchema: {
      type: "object",
      properties: { teams: TEAM_SCHEMA },
      required: ["teams"],
      additionalProperties: false
    }
  },
  {
    name: "compare_models",
    description: "Rate the same match under all three Weng-Lin models at once, to see where they diverge. Bradley-Terry and Plackett-Luce agree for two teams and separate for three or more.",
    inputSchema: {
      type: "object",
      properties: { teams: TEAM_SCHEMA, ranks: { type: "array", items: { type: "number" } } },
      required: ["teams", "ranks"],
      additionalProperties: false
    }
  },
  {
    name: "ordinal",
    description: "Conservative single-number skill for display or sorting: mu - z*sigma, z=3 by default. Penalises players the system is still unsure about.",
    inputSchema: {
      type: "object",
      properties: {
        mu: { type: "number" },
        sigma: { type: "number" },
        z: { type: "number", description: "Standard deviations to subtract. Default 3." }
      },
      required: ["mu", "sigma"],
      additionalProperties: false
    }
  }
];
const ok = (id, result) => ({ jsonrpc: "2.0", id, result });
const err = (id, code, message) => ({
  jsonrpc: "2.0",
  id,
  error: { code, message }
});
const text = (value) => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }]
});
function assertTeams(teams) {
  if (!Array.isArray(teams) || teams.length < 2) {
    throw new Error("teams must be an array of at least two teams");
  }
  if (teams.length > LIMITS.teams) {
    throw new Error(`too many teams: ${teams.length} (limit ${LIMITS.teams})`);
  }
  let total = 0;
  return teams.map((team, i) => {
    if (!Array.isArray(team) || !team.length) throw new Error(`team ${i} must be a non-empty array`);
    if (team.length > LIMITS.playersPerTeam) {
      throw new Error(`team ${i} has too many players: ${team.length} (limit ${LIMITS.playersPerTeam})`);
    }
    total += team.length;
    if (total > LIMITS.totalPlayers) {
      throw new Error(`too many players in total (limit ${LIMITS.totalPlayers})`);
    }
    return team.map((p, j) => {
      const mu = Number(p == null ? void 0 : p.mu);
      const sigma = Number(p == null ? void 0 : p.sigma);
      if (!Number.isFinite(mu) || !Number.isFinite(sigma)) {
        throw new Error(`team ${i} player ${j} needs finite mu and sigma`);
      }
      if (sigma <= 0) throw new Error(`team ${i} player ${j}: sigma must be positive`);
      if (Math.abs(mu) > 1e6 || sigma > 1e6) {
        throw new Error(`team ${i} player ${j}: mu and sigma must be within +/-1e6`);
      }
      return { mu, sigma };
    });
  });
}
function assertRanks(ranks, n) {
  if (!Array.isArray(ranks) || ranks.length !== n) {
    throw new Error(`ranks must have one entry per team (${n})`);
  }
  return ranks.map((r) => {
    const v = Number(r);
    if (!Number.isFinite(v)) throw new Error("ranks must be finite numbers");
    return v;
  });
}
function callTool(name, args) {
  var _a;
  switch (name) {
    case "rate_match": {
      const teams = assertTeams(args.teams);
      const ranks = assertRanks(args.ranks, teams.length);
      const model = (_a = args.model) != null ? _a : "plackett_luce";
      if (!MODELS.includes(model)) throw new Error(`unknown model: ${model}`);
      const rated = rate(teams, ranks, model);
      return text({
        model,
        teams: rated.map(
          (team, i) => team.map((r, j) => ({
            mu: r.mu,
            sigma: r.sigma,
            ordinal: ordinal(r),
            deltaMu: r.mu - teams[i][j].mu,
            deltaSigma: r.sigma - teams[i][j].sigma
          }))
        )
      });
    }
    case "predict_win": {
      const teams = assertTeams(args.teams);
      return text({ probabilities: predictWin(teams) });
    }
    case "compare_models": {
      const teams = assertTeams(args.teams);
      const ranks = assertRanks(args.ranks, teams.length);
      const byModel = Object.fromEntries(
        MODELS.map((m) => [m, rate(teams, ranks, m).map((t) => t.map((r) => ({ mu: r.mu, sigma: r.sigma })))])
      );
      return text({
        models: byModel,
        note: "Bradley-Terry and Plackett-Luce coincide for two teams and diverge for three or more."
      });
    }
    case "ordinal": {
      const mu = Number(args.mu);
      const sigma = Number(args.sigma);
      if (!Number.isFinite(mu) || !Number.isFinite(sigma)) throw new Error("mu and sigma required");
      const z = args.z === void 0 ? 3 : Number(args.z);
      if (!Number.isFinite(z)) throw new Error("z must be a finite number");
      if (Math.abs(mu) > 1e6 || sigma <= 0 || sigma > 1e6) {
        throw new Error("mu and sigma must be finite, with sigma positive and within 1e6");
      }
      return text({ ordinal: ordinal({ mu, sigma }, z), z });
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}
const mcp_post = defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type, mcp-protocol-version",
    "Cache-Control": "no-store"
  });
  const body = await readBody(event);
  const messages = Array.isArray(body) ? body : [body];
  if (messages.length > LIMITS.batch) {
    setResponseStatus(event, 400);
    return err(null, -32600, `batch too large: ${messages.length} (limit ${LIMITS.batch})`);
  }
  const responses = [];
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      responses.push(err(null, -32600, "invalid request: expected a JSON-RPC object"));
      continue;
    }
    const { id, method, params } = msg;
    const isNotification = id === void 0 || id === null;
    try {
      if (method === "initialize") {
        responses.push(
          ok(id, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: "openskill", version: "1.0.0" },
            instructions: "Bayesian rating for asymmetric multi-team, multiplayer matches, implementing the Weng-Lin models. Same implementation as vivekjoshy.com/openskill, checked against openskill.py on every deploy."
          })
        );
      } else if (method === "tools/list") {
        responses.push(ok(id, { tools: TOOLS }));
      } else if (method === "tools/call") {
        const { name, arguments: args } = params != null ? params : {};
        try {
          responses.push(ok(id, callTool(name, args != null ? args : {})));
        } catch (e) {
          responses.push(
            ok(id, { content: [{ type: "text", text: e.message }], isError: true })
          );
        }
      } else if (isNotification) {
        continue;
      } else {
        responses.push(err(id, -32601, `method not found: ${method}`));
      }
    } catch (e) {
      if (!isNotification) responses.push(err(id, -32603, e.message));
    }
  }
  if (!responses.length) {
    setResponseStatus(event, 202);
    return null;
  }
  return Array.isArray(body) ? responses : responses[0];
});

export { mcp_post as default };
//# sourceMappingURL=mcp.post.mjs.map
