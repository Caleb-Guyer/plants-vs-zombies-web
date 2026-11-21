"""Authenticate and replay the pin and roller update to ZomBotany Bowling."""
from native_extension import CASES, check, run

ROLLS = ("ordinaryRolls", "explosiveRolls", "giantRolls", "tallRolls", "pumpkinRolls",
         "ordinaryHits", "explosiveHits", "giantHits", "ricochets")
HEADS = ("peaSeen", "wallSeen", "jalapenoSeen", "gatlingSeen", "tallSeen",
         "doorSeen", "squashSeen", "iceSeen")
CONTROLS = ("classicBowling", "familyRoof", "coneZone", "doorCases", "squashCases",
            "freezeCases", "heavyCases", "splitCases", "edgeSplits", "legacyContinues", "legacyTrophies")


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zpins.1" and report["status"] == "PASS" and
          report["driver"] == artifacts and report["audioDeviceOpened"] is False,
          "Incorrect Bowling engine, replay driver or audio setting")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete Bowling replay matrix")
    for (case, speed, seed), row in rows.items():
        check(bool(row["doubleUpdates"]) == (speed == 2), "Incorrect native game speed")
        check(row["saves"] == (case == "resume") and row["losses"] == (case == "retry"),
              "Missing Continue or Retry")
        check(row["replayBags"] == (case == "solution" and speed == 1 and seed == 1729),
              "Incorrect replay award")
        if case == "classic":
            check(row["won"] == row["waves"] == 0 and all(row[k] > 0 for k in CONTROLS),
                  "Missing native pin, roller, previous-version or classic control")
        else:
            check(row["won"] == 1 and row["waves"] == 20, "Incomplete 20-wave game")
            for key in ("ticks", *ROLLS, *HEADS):
                check(row[key] > 0, f"Missing Bowling observation {key}")
    return rows


if __name__ == "__main__":
    run("zpins", verify_results, ("won", "waves", "saves", "losses", "replayBags", *CONTROLS))
