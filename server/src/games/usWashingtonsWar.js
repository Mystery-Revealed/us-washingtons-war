// usWashingtonsWar.js — Unit 2 U.S. History adapter: "Washington's War: Keep
// the Army Alive" (SOLO, single class group, NO variant, NO branch, NO AI rival).
//
// The student commands the Continental Army from Boston (1775) to Yorktown (1781)
// across SEVEN campaigns, each a situation card plus TWO graded decisions —
// 14 graded actions in all. The whole design turns on one truth (spec §1):
// Washington's real strategy was SURVIVAL, not glory. He lost more battles than
// he won and still won the war. So every "glorious" pitched-battle option is the
// historically wrong one and is graded ❌; the right move is almost never the
// bold one. Winning means still having an army when the French fleet reaches
// Yorktown.
//
// THE ENGINE OF THE DESIGN (spec §1, §3): three meters — Army 🪖, Supplies 🎒,
// Morale 🔥 — are DRAMA. ACCURACY (verdict-only, right=1 / partial=0.5 / wrong=0)
// grades whether you commanded as Washington did. The meters decide only the
// ENDING TIER (their sum at Yorktown, spec §3): strong / battered / gutted. Even
// perfectly accurate play DIPS at Valley Forge — the divergence is deliberate and
// tested: Campaign 4 D1 scores a full 1 while the feedback names ~2,000 dead.
//
// Straight factory usage (spec §6): 7 phases × 2 static graded steps, one class
// group ('class'), no variants, no branch, no map board, no AI rival. Two client
// novelties (spec §5, §6) are PURELY presentational and live in the client: the
// between-campaign map strip (Boston → Yorktown, an advancing dot) reads the
// chapter index the engine already ships, and the vocabulary tap-bubbles underline
// the four terms in `VOCAB`. Neither touches scoring.
//
// Reading level (Common Standards §3): every student-facing word is 8th-grade
// content at a 5th-grade reading level, in the steady voice of an aide-de-camp.
//
// SENSITIVITY (spec §11, Common Standards §10): war without gore. The ~2,000
// Valley Forge dead are stated with weight, never depicted. The Hessians are
// "soldiers paid to fight for Britain," not caricature. James Armistead's
// enslavement is named plainly and his skill drives his step (Standards 10.1).
// Benedict Arnold is tragedy, not glamor. The lesson is that patience and
// endurance — not glory — were what leadership required (8.22A); the bold option
// grading wrong is the lesson landing, not a bug.

import { createStepGame } from './_stepGame.js';

// ---------------------------------------------------------------------------
// Meters (shipped to clients at match:begin — display info only). Start 50 each
// (spec §3). Their SUM at the end picks the ending tier; they never touch accuracy.
// ---------------------------------------------------------------------------

export const METERS = {
  army:     { name: 'Army',     icon: 'army',     blurb: 'Trained soldiers still in the ranks. Rule One: the Revolution lives as long as the army does.' },
  supplies: { name: 'Supplies', icon: 'supplies', blurb: 'Food, powder, and shoes. An army marches and fights on what it can carry and find.' },
  morale:   { name: 'Morale',   icon: 'morale',   blurb: 'The will to stay. When morale breaks, enlistments expire and men go home.' },
};

export const START_METERS = { army: 50, supplies: 50, morale: 50 };

// One class group (spec §1: "Pick: none — one class group"). The roster and the
// Command Center group every student under this single side.
export const SIDE = 'class';

// The four required vocabulary terms (spec §2). The client underlines these in
// student-visible text with tap-for-plain-words bubbles.
export const VOCAB = {
  siege:     'surrounding a place to starve it out',
  militia:   'part-time citizen soldiers, not full-time trained troops',
  mercenary: 'a soldier paid to fight for a foreign country (the Hessians)',
  forage:    'searching the countryside for food and supplies',
};

// ---------------------------------------------------------------------------
// Decisions. Every choice carries an EXPLICIT effects object (spec §4 names the
// meter change for each option; where the spec names none, the effect is {} — a
// verdict with no meter cost). This differs from the Mutiny adapter's default
// ±10 formula: Washington's War tunes each option's meter toll by hand so the
// ending tiers (spec §3) land where the history says they should.
//
// v: 'right' | 'partial' | 'wrong'   fx: explicit meter effects for that choice.
// ---------------------------------------------------------------------------

const V = { R: 'right', P: 'partial', W: 'wrong' };

function choice(label, verdict, fx, feedback) {
  return { label, verdict, effects: fx, feedback };
}

// A decision is a prompt (the order you must give) + three choices, one graded step.
function decision(prompt, a, b, c) {
  return {
    kind: 'decision',
    prompt,
    choices: [
      choice(a.label, a.v, a.fx, a.fb),
      choice(b.label, b.v, b.fx, b.fb),
      choice(c.label, c.v, c.fx, c.fb),
    ],
  };
}

// ---------------------------------------------------------------------------
// The seven campaigns. Each is a situation card (title / date-place plate / scene
// image / situation text) plus two decisions. Content is verbatim from spec §4;
// the aide-de-camp voice and 5th-grade reading level are authored here.
// ---------------------------------------------------------------------------

export const CAMPAIGNS = [
  // ===== Campaign 1 — Boston (1775–76) =====================================
  {
    title: 'Boston',
    date: '1775–76 · Massachusetts',
    place: 'Boston',
    image: 'scene_boston.jpg',
    situation:
      'Congress hands you 15,000 to 20,000 militia penning the British into Boston — brave men, but not yet an army. They can shoot. They cannot yet march, hold a line, or take orders under fire.',
    steps: [
      decision(
        'Your first order as commander?',
        { label: 'Drill them daily, set real discipline, clean the camps, and sign men to long enlistments.',
          v: V.R, fx: { army: 10, morale: 5 },
          fb: 'Farmers walked into this camp; an army must walk out. Discipline first — everything else stands on it.' },
        { label: 'Storm Boston now, while spirits are high and the men are eager.',
          v: V.W, fx: { army: -15 },
          fb: 'Untrained men against stone fortifications — the Revolution could die in a single afternoon.' },
        { label: 'Just blockade the city and wait. Train them later, when there is time.',
          v: V.P, fx: { supplies: -5 },
          fb: 'A siege rots an idle army. Half-right — you hold the line — and half-wasted, because the men learn nothing.' },
      ),
      decision(
        'You have the British trapped, but no siege cannon to force them out.',
        { label: 'Send Henry Knox to drag Fort Ticonderoga’s guns about 300 miles through the snow.',
          v: V.R, fx: { supplies: 10, morale: 10 },
          fb: 'Madness on paper — and it worked. Guns appear on Dorchester Heights overnight, and the British sail away without a battle.' },
        { label: 'Attack the fortifications now, without artillery.',
          v: V.W, fx: { army: -10 },
          fb: 'Muskets do not answer fortress walls. You would spend the army and gain nothing.' },
        { label: 'Wait for France to send us cannon.',
          v: V.W, fx: { morale: -5 },
          fb: 'France is not watching yet. You have to earn the alliance before it will risk a single gun on you.' },
      ),
    ],
  },

  // ===== Campaign 2 — New York (1776) =====================================
  {
    title: 'New York',
    date: '1776 · New York',
    place: 'New York',
    image: 'scene_trenton.jpg',
    situation:
      'A massive British force lands to take New York — the largest army Britain has ever sent overseas. Congress wants the city held at all costs.',
    steps: [
      decision(
        'Hold the city, or save the army?',
        { label: 'Fight slow delaying actions, then retreat with the army whole.',
          v: V.R, fx: { army: 5, morale: -5 },
          fb: 'Lose the city, save the war. Washington lost more battles than he won — and still won. The army is the cause; a city is only a place.' },
        { label: 'Stake everything on one great battle to defend New York.',
          v: V.W, fx: { army: -20 },
          fb: 'That is exactly the trap Britain prayed you would walk into — your whole army, cornered, in one afternoon.' },
        { label: 'Abandon everything at once, without firing a shot.',
          v: V.P, fx: { supplies: -10, morale: -10 },
          fb: 'It saves men — but it bleeds your credibility and leaves gear behind. Retreat is a skill, not a stampede.' },
      ),
      decision(
        'December. Enlistments expire in days. The cause is at the brink of collapse.',
        { label: 'Take the Christmas gamble: cross the icy Delaware and hit the Hessians at Trenton.',
          v: V.R, fx: { army: 5, morale: 20 },
          fb: 'The watchword is "Victory or Death." You surprise the mercenaries at dawn, the Revolution revives, and men re-enlist.' },
        { label: 'Go into winter quarters now and recruit fresh troops in the spring.',
          v: V.W, fx: { morale: -15 },
          fb: 'By spring there is no army left to recruit into. The enlistments would run out first, and the cause with them.' },
        { label: 'Throw one more grand assault straight at New York.',
          v: V.W, fx: { army: -15 },
          fb: 'Desperation is not a strategy. You would only finish the wreck the British started.' },
      ),
    ],
  },

  // ===== Campaign 3 — The North Decides (1777) ============================
  {
    title: 'The North Decides',
    date: '1777 · Saratoga & Philadelphia',
    place: 'Saratoga',
    image: 'scene_saratoga.jpg',
    situation:
      'General Burgoyne marches down from Canada to split New England off from the rest. General Howe moves on Philadelphia. You cannot be in both places — you must choose where your weight goes.',
    steps: [
      decision(
        'Where do you send your strength?',
        { label: 'Send crack riflemen and good officers north; keep Howe’s attention on yourself.',
          v: V.R, fx: { army: 5 },
          fb: 'You cannot win Saratoga in person. But you can make it possible — and holding Howe is your part of that plan.' },
        { label: 'March the whole army north yourself, for the glory of beating Burgoyne.',
          v: V.W, fx: { supplies: -10 },
          fb: 'Abandon the middle states and Howe simply eats them. Glory-hunting hands away everything you were guarding.' },
        { label: 'Pull everything together to save Philadelphia, the capital.',
          v: V.P, fx: { morale: -5 },
          fb: 'The capital falls anyway. Cities are not the war — the army is. You spent effort defending a place, not the cause.' },
      ),
      decision(
        'News arrives: Burgoyne has surrendered nearly 6,000 men at Saratoga.',
        { label: 'Rush the news to Benjamin Franklin in Paris — proof that America can actually win.',
          v: V.R, fx: { morale: 10 },
          fb: 'Saratoga is the turning point. It convinces France to sign on. Money, troops, and a navy follow in 1778.' },
        { label: 'Invade Canada now, while the enemy is reeling, to finish the job.',
          v: V.W, fx: { army: -10, supplies: -10 },
          fb: 'Overreach. Winter and distance beat armies as surely as any enemy. You would lose men to the cold for nothing.' },
        { label: 'Publicly demand Gates be punished for stealing the credit Arnold earned.',
          v: V.P, fx: {},
          fb: 'True — Arnold won that battle and Gates took the credit. But a public feud only helps Britain. Arnold’s bitterness will cost America later.' },
      ),
    ],
  },

  // ===== Campaign 4 — Valley Forge (1777–78) ==============================
  // THE DIVERGENCE (spec §3, checklist §10): D1 option A scores a FULL 1 and its
  // feedback still names ~2,000 dead. Accurate command and human cost are both
  // true at once — the meters may dip while the grade is perfect.
  {
    title: 'Valley Forge',
    date: '1777–78 · Pennsylvania',
    place: 'Valley Forge',
    image: 'scene_valley_forge.jpg',
    situation:
      'Philadelphia is lost. About 11,000 men winter in log huts with no meat, no shoes, and sickness everywhere. Through the freezing nights the camp chants: "No Meat! No Meat!"',
    // THE VISIBLE DIP (spec §3: "accurate play still dips at Valley Forge"). The
    // winter itself takes a toll the moment this card appears — before any decision.
    // Even a flawless campaign here recovers only part of it, so the meter bars show
    // the hardship on the screen, not just in the feedback. This is drama, never a
    // grade: accuracy is untouched (the ~2,000 dead are named in D1's feedback while
    // the right choice still scores a full 1).
    eventEffects: { army: -10, supplies: -15, morale: -5 },
    steps: [
      decision(
        'How do you get the army through this winter?',
        { label: 'Hold the army together: forage wide, hound Congress for supplies, and share the hardship in the open with your men.',
          v: V.R, fx: { supplies: 10, morale: 10 },
          fb: 'Nearly 2,000 still die of sickness and cold — and the army holds, because you stayed. Leadership is presence. (This is the hard truth: you did everything right, and men still died.)' },
        { label: 'Disband the army for the winter and reassemble it in the spring.',
          v: V.W, fx: { army: -25 },
          fb: 'Sent home hungry and unpaid, this army never comes back. Winter quarters together is the only way it survives.' },
        { label: 'Storm Philadelphia to seize warm quarters for the men.',
          v: V.W, fx: { army: -15 },
          fb: 'Starving, barefoot men against a defended city — that is the end of everything, not the escape from it.' },
      ),
      decision(
        'A Prussian volunteer, Baron von Steuben, offers to drill your troops.',
        { label: 'Make him drillmaster with full authority over training the whole camp.',
          v: V.R, fx: { army: 15, morale: 10 },
          fb: 'He trains one model company, then the whole camp. The army marches out of Valley Forge smaller — and made of steel.' },
        { label: 'Decline. Americans fight their own way, not the European way.',
          v: V.W, fx: {},
          fb: 'Courage without drill keeps losing fields. Pride here costs you the next battle.' },
        { label: 'Use him only as a translator; we do not need a foreign drillmaster.',
          v: V.W, fx: {},
          fb: 'The one thing he is world-class at — turning farmers into regulars — wasted.' },
      ),
    ],
  },

  // ===== Campaign 5 — A Real Ally (1778) ==================================
  {
    title: 'A Real Ally',
    date: '1778 · Monmouth, New Jersey',
    place: 'Monmouth',
    image: 'title_hero.jpg',  // no dedicated asset in the 6-image budget (spec §7); reuses the war-room hero
    situation:
      'France signs the Treaty of Alliance. The British leave Philadelphia and march for New York, their column strung out and exposed along the road.',
    steps: [
      decision(
        'Their marching column is exposed. What do you do?',
        { label: 'Strike it hard — a controlled blow, not a stand-up slugfest.',
          v: V.R, fx: { morale: 10 },
          fb: 'At Monmouth your drilled regulars hold the field against Britain’s best. Valley Forge’s training, proven in the open.' },
        { label: 'Let them march away untouched. Why risk it?',
          v: V.P, fx: { morale: -5 },
          fb: 'Safe — but an army that never fights convinces no ally. France needs to see you can hit back.' },
        { label: 'Commit the whole army to wipe the column out completely.',
          v: V.W, fx: { army: -15 },
          fb: 'Rule One still stands. Wound the bear; do not try to hug it. A total gamble risks the one thing you cannot replace.' },
      ),
      decision(
        'How do you use the new French fleet?',
        { label: 'Coordinate patiently — wait for the one moment sea power can trap a British army against the coast.',
          v: V.R, fx: { supplies: 5 },
          fb: 'Fleets come and go with the wind. One perfect moment is worth years of waiting. Patience is the whole plan.' },
        { label: 'Demand an immediate all-out attack on New York with the fleet.',
          v: V.P, fx: { morale: -5 },
          fb: 'Considered — and wisely dropped. The harbor was too strong; a rushed strike there wastes the alliance’s first gift.' },
        { label: 'Let France fight its own separate war however it likes.',
          v: V.W, fx: {},
          fb: 'An alliance left unused is Saratoga wasted. You spent years earning this fleet — now use it together.' },
      ),
    ],
  },

  // ===== Campaign 6 — Eyes South (1780–81) ================================
  {
    title: 'Eyes South',
    date: '1780–81 · Virginia',
    place: 'Chesapeake',
    image: 'title_hero.jpg',  // no dedicated asset (spec §7's 6-image budget); the war-room planning image fits the intelligence/secret-march beat, and avoids spoiling the Yorktown victory art before Campaign 7
    situation:
      'General Cornwallis digs in at Yorktown, Virginia, waiting on the Royal Navy. Lafayette shadows him with a small force — and inside the British camp, the spy James Armistead sends word of everything.',
    steps: [
      decision(
        'How do you play the intelligence game?',
        { label: 'Trust Lafayette’s small force and Armistead’s reports; watch, wait, and learn.',
          v: V.R, fx: { morale: 5 },
          fb: 'Armistead — an enslaved Virginian the British believe is THEIR spy — maps Cornwallis’s whole position. Yorktown’s trap starts with him.' },
        { label: 'Race the whole army south at once, out in the open.',
          v: V.W, fx: { supplies: -10 },
          fb: 'Cornwallis sees you coming and simply sails away. Speed without secrecy springs the trap early.' },
        { label: 'Ignore Virginia. The real war is in the north.',
          v: V.W, fx: {},
          fb: 'The war is wherever the enemy can be trapped. Right now that place is Virginia, not New York.' },
      ),
      decision(
        'Admiral de Grasse’s fleet can hold the Chesapeake — but only until the fall.',
        { label: 'Fake an attack on New York, then secretly march 400 miles south with Rochambeau.',
          v: V.R, fx: { army: 5, morale: 10 },
          fb: 'The great deception. By the time Britain understands where your army really is, the door has already shut.' },
        { label: 'Use the French fleet against New York instead.',
          v: V.P, fx: {},
          fb: 'That was Washington’s own first instinct — and his French partners argued him out of it. The southern trap was the better prize.' },
        { label: 'Hold your position. A 400-mile march is far too risky.',
          v: V.W, fx: {},
          fb: 'The one clear chance of the whole war, declined. Some risks are the safe choice in disguise.' },
      ),
    ],
  },

  // ===== Campaign 7 — Yorktown (1781) =====================================
  {
    title: 'Yorktown',
    date: '1781 · Yorktown, Virginia',
    place: 'Yorktown',
    image: 'scene_yorktown.jpg',
    situation:
      'De Grasse turns the British fleet back at the Battle of the Capes. Cornwallis’s 9,000 men are sealed in by more than 17,000 American and French troops. The trap is shut. Now you must close it.',
    steps: [
      decision(
        'How do you take Yorktown?',
        { label: 'Run a formal siege: dig trenches closer each night, bombard, and tighten the ring.',
          v: V.R, fx: { supplies: -5, morale: 10 },
          fb: 'The textbook kill. His guns fall silent one by one, the sea behind him is French, and there is nowhere left to run.' },
        { label: 'Order an immediate frontal storm of the earthworks.',
          v: V.W, fx: { army: -20 },
          fb: 'Throwing the army away in the last mile of the war. Patience wins this; a wild charge only fills graves.' },
        { label: 'Simply starve them out over a year-long blockade.',
          v: V.W, fx: {},
          fb: 'De Grasse leaves in weeks, not months. The clock is the whole battle — a slow siege loses the fleet that made it possible.' },
      ),
      decision(
        'October 19, 1781. Cornwallis surrenders; legend says the band plays "The World Turned Upside Down."',
        { label: 'Accept the surrender with dignity — and keep the army in the field until the peace is signed.',
          v: V.R, fx: { morale: 10 },
          fb: 'The Treaty of Paris takes until 1783. A war does not end when the guns stop; it ends when the ink dries.' },
        { label: 'March on Canada now, while we are winning, to seize more land.',
          v: V.W, fx: {},
          fb: 'The cause was independence, not empire. Winning the war does not mean starting a new one.' },
        { label: 'Disband the army on the spot. The war is over.',
          v: V.W, fx: {},
          fb: 'Two more years of negotiation stand between this field and a nation. Send the army home now and you throw away your leverage.' },
      ),
    ],
  },
];

// ---------------------------------------------------------------------------
// Assembly. The engine groups steps into "chapters" of two; here a chapter IS a
// campaign, so the mapping is exact: 7 campaigns × 2 decisions = 14 steps.
// `event` is the situation card; `image`/`title`/`date` ride along for the client.
// ---------------------------------------------------------------------------

export function phasesFor() {
  return CAMPAIGNS.map((c) => ({
    title: c.title,
    date: c.date,
    place: c.place,
    image: c.image,
    event: c.situation,
    eventEffects: c.eventEffects || null,  // one-time situation-card toll (only Valley Forge)
    steps: c.steps,
  }));
}

// ---------------------------------------------------------------------------
// The map strip (spec §5, §6): a client-only decorative overlay that advances a
// dot along the army's path from Boston to Yorktown between campaigns. Coordinates
// are fractional (x left→right = progress through the war; y ≈ latitude for
// flavor, 0 = north/top). Shipped in `meta` so the client can label each stop; the
// engine never uses these — they are pure presentation.
// ---------------------------------------------------------------------------

export const MAP_STRIP = CAMPAIGNS.map((c, i) => ({
  key: c.title,
  place: c.place,
  date: c.date,
  x: i / (CAMPAIGNS.length - 1),
  y: [0.12, 0.41, 0.00, 0.51, 0.47, 0.90, 1.00][i],
}));

// ---------------------------------------------------------------------------
// Endings tier by the METER SUM at Yorktown (spec §3), not by accuracy. Max sum
// is 300 (three meters, cap 100 each). A fully accurate run lands well into the
// strong band even after the Valley Forge dip; an all-glory run guts the army and
// lands in "An Army of Ghosts." Every debrief lands the same truth: America
// OUTLASTED Britain — it did not overpower her (8.4C, 8.22A).
// ---------------------------------------------------------------------------

export const STRONG_MIN = 200;  // "The World Turned Upside Down"
export const BARELY_MIN = 110;  // "By a Thread"; below this is "An Army of Ghosts"

export const ENDINGS = {
  strong: {
    key: 'strong',
    title: 'The World Turned Upside Down',
    text: 'You kept the army alive from Boston to Yorktown — and it was standing, whole and drilled, on the day the French fleet shut the trap. You lost cities, you lost battles, and none of it mattered, because you never lost the one thing that was the whole war: the army itself. Cornwallis surrenders to a force that simply would not break.',
  },
  barely: {
    key: 'barely',
    title: 'By a Thread',
    text: 'The army reaches Yorktown battered — thinner, hungrier, and closer to the edge than it ever should have been. The trap still closes, because history was patient even when you were not. But a few more bold gambles and there would have been no army left to march south at all. You won. You nearly did not.',
  },
  ghosts: {
    key: 'ghosts',
    title: 'An Army of Ghosts',
    text: 'The glorious charges, the grand battles, the refusals to retreat — each one felt brave, and each one spent men you could never replace. Long before Yorktown, the army you needed had melted away. In the real war these choices would have dissolved the Continental Army early, and the Revolution with it. Rule One was always true: the Revolution lives only as long as the army does.',
  },
};

export function endingFor(score) {
  if (score >= STRONG_MIN) return ENDINGS.strong;
  if (score >= BARELY_MIN) return ENDINGS.barely;
  return ENDINGS.ghosts;
}

// The report's "score" is the three meters added (max 300) — it decides the tier.
export function armyScore(meters) {
  return (meters.army || 0) + (meters.supplies || 0) + (meters.morale || 0);
}

// ---------------------------------------------------------------------------
// The debrief (spec §3) — SAME truth under every tier. Yorktown was not the end;
// the Treaty of Paris (1783) gave independence to the Mississippi. America won by
// outlasting Britain — tenacity, the French alliance, and British missteps 3,000
// miles from home — not by overpowering her (8.4C, 8.22A).
// ---------------------------------------------------------------------------

export const DEBRIEF =
  'Here is why it worked. America did not out-gun Britain — the most powerful empire on earth. America OUTLASTED her. Washington understood something his bolder officers did not: as long as the Continental Army existed, the Revolution could not be beaten, no matter how many cities or battles were lost. So he retreated, drilled, endured, and waited — for eight long years — until the French alliance and a British army trapped against the sea at Yorktown finally gave him the one victory that ended it. ' +
  'The surrender at Yorktown in 1781 did not end the war on its own. It took the Treaty of Paris in 1783 to make it real — independence for the new United States, all the way west to the Mississippi River. ' +
  'Tenacity, a patient alliance with France, and an enemy fighting 3,000 miles from home: that is how a ragged army of farmers outlasted an empire. Not by being glorious. By refusing to disappear.';

export function debriefFor() {
  return DEBRIEF;
}

// ---------------------------------------------------------------------------

export default createStepGame({
  id: 'us-washingtons-war',
  title: "Washington's War: Keep the Army Alive",
  sides: [SIDE],                 // one class group — no pick
  modes: ['solo'],
  soloRival: false,              // you command the army alone — no AI rival
  startMeters: () => ({ ...START_METERS }),
  phasesFor,
  meta: { meters: METERS, mapStrip: MAP_STRIP, vocab: VOCAB },  // no map board
  scoreMeters: armyScore,
  endingFor,
  debriefFor,
});
