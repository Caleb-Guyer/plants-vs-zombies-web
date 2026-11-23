"""Check the release and replay the original inputs for all five Spare Change frames."""
from native_extension import check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-spare.1" and report["status"] == "PASS"
          and report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected Spare Change driver or audio state")
    cases = {(name, speed, 1729 if speed == 1 else 7331)
             for name in ("play", "retry", "resume", "classic-one", "classic-two") for speed in (1, 2)}
    cases.add(("repeat", 1, 1729))
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == cases and len(rows) == len(report["cases"]), "Unexpected set of Bowling games")
    for (name, speed, _), row in rows.items():
        original = name.startswith("classic-")
        wins = 0 if original else 2 if name == "repeat" else 1
        check((row["awards"], row["strikes"], row["spares"]) == (wins, wins * 2, wins * 3),
              "Incorrect frame results or completion award")
        check((row["saves"], row["retries"], row["classicRolls"]) ==
              (int(name == "resume"), int(name == "retry"), int(original)), "Wrong resume, retry or control")
        check(bool(row["doubleUpdates"]) == (speed == 2), "Game ran at the wrong speed")
    return rows


if __name__ == "__main__":
    run("spare", verify_results, ("strikes", "spares", "saves", "retries", "awards", "classicRolls"))
