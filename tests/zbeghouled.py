"""Verify ZomBotany Beghouled and optionally replay all its muted gameplay cases."""
from native_extension import CASES, check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zbeghouled.1" and report["status"] == "PASS" and
          report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected build, sound device or result")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(report["cases"]) == len(CASES), "Incomplete playthrough matrix")
    for (case, speed, _), row in rows.items():
        classic = case == "classic"
        check(row["score"] == (75 if classic else 50) and row["moves"] > 0 and row["sunClicks"] > 0,
              "Expected actual swaps, sun collections and a win at the correct target")
        check((row["doubleUpdates"] > 0) == (speed == 2), "Wrong game speed")
        check(row["saves"] == (2 if case == "resume" else 0) and row["shuffles"] == (case == "resume")
              and row["losses"] == (case == "retry"), "Missing Continue, paid shuffle or natural loss")
        check((row["escorts"] > 0) == (not classic), "Wrong wave roster")
        if speed == 1:
            check(row["scoringTicksChecked"] > 0, "Missing scoring ticks")
            for field in ("horizontal", "vertical", "shots"):
                check((row[field] > 0) == (not classic), "Wrong final volley")
    return rows


if __name__ == "__main__":
    run("zbeghouled", verify_results, ("score", "saves", "shuffles", "losses"))
