"""Verify the two Bowling aliases on the same build that ships on Pages."""
from native_extension import check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-wbtab.1" and report["status"] == "PASS"
          and report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected Bowling menu driver or audio state")
    cases = {(name, speed, 1729 if speed == 1 else 7331)
             for name in ("one", "two", "mini-one", "mini-two") for speed in (1, 2)}
    cases.add(("tour", 1, 1729))
    rows = {(row["case"], row["speed"], row["seed"]): row for row in report["cases"]}
    check(rows.keys() == cases and len(rows) == len(report["cases"]), "Missing or repeated Bowling case")
    for (name, speed, _), row in rows.items():
        check(row["wins"] == (2 if name == "tour" else 1) and row["backChecks"] == 1,
              "Missing shared trophy or category navigation")
        check(row["resumes"] == (name in ("one", "two")) and bool(row["doubleUpdates"]) == (speed == 2),
              "Incorrect Continue or game speed")
        check(row["ordinary"] > 0 and row["explosive"] > 0, "Missing original rollers")
        check((row["giant"] > 0) == (name.endswith("two") or name == "tour"), "Incorrect Giant Wall-nut supply")
    return rows


if __name__ == "__main__":
    run("wbtab", verify_results, ("wins", "resumes", "backChecks"))
