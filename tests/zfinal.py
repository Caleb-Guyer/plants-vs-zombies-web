"""Authenticate and play the last four native ZomBotany cards with sound off."""
from native_extension import check, run


def verify_results(report, artifacts):
    check(report["engine"] == "0.2.6-web-zfinal.1" and report["status"] == "PASS"
          and report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected finale engine, driver or audio state")
    cases = {(game, speed, seed) for game in ("stars", "portals", "columns", "stand")
             for speed in (1, 2) for seed in (1729, 7331)}
    cases.add(("tour", 1, 1729))
    rows = {(row["case"], row["speed"], row["seed"]): row for row in report["cases"]}
    check(rows.keys() == cases and len(rows) == len(report["cases"]), "Missing or duplicate finale scenario")
    for (game, speed, seed), row in rows.items():
        replay = (game, speed, seed) == ("stars", 1, 1729)
        retry = (game, speed, seed) == ("portals", 1, 7331)
        check(row["wins"] == (4 if game == "tour" else 1 + replay) and row["placements"] > 0,
              "Missing a real placement or collected victory")
        check(row["saves"] == (game != "tour") and bool(row["doubleUpdates"]) == (speed == 2),
              "Unexpected Continue or speed")
        check(row["losses"] == retry and row["replayBags"] == replay, "Missing Retry or replay prize")
        check(row["heads"] >= {"stars": 2, "portals": 5, "columns": 5, "stand": 11, "tour": 11}[game],
              "Missing plant-headed opponent")
        check(bool(row["ported"]) == (game in ("portals", "tour"))
              and bool(row["fullColumn"]) == (game in ("columns", "tour"))
              and row["onslaughts"] == (5 if game in ("stand", "tour") else 0), "Missing card mechanic")
    return rows


if __name__ == "__main__":
    run("zfinal", verify_results, ("wins", "saves", "fullColumn", "onslaughts", "losses", "replayBags"))
