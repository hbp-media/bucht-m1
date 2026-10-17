# Project architecture

- Keep the interactive lake map and spot list in `AvailableSpotsForRange` so both entry points reuse the same loaded spot data and detail dialog; load spot information independently of date selection.