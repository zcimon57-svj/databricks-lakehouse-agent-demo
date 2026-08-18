# Presentation site v2 validation

Validated: 2026-08-16  
URL during validation: local loopback HTTP server only

## Result

`PASS`

- Page title: `Databricks 数据湖与数据库演示`;
- viewport: 1440×900;
- three local document links: HTTP 200;
- two SVG diagrams: loaded, natural width 1600;
- six embedded real-workspace MP4 clips: `readyState=4`, valid duration, no media error;
- page text contains no email address;
- page text contains no private Databricks workspace hostname;
- visual inspection passed for hero, Agent evolution and recording-grid frames;
- H.264 MP4 walkthrough generated successfully, 31.48 seconds, no audio.

## Embedded video durations

| Clip | Duration |
|---|---:|
| M02 Catalog/Delta/Lineage | 25.00s |
| M05 Data Ingestion | 13.50s |
| M09 Genie Agent | 34.25s |
| C2 Trusted SQL | 16.25s |
| C3 After-sales | 15.50s |
| C4 Database operations | 16.00s |

## SHA-256

| Artifact | SHA-256 |
|---|---|
| `site/index.html` | `393f1dec5efed7352a69a1866741aee8a4a0c6252725f1928020e48700feac63` |
| `site/styles.css` | `ed1a85ead4b56ac34864f6bd8b2643af7184a81f02c0f4ec2d536e1d8863a07f` |
| `embedded-vs-external.svg` | `a5a2b316e78a95990ffe4993211f26f177e2f063cac386551b809457b2aa58be` |
| `platform-data-paths.svg` | `5b887a7b1a5ed8a69116799d1480a453af40d9774ff565996ae45e85663fc7cc` |
| `site-v2.png` | `bbeecaca4ed775f81753ab3a28100c1ae9ada918328b67cec5b6426841bf09d6` |
| `site-v2.webm` | `359f2426e76f2ce19e6f1254e56cd64d6c36f065b922d289c32a1cbc701b79cd` |
| `site-v2.mp4` | `ee9a867f0c5b4bdeef4190c1b818b6ea105245d7c06cae73f465684f6eb23a1a` |

## Reproduce

```bash
python3 -m http.server 8765 --bind 127.0.0.1
node scripts/validate_site.mjs http://127.0.0.1:8765/site/ evidence/workspace/site-v2.png
node scripts/record_page.mjs http://127.0.0.1:8765/site/ evidence/workspace/site-v2.webm
node_modules/ffmpeg-static/ffmpeg -y -i evidence/workspace/site-v2.webm \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart \
  evidence/workspace/site-v2.mp4
```
