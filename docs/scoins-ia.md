# Scoins redesign: information architecture

Goal: make Scoins feel like money people have earned, understand, and want to spend.

## 1. What's wrong today (from the four current states)

| # | Issue | Where | Effect |
|---|---|---|---|
| 1 | Balance shown only as a coin count; no ₹ value anywhere | Wallet hero | Scoins read as points |
| 2 | No Spend / Withdraw / Earn actions on the wallet | Wallet | No obvious next step |
| 3 | History rows look like rupees (`+300.00`, `−200.00`), with decimals and no unit | Activity | Trust: users think ₹300 landed |
| 4 | Redemptions shown as red losses | Activity | Spending feels like losing money |
| 5 | "Every 5th UPI" with no progress; third earn card clipped | Earn row | Earning is passive |
| 6 | Card reward points merged into the balance with a third conversion (`RP 500 = 🪙500`) and a vague pending note | Cardholder state | A third currency to learn |
| 7 | Balance doesn't reconcile with history (lifetime 2,000, available 0, no explanation) | Header pill | Trust |
| 8 | Same history in two states with different balances; mixed date formats | All | Trust |
| 9 | Deals card promises "save ₹1,000" regardless of balance | Redeem card | Generic, not about the user |
| 10 | Zero state is a decorative coin and an empty list | New user | Dead end |
| 11 | Watermark and trust badges take about ¼ of the screen | Zero state | Hierarchy |

## 2. Principles

1. **Lead with rupees.** The headline is the in-app ₹ value. Scoins and the bank value sit directly under it.
2. **Show both rates, rank them.** `5 Scoins = ₹1` on SalarySe is primary. `10 Scoins = ₹1` to bank is always visible and never guilt-framed.
3. **Every amount carries its unit and its ₹.** No bare numbers, no decimals on Scoins.
4. **Spending is saving.** Redemptions show "Saved ₹X", not a red minus.
5. **The balance always reconciles.** Running balance per transaction; pending is never mixed into available.
6. **One next action per state.** Each state gets its own message and primary action.

## 3. Structure

```
Scoins Wallet (Screen A)
├── Balance hero ─ ₹ to spend · Scoins · ₹ to bank · rates (sheet)
├── Actions ───── Spend (primary) · Withdraw · Earn
├── Card balance ─ cardholders only: from activity / from card / pending points (sheet)
├── Next reward ── progress toward the existing 5th-UPI bonus, with the exact action
│                  non-cardholders: one-line card benefit, in context
├── Use your ₹X ── deals the balance covers, Scoins deducted, ₹ saved, balance after
└── Activity ───── month summary · pending · rows → transaction detail (sheet)

Earn (Screen B) ─ current ways to earn │ proposed mechanics (labelled) │ card multipliers
Spend (Screen C) ─ discover → select → review → confirm → receipt with new balance
Withdraw (Screen C) ─ amount → neutral comparison → confirm → receipt
```

## 4. States

| State | Hero | Primary action | Notes |
|---|---|---|---|
| New user, never earned | What Scoins are + what they're worth | Make first UPI payment (0/5) | Other ways to earn; worth explainer |
| Spent everything | ₹0 + "You've saved ₹400 with Scoins" | Next reward progress | History kept; no empty Spend button |
| Active, no card | ₹300 / 1,500 Scoins / ₹150 to bank | Spend | Card benefit is one line inside Next reward |
| Active, cardholder | Same hero | Spend | Balance breakdown with pending points, and when they become Scoins |

## 5. Journeys

- **Understand value:** open wallet → read ₹300 → tap bank line → rates sheet compares ₹300 vs ₹150 for the user's own balance.
- **Earn on purpose:** Next reward → "2 more UPI payments" → pay → progress fills → bonus lands, coin turns, balance counts up, row appears.
- **First redemption:** "Use your ₹300" → deal fully covered → Spend flow (Screen C).
- **Check a transaction:** tap row → amount, ₹ at both rates, status, rule, balance after, reference.

## 6. The 3D coin and intro

Code lives in `src/components/coin/`:

| Module | Role |
|---|---|
| `Scoin3D.jsx` | Real geometry: satin field, 72 faceted triangles, rounded polished rim, 120 square reeds on the edge, extruded and bevelled S. Built once, shared by all coins. |
| `ScoinMaterial.js` | PBR gold finishes: sandblasted face (tiled grain bump, faint lathe-ring roughness), polished emblem and rim, darker reeded edge. |
| `CoinGroup.jsx` | The reference composition: centre coin forward, two smaller coins behind, turned outward. |
| `CoinIntroAnimation.jsx` | Canvas, studio light formers, shadow-casting key light, and the GSAP master timeline. |
| `useCoinInteraction.js` | Drag/flick to spin (settles face-forward), tap to flip, hover tilt, Enter/Space. |
| `timeline.js` | Phase times, shared with the DOM so wallet blocks fade in from the same playhead. |

Timeline (one GSAP `timeline`, labelled): `closeup` 0s → `spin` 0.5s → `formation` 1.6s → `wallet` 2.3s → end 3.0s.
The camera dolly is a single tween with a custom ease keyed in log-distance, so the pull-back reads as one move.
Repeat visits seek to `wallet`; reduced motion jumps to the end and disables coin interaction.
The review panel's scrubber seeks the same timeline (45° and 90° presets for checking depth and the edge).

## 7. Build status

- [x] Screen A: Wallet, all four states, sheets, earn celebration
- [x] 3D coin rebuilt with real depth; GSAP intro timeline; interactive coins
- [x] Screen B: Earn (current ways to earn + clearly labelled proposals)
- [x] Screen C: Spend and Withdraw flows with review, loading, success, error and not-enough-Scoins states
- [x] Behaviour model write-up (docs/deliverables.md)

All earn amounts, deals and card figures in the prototype are illustrative. The two conversion rates are fixed.
