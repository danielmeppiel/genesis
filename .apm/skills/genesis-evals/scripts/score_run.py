#!/usr/bin/env python3
"""Score one run by walking spawn.json + response.txt pairs.

Per scenario:
  P scenarios need TWO halves: <id>__with.response.txt + <id>__without.response.txt
  N scenarios need ONE half:   <id>__single.response.txt
  R scenarios need ONE half:   <id>__single.response.txt

Convergence (per-category binary ratios):
  P >= 0.8  (with N=3, that means 3/3)
  N >= 0.8  (with N=3, that means 3/3)
  R == 1.0  (zero tolerance, no auto-retry)

Emits <runs-dir>/<run-id>/summary.md.

Usage:
  python score_run.py --run-id <id> \\
                      --runs-dir <runs-dir> \\
                      --scenarios-dir <scenarios-dir>
"""
import argparse
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


def check_substrings(text: str, must_contain, must_not_contain) -> tuple[bool, str]:
    text_lower = text.lower()
    for needle in must_contain or []:
        if needle.lower() not in text_lower:
            return False, f"missing required substring: {needle!r}"
    for needle in must_not_contain or []:
        if needle.lower() in text_lower:
            return False, f"contains forbidden substring: {needle!r}"
    return True, "ok"


def score_p(scenario, run_dir) -> tuple[bool, str]:
    sid = scenario["id"]
    with_path = run_dir / f"{sid}__with.response.txt"
    without_path = run_dir / f"{sid}__without.response.txt"
    if not with_path.exists():
        return False, f"missing {with_path.name}"
    if not without_path.exists():
        return False, f"missing {without_path.name}"
    gate = scenario["pass_gate"]
    ok_with, why_with = check_substrings(
        with_path.read_text(),
        gate.get("with_skill_must_contain"),
        gate.get("with_skill_must_not_contain"),
    )
    if not ok_with:
        return False, f"with-half: {why_with}"
    ok_without, why_without = check_substrings(
        without_path.read_text(),
        gate.get("without_skill_must_contain"),
        gate.get("without_skill_must_not_contain"),
    )
    if not ok_without:
        return False, f"without-half: {why_without}"
    return True, "ok"


def score_single(scenario, run_dir) -> tuple[bool, str]:
    sid = scenario["id"]
    single_path = run_dir / f"{sid}__single.response.txt"
    if not single_path.exists():
        return False, f"missing {single_path.name}"
    gate = scenario["pass_gate"]
    return check_substrings(
        single_path.read_text(),
        gate.get("single_must_contain") or gate.get("with_skill_must_contain"),
        gate.get("single_must_not_contain") or gate.get("with_skill_must_not_contain"),
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--runs-dir", required=True)
    ap.add_argument("--scenarios-dir", required=True)
    args = ap.parse_args()

    run_dir = Path(args.runs_dir) / args.run_id
    if not run_dir.exists():
        sys.stderr.write(f"run dir not found: {run_dir}\n")
        return 2

    scenarios = []
    for path in sorted(Path(args.scenarios_dir).glob("*.yml")):
        data = yaml.safe_load(path.read_text())
        if data.get("retired_in"):
            continue
        scenarios.append(data)

    results = []
    for sc in scenarios:
        if sc["category"] == "P":
            ok, reason = score_p(sc, run_dir)
        else:
            ok, reason = score_single(sc, run_dir)
        spawn_with = run_dir / f"{sc['id']}__with.spawn.json"
        spawn_single = run_dir / f"{sc['id']}__single.spawn.json"
        spawn_record = (
            json.loads(spawn_with.read_text()) if spawn_with.exists()
            else json.loads(spawn_single.read_text()) if spawn_single.exists()
            else {}
        )
        results.append({
            "id": sc["id"],
            "category": sc["category"],
            "description": sc["description"],
            "model": spawn_record.get("requested_model", sc["model"]),
            "ok": ok,
            "reason": reason,
        })

    by_cat = {"P": [], "N": [], "R": []}
    for r in results:
        by_cat[r["category"]].append(r)

    def ratio(rows):
        if not rows:
            return 1.0
        return sum(1 for r in rows if r["ok"]) / len(rows)

    p_ratio = ratio(by_cat["P"])
    n_ratio = ratio(by_cat["N"])
    r_ratio = ratio(by_cat["R"])

    p_pass = p_ratio >= 0.8
    n_pass = n_ratio >= 0.8
    r_pass = r_ratio == 1.0
    converged = p_pass and n_pass and r_pass

    lines = [
        f"# Genesis evals -- run {args.run_id}",
        "",
        "## Convergence gates",
        "",
        f"- P (positive value-add):    {p_ratio:.2f}  gate >= 0.80  -> {'PASS' if p_pass else 'FAIL'}",
        f"- N (dispatch hygiene):      {n_ratio:.2f}  gate >= 0.80  -> {'PASS' if n_pass else 'FAIL'}",
        f"- R (regression):            {r_ratio:.2f}  gate == 1.00  -> {'PASS' if r_pass else 'FAIL'}",
        "",
        f"**Converged: {'YES' if converged else 'NO'}**",
        "",
        "## Per-scenario results",
        "",
        "| ID | Cat | Model | Result | Reason |",
        "|----|-----|-------|--------|--------|",
    ]
    for r in results:
        verdict = "PASS" if r["ok"] else "FAIL"
        lines.append(f"| {r['id']} | {r['category']} | {r['model']} | {verdict} | {r['reason']} |")

    summary_path = run_dir / "summary.md"
    summary_path.write_text("\n".join(lines) + "\n")
    print(str(summary_path))
    print(f"P={p_ratio:.2f} N={n_ratio:.2f} R={r_ratio:.2f} converged={converged}")
    return 0 if converged else 1


if __name__ == "__main__":
    sys.exit(main())
