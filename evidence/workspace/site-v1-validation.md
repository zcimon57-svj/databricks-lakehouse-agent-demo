# Presentation site v1 validation

Validated: 2026-08-14  
Purpose: leadership-facing presentation rendering and recording pipeline  
Not a substitute for: real Databricks workspace UI recording

## Artifacts

| Artifact | Properties | SHA-256 |
|---|---|---|
| `site-v1.png` | PNG, 1440 × 6434, full page | `9f7ca9b44ed7b235e57d4b04b49c64c186999afa98ccd5becacd78dbae83510e` |
| `site-v1.webm` | Playwright browser recording | `f0c3b48a9415f96852a7906265b83f83cc10c9318a96675dc7231c258ed8d66e` |
| `site-v1.mp4` | H.264 High, yuv420p, 1440 × 900, 25 fps, 12.44 s | `c181eb4e21852c08560985a38b561d55fe5ee03a43c85e6ba1f2a5ffafdefeae` |

## Visual checks

- Chinese typography rendered correctly.
- Both SVG diagrams rendered correctly.
- Six live-validation metrics remain readable without exposing account identifiers.
- Four case cards show data/query readiness separately from pending UI recordings.
- Research details are not copied into the presentation layer.

## Evidence boundary

This recording proves that the local presentation and media pipeline work. It contains real aggregate results obtained from the Databricks workspace, but it does not show the Databricks product UI. Product-UI recordings remain a separate deliverable.

