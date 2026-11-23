# PR Review Benchmark

A full-stack benchmark for comparing AI code-review findings against a manually verified ground-truth issue list. **All bundled reviewers and findings are synthetic demonstrations, NOT actual Proofline or other AI reviewer results.**

## Requirements
- Node.js 20.19+ or 22.12+ (recommended: Node.js 22 LTS)
- npm and Git

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173. API runs on http://localhost:4000.

## Test and build
```bash
npm test
npm run build
```

The test suite covers the scoring formulas, one-to-one matching, duplicate and
unknown annotations, empty datasets, request validation, malformed JSON, the
health endpoint, and fixture loading. The client build also runs TypeScript
checking before Vite bundles the production assets.

## API
- `GET /api/health`: health status
- `GET /api/benchmark`: verified issues and scored demo reviews
- `POST /api/score`: score a JSON review, e.g.
```json
{"reviewer":"Example","findings":[{"id":"F1","category":"security","description":"Admin route missing authorization","matchesGroundTruthId":"GT-1"}]}
```
`matchesGroundTruthId` is a **human-verified annotation**, not an automatic prediction. Unmatched findings use `null`. A verified issue can be counted once per reviewer; duplicates are false positives.

Input fields are trimmed and must be non-empty. Unknown or duplicate
`matchesGroundTruthId` values remain false positives; the scorer never infers a
match from a finding's category or description.

## Metrics
- TP: unique findings matched to verified issues
- FP: unmatched, invalid, or duplicate findings
- FN: verified issues without a match
- Precision = TP / (TP + FP), zero when no findings
- Recall = TP / (TP + FN), 1 if no verified issues exist
- F1 = 2PR / (P + R), zero if P + R = 0

## Turn this into a genuine benchmark
1. Pick a public test PR with permission to run reviewers; collect the exact commit SHA.
2. Manually establish and document ground-truth bugs, their locations, and how each was verified (tests, reproduction steps, or maintainer confirmation).
3. Run multiple real AI reviewers on the **same exact PR/commit**; retain original outputs and configuration/version details.
4. Independently adjudicate each finding; map it to a ground-truth ID or `null`, and record rationale. Avoid counting a speculative finding as verified.
5. Replace synthetic JSON fixtures in `benchmarks/` with your documented real results, or add separate real-case fixtures and extend the API.
6. Re-run tests and inspect the dashboard. Include a methodology and limitations section in your PR.

## Proofline application checklist
- [ ] Create a GitHub repository under an organization you control.
- [ ] Push a feature branch and open a pull request (do not merge).
- [ ] Install Proofline on the organization/repository, authorize review, and trigger a real PR review per current Proofline instructions.
- [ ] Read every Proofline comment and document what you changed, or why you disagreed.
- [ ] Add `npm test` and `npm run build` results, reproducible instructions, PR link, and benchmark evidence to the PR description.
- [ ] Record a narrated walkthrough <= 2 minutes: working dashboard, scoring, important code, tests, and Proofline feedback.
- [ ] Email intern-applicants@proofline.sh with subject containing `Software Engineering Intern`, PR URL, video URL, intro, location, and availability for a 3–6 month full-time internship.

## Suggested 2-minute walkthrough
0:00–0:20 problem and benchmark case; 0:20–0:50 compare reviewer metrics and finding audit; 0:50–1:15 show scoring and duplicate handling; 1:15–1:35 run tests; 1:35–2:00 show Proofline comments and resulting changes.

## Limitations
- Sample data is illustrative, not empirical evidence of any reviewer performance.
- Ground truth is human-entered and match assignments are manual; scoring does not independently establish bug correctness.
- Demo loads fixtures from disk on API startup. For multiple real PRs, add a persistent database and dataset selection.
