# "Washington's War: Keep the Army Alive" — Build Specification
### Unit 2 Game · 8th Grade U.S. History · The Revolutionary War

**Purpose:** A build-ready spec to paste into Claude (Fable, Opus, Sonnet): build, deploy on Render via GitHub, embed in Wix. Shared Socket.IO engine, Teacher Command Center, standard workflow — only what's unique lives here.

> **Reading-level rule (everything the student sees):** 8th grade content at a **5th grade reading level**. Short sentences, common words, define hard terms on first use. Does not apply to this spec itself.

> **Data method:** the **shared Socket.IO engine, solo mode** (server-authoritative, in-memory sessions, no database). New adapter: `usWashingtonsWar.js`.

> **The design's engine:** Washington's real strategy was **survival, not glory** — he lost more battles than he won and still won the war. The key rewards choices that keep the army alive; "glorious" pitched-battle options are historically wrong and graded that way. Winning means still having an army when the French fleet reaches Yorktown.

---

## 1. Game at a Glance

| Field | Value |
|---|---|
| **Title** | Washington's War: Keep the Army Alive |
| **Unit** | 2 — The Revolutionary War |
| **TEKS** | 8.4B (Washington, Franklin, Lafayette), 8.4C (Saratoga, Valley Forge, Yorktown), 8.22A (Washington's leadership), 8.31B (decision-making) |
| **Pick** | none: one class group |
| **Type** | Solo strategy/resource decision game — 7 campaigns × 2 decisions = **14 graded actions** |
| **Playtime** | 10–14 minutes |
| **Platform / tracking** | Shared engine solo mode; class-wide accuracy; session-only data |
| **Art style** | Semi-realistic / cinematic, Union Blue |

**One-sentence pitch: Command the Continental Army from Boston to Yorktown, where the winning move is almost never the glorious one — retreat, drill, endure, and be standing when France's fleet shuts the trap.**

## 2. Historical Content Bank

| Beat | Facts the key runs on (unit source doc) |
|---|---|
| **Boston 1775–76** | 15,000–20,000 militia besiege Boston; Washington (a Virginian binds the South) takes command; Knox hauls Ticonderoga's cannon ~300 miles; Dorchester Heights, March 1776. |
| **New York 1776** | A massive British force takes the city; Washington survives by losing and slipping away — "the brink of collapse." |
| **Trenton, Dec 26, 1776** | Christmas-night Delaware crossing ("Victory or Death"); Hessians surprised; the Revolution revived. |
| **Saratoga, Oct 17, 1777** | Burgoyne surrenders nearly 6,000; Arnold won it, Gates took credit (bitterness → treason). **The turning point:** France allies, 1778 (Franklin). |
| **Valley Forge 1777–78** | ~11,000 camp; ~2,000 die of disease; Surgeon Waldo's "No Meat! No Meat!"; von Steuben drills the army into "steel." |
| **Yorktown 1781** | De Grasse wins the Battle of the Capes; a secret 400-mile march; 17,000+ trap Cornwallis's 9,000; surrender Oct 19. Treaty of Paris (1783): independence to the Mississippi. |
| **Why America won** | Tenacity + the French alliance + British missteps 3,000 miles from home. Outlasted, not overpowered. |

**Vocabulary (define on first use):** *siege* — surrounding a place to starve it out; *militia* — part-time citizen soldiers; *mercenary* — a soldier paid to fight for a foreign country (the Hessians); *forage* — searching the countryside for supplies.

## 3. Core Mechanics

**Meters (0–100, start 50):** **Army** 🪖 (trained soldiers), **Supplies** 🎒 (food, powder, shoes), **Morale** 🔥 (will they stay?). Meters are drama; accuracy grades whether you commanded as Washington did — accurate play still dips at Valley Forge.

**Structure:** 7 campaigns (Boston · New York · Trenton · The North · Valley Forge · Alliance · Yorktown): situation card → two decisions with feedback. **14 graded actions**; right = 1, partial = 0.5, wrong = 0, server-side. HUD banner: **"Rule One: the Revolution lives as long as the army does."**

**Endings:** meter sum at Yorktown → **"The World Turned Upside Down"** (strong) / **"By a Thread"** (battered; the trap still closes) / **"An Army of Ghosts"** (gutted; the debrief explains these choices would have dissolved the real army early). All debriefs land the same truth: America **outlasted** Britain (8.4C, 8.22A).

## 4. Reference Content — the Answer Key (14 steps)

Feedback voice: a steady aide-de-camp; student text at 5th-grade level.

### Campaign 1 — Boston (1775–76)
*Situation:* Congress hands you 15,000–20,000 militia penning the British into Boston — brave men, not yet an army.

**D1 — First order?**
- **A) Drill, discipline, clean camps, real enlistments.** ✅ (Army +10, Morale +5). *"Farmers walked in; an army must walk out."*
- **B) Storm Boston now while spirits are high.** ❌ (Army −15). *"Untrained men against fortifications — the Revolution could die in an afternoon."*
- **C) Just blockade and wait; train later.** ⚠️ (Supplies −5). *"Sieges rot idle armies. Half-right, half-wasted."*

**D2 — You have no siege cannon.**
- **A) Send Henry Knox to drag Ticonderoga's guns ~300 miles through snow.** ✅ (Supplies +10, Morale +10). *"Madness on paper; it worked. Guns on Dorchester Heights — the British sail away without a battle."*
- **B) Attack without artillery.** ❌ (Army −10). *"Muskets don't answer fortress walls."*
- **C) Wait for France to send cannon.** ❌ (Morale −5). *"France isn't watching yet. Earn the alliance first."*

### Campaign 2 — New York (1776)
*Situation:* A massive British force lands to take New York. Congress wants the city held.

**D1 — Hold or live?**
- **A) Fight delaying actions, then retreat with the army intact.** ✅ (Morale −5, Army +5). *"Lose the city, save the war. Washington lost more battles than he won — and still won."*
- **B) Stake everything on one great battle.** ❌ (Army −20). *"The trap Britain prayed you'd walk into."*
- **C) Abandon everything instantly without a shot.** ⚠️ (Supplies −10, Morale −10). *"Saves men, bleeds credibility and gear."*

**D2 — December. Enlistments expire in days; the cause is at "the brink of collapse."**
- **A) The Christmas gamble: cross the icy Delaware, hit the Hessians at Trenton.** ✅ (Morale +20, Army +5). *"Watchword: 'Victory or Death.' The Revolution revives; men re-enlist."*
- **B) Winter quarters; recruit in spring.** ❌ (Morale −15). *"By spring there is no army to recruit into."*
- **C) One more grand assault on New York.** ❌ (Army −15). *"Desperation is not strategy."*

### Campaign 3 — The North Decides (1777)
*Situation:* Burgoyne marches from Canada to split off New England; Howe moves on Philadelphia. You cannot be everywhere.

**D1 — Where does your weight go?**
- **A) Send crack riflemen and good officers north; hold Howe's attention yourself.** ✅ (Army +5). *"You can't win Saratoga in person — you can make it possible."*
- **B) March everything north for the glory.** ❌ (Supplies −10). *"Abandon the middle states and Howe eats them."*
- **C) Concentrate everything to save Philadelphia.** ⚠️ (Morale −5). *"The capital falls anyway. Cities aren't the war; the army is."*

**D2 — News: Burgoyne surrenders nearly 6,000 at Saratoga.**
- **A) Rush the news to Franklin in Paris — proof America can win.** ✅ (Morale +10). *"Saratoga convinces France. Money, troops, and a navy follow in 1778."*
- **B) Invade Canada to finish the job.** ❌ (Army −10, Supplies −10). *"Overreach. Winter and distance beat armies too."*
- **C) Publicly demand punishment for Gates, who stole Arnold's credit.** ⚠️. *"True — Arnold won it — but a public feud helps only Britain. His bitterness costs America later."*

### Campaign 4 — Valley Forge (1777–78)
*Situation:* Philadelphia is lost. ~11,000 men winter in huts — no meat, no shoes, disease everywhere. The night chant: "No Meat! No Meat!"

**D1 — How do you get through?**
- **A) Hold the army together: forage wide, hound Congress, share the hardship visibly.** ✅ (Supplies +10, Morale +10). *"Nearly 2,000 still die of sickness and cold — and the army holds, because you stayed. Leadership is presence." (8.22A)*
- **B) Disband for winter; reassemble in spring.** ❌ (Army −25). *"Sent home, this army never returns."*
- **C) Storm Philadelphia for warm quarters.** ❌ (Army −15). *"Starving men against a defended city — the end of everything."*

**D2 — A Prussian volunteer, Baron von Steuben, offers to drill your troops.**
- **A) Make him drillmaster with full authority.** ✅ (Army +15, Morale +10). *"He trains a model company, then the camp. The army marches out smaller — and steel."*
- **B) Decline; Americans fight their own way.** ❌. *"Courage without drill keeps losing fields."*
- **C) Use him as a translator.** ❌. *"The one thing he's world-class at, wasted."*

### Campaign 5 — A Real Ally (1778)
*Situation:* France signs the Treaty of Alliance. The British quit Philadelphia and march for New York, strung out on the road.

**D1 — Their column is exposed.**
- **A) Strike it hard — a controlled blow, not a stand-up slugfest.** ✅ (Morale +10). *"At Monmouth your drilled regulars hold the field against Britain's best. Valley Forge, proven."*
- **B) Let them go untouched.** ⚠️ (Morale −5). *"Safe — but an army that never fights convinces no ally."*
- **C) Commit everything to annihilate them.** ❌ (Army −15). *"Rule One stands. Wound the bear; don't hug it."*

**D2 — How do you use the French fleet?**
- **A) Coordinate patiently — wait for the moment sea power can trap a British army against the coast.** ✅ (Supplies +5). *"Fleets come and go with the wind; one perfect moment is worth years of waiting."*
- **B) Demand an immediate all-out attack on New York.** ⚠️ (Morale −5). *"Considered, and wisely dropped — the harbor was too strong."*
- **C) Let France fight its own separate war.** ❌. *"An alliance unused is Saratoga wasted."*

### Campaign 6 — Eyes South (1780–81)
*Situation:* Cornwallis digs in at Yorktown, waiting on the Royal Navy. Lafayette shadows him — and inside the British camp, the spy James Armistead sends word of everything.

**D1 — The intelligence game.**
- **A) Trust Lafayette's small force and Armistead's reports; watch, wait, learn.** ✅ (Morale +5). *"Armistead — an enslaved Virginian the British believe is THEIR spy — maps Cornwallis's whole position. Yorktown's trap starts with him." (8.4B)*
- **B) Race everything south at once, openly.** ❌ (Supplies −10). *"Cornwallis sees you coming and sails away."*
- **C) Ignore Virginia; the war is in the north.** ❌. *"The war is where the enemy can be trapped."*

**D2 — Admiral de Grasse's fleet can hold the Chesapeake — but only until fall.**
- **A) Fake an attack on New York; secretly march 400 miles south with Rochambeau.** ✅ (Army +5, Morale +10). *"The great deception. By the time Britain understands, the door is shut."*
- **B) Use the fleet against New York instead.** ⚠️. *"Washington's own first instinct — his French partners argued him out of it."*
- **C) Hold position; the march is too risky.** ❌. *"The one chance of the war, declined."*

### Campaign 7 — Yorktown (1781)
*Situation:* De Grasse turns the British fleet back at the Battle of the Capes. Cornwallis's 9,000 are sealed in by 17,000 Americans and French.

**D1 — How do you take Yorktown?**
- **A) Formal siege: trenches closer each night, bombard, tighten the ring.** ✅ (Supplies −5, Morale +10). *"The textbook kill. His guns fall silent; the sea is French."*
- **B) Immediate frontal storm of the earthworks.** ❌ (Army −20). *"Throwing the army away in the war's last mile."*
- **C) Simply starve them out for a year.** ❌. *"De Grasse leaves in weeks. The clock is the whole battle."*

**D2 — October 19, 1781. Cornwallis surrenders; legend says the band plays "The World Turned Upside Down."**
- **A) Accept with dignity — and keep the army in the field until the peace is signed.** ✅ (Morale +10). *"The Treaty of Paris takes until 1783. A war ends when the ink dries."*
- **B) March on Canada while we're winning.** ❌. *"The cause was independence, not empire."*
- **C) Disband on the spot.** ❌. *"Two years of negotiation stand between this field and a nation."*

## 5. Screens & UI Flow
Title: navy "war room" (`#1B2A4A → #10203C`), map-table hero, Rule One subtitle → join code + name → campaign loop: situation card, year/place plate, three meter bars, two decisions → between campaigns a skippable map strip animates the army's path (Boston → Yorktown) → ending tier + debrief. Buttons navy/white; verdict edges green `#2F7D4F` / gold `#C9A227` / crimson `#B23A48`. **No tan/parchment UI** — the map strip is steel-blue linework on cool paper `#F5F7FA`.

## 6. Engine Integration
Adapter `server/src/games/usWashingtonsWar.js`, `gameId: 'us-washingtons-war'`, mode solo, **variants: none**, `totalActions: 14`, meters `{ army: 50, supplies: 50, morale: 50 }`. Pure `createStepGame` — no engine extension. New client piece: the between-campaign map strip (static SVG, advancing dot). Repo `us-washingtons-war`.

## 7. Visual & Audio Assets (Higgsfield MCP)
**Art direction (prepend):** *Semi-realistic cinematic historical illustration, Continental Army 1775–1781. Cool light, painterly, dignified; Black soldiers present in the ranks. No gore — distance, smoke, aftermath. No text or logos. 16:9.*

| # | Asset | Prompt sketch |
|---|---|---|
| 1 | Title / hero | "Washington at a lantern-lit field table, officers and maps, tent canvas breathing in wind." |
| 2 | Boston | "Cannon on snowy ox-sleds hauled through a mountain pass at dawn." |
| 3 | Trenton | "Boats among ice floes on a black river, snow driving sideways, one standing figure at the bow." |
| 4 | Saratoga | "A British army stacking muskets in an autumn clearing before Continental ranks." |
| 5 | Valley Forge | "Log huts under snow at dusk, thin soldiers drilling anyway, breath-fog in ranks." |
| 6 | Yorktown | "Siege trenches at golden hour, allied flags side by side, a white flag rising beyond." |
| 7 | *(Optional)* ambience | Camp wind, distant drums; muted by default. |

## 8. Model Workflow
Standard order. **Fable:** aide-de-camp voice, 14 steps + three debriefs. **Opus:** adapter, map strip, divergence check. **Sonnet:** screens, meters, palette, responsive. **Higgsfield:** Section 7.

## 9. Teacher Command Center
Standard, one class group. PDF: Students (Name · Status · Accuracy %) + class average. Footer: `Made for 8th Grade U.S. History · TEKS 8.4B, 8.4C, 8.22A, 8.31B`.

## 10. Build Checklist & Test Plan (delta)
- [ ] 14-step key filled; every "glory" option graded ❌ with survival-logic feedback
- [ ] All-right run = 100%; all-glory run scores near 0% and its debrief explains why
- [ ] Valley Forge D1 shows the human cost while scoring 1 — divergence verified
- [ ] Map strip advances only between campaigns, skippable; palette check — navy war room, zero brown/tan
- [ ] Knox, von Steuben, Franklin, Lafayette, and Armistead named in their steps
- [ ] Documented vs. legend labeled correctly ("Victory or Death" documented; the Yorktown song legend)

## 11. Teacher / Sensitivity Notes
War without gore: the ~2,000 Valley Forge dead are stated with weight, never depicted. Hessians are "soldiers paid to fight for Britain," not caricature. Armistead's enslavement is named plainly; his skill drives the step (Standards 10.1). Arnold is tragedy, not glamor. Frame for the class: patience and endurance — not glory — were what leadership required (8.22A); expect frustration when the bold option grades wrong. That frustration is the lesson landing.

---
*Companion to Patriot, Loyalist, or Neutral?, Tax Collector vs. Tea Party, Spy Ring, and the Unit 2 apps. Shared engine (solo mode), Union Blue palette, same GitHub → Render → Wix workflow.*
