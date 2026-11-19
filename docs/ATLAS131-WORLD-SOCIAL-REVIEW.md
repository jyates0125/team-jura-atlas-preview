# Atlas 13.1 · World-specific social preview review
**Base:** Atlas 13.0 live-connected `development` merge `ddc6ea658d89729d9428e7470088a26c64c0de03`
**Status:** REVIEW ONLY · Not authorized to merge into live `development`

This branch adds accurate Open Graph and social-card metadata to:
- GTA V Story, GTA Online and provisional GTA VI research explorers
- Cayo Perico schematic heist planner
- All 13 worlds directory
- My Garage, Universe Database and Heist HQ

Each page gets its own canonical URL, independent title/description, suitable original Elario art already present in the repository, and a Share navigation route to the Atlas 13.0 social launch hub. No tracker, social account integration or fake sharing automation is added. Map engines, data, saved game progress, and source licenses remain untouched.

## Art and source limitations
- Existing original multi-world or studio concept WebP images are reused for social cards. Some games still lack cleared game-specific 1200×630 share photography; metadata is **not** represented as gameplay screenshots.
- `atlas-vi.html` description explicitly labels unverified/provisional positions.
- `atlas-cayo.html` description says schematic.
- Platform preview caches can differ. Do not guarantee Twitter/X, Facebook or Discord always chooses `og:image`.
- The user's new generated Facebook poster exists in the separately delivered social ZIP, not as an authorized binary in this GitHub review PR.
- Sitemap and social tags make content discoverable but cannot guarantee search indexing or feed distribution.

## Owner approval gate
The standing charter is proposed to reflect the new owner instruction: after the **one authorized Atlas 13.0 merge**, keep *all further work* on non-live branches with draft PRs and no automatic Cloudflare publishing. Require fresh explicit owner approval for each new `development` merge. The protected `main` remains untouched.

Automated static checks are in `scripts/test_world_social_131.py`, followed by the full release CI (Chromium, Edge, ZIP) triggered by the draft PR. Actual Facebook/Instagram/Discord thumbnail behavior and mobile visual parity require separate human inspection.
