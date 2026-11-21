"""Authenticate and silently replay the five flags of ZomBotany Survival Roof."""
from native_extension import CASES, check, run

CONTROLS = ("classicRoof", "familyFog", "blockedLobs", "landedLobs", "butterStops", "melonSplash")


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zsroof.1" and report["status"] == "PASS" and
          report["driver"] == artifacts and report["audioDeviceOpened"] is False,
          "Unexpected Roof engine, replay executable or audio output")
    rows = {(row["case"], row["speed"], row["seed"]): row for row in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete Roof playthrough matrix")
    for (case, speed, _), row in rows.items():
        check((row["doubleUpdates"] > 0) == (speed == 2), "Incorrect native game speed")
        check(row["saves"] == (case == "resume") and row["losses"] == (case == "retry"),
              "Continue or Retry was not exercised")
        if case == "classic":
            check(row["flags"] == row["repicks"] == 0, "A control counted as a win")
            for field in CONTROLS:
                check(row[field] > 0, f"Missing Roof control {field}")
            continue
        check(row["flags"] == 5 and row["repicks"] == 4, "Incomplete five-flag Roof course")
        for field in ("ticks", "placements", "sunClicks", "sunSpent", "skySun", "flowerPots", "supportedPlants",
                      "slopePlants", "flatPlants", "umbrellas", "cabbageSeen", "kernelSeen", "wallSeen",
                      "melonSeen", "tallSeen", "hostileLobs"):
            check(row[field] > 0, f"Missing Roof gameplay observation {field}")
    return rows


if __name__ == "__main__":
    run("zsroof", verify_results, ("flags", "repicks", "saves", "losses", *CONTROLS))
