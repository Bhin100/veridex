## 2026-08-17 - Concurrent Factor Evaluation in Approval Engine
**Learning:** Sequential await loops over independent factor functions create latency linear in the number of factors (O(N)). Evaluating factor functions concurrently using `Promise.all` reduces latency to the duration of the slowest factor (O(1) concurrent latency) while retaining deterministic alphabetical output mapping.
**Action:** Always search for sequential `for...of` await loops over independent evaluation/scoring functions and convert them to `Promise.all` concurrent execution.
