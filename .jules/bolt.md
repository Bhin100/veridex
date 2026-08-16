## 2026-08-16 - Concurrent Evaluation in Scoring Engine
**Learning:** Scoring modules executed sequentially using async loops create cumulative latency (N * avg_module_latency). Evaluating modules concurrently using `Promise.all` reduces overall execution time to max(module_latency) while maintaining exact mathematical equivalence for weighted averages.
**Action:** When executing independent async evaluators or rule modules, always execute them concurrently with `Promise.all` and combine aggregation into a single pass.
