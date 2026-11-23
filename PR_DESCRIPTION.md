# Add benchmark scoring safeguards and verification coverage

## Summary

This change makes the synthetic PR review benchmark safer to extend and easier
to verify:

- de-duplicates malformed ground-truth IDs before calculating FN and missed issues;
- preserves the existing manual, one-to-one annotation model;
- rejects blank review fields at the API boundary;
- returns a JSON error for malformed request bodies;
- adds edge-case coverage for unknown IDs, duplicate ground-truth IDs, blank input,
  malformed JSON, health checks, and fixture loading;
- documents the scoring contract and validation behavior.

No AI review output or benchmark result was fabricated or added. Existing
fixtures remain explicitly synthetic.

## Verification

| Check | Result |
| --- | --- |
| `server` TypeScript build | Pass |
| Built Express API smoke test (`/api/health`, `/api/benchmark`, `/api/score`) | Pass |
| `npm test` | Blocked in this Windows environment: Application Control blocks the native Rollup binary loaded by Vitest |
| `npm run build` | Server build passes; client TypeScript check passes, then Vite is blocked by the same native Rollup policy |

To reproduce in a standard Node.js 20.19+/22.12+ environment:

```bash
npm install
npm test
npm run build
```

## Review notes

- `matchesGroundTruthId` remains a human-verified annotation. The scorer does
  not predict matches from text or categories.
- A matched ground-truth issue can contribute one TP per review. Duplicate,
  unknown, null, or unmatched findings contribute FP.
- No GitHub publication, settings change, external reviewer invocation, or
  real Proofline data is included in this change.

## Follow-up

- Run the full test/build commands on CI or a workstation where native Node
  binaries are permitted.
- Replace synthetic fixtures only after collecting a fixed PR commit, verified
  ground truth, reviewer configuration, and independent adjudication notes.
