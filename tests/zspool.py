"""Verify the Pool build and replay its muted five-flag course."""
from native_extension import CASES, check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zspool.1" and report["status"] == "PASS" and
          report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected Pool release, audio device or test executable")
    rows = {(row["case"], row["speed"], row["seed"]): row for row in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete Pool playthrough matrix")
    for (case, speed, _), row in rows.items():
        check((row["doubleUpdates"] > 0) == (speed == 2), "Wrong native simulation speed")
        check(row["saves"] == (case == "resume") and row["losses"] == (case == "retry"),
              "Missing saved board or loss and retry")
        if case == "classic":
            check(row["classicPool"] == row["familyNight"] == 1 and row["flags"] == row["repicks"] == 0,
                  "Both neighboring modes must retain their original roster")
            check(row["frozenRepick"] == row["frozenFinal"] == 1, "A frozen, cleared flag failed to finish")
            continue
        check(row["flags"] == 5 and row["repicks"] == 4 and row["ticks"] > 0, "Incomplete five-flag course")
        for field in ("sunClicks", "placements", "sunSpent", "skySun", "lilyPads", "supportedPlants",
                      "kelpPlants", "swimmersUpper", "swimmersLower", "poolRisers", "landSeen",
                      "peaSeen", "wallSeen", "gatlingSeen"):
            check(row[field] > 0, f"Missing Pool gameplay observation {field}")
    return rows


if __name__ == "__main__":
    run("zspool", verify_results, ("flags", "repicks", "saves", "losses", "classicPool", "familyNight",
                                   "frozenRepick", "frozenFinal"))
