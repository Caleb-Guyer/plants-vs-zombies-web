"""Authenticate and replay ZomBotany Bowling with sound off."""
from native_extension import CASES, check, run

ROLLS = ("ordinaryRolls", "explosiveRolls", "giantRolls", "ordinaryHits", "explosiveHits", "giantHits", "ricochets")
HEADS = ("peaSeen", "wallSeen", "jalapenoSeen", "gatlingSeen", "tallSeen")
CONTROLS = ("classicBowling", "familyRoof")


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zbowling.1" and report["status"] == "PASS" and
          report["driver"] == artifacts and report["audioDeviceOpened"] is False,
          "Wrong Bowling engine, replay driver or audio setting")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete Bowling replay matrix")
    for (case, speed, seed), row in rows.items():
        check((row["doubleUpdates"] > 0) == (speed == 2), "Wrong native game speed")
        check(row["saves"] == (case == "resume") and row["losses"] == (case == "retry"),
              "Missing Continue or Retry")
        check(row["replayBags"] == (case == "solution" and speed == 1 and seed == 1729),
              "Wrong repeat-win award")
        if case == "classic":
            check(row["won"] == row["waves"] == 0 and all(row[key] > 0 for key in CONTROLS),
                  "Original Bowling or neighboring Roof control failed")
        else:
            check(row["won"] == 1 and row["waves"] == 20, "Incomplete Bowling game")
            for key in ("ticks", *ROLLS, *HEADS):
                check(row[key] > 0, f"Missing Bowling observation {key}")
    return rows


if __name__ == "__main__":
    run("zbowling", verify_results, ("won", "waves", "saves", "losses", "replayBags", *CONTROLS))
