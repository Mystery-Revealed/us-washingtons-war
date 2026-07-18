// content.test.js — structure, scoring-reachability, divergence, named-figure,
// documented-vs-legend, and sensitivity checks on Washington's War content. The
// core promises (spec §3, §4, §10): 7 campaigns × 2 decisions = 14 graded actions
// with exactly one right answer each (so all-right = 100%); every "glory" option
// graded ❌; endings tiered by the METER SUM (not accuracy); the Valley Forge D1
// beat scoring a full 1 while naming ~2,000 dead (the divergence); and the five
// key figures named in their steps.
import test from 'node:test';
import assert from 'node:assert/strict';
import game, {
  METERS, START_METERS, CAMPAIGNS, SIDE, VOCAB, MAP_STRIP,
  phasesFor, armyScore, endingFor, debriefFor, ENDINGS, STRONG_MIN, BARELY_MIN,
} from '../src/games/usWashingtonsWar.js';

const stepsOf = () => phasesFor().flatMap((p) => p.steps);
const pointsFor = (v) => (v === 'right' ? 1 : v === 'partial' ? 0.5 : 0);

test('one class group, solo, no rival, three meters at 50, 14 actions', () => {
  assert.deepEqual(game.sides, ['class']);
  assert.equal(SIDE, 'class');
  assert.equal(game.soloRival, false, 'you command the army alone — no AI rival');
  assert.deepEqual(Object.keys(METERS), ['army', 'supplies', 'morale']);
  assert.deepEqual(START_METERS, { army: 50, supplies: 50, morale: 50 });
  assert.equal(game.meta.positions, undefined, 'no map board');
  assert.equal(game.totalActions, 14);
  assert.equal(game.chapterCount, 7, 'seven campaigns');
});

test('seven campaigns, each with a situation card and two decisions', () => {
  assert.equal(CAMPAIGNS.length, 7, 'seven campaigns');
  for (const [i, c] of CAMPAIGNS.entries()) {
    assert.ok(c.title?.length > 2, `campaign ${i} title`);
    assert.ok(c.situation?.length > 20, `campaign ${i} situation card`);
    assert.ok(c.image?.length > 4, `campaign ${i} scene image`);
    assert.equal(c.steps.length, 2, `campaign ${i}: two decisions`);
  }
});

test('fourteen decisions, each with three choices and all fields present', () => {
  const steps = stepsOf();
  assert.equal(steps.length, 14, 'fourteen graded actions');
  for (const [c, s] of steps.entries()) {
    assert.equal(s.kind, 'decision', `decision ${c} is a decision`);
    assert.equal(s.choices.length, 3, `decision ${c}: three choices`);
    for (const ch of s.choices) {
      assert.ok(ch.label?.length > 5, `decision ${c} label`);
      assert.ok(['right', 'partial', 'wrong'].includes(ch.verdict), `decision ${c} verdict`);
      assert.ok(ch.feedback?.length > 10, `decision ${c} feedback`);
      assert.equal(typeof ch.effects, 'object', `decision ${c} effects object`);
    }
  }
});

test('exactly one right answer per decision (this is what makes 100% reachable)', () => {
  for (const [c, s] of stepsOf().entries()) {
    const rights = s.choices.filter((ch) => ch.verdict === 'right').length;
    assert.equal(rights, 1, `decision ${c}: exactly one right`);
  }
});

test('every "glory" / pitched-battle option is graded wrong (spec §1, §10 checklist)', () => {
  const steps = stepsOf();
  const gloryChecks = [
    [0, /Storm Boston now/i],
    [2, /one great battle/i],
    [3, /grand assault straight at New York/i],
    [4, /whole army north yourself, for the glory/i],
    [6, /Storm Philadelphia/i],
    [8, /wipe the column out completely/i],
    [12, /immediate frontal storm/i],
  ];
  for (const [idx, re] of gloryChecks) {
    const ch = steps[idx].choices.find((c) => re.test(c.label));
    assert.ok(ch, `decision ${idx}: glory option present (${re})`);
    assert.equal(ch.verdict, 'wrong', `decision ${idx}: the glorious option is graded wrong`);
  }
});

test('key explicit meter effects match spec §4', () => {
  const steps = stepsOf();
  // C1 D1 right — drill: army +10, morale +5
  assert.deepEqual(steps[0].choices.find((c) => c.verdict === 'right').effects, { army: 10, morale: 5 });
  // C1 D1 wrong — storm Boston: army −15
  assert.deepEqual(steps[0].choices.find((c) => /Storm Boston/i.test(c.label)).effects, { army: -15 });
  // C2 D2 right — Christmas gamble: army +5, morale +20
  assert.deepEqual(steps[3].choices.find((c) => c.verdict === 'right').effects, { army: 5, morale: 20 });
  // C4 D1 right — hold together: supplies +10, morale +10 (still positive, still grim)
  assert.deepEqual(steps[6].choices.find((c) => c.verdict === 'right').effects, { supplies: 10, morale: 10 });
  // C4 D2 right — von Steuben drillmaster: army +15, morale +10
  assert.deepEqual(steps[7].choices.find((c) => c.verdict === 'right').effects, { army: 15, morale: 10 });
});

// --- Playthrough helpers: drive the adapter directly, honoring the shuffle ----
function playRun(pick = 'right') {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  for (let c = 0; c < game.totalActions; c++) {
    game.chapterEvent(state, SIDE);
    const ss = state.sides[SIDE];
    const step = stepsOf()[c];
    let real = step.choices.findIndex((ch) => ch.verdict === pick);
    if (real < 0) real = step.choices.findIndex((ch) => ch.verdict === 'partial'); // fallback
    if (real < 0) real = 0;
    const choiceIndex = ss.shuffles[c].indexOf(real);
    const res = game.resolve(state, SIDE, { kind: 'decision', choiceIndex });
    assert.ok(!res.error, `decision ${c}: ${res.error}`);
  }
  return game.report(state).perSide[SIDE];
}

test('all-right = 100% accuracy and "The World Turned Upside Down" (strong)', () => {
  const r = playRun('right');
  assert.equal(r.accuracy, 100);
  assert.equal(r.ending.key, 'strong', 'a whole, drilled army reaches Yorktown');
  assert.ok(r.score >= STRONG_MIN, `meter sum ${r.score} lands in the strong band`);
});

test('all-glory (all-wrong) scores 0% and "An Army of Ghosts" (gutted) — but Yorktown still falls', () => {
  const r = playRun('wrong');
  assert.equal(r.accuracy, 0, 'the bold options score near nothing');
  assert.equal(r.ending.key, 'ghosts', 'the army melts away before Yorktown');
  assert.ok(r.score < BARELY_MIN, `meter sum ${r.score} lands in the gutted band`);
});

test('endings tier by the METER SUM, not accuracy (spec §3)', () => {
  assert.equal(endingFor(300).key, 'strong');
  assert.equal(endingFor(STRONG_MIN).key, 'strong');
  assert.equal(endingFor(STRONG_MIN - 1).key, 'barely');
  assert.equal(endingFor(BARELY_MIN).key, 'barely');
  assert.equal(endingFor(BARELY_MIN - 1).key, 'ghosts');
  assert.equal(ENDINGS.strong.title, 'The World Turned Upside Down');
  assert.equal(ENDINGS.barely.title, 'By a Thread');
  assert.equal(ENDINGS.ghosts.title, 'An Army of Ghosts');
});

test('THE DIVERGENCE: Valley Forge D1 shows the human cost while scoring a full 1 (spec §3, §10)', () => {
  const c4d1 = stepsOf()[6];
  assert.match(c4d1.prompt, /winter/i, 'the Valley Forge winter card');
  const right = c4d1.choices.find((c) => c.verdict === 'right');
  assert.equal(pointsFor(right.verdict), 1, 'holding the army together scores a full point');
  assert.match(right.label, /Hold the army together/i, 'the accurate command is to endure, together');
  assert.match(right.feedback, /2,000/, 'the feedback names nearly 2,000 dead even as it scores 1');
  assert.match(right.feedback, /die|died|dead/i, 'the human cost is stated, not softened');

  // The visible dip: the Valley Forge situation card itself imposes a meter toll
  // (spec §3), so even accurate play shows the winter's hardship on the bars.
  const valleyForge = CAMPAIGNS[3];
  assert.equal(valleyForge.title, 'Valley Forge');
  assert.ok(valleyForge.eventEffects, 'the winter card carries a one-time toll');
  const toll = Object.values(valleyForge.eventEffects);
  assert.ok(toll.every((v) => v < 0) && toll.length >= 1, 'the toll only ever costs meters');
});

test('the Valley Forge toll dips the meters even on a flawless run, yet still tiers strong', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  const steps = stepsOf();
  let beforeVF = null;
  for (let c = 0; c < game.totalActions; c++) {
    const ss = state.sides[SIDE];
    if (c === 6) beforeVF = { ...ss.meters };            // meters entering Valley Forge D1
    game.chapterEvent(state, SIDE);                       // applies the situation-card toll
    if (c === 6) {
      const afterCard = { ...ss.meters };
      const dipped = ['army', 'supplies', 'morale'].some((m) => afterCard[m] < beforeVF[m]);
      assert.ok(dipped, 'the winter card visibly drops at least one meter before any choice');
    }
    const real = steps[c].choices.findIndex((x) => x.verdict === 'right');
    const ci = ss.shuffles[c].indexOf(real);
    assert.ok(!game.resolve(state, SIDE, { kind: 'decision', choiceIndex: ci }).error);
  }
  const r = game.report(state).perSide[SIDE];
  assert.equal(r.accuracy, 100, 'the dip never touches the grade');
  assert.equal(r.ending.key, 'strong', 'a flawless run still reaches the strong ending');
});

test('the five key figures are named in their steps (spec §10 checklist)', () => {
  const text = stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => `${c.label} ${c.feedback}`)]).join(' ');
  for (const re of [/Knox/, /von Steuben/, /Franklin/, /Lafayette/, /Armistead/]) {
    assert.match(text, re, `key figure named: ${re}`);
  }
});

test('James Armistead is named as enslaved, with his skill driving the step (spec §11, Standards 10.1)', () => {
  const c6d1 = stepsOf()[10];
  const right = c6d1.choices.find((c) => c.verdict === 'right');
  assert.match(right.feedback, /enslaved Virginian/i, 'Armistead\'s enslavement is named plainly');
  assert.match(right.feedback, /maps Cornwallis/i, 'his skill maps the whole British position — it drives the trap');
});

test('documented vs. legend is labeled correctly (spec §10 checklist)', () => {
  const steps = stepsOf();
  // "Victory or Death" — the documented Trenton watchword (Campaign 2 D2 right feedback).
  assert.match(steps[3].choices.find((c) => c.verdict === 'right').feedback, /Victory or Death/,
    'the documented Trenton watchword appears');
  // The Yorktown surrender song is flagged as legend, not stated as fact (Campaign 7 D2 prompt).
  assert.match(steps[13].prompt, /legend says the band plays/i,
    'the surrender-song story is labeled legend');
});

test('all four vocabulary terms appear in student-visible text (spec §2 bubbles)', () => {
  // Student-visible text = the situation cards + every prompt, choice label, and feedback line.
  const text = [
    ...CAMPAIGNS.map((c) => c.situation),
    ...stepsOf().flatMap((s) => [s.prompt, ...s.choices.map((c) => `${c.label} ${c.feedback}`)]),
  ].join(' ');
  assert.deepEqual(Object.keys(VOCAB), ['siege', 'militia', 'mercenary', 'forage']);
  for (const re of [/siege/i, /militia/i, /mercenar/i, /forage/i]) {
    assert.match(text, re, `vocabulary term present: ${re}`);
  }
});

test('the debrief lands the same truth every tier: America OUTLASTED Britain (8.4C, 8.22A)', () => {
  const d = debriefFor();
  assert.match(d, /outlasted/i, 'America outlasted, not overpowered');
  assert.match(d, /Treaty of Paris/, 'names the 1783 treaty that made independence real');
  assert.match(d, /Mississippi/, 'independence to the Mississippi');
  assert.match(d, /France|French/, 'names the French alliance as decisive');
});

test('the map strip runs Boston → Yorktown, one stop per campaign (spec §5, §6)', () => {
  assert.equal(MAP_STRIP.length, 7, 'one waypoint per campaign');
  assert.equal(MAP_STRIP[0].place, 'Boston');
  assert.equal(MAP_STRIP[6].place, 'Yorktown');
  assert.equal(MAP_STRIP[0].x, 0, 'progress starts at the left');
  assert.equal(MAP_STRIP[6].x, 1, 'progress ends at the right');
  assert.deepEqual(game.meta.mapStrip, MAP_STRIP, 'shipped to the client in meta');
});

test('armyScore adds the three meters; it is what decides the tier', () => {
  assert.equal(armyScore({ army: 50, supplies: 50, morale: 50 }), 150);
  assert.equal(armyScore({ army: 95, supplies: 70, morale: 100 }), 265);
});

test('currentPrompt never leaks the answer key (labels only)', () => {
  const state = game.initMatch({ mode: 'solo', soloSide: SIDE });
  game.chapterEvent(state, SIDE);
  const prompt = game.currentPrompt(state, SIDE);
  assert.equal(prompt.kind, 'decision');
  assert.equal(prompt.choices.length, 3);
  for (const c of prompt.choices) assert.equal(typeof c, 'string');
  assert.ok(!('verdict' in prompt), 'no verdict leaks');
});
