"""Verify I, ZomBotany and optionally replay all its muted gameplay cases."""
from native_extension import CASES, check, run

ENGINE = "0.2.6-web-izombotany.1"


def verify_results(report, artifacts):
    check(report["engine"] == ENGINE and report["status"] == "PASS" and
          report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected gameplay engine, audio device, or result")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(report["cases"]) == len(CASES),
          "Incomplete or duplicated gameplay matrix")
    for (name, speed, _), row in rows.items():
        check(row["checks"] > 0, "No engine assertions were evaluated")
        check(row["doubleUpdates"] > 0 if speed == 2 else row["doubleUpdates"] == 0,
              "Observed engine cadence differs from the requested speed")
        if name == "classic":
            check(all(row[k] == 0 for k in ("boards", "types", "purchases", "saves")),
                  "Classic controls accidentally played the new game")
        else:
            check(row["boards"] == 3 and row["types"] == 6 and row["purchases"] >= 15 and
                  row["sunClicks"] > 0 and row["saves"] == (2 if name == "resume" else 0),
                  f"Incomplete {name} course")
    return rows


if __name__ == "__main__":
    run("izombotany", verify_results, ("boards", "types", "purchases", "saves"))
