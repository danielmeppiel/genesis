#!/usr/bin/env python3
"""Record the deterministic pre-spawn metadata for one (scenario, half).

Writes <runs-dir>/<run-id>/<scenario-id>__<half>.spawn.json BEFORE the
parent invokes the harness's task tool. This file is IMMUTABLE -- the
child never sees it and cannot overwrite. It is the source of truth for
'what we asked for' (model, prompt, loaded skills) versus 'what came back'
(child's response).

Usage:
  python spawn_record.py --scenario <path-to-scenario.yml> \\
                         --half     <with|without|single> \\
                         --run-id   <run-id> \\
                         --runs-dir <runs-dir>
"""
import argparse
import datetime as dt
import hashlib
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError as exc:
    sys.stderr.write(
        f"missing dep ({exc}); install: pip install -r "
        f".apm/skills/genesis-evals/requirements.txt\n"
    )
    sys.exit(2)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenario", required=True)
    ap.add_argument("--half", required=True, choices=["with", "without", "single"])
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--runs-dir", required=True)
    args = ap.parse_args()

    scenario_path = Path(args.scenario)
    raw = scenario_path.read_text()
    data = yaml.safe_load(raw)

    if "model" not in data or not data["model"]:
        sys.stderr.write(
            f"REFUSE TO SPAWN: scenario {scenario_path.name} has no 'model' field. "
            "Genesis-evals requires deterministic model declaration per scenario.\n"
        )
        return 3

    if data.get("retired_in"):
        sys.stderr.write(
            f"REFUSE TO SPAWN: scenario {data['id']} retired in {data['retired_in']}\n"
        )
        return 4

    loaded = list(data.get("loaded_skills", []))
    if args.half == "without":
        loaded = [s for s in loaded if s != "genesis"]

    run_dir = Path(args.runs_dir) / args.run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    out = run_dir / f"{data['id']}__{args.half}.spawn.json"

    record = {
        "scenario_id": data["id"],
        "category": data["category"],
        "half": args.half,
        "requested_model": data["model"],
        "prompt": data["prompt"],
        "loaded_skills_requested": loaded,
        "scenario_sha256": hashlib.sha256(raw.encode("utf-8")).hexdigest(),
        "scenario_path": str(scenario_path),
        "frozen_since": data["frozen_since"],
        "timestamp_iso": dt.datetime.now(dt.timezone.utc).isoformat(),
        "run_id": args.run_id,
    }
    out.write_text(json.dumps(record, indent=2) + "\n")
    print(str(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
