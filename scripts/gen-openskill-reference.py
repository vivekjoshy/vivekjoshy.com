"""
Regenerates scripts/openskill-reference.json from the real openskill package.

The browser port in app/utils/openskill.ts is checked against this fixture on
every build by scripts/verify-openskill.mjs. Re-run this whenever you bump the
openskill version you want to track:

    uv venv && uv pip install openskill
    .venv/bin/python scripts/gen-openskill-reference.py > scripts/openskill-reference.json
"""

import json

from openskill.models import BradleyTerryFull, PlackettLuce, ThurstoneMostellerFull

MODELS = {
    "plackett_luce": PlackettLuce,
    "thurstone_mosteller": ThurstoneMostellerFull,
    "bradley_terry": BradleyTerryFull,
}

CASES = [
    {"name": "1v1 upset", "teams": [[(25.0, 8.333)], [(30.0, 4.0)]], "ranks": [1, 2]},
    {
        "name": "2v2 even",
        "teams": [[(25.0, 8.333), (25.0, 8.333)], [(25.0, 8.333), (25.0, 8.333)]],
        "ranks": [1, 2],
    },
    {
        "name": "3-team ffa",
        "teams": [[(25.0, 8.333)], [(28.0, 6.0)], [(22.0, 7.0)]],
        "ranks": [2, 1, 3],
    },
    {
        "name": "asymmetric",
        "teams": [[(30.0, 3.0), (20.0, 9.0)], [(25.0, 5.0)]],
        "ranks": [1, 2],
    },
]


def main() -> None:
    out: dict = {}
    for name, model_cls in MODELS.items():
        model = model_cls()
        out[name] = []
        for case in CASES:
            teams = [
                [model.rating(mu=mu, sigma=sigma) for (mu, sigma) in team]
                for team in case["teams"]
            ]
            rated = model.rate(teams, ranks=case["ranks"])
            out[name].append(
                {
                    "name": case["name"],
                    "input": case["teams"],
                    "ranks": case["ranks"],
                    "output": [
                        [[round(p.mu, 10), round(p.sigma, 10)] for p in team]
                        for team in rated
                    ],
                }
            )
        t1 = [model.rating(mu=25.0, sigma=8.333)]
        t2 = [model.rating(mu=30.0, sigma=4.0)]
        out[f"{name}_predict_win"] = [round(x, 10) for x in model.predict_win([t1, t2])]

    reference = PlackettLuce()
    out["_constants"] = {
        "mu": reference.mu,
        "sigma": reference.sigma,
        "beta": reference.beta,
        "tau": reference.tau,
        "kappa": reference.kappa,
    }
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
