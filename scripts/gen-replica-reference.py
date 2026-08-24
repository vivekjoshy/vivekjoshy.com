"""
Regenerates scripts/replica-reference.json.

Mirrors Opinion@nca opinion/loss.py — LossUtilities.circular_distance and
LossUtilities.create_circular_target_distributions — in pure Python, so the
browser port in app/utils/replica-loss.ts can be checked against it without
a torch install.

    python scripts/gen-replica-reference.py > scripts/replica-reference.json
"""

import json

NUM_COLORS = 10
NUM_REPLICAS = 10


def circular_distance(a: int, b: int, num_colors: int = NUM_COLORS) -> int:
    direct = abs(a - b)
    return min(direct, num_colors - direct)


def create_circular_target_distributions(
    num_colors: int, num_replicas: int, spillover: float
) -> list[list[float]]:
    total_classes = num_colors * num_replicas
    distributions = [[0.0] * total_classes for _ in range(num_colors)]

    for target_color in range(num_colors):
        distances = [circular_distance(target_color, c, num_colors) for c in range(num_colors)]

        weights = [0.0 if d == 0 else 1.0 / d for d in distances]
        weight_sum = sum(weights)
        if weight_sum > 0:
            weights = [w / weight_sum for w in weights]

        for c in range(num_colors):
            start = c * num_replicas
            if c == target_color:
                per_replica = (1.0 - spillover) / num_replicas
            else:
                per_replica = (spillover * weights[c]) / num_replicas
            for i in range(start, start + num_replicas):
                distributions[target_color][i] = per_replica

    return distributions


def main() -> None:
    out = {
        "_constants": {
            "num_colors": NUM_COLORS,
            "num_replicas": NUM_REPLICAS,
            "spillover": 0.03,
            "entropy_weight": 0.01,
            "focal_gamma": 2.0,
        },
        "circular_distance": [
            {"a": a, "b": b, "d": circular_distance(a, b)}
            for a, b in [(0, 1), (0, 9), (0, 5), (3, 7), (2, 2), (8, 1), (4, 9)]
        ],
        "distributions": {},
    }
    for s in (0.0, 0.03, 0.1, 0.35):
        out["distributions"][str(s)] = create_circular_target_distributions(
            NUM_COLORS, NUM_REPLICAS, s
        )
    print(json.dumps(out))


if __name__ == "__main__":
    main()
