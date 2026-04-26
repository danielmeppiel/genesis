#!/usr/bin/env python3
"""Validate every scenario YAML against the JSON schema.

Exits non-zero on any failure. Print one line per scenario:
  [OK]   <id>  <path>
  [FAIL] <id>  <path>  <reason>

Usage:
  python validate_scenarios.py --scenarios-dir dev/skills/genesis-evals/scenarios \\
                               --schema      dev/skills/genesis-evals/schema/scenario.schema.json
"""
import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
    from jsonschema import Draft7Validator
except ImportError as exc:
    sys.stderr.write(
        f"missing dep ({exc}); install: pip install -r "
        f"dev/skills/genesis-evals/requirements.txt\n"
    )
    sys.exit(2)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenarios-dir", required=True)
    ap.add_argument("--schema", required=True)
    args = ap.parse_args()

    schema = json.loads(Path(args.schema).read_text())
    validator = Draft7Validator(schema)

    failures = 0
    seen_ids = set()
    files = sorted(Path(args.scenarios_dir).glob("*.yml"))
    if not files:
        sys.stderr.write(f"no scenarios found in {args.scenarios_dir}\n")
        return 2

    for path in files:
        try:
            data = yaml.safe_load(path.read_text())
        except yaml.YAMLError as exc:
            print(f"[FAIL] {path.name}  yaml-parse: {exc}")
            failures += 1
            continue

        errs = list(validator.iter_errors(data))
        if errs:
            for err in errs:
                print(f"[FAIL] {data.get('id', path.stem)}  {path.name}  {err.message}")
            failures += 1
            continue

        sid = data["id"]
        if sid in seen_ids:
            print(f"[FAIL] {sid}  {path.name}  duplicate id")
            failures += 1
            continue
        seen_ids.add(sid)

        if data["id"] != path.stem:
            print(f"[FAIL] {sid}  {path.name}  id does not match filename stem")
            failures += 1
            continue

        print(f"[OK]   {sid}  {path.name}")

    print(f"\n{len(files) - failures}/{len(files)} scenarios valid")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
