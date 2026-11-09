# Founder-only click rankings

The site remains publicly usable and its current owner remains the sole source editor. Preserve existing ADMIN_USER_IDS and server-side authorization; do not display the owner's name. Existing D1 analytics and founder identity are already operational.

Add explicit mode_click events for every user action that enters a learning mode, including repeated navigation clicks. Keep mode_view separate so the initial page does not count as a click. All mode_click events include the destination mode. The admin panel shows per-mode clicks and share of all mode clicks, plus existing views/time. Add radical click share alongside existing session-based CTR. Explain denominator and that mode clicks start with this update. Retain historical events, filters, and exports. Surface a founder-only dashboard link without a name.
