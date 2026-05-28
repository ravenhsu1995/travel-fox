-- Backfill share_token for trips that lost theirs under the old
-- "private clears token" rule (0007/0008), or never had one because they
-- were created and stayed private.
--
-- After 0009, every trip needs a stable share_token so that:
--   - /s/[token] always resolves to *some* row (private → landing page,
--     non-private → trip view / redirect)
--   - flipping back to non-private later doesn't have to mint a fresh
--     token (the lazy-mint path only triggers when this column is NULL)
--
-- Existing tokens (non-null) are left untouched. The partial unique index
-- `trips_share_token_unique` ensures gen_random_uuid() won't collide.

update trips
  set share_token = gen_random_uuid()
  where share_token is null;
