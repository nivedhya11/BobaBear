# XR-010 attended screen-reader handoff (IMP-036J)

```text
AUTHORITY = NON_AUTHORITATIVE_UAT_EVIDENCE
REQUIREMENT = XR-IMP-036J-010
STATUS = PARTIAL — genuine NVDA/Orca session not executable in this environment
ENVIRONMENT_PROBE_AT = 2026-11-02
DISPLAY = :0 present
ORCA = NOT_INSTALLED
NVDA = NOT_APPLICABLE_ON_LINUX_WSL
SPEECH_DISPATCHER_OR_ESPEAK = NOT_INSTALLED
AT_SPI_CORE = PRESENT (insufficient alone)
RULE = ARIA inspection / TTS binary presence / synthetic a11y tree dumps do NOT close XR-010
```

## Why this remains PARTIAL

This remediation host has AT-SPI packages but no Orca (or NVDA) screen reader and no speech synthesizer session. A genuine XR-010 proof requires a real assistive-technology run against the live application build at a recorded SHA, with spoken announcements captured.

## Exact attended session required (one sitting)

1. Deploy or start the customer ordering app at the **final merged main SHA** recorded in the AC/XR matrix (not a stale PR branch).
2. Start **NVDA (Windows)** or **Orca (Linux desktop)** with speech audible or logged.
3. Keyboard-only, record for each step: spoken announcement text, focus target, recovery action if focus is lost.

### Required coverage (minimum)

| Step | Surface | Prove |
|---|---|---|
| A | Cart with estimated offer / saving | Estimated vs payable language announced; focus order into coupon field |
| B | Checkout Review payable | Payable total announced; coupon apply/replace/remove controls named |
| C | Invalid coupon | Distinct invalid sentence; focus remains on failed action; Try again in tab order |
| D | Identity-restricted coupon (signed-out) | Sign-in ask announced; focus on identity result (`role=status` / polite live region) |
| E | Stale Review recovery after offer retire / reprice | COPY-STALE or equal-payable neutral recovery; keyboard return to Review |
| F | Complimentary included item | Included/gift item announced without substituting unpaid merchandise |
| G | Operator promotions status (Commercial workspace) | Retire confirmation / retired readiness announced without trapping focus |

## Evidence to attach

- Exact app SHA + working-tree fingerprint
- Screen-reader product + version
- Timestamped notes or audio of spoken strings for A–G
- Focus-order notes / screenshots of focused controls
- Defect list (or `DEFECTS: NONE`) reviewed by Product/Experience independently

## Close rule

Promote XR-010 from PARTIAL → PASS in the evidence matrix only after the attended session evidence exists and PE independent review records PASS. Do not invent spoken-announcement evidence from automated axe/ARIA checks.
