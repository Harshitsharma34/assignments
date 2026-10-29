"""Builds figma-plugin/code.js from docs/case-study/screens: one section per flow, one frame per screen.
Run from the repo root: python3 docs/case-study/build_figma_plugin.py"""
import base64, io, json, os
from PIL import Image

SRC = 'docs/case-study/screens'
GROUPS = [
    ('Wallet', [('wallet-active', 'Wallet / Active'), ('wallet-cardholder', 'Wallet / Cardholder'), ('wallet-spent', 'Wallet / Spent everything'), ('wallet-new', 'Wallet / New user'), ('wallet-reward-landed', 'Wallet / Reward landed')]),
    ('Wallet sheets', [('sheet-rates', 'Sheet / Rates'), ('sheet-history', 'Sheet / All activity'), ('sheet-transaction', 'Sheet / Transaction details')]),
    ('Intro animation', [('intro-1-closeup', 'Intro / 1 Close-up'), ('intro-2-edge', 'Intro / 2 Edge-on'), ('intro-3-formation', 'Intro / 3 Formation'), ('intro-4-landed', 'Intro / 4 Wallet')]),
    ('Earn', [('earn-active', 'Earn / Active'), ('earn-cardholder', 'Earn / Cardholder'), ('earn-new', 'Earn / New user')]),
    ('Spend flow', [('spend-list', 'Spend / 1 Choose'), ('spend-review', 'Spend / 2 Review'), ('spend-confirming', 'Spend / 3 Confirming'), ('spend-success', 'Spend / 4 Success'), ('spend-bill-review', 'Spend / Bill amount'), ('spend-not-enough', 'Spend / Not enough Scoins')]),
    ('Withdraw flow', [('withdraw-1-amount', 'Withdraw / 1 Amount and UPI ID'), ('withdraw-2-upi-check', 'Withdraw / 2 UPI ID check'), ('withdraw-3-otp', 'Withdraw / 3 OTP'), ('withdraw-4-otp-error', 'Withdraw / 4 OTP error'), ('withdraw-5-processing', 'Withdraw / 5 Processing'), ('withdraw-6-success-confetti', 'Withdraw / 6 Success with confetti'), ('withdraw-7-success', 'Withdraw / 7 Success')]),
]

data = []
for name, items in GROUPS:
    frames = []
    for fid, label in items:
        im = Image.open(os.path.join(SRC, fid + '.png')).convert('RGB')
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=88, optimize=True)
        frames.append({'name': label, 'w': im.width // 2, 'h': im.height // 2, 'b64': base64.b64encode(buf.getvalue()).decode()})
    data.append({'name': name, 'frames': frames})

template = open('figma-plugin/code.js').read()
head, _, rest = template.partition('const GROUPS = ')
_, _, tail = rest.partition('\n\nasync function run()')
open('figma-plugin/code.js', 'w').write(head + 'const GROUPS = ' + json.dumps(data) + '\n\nasync function run()' + tail)
print('frames:', sum(len(g['frames']) for g in data))
