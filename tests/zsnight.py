"""Verify the Survival Night release and replay its muted native gameplay suite."""
from native_extension import CASES, check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zsnight.1" and report["status"] == "PASS" and
          report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected release, audio device or result")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(rows) == len(report["cases"]), "Incomplete playthrough matrix")
    for (name, speed, _), row in rows.items():
        check((row["doubleUpdates"] > 0) == (speed == 2), "Wrong simulation speed")
        check(row["saves"] == (name == "resume") and row["losses"] == (name == "retry"),
              "Missing saved battle or loss and retry")
        if name == "classic":
            check(row["classicNight"] == row["familyDay"] == 1 and row["flags"] == row["repicks"] == 0,
                  "Both original modes must still start with their own roster")
        else:
            check(row["flags"] == 5 and row["repicks"] == 4 and row["ticks"] > 0, "Incomplete five-flag course")
            for field in ("sunClicks", "placements", "sunSpent", "graveGrowth", "gravesCleared",
                          "risers", "puffSeen", "fumeSeen", "iceSeen", "escorts"):
                check(row[field] > 0, f"Missing gameplay observation {field}")
    return rows


if __name__ == "__main__":
    run("zsnight", verify_results, ("flags", "repicks", "saves", "losses", "classicNight", "familyDay"))
