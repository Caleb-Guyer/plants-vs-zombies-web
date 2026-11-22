"""Authenticate the Whack a Sprout build and its muted native gameplay replays."""
from native_extension import CASES, check, run

PLAY = ("ticks", "swings", "rising", "armorHits", "fireStrikes", "sunClicks", "graveBusters",
        "puffSeen", "peaSeen", "wallSeen", "tallSeen", "pepperSeen")
CONTROLS = ("missCases", "armorCases", "chainCases", "fuseCases", "burnCases", "classicWhack", "familyBowling", "legacyProfiles")


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zwhack.1" and report["status"] == "PASS" and
          report["driver"] == artifacts and report["audioDeviceOpened"] is False,
          "Incorrect Whack engine, driver or audio setting")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete Whack replay matrix")
    for (case, speed, seed), row in rows.items():
        check(bool(row["doubleUpdates"]) == (speed == 2), "Incorrect native game speed")
        check(row["saves"] == (case == "resume") and row["losses"] == (case == "retry"), "Missing Continue or Retry")
        check(row["replayBags"] == (case == "solution" and speed == 1 and seed == 1729), "Incorrect repeat reward")
        if case == "classic":
            check(row["won"] == row["waves"] == 0 and all(row[k] > 0 for k in CONTROLS),
                  "Missing hit, blast, fuse, classic mode or save control")
        else:
            check(row["won"] == 1 and row["waves"] == 12 and all(row[k] > 0 for k in PLAY),
                  "Incomplete 12-wave Whack game")
    return rows


if __name__ == "__main__":
    run("zwhack", verify_results, ("won", "waves", "saves", "losses", "replayBags", *CONTROLS))
