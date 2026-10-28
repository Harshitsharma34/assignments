// Illustrative prototype data. Earn amounts and deals are examples, not confirmed SalarySe offers.
// Each state reconciles: opening + settled activity = balance = earned − spent − withdrawn.

const tx = (id, kind, title, source, scoins, at, extra = {}) => ({ id, kind, title, source, scoins, at, ...extra })

const UPI_RULE = 'Every 5th UPI payment through SalarySe earns a bonus.'

export const USER_STATES = {
  new: {
    id: 'new',
    label: 'New user',
    hint: 'Never earned',
    hasCard: false,
    opening: 0,
    lifetime: { earned: 0, spent: 0, withdrawn: 0 },
    upi: { done: 0, target: 5, reward: 10 },
    activity: [],
    pending: [],
  },

  redeemed: {
    id: 'redeemed',
    label: 'Spent it all',
    hint: '0 balance, has history',
    hasCard: false,
    opening: 1800,
    lifetime: { earned: 2000, spent: 2000, withdrawn: 0 },
    upi: { done: 3, target: 5, reward: 10 },
    activity: [
      tx('r1', 'rent', 'Rent paid via instacash', 'instacash', 150, '2026-10-05T10:02'),
      tx('r2', 'upi', 'UPI bonus · 5th payment', 'UPI', 10, '2026-10-09T19:40', { rule: UPI_RULE }),
      tx('r3', 'bill', 'Electricity bill', 'Bill payment', 40, '2026-10-12T09:12'),
      tx('r4', 'redeem', 'Amazon Pay gift card', 'Deal', -2000, '2026-10-21T20:15', { saved: 400 }),
    ],
    pending: [],
  },

  active: {
    id: 'active',
    label: 'Active · no card',
    hint: '1,500 Scoins',
    hasCard: false,
    opening: 1250,
    lifetime: { earned: 2450, spent: 950, withdrawn: 0 },
    upi: { done: 3, target: 5, reward: 10 },
    activity: [
      tx('a1', 'bill', 'Electricity bill', 'Bill payment', 25, '2026-10-03T09:12'),
      tx('a2', 'rent', 'Rent paid via instacash', 'instacash', 300, '2026-10-05T10:02'),
      tx('a3', 'upi', 'UPI bonus · 5th payment', 'UPI', 10, '2026-10-09T19:40', { rule: UPI_RULE }),
      tx('a4', 'redeem', 'Amazon Pay gift card', 'Deal', -250, '2026-10-14T13:15', { saved: 50 }),
      tx('a5', 'emi', 'quickloans EMI paid on time', 'quickloans', 55, '2026-10-18T08:30'),
      tx('a6', 'upi', 'UPI bonus · 5th payment', 'UPI', 10, '2026-10-22T21:05', { rule: UPI_RULE }),
      tx('a7', 'campaign', 'Diwali campaign reward', 'Campaign', 100, '2026-10-26T18:34'),
    ],
    pending: [
      { id: 'p1', kind: 'campaign', title: 'Swiggy partner offer', source: 'Campaign', scoins: 100, expected: 'by 31 Oct', note: 'Confirms once the partner verifies your order.' },
    ],
  },

  card: {
    id: 'card',
    label: 'Active · cardholder',
    hint: '1,500 incl. card rewards',
    hasCard: true,
    opening: 790,
    lifetime: { earned: 2210, spent: 710, withdrawn: 0 },
    upi: { done: 3, target: 5, reward: 10 },
    card: {
      name: 'up! credit card',
      converted: 500, // reward points already added to the balance
      statement: '12 Oct',
      cycleEstimate: 180, // points earned this cycle, not yet spendable
      nextStatement: '12 Nov',
    },
    activity: [
      tx('c1', 'bill', 'Electricity bill', 'Bill payment', 25, '2026-10-03T09:12'),
      tx('c2', 'rent', 'Rent paid via instacash', 'instacash', 300, '2026-10-05T10:02'),
      tx('c3', 'upi', 'UPI on up! card', 'UPI · up! card', 40, '2026-10-09T19:40', { multiplier: 10 }),
      tx('c4', 'card', 'Card rewards · 12 Oct statement', 'up! credit card', 500, '2026-10-12T06:00', { note: '500 reward points converted at 1 point = 1 Scoin.' }),
      tx('c5', 'redeem', 'Amazon Pay gift card', 'Deal', -250, '2026-10-14T13:15', { saved: 50 }),
      tx('c6', 'emi', 'quickloans EMI paid on time', 'quickloans', 55, '2026-10-18T08:30'),
      tx('c7', 'upi', 'UPI on up! card', 'UPI · up! card', 40, '2026-10-22T21:05', { multiplier: 10 }),
    ],
    pending: [
      { id: 'cp1', kind: 'card', title: 'Card rewards this cycle', source: 'up! credit card', scoins: 180, expected: 'after 12 Nov statement', note: 'Estimated points from this billing cycle. They become Scoins once the statement is generated.' },
    ],
  },
}

export const STATE_ORDER = ['new', 'redeemed', 'active', 'card']

// Illustrative deals. `cost` is in Scoins; savings are derived from the in-app rate.
export const DEALS = [
  { id: 'zomato', brand: 'Zomato', title: '₹100 off your next order', cost: 500, kind: 'voucher' },
  { id: 'bill', brand: 'Bill payments', title: 'Pay part of any bill', cost: null, kind: 'bill' },
  { id: 'amazon', brand: 'Amazon Pay', title: '₹250 gift card', cost: 1250, kind: 'voucher' },
  { id: 'myntra', brand: 'Myntra', title: '₹500 off fashion', cost: 2500, kind: 'voucher' },
]
