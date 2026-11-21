"""Verify ZomBotany Survival Fog and replay its five flags without opening an audio device."""
from native_extension import CASES, check, run

CONTROL_CHECKS = ("classicFog", "familyPool", "litWater", "partialLight", "blownFog", "returningFog",
                  "frozenRepick", "frozenFinal", "hudClear")


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zsfog.1" and report["status"] == "PASS" and
          report["driver"] == artifacts and report["audioDeviceOpened"] is False,
          "Unexpected Fog build, test executable or audio output")
    rows = {(row["case"], row["speed"], row["seed"]): row for row in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete Fog playthrough matrix")
    for (case, speed, _), row in rows.items():
        check((row["doubleUpdates"] > 0) == (speed == 2), "Wrong native speed")
        check(row["saves"] == (case == "resume") and row["losses"] == (case == "retry"), "Missing Continue or Retry")
        if case == "classic":
            check(row["flags"] == row["repicks"] == 0, "Control was counted as a win")
            for field in CONTROL_CHECKS:
                check(row[field] > 0, f"Missing control {field}")
            check(row["cloudPixels"] > 30000, "The fifth-flag clouds disappeared from the lawn")
            continue
        check(row["flags"] == 5 and row["repicks"] == 4 and row["ticks"] > 0, "Incomplete five-flag course")
        check(row["skySun"] == 0, "Sky sun fell on the night lawn")
        for field in ("sunSpent", "sunClicks", "placements", "sunShrooms", "planterns", "lilyPads", "supportedPlants",
                      "kelpPlants", "swimmersUpper", "swimmersLower", "poolRisers", "blovers", "preventedRises", "landSeen", "fumeSeen",
                      "wallSeen", "tallSeen"):
            check(row[field] > 0, f"Missing Fog gameplay observation {field}")
    return rows


if __name__ == "__main__":
    run("zsfog", verify_results, ("flags", "repicks", "saves", "losses", "skySun", *CONTROL_CHECKS))
