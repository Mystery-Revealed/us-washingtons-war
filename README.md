# Washington's War: Keep the Army Alive

**Unit 2 · 8th Grade U.S. History · TEKS 8.4B, 8.4C, 8.22A, 8.31B**

You command the Continental Army from **Boston (1775)** to **Yorktown (1781)**
across **seven campaigns and fourteen decisions**. The engine of the design:
Washington's real strategy was **survival, not glory** — he lost more battles
than he won and still won the war. The "glorious," pitched-battle option is
almost always the historically wrong move, and it's graded that way. Winning
means still having an army when the French fleet reaches Yorktown.

**Winning vs. accuracy.** Three meters — **Army 🪖 · Supplies 🎒 · Morale 🔥** —
are drama; their sum picks the ending's tier. **Accuracy is the grade:** did
you command the way Washington actually did? Accurate play still dips at
Valley Forge — that divergence is deliberate and tested.

Built on the shared U.S. History Socket.IO engine (server-authoritative, solo
mode). Straight factory usage — 7 phases × 2 static graded steps, one class
group, no variants, no branch, no AI rival. The one novel client component is
the **map strip**: a skippable, purely decorative animation that marches the
army's marker from Boston to Yorktown between campaigns.

## Run it

```bash
npm install        # installs server/ and client/ via postinstall
npm test           # server test suite (content + engine lifecycle)
npm run build      # builds the React client into client/dist
npm start          # serves game + Teacher Command Center on :4000
```

- Student game: `http://localhost:4000`
- Teacher Command Center: `http://localhost:4000/#teacher`

## What's specific to this game

- **Adapter:** `server/src/games/usWashingtonsWar.js` — 7 campaigns, 14
  decisions, transcribed from the build spec's answer key. Meters: **Army 🪖 ·
  Supplies 🎒 · Morale 🔥**, start at 50. Every choice carries an explicit,
  hand-tuned meter effect (not a flat ±10 formula) so the ending tiers land
  where the history says they should.
- **Accuracy is the grade.** Right = 1, partial = 0.5, wrong = 0, server-side.
  Every "glory"/pitched-battle option (storming Boston, one grand battle for
  New York, storming Philadelphia, a frontal storm of Yorktown, and more) is
  graded **wrong**.
- **Endings tier by the METER SUM**, not accuracy: **The World Turned Upside
  Down** (≥200) / **By a Thread** (110–199) / **An Army of Ghosts** (<110). All
  three reach Yorktown — the tier only decides how battered the army is when
  it gets there.
- **The Valley Forge divergence (spec §3, §10 checklist):** the winter card
  imposes a one-time meter toll the instant it appears — so even a flawless,
  100%-accuracy run visibly dips on the meter bars — while the right decision
  (hold the army together) still scores a full point and its feedback names
  the ~2,000 who died anyway. Command and cost are both true at once.
- **The map strip:** between each campaign, a steel-blue line animates the
  army's marker from the previous stop to the next (Boston → New York →
  Saratoga → Valley Forge → Monmouth → Chesapeake → Yorktown). Purely
  decorative — skippable, never touches scoring.
- **Named figures:** Henry Knox, Baron von Steuben, Benjamin Franklin,
  Lafayette, and James Armistead all appear in the steps their real
  contributions drove. Armistead's enslavement is named plainly — he is the
  spy the British believe is *their* spy, and his intelligence maps
  Cornwallis's whole position.
- **Documented vs. legend:** "Victory or Death" (the Trenton watchword) is
  presented as history; the Yorktown surrender-song story is explicitly
  flagged as legend ("legend says the band plays…").
- **Vocabulary bubbles:** siege, militia, mercenary, and forage are underlined
  on first use with a tap-for-plain-words bubble.
- **The shared debrief** (every tier): America **outlasted** Britain — tenacity,
  the French alliance, and British missteps 3,000 miles from home — not by
  overpowering her. The Treaty of Paris (1783) made independence real, all the
  way to the Mississippi.
- **Dashboard:** one class-wide group; PDF includes the roster (Name · Status ·
  Accuracy %) and the class average.

## Sensitivity (spec §11, Common Standards §10)

- War without gore: the Valley Forge dead are stated with weight, never
  depicted. Hessians are named as "soldiers paid to fight for Britain," not
  caricature.
- James Armistead's enslavement is named plainly and his skill drives his
  step (Standards 10.1).
- Benedict Arnold is treated as tragedy, not glamor — his real grievance is
  acknowledged even as the public-feud option is graded a mistake.
- The lesson is framed for the class as patience and endurance, not glory —
  expect frustration when the bold option grades wrong. That frustration is
  the lesson landing.

Session data lives in server memory only; the teacher's PDF is the only record
that survives. Deploy shape: one Render web service (see `render.yaml`),
embedded in Wix — same workflow as the companion U.S. History games.

*Companion to Patriot, Loyalist, or Neutral?, Tax Collector vs. Tea Party, and
Spy Ring: Crack the Code.*
