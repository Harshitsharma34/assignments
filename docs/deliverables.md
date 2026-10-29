# Scoins redesign — submission

Prototype: https://claude.ai/artifact/VrxVM3azJxau7ZQbx6ibTs (interactive, 390 × 844; review panel switches user states)

---

## Deliverable 1 — Problem analysis

**Why Scoins feel useless today.** A Scoin balance is a number with no meaning. The wallet never says what 1,500 Scoins are worth in rupees, offers no Spend, Withdraw or Earn action, and leaves a zero balance as a decorative coin over an empty list. The one fact that would change behaviour, that Scoins are worth twice as much spent inside SalarySe, appears only in a cash-out popup with guilt copy ("lose value and proceed"), after the user has already decided to leave.

**What I found beyond the brief.**
- **The history looks like a rupee statement.** Rows read `+300.00` and `−200.00` with no unit and two decimals, so `+300.00` reads as ₹300 arriving. Fractional Scoins (`3.50`) make it worse. This is the same trust failure as the transfer screen showing ₹500 for 500 Scoins, repeated on every row.
- **Redeeming is drawn as a loss.** A deal purchase is a red minus, so the action we want most looks like losing money.
- **The balance doesn't reconcile.** One state shows lifetime earnings of 2,000 and an available balance of 0, with nothing explaining where the 2,000 went. Two states share the same history but show different balances, and dates mix formats.
- **Cardholders get a third currency.** Card reward points convert at 1 point = 1 Scoin, pending and available are blended, and "will reflect once the bill is generated" is the only explanation.
- **Earning is tied to credit products.** instacash rent, quickloans EMIs and card multipliers earn Scoins. Gamification built naively here could nudge people toward borrowing, so mechanics must reward paying on time, never borrowing more.
- **Deals ignore the balance.** "Save ₹1,000 extra" shows even at a balance of 0.

**What I'd fix first, in order.**
1. **Trust:** every amount carries its unit and its ₹ value, conversions are correct everywhere, and the ledger reconciles with a running balance.
2. **Lead with the in-app rupee value** (₹300) with the bank value beside it (or ₹150). The 2× becomes the default framing instead of a warning.
3. **A next action in every state:** progress toward the next reward, deals the balance actually covers, and a first step for new users.

---

## Deliverable 2 — High-fidelity designs

Built as a high-fidelity interactive prototype in code (React, Three.js) rather than Figma, so every state, conversion and transition can be tried. Screenshots are in `docs/`.

### Scoins wallet
Order, top to bottom, follows what a user needs first:
1. **Balance** — 1,500 Scoins, ₹300 to spend on SalarySe, "or ₹150 to your bank" (opens the rates explainer). 3D coins above, interactive.
2. **Quick actions** — Spend, Withdraw, Earn, History.
3. **Card rewards** (cardholders) — from SalarySe activity vs from card, pending points and when they convert.
4. **Next reward** — "2 more UPI payments · +10 Scoins · ₹2", progress, Pay via UPI.
5. **Popular deals** — ranked by what the balance covers; out-of-reach deals show how many more Scoins.
6. **What your Scoins are worth** — calculator: On SalarySe / To bank, amount slider, result with a Spend or Withdraw button carrying the amount.
7. **Recent activity** — rupee-first rows (`+₹60 / +300 Scoins`, "Saved ₹400", "₹150 to bank"); See all opens the month.

### Earn / discovery
- **Ways to earn today:** UPI bonus with progress, rent via instacash, bill payments, quickloans EMI, campaigns (pending reward or "Notify me"), up! card multiplier (status for cardholders, one line for others).
- **Proposed:** on-time bills streak, autopay setup, first eligible payment, recurring payments, card activation. Each is labelled Proposal with illustrative values.

### Redemption flow
- **Spend:** You can cover / Almost there → review (you save, Scoins used, rate, balance after) → confirming → success with updated balance, or error with retry. Bills take a chosen amount. Not enough Scoins says exactly how many more and links to Earn.
- **Withdraw:** amount slider at 10 Scoins = ₹1, "Worth ₹300 on SalarySe · Spend instead" shown as information, linked account, review → success or error.

### States covered
| State | Wallet | Earn | Spend / Withdraw |
|---|---|---|---|
| New user, never earned | What Scoins are, rate, first reward (0/5), other ways to earn | First-payment framing | Empty states pointing to Earn |
| Spent everything | ₹0, "Saved ₹400 with Scoins so far", next reward, history | Progress kept | Empty states pointing to Earn |
| Active, no card | Full wallet, one-line card benefit | Card shown as an option | All deals, withdraw |
| Active, cardholder | Card rewards breakdown, pending points | Card shown as Active | Same |
| Flow states | — | — | Loading, success, error (review-panel switch), not enough Scoins |

All earn amounts, deals, card figures, voucher codes and the bank account are illustrative. The two rates are fixed: 5 Scoins = ₹1 in-app, 10 Scoins = ₹1 to bank.

---

## Deliverable 3 — Behaviour model

| Mechanic | Behaviour it encourages | Value to the user | Value to SalarySe | How we'd measure it |
|---|---|---|---|---|
| Rupee-first balance (₹300 · 1,500 Scoins · or ₹150 to bank) | Checking and planning with Scoins as money | Understands worth in seconds | Scoins start to matter | Share of users who state the ₹ value correctly in tests; wallet → Spend tap-through |
| Both rates side by side, "2× the bank value" | Choosing to spend in-app | Gets twice the value | Value stays in the ecosystem | % of Scoins spent in-app vs withdrawn |
| UPI progress tracker (3 of 5) | Repeat eligible UPI payments | A clear, short path to the next reward | More UPI volume through SalarySe | Bonus completion rate; UPI payments per user per cycle |
| Deals ranked by what the balance covers, "1,000 more Scoins" | A first redemption; saving toward a deal | No doubt about whether it's enough | Earlier first redemption | First-redemption rate; time to first redemption |
| Savings framing ("Saved ₹400", lifetime saved) | Redeeming again | Spending feels like gaining, not losing | Higher redemption frequency | Redemptions per active user per month |
| Calculator that ends in Spend / Withdraw with the amount | Turning curiosity into an action | Fewer steps, no re-entering amounts | Conversion from exploring to redeeming | Calculator → completed redemption rate |
| Earn celebration (coin turn, count-up, new row) | Noticing and repeating the earning action | Confirmation the reward landed | Repeat earning | Repeat earning within the next cycle |
| Pending vs available card points with the statement date | Using the card without confusion | No surprise about missing points | Fewer "where are my points" contacts | Support contacts on points; card UPI share |
| One contextual line on the card's 10× (non-cardholders) | Considering the card for UPI | More Scoins per payment, if it suits them | Card interest without an ad-filled wallet | Click-through; dismissals |
| Neutral withdrawal ("Worth ₹300 on SalarySe · Spend instead") | Withdrawing only when cash is needed | Free choice, no guilt | Trust; lower withdrawal share without dark patterns | Withdrawal share; complaints |
| Proposed: on-time bills, 3 months running | Paying before the due date | Avoids late fees, better credit habits | Bills paid on SalarySe, lower default risk | On-time payment rate |
| Proposed: autopay setup | Moving recurring bills to autopay | Never misses a bill | Retained recurring payments | Autopay adoption; 90-day retention |
| Proposed: first eligible payment | Activation for new users | Immediate, tangible value | Activation | D7 activation rate |
| Proposed: recurring payments (capped at 3) | Keeping monthly payments on SalarySe | Rewards for what they already pay | Monthly active payers | Recurring payers per month |
| Proposed: card activation | Finishing card activation | Card becomes usable | Activated cards | Activation rate after approval |

**Guardrails.** No mechanic rewards borrowing more or spending more for its own sake. Streaks reward punctuality, never volume. Caps stop gaming (recurring payments up to 3, the UPI bonus resets every 5 payments). Withdrawing is always available and never framed as a loss.
