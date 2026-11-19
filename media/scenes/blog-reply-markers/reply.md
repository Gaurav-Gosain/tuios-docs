**Result:** The retry test is fixed. [[Done]]

**Cause:** The jitter was added after the cap, so a wait could pass 1800ms.

- ✓ 200 runs of `TestRetryJitter` pass [[Passed]]
- ✗ The CI cache still holds the old test binary [[Needs you]]
- → `gh cache delete --all` clears it [[Irreversible]]

**Next:** Merge, then watch one CI run. [[Unverified]]
