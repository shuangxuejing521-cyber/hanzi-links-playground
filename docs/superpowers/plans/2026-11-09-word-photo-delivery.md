# Preserve full-resolution photos within the hosting limit

The v16 deployment archive nearly reaches Sites' 256 MiB expanded limit. New levels must retain the reviewed original photographs, current URLs, learning interface and owner-only analytics.

Use the existing public GitHub repository as an immutable photo archive. Upload reviewed assets there first, record the exact successful commit, and allow only explicitly catalogued JPEG filenames. The Worker intercepts those exact same-origin paths before the framework's static-asset shortcut, fetches that fixed public path without forwarding any user headers, validates the original byte count and SHA-256, and returns the unchanged image with cache headers. Unknown files never trigger an archive request. Historical specimens and original baseline assets remain local.

Use redirect mode `manual` and reject non-success responses: [Workers Request documentation](https://developers.cloudflare.com/workers/runtime-apis/request/) confirms `error` mode is unsupported. Local integration must verify actual JPEG bytes, rather than treating a 200 response as sufficient.

Construct fresh outbound headers with only `Accept`, rather than cloning the incoming request. Tests include account cookies, authorization, visitor IP/proxy headers and referrers; none may be forwarded. [Cloudflare subrequest header documentation](https://developers.cloudflare.com/fundamentals/reference/http-headers/) describes why incoming IP headers must not be forwarded unchanged.

Keep every original photo in the source checkout and GitHub. After a successful build, remove only verified catalogued copies from `dist/client`, so the deployment contains the required app and local assets without duplicate archived photographs. Fail closed on invalid manifests, unsafe paths or differing image hashes. No account, audience or analytics settings change.

- [x] Write failing route tests for exact URL and bytes, unknown paths, upstream failures, changed content, cache/HEAD behavior and no forwarded identity headers.
- [x] Implement and verify the same-origin Worker path with a fixed repository and immutable commit allowlist. Actual Worker returned247345 bytes matching the original SHA; browser displayed1000×750 at the unchanged URL.
- [x] Test build pruning against temporary fixtures, proving the source bytes and uncatalogued build files are retained.12 transport/pruning tests pass, including oversized/no-length/interrupted streams and symlink/missing-source failures.
- [x] Generate/review/promote all221 level5 assets, upload them to the existing public GitHub repository, and verify the immutable archive. Commit63ba3cdd542618f74f9dc39ed7d0f938d25b9e88 contains all603 reviewed word photos; source/mirror SHA and four public HTTP samples checked. Original134233366 photo bytes retained.
- [x] Complete the exact-ID level5 mappings and coverage test.100 tests/types/build passed; prune603 duplicate copies, package with COPYFILE_DISABLE=1; expanded tar173583360 bytes.
- [x] Review, publish v17 and visually verify the image route and unchanged learning/source/privacy behavior; mirror final source to GitHub. Travel-agency photo1000×750, seven旅 source stages and founder dashboard entry verified live. Runtime environment revision2 unchanged.
