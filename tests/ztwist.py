"""Verify the released ZomBotany Twist engine and replay its muted gameplay cases."""
from native_extension import CASES, check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-ztwist.1" and report["status"] == "PASS" and
          report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected Twist engine, audio setting or driver")
    rows = {(row["case"], row["speed"], row["seed"]): row for row in report["cases"]}
    check(rows.keys() == CASES and len(report["cases"]) == len(rows), "Incomplete Twist matrix")
    for (case, speed, seed), row in rows.items():
        classic = case == "classic"
        check(row["score"] == (75 if classic else 45) and row["moves"] > 0 and row["sunClicks"] > 0,
              "Missing rotations, collected sun or victory")
        check(bool(row["doubleUpdates"]) == (speed == 2), "Game speed did not match the scenario")
        check(row["saves"] == (2 if case == "resume" else 0) and row["shuffles"] == (case == "resume")
              and row["losses"] == (case == "retry"), "Missing Continue, paid shuffle or retry")
        check(row["replayBags"] == (case == "solution" and speed == 1 and seed == 1729),
              "Unexpected replay reward")
        for key in ("targetChecks", "bankChecks", "tallEscorts"):
            check((row[key] > 0) != classic, "Wrong combat behavior for " + key)
        if speed == 1:
            check(row["scoringTicksChecked"] > 0, "Missing observed scoring transitions")
            for key in ("shots", "horizontal", "vertical"):
                check((row[key] > 0) != classic, "Unexpected matched-plant attacks")
    for speed in (1, 2):
        played = [row for (case, cadence, _), row in rows.items() if cadence == speed and case != "classic"]
        check(any(row["butter"] and row["stunTicks"] for row in played),
              "No long match stunned a zombie during normal play")
    return rows


if __name__ == "__main__":
    run("ztwist", verify_results, ("score", "saves", "shuffles", "losses", "replayBags"))
