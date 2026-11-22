# Israeli Norielle cloud trial

This branch adds an optional conversation after a **completed three-card tarot
reading**, in both tarot interfaces. The frame receives the exact card IDs, the
original question and the completed interpretation. Messages must come from the
expected frame and origin. The frame is removed when the dialog closes.

The feature is disabled unless `VITE_NORIELLE_TRIAL_ENABLED=1`. Its absolute
expiry is **23 November 2026, 08:05:38 Israel time**. Do not extend this deadline
or restart paid compute without reviewing the trial budget with the owner.

The temporary cloud preview is separate from the public Israeli domain and from
the US project. The current trial speaks English; multilingual input requires
separate recognition testing. It is not a production release or a claim that
all languages or physical phones have been validated.

Server cap: at most ten hours and USD 3. The allocated Runpod RTX 3070 costs
approximately USD 0.14/hour including its ephemeral disk. A server-side stop
helper is configured for the same absolute deadline. No persistent volume,
new account-level API key or payment top-up is part of this change.

Validation: production build and tests for the voice context handoff, the
existing immediate tarot result, and localized text follow-ups. Browser playback
timing uses the Web Audio clock. Frame scheduling statistics are not an acoustic
loopback measurement or a perceptual lip-sync accuracy score.
