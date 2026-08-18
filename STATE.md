# Project State

Updated: 2026-08-18

## Current phase

`DELIVERY_COMPLETE`

## Established decisions

- Focus on data lake, Lakehouse, database, natural-language analytics and data-facing Agents.
- De-emphasize model training and generic inference infrastructure.
- Keep exhaustive research separate from concise presentation HTML.
- Require real screen recordings and curated external explanatory videos per major module.
- Compare embedded workspace usage with external users, applications and agents for every module.
- Explain how RDS, PostgreSQL/MySQL, PolarDB and TaurusDB-class products can acquire Genie-like capabilities, including pre-Agent governance and semantic prerequisites.
- Provide a separate Huawei Cloud RDS MySQL/PostgreSQL direction: customer story, official capability map, reuse/connect/build gaps, dual-engine slices, measurable 90-day Gates and customer-facing packaging.
- Cover four cases: mainstream/high-frequency flow, natural-language analysis, intelligent after-sales, and database intelligent operations.
- Use read-only built-in samples first and synthetic data only when writes are necessary.

## Access and live-validation status

- A temporary Google-authenticated Playwright browser was connected through local CDP; no cookie, password, OAuth code or token was written into the project.
- UI directly confirms `Databricks Free Edition` on AWS.
- A custom PKCE OAuth probe authenticated with tokens held only in memory; its broker/socket has expired and is no longer running.
- `samples.nyctaxi.trips` returned 21,932 rows.
- `workspace.dbx_demo_20260814` contains one managed Volume, 14 Delta managed tables, 18,498 validated rows, three views and one Genie benchmark table.
- A Genie Agent bound to seven governed sources answered the Chinese P1-region, all-status refund, three-incident and approval-boundary questions; generated SQL and sources are visible.
- Three Agent-mode Benchmarks are embedded. The final valid run remained 33% (1/3): P1 passed, refund facts were correct but violated the strict output contract, and DBOps returned a visible report while the evaluator reported `Empty Result`.
- The account has one 2X-Small Serverless Starter SQL Warehouse; cleanup verified it is `STOPPED`.
- No Job, Pipeline, Dashboard, App, Share, Connection or Lakebase project was created.
- A Free Edition “Verify you're a real person” LinkedIn prompt was dismissed with `Not now`; no LinkedIn connection or additional authorization was granted.

## Completed delivery artifacts

- Project brief and 15-module research matrix created.
- Full research notes created for account/edition boundaries, Lakehouse/database paths, and natural-language/external-Agent access.
- Presentation HTML plus dedicated concise Genie, general cloud-database Agent and Huawei Cloud RDS implementation pages created.
- Markdown-backed project brief, recording index, external-video index, Genie guide, cloud-database guide and Huawei Cloud RDS delivery guide now render as UTF-8 static HTML under `site/details/`; presentation links no longer open raw Markdown.
- Eight SVG diagrams created: four for the original platform/Genie views, two for the general cloud-database capability stack/routes, and two for the Huawei Cloud RDS target architecture/90-day roadmap.
- Playwright recording and H.264 MP4 conversion toolchain validated with a 10.60-second local presentation recording.
- Fourteen deterministic synthetic datasets generated: 18,498 rows, approximately 1.2 MB.
- Synthetic data integrity, foreign keys, reserved safety domains and three incident ground truths validated.
- Eleven real-workspace H.264 MP4 clips plus three local architecture walkthroughs recorded with privacy scrubbing and embedded Chinese captions.
- Genie long-form recordings: G1 business/multi-use 61.25s, G2 authoring/Monitor/Benchmark 82.75s, G3 embedded/API/multi-Agent architecture 71.00s.
- Cloud-database architecture recording: D1 capability stack/integration routes/embedded-vs-external/G0–G8 78.80s; explicitly labeled as architecture demonstration, not production database validation.
- Huawei Cloud RDS direction recording: H1 customer story/reuse-connect-build/target architecture/scenarios/MySQL-PG slices/six Gates/KPIs 127.16s; explicitly labeled as a public-source architecture proposal, not Huawei Cloud production validation.
- Official and independent external-video candidates curated by module.
- Fourteen Mandarin narrated derivatives generated from 73 timed segments; silent originals remain unchanged, and the site now defaults to the narrated files.

## Finalization result

- Concise leadership HTML, Genie deep-dive HTML, cloud-database-to-Agent HTML, Huawei Cloud RDS direction HTML, generated detail pages, 8 SVG diagrams, 11 real-workspace clips and 3 architecture walkthroughs are complete; all 14 clips also have Mandarin narrated derivatives.
- A detailed official-source-calibrated gap analysis now covers database primitives, Unity Catalog-like governance, semantic contracts, trusted SQL, Agent runtime, evaluation, embedded/external delivery and action safety.
- The Huawei Cloud RDS direction maps RDS, DAS, DRS, DataArts, Agent development, IAM, APIG and CTS into reuse/connect/build responsibilities, with proposed targets clearly separated from official facts and unverified production assumptions.
- Site v4/cloud-database validation evidence is recorded in `evidence/workspace/site-v4-cloud-database-validation.md`.
- Local links, SVG rendering, embedded MP4 metadata, data integrity, script syntax and privacy scans passed.
- Temporary OAuth broker, Google-authenticated browser and local web server are not running; the exact disposable browser profile was moved to the system trash.
- SQL Warehouse is `STOPPED`.
- Temporary browser was closed and its exact disposable profile was moved to the system trash; it can be recovered from trash if needed.
- Lakebase, Apps, Federation/Sharing and Dashboard creation remain explicitly marked as uncreated/not live-validated.

## Public publication

- Public repository: `https://github.com/zcimon57-svj/databricks-lakehouse-agent-demo`.
- GitHub Pages: `https://zcimon57-svj.github.io/databricks-lakehouse-agent-demo/`; HTTPS is enforced and the build type is GitHub Actions.
- The public Pages artifact contains the root redirect, presentation site, all 13 narrated clips, all 13 silent originals, and voiceover manifests/checksums.
- Online browser validation passed for the leadership page, 10 embedded narrated videos, all 26 recording links, SVGs, voiceover evidence links and privacy checks.
- Local dependency and tool directories remain excluded: `node_modules/`, `.tools/` and `_site/`.
- Publication evidence is recorded in `evidence/workspace/github-publication-validation.md`.
