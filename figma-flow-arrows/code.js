// Draws the flow arrows on the "Scoins screens" page: gold arrows between consecutive
// screens, and labelled elbow arrows for the branches out of the wallet. Run once.
const GOLD = { r: 0.886, g: 0.714, b: 0.361 };

async function run() {
  const page = await figma.getNodeByIdAsync('10:2505');
  await figma.setCurrentPageAsync(page);
  await figma.loadFontAsync({ family: 'Noto Sans', style: 'Bold' });

  // Remove arrows from an earlier run so it can be re-run safely.
  page.findAll((n) => n.name.startsWith('Arrow · ') || n.name.startsWith('Arrow label · ')).forEach((n) => n.remove());

  async function arrow(section, pts, name) {
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const mx = Math.min(...xs), my = Math.min(...ys);
    const v = figma.createVector();
    v.name = `Arrow · ${name}`;
    await v.setVectorNetworkAsync({
      vertices: pts.map((q, i) => ({ x: q[0] - mx, y: q[1] - my, strokeCap: i === pts.length - 1 ? 'ARROW_LINES' : 'NONE', strokeJoin: 'ROUND' })),
      segments: pts.slice(1).map((_, i) => ({ start: i, end: i + 1 })),
    });
    v.strokes = [{ type: 'SOLID', color: GOLD }];
    v.strokeWeight = 3;
    v.fills = [];
    section.appendChild(v);
    v.x = mx; v.y = my;
  }
  function label(section, text) {
    const t = figma.createText();
    t.fontName = { family: 'Noto Sans', style: 'Bold' };
    t.fontSize = 14;
    t.characters = text;
    t.fills = [{ type: 'SOLID', color: GOLD }];
    t.name = `Arrow label · ${text}`;
    section.appendChild(t);
    return t;
  }
  async function box(id) {
    const n = await figma.getNodeByIdAsync(id);
    return { x: n.x, y: n.y, r: n.x + n.width, b: n.y + n.height, cx: n.x + n.width / 2 };
  }
  // Straight arrow in the gap between two side-by-side screens.
  async function next(section, a, b, name) {
    const A = await box(a), B = await box(b);
    const y = Math.min(A.y, B.y) + 300;
    await arrow(section, [[A.r + 6, y], [B.x - 6, y]], name);
  }

  // Scoins Home
  const home = await figma.getNodeByIdAsync('15:8558');
  await next(home, '15:5947', '15:5922', 'Intro close-up → formation');
  await next(home, '15:5922', '15:5985', 'Intro formation → landing');
  await next(home, '15:5985', '15:3468', 'Intro → wallet');
  await next(home, '15:3468', '15:6191', 'Wallet → rates sheet');
  await next(home, '15:11957', '15:12290', 'Deals → review');
  await next(home, '15:12290', '15:12580', 'Review → success');
  await next(home, '15:13336', '20:14436', 'Bill review → bill success');

  // Branches out of the wallet, routed in lanes under the screens.
  const W = await box('15:3468');
  const lanes = [
    ['15:8665', 'Tap an activity row', 0],
    ['15:11957', 'Spend', -50],
    ['15:12774', 'Spend with ₹0', 0],
    ['15:12828', 'How card rewards work', 0],
  ];
  let laneY = 1050;
  for (const [id, text, dx] of lanes) {
    const T = await box(id);
    const x = T.cx + dx;
    await arrow(home, [[W.r + 6, laneY], [x, laneY], [x, T.b + 8]], `Wallet → ${text}`);
    const t = label(home, text);
    t.x = x - t.width - 10; t.y = laneY - t.height - 4;
    laneY += 44;
  }
  // Deals → bill review ("Pay a bill").
  const D = await box('15:11957'), BR = await box('15:13336');
  const y5 = laneY + 10;
  await arrow(home, [[D.cx + 50, D.b + 8], [D.cx + 50, y5], [BR.cx, y5], [BR.cx, BR.b + 8]], 'Deals → bill review');
  const t5 = label(home, 'Pay a bill');
  t5.x = BR.cx - t5.width - 10; t5.y = y5 - t5.height - 4;

  // Withdraw to a bank: amount → UPI → OTP → filled → processing → success.
  const wd = await figma.getNodeByIdAsync('15:7906');
  const chain = ['15:6772', '15:7009', '15:7247', '15:11084', '15:11951', '15:11952'];
  const names = ['Enter UPI ID', 'Swipe', 'Enter OTP', 'Verify', 'Sent'];
  for (let i = 0; i < chain.length - 1; i++) await next(wd, chain[i], chain[i + 1], names[i]);
}

run()
  .then(() => figma.closePlugin('Flow arrows added'))
  .catch((e) => figma.closePlugin(`Couldn't add arrows: ${e.message}`));
