# Interface responsiveness

Use these guidelines when building or changing an interface that loads data or media asynchronously.

## Keep the interface usable

- Render static navigation, headers, and layout immediately. A page-level loading state must not block navigation that can already work.
- Show useful content as each independent request finishes. Do not hold the whole page for its slowest query.
- Keep existing content visible during refreshes when it remains valid; distinguish stale content from confirmed current data when that matters.

## Remove avoidable waits

- Before adding a loading indicator, identify what the user is waiting for and whether the wait can be removed.
- Reuse cached data on return navigation, with a freshness and invalidation policy appropriate to the data. Check the cache before showing a placeholder.
- Prefetch likely next views on link hover or keyboard focus when the request is cheap and safe. Avoid unbounded prefetching or side effects from prefetch requests.
- Map which components depend on which requests. Run independent requests concurrently, and split or move slow work off the critical path where possible.
- For media, prefer appropriately sized assets and progressive or streamed delivery so playback or viewing can begin early.

## Design the wait that remains

- Prefer real cached content, progressive content, or a placeholder matching the final layout. Use a data-loading spinner only when there is a clear reason these alternatives do not fit.
- Keep placeholder motion brief and purposeful; respect reduced-motion preferences. Do not add a minimum loading delay just to display an animation.
- Give users clear feedback for long operations, a useful error and retry path on failure, and a distinct empty state when no data exists. Never leave an indefinite loading state after a request fails.

## Verify and report

- Check first visit, return navigation, slow requests, partial responses, empty results, and failures. Confirm navigation remains usable and content does not flash through unnecessary placeholders.
- Report which waits were removed, which loading states remain and why, and any backend or media changes still needed.
