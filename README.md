# Thursday 19 November 2026 — The Day in World News

[![make.fun · news-image-20261119](https://make.fun/badge/news-image-20261119.svg)](https://make.fun/bounty/news-image-20261119?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![rank](https://make.fun/badge/news-image-20261119/rey007123/news-image-20261119/rank.svg)](https://make.fun/bounty/news-image-20261119/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)
[![reward](https://make.fun/badge/news-image-20261119/rey007123/news-image-20261119/reward.svg)](https://make.fun/bounty/news-image-20261119/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261119)

A single `1024×1024` editorial front-page broadsheet summarizing **36 strictly verified Thursday 19 November 2026 world news stories across 6 continents**, with zero pre-19 November carryovers.

![Thursday 19 November 2026 World News Broadsheet](./entry.png)

## Editorial Design & Structure

- **Masthead & Data Strip**: Deep navy (`#0c1b33`) masthead with gold rule (`#c9a24b`), red/white `NOV 19 THU 2026` badge, proportional 6-region count bar, and 6-KPI strip (`$81.3bn` Anthropic record IPO, `15.9m` GTA VI pre-orders, `200,000` evacuated for Akvan, `$120bn` COP31 adaptation gap, `730,000` Rohingya in ICJ case, `$190.4m` record Van Gogh sale).
- **Row 1 — 3 Lead Stories**: Original vector illustrations with dark location caption bars and ranked badges (`1–3`):
  1. **Shenzhen Summit** — Trump, Xi, and Putin hold their first three-way summit (arms control and Iran war top agenda; separate Trump–Putin 1-on-1).
  2. **GTA VI Global Launch** — Rolling midnight release from New Zealand westward (`15.9m` pre-orders, `$79.99` on PS5/Xbox, no PC yet, `99` Metacritic).
  3. **Anthropic Record IPO** — Priced at `$83` above range to raise `$81.3bn` at `~$1.5tn` valuation, with up to a fifth to retail.
- **Rows 2 & 3 — 8 Illustrated Mid Cards (`4–11`)**: ICJ Myanmar Rohingya ruling, COP31 final 48 hours in Antalya, Cyclone Akvan in Odisha, Ukraine watching Shenzhen, APEC Shenzhen Declaration, Flooded Florida, *Nature* Great Unconformity geology study, and France's justice minister on Mélenchon.
- **Bottom Split — Global Dateline Map & 25 Verified World Briefs (`12–36`)**: Dark-navy `64×25` dot-matrix world map with numbered pins `1–11` and color-coded region dots for briefs `12–36`, paired with 25 strictly dated Thursday 19 November briefs across all six continents.
- **Red DATE CHECK Bar**: Explicitly lists major stories first reported on 17–18 November (Kuwait/Bahrain drone interceptions, EU €45bn Ukraine loan proposal, House Democrats' Jeffries vote, Voyager 1 light-day milestone, Pew 2035 Islam projection, Peltola Alaska win & Nvidia Q3) that were excluded as today's news.

## Running

Requires **Node.js 22+** (zero external dependencies):

```bash
node main.ts
```

`main.ts` validates `entry.png` (PNG/JPEG signature, `<= 1024×1024` dimensions, `<= 1 MiB` file size) and writes it to `process.env.MAKEFUN_OUTPUT_DIR || "/output"`.

To regenerate the broadsheet HTML source:

```bash
node render.mjs
```

## License

MIT — see [LICENSE](./LICENSE).
