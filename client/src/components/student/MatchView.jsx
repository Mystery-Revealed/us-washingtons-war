// MatchView.jsx — one campaign beat at a time: the map strip marches the army
// to the next stop → a situation card sets the scene → two decisions, each with
// a verdict flash and feedback in a steady aide-de-camp's voice. Single role, no
// pick, no branch: every student commands the same army through the same seven
// campaigns (spec §3, §5, §6).
//
// The MAP STRIP (spec §5, §6) is the one genuinely novel piece here: a purely
// decorative interstitial that plays once per campaign, between the previous
// decision's feedback and the new situation card. It reads `meta.mapStrip`
// (server-shipped display data — see usWashingtonsWar.js MAP_STRIP) and never
// touches scoring; skipping it changes nothing about the game.

import { useEffect, useRef, useState } from 'react';
import { emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import MetersBar from '../shared/MetersBar.jsx';
import MapStrip from '../shared/MapStrip.jsx';
import VocabText from './VocabText.jsx';

const armyScore = (m) => (m ? (m.army || 0) + (m.supplies || 0) + (m.morale || 0) : 0);

export default function MatchView({ state, dispatch }) {
  const { match } = state;
  const { begin, eventCard, turn, feedback } = match;
  const meta = begin.meta;
  const waypoints = meta.mapStrip || [];

  const phase = eventCard?.chapter || turn?.chapter;
  const lowMeter = Object.entries(match.meters || {}).find(([, v]) => v <= 15);

  // The map strip gates the situation card once per campaign. mapDoneForIndex
  // holds the last chapter index whose march animation finished (or was
  // skipped); comparing against the live chapter index is enough to know
  // whether THIS campaign's map beat has played yet — no ref/effect needed.
  const [mapDoneForIndex, setMapDoneForIndex] = useState(-1);
  const chapterIndex = eventCard?.chapter?.index;
  const showMap = !!eventCard && chapterIndex !== mapDoneForIndex && waypoints.length > 0;

  return (
    <div className="match">
      <header className="match-header">
        <div className="nation-chip class">⚔️ Continental Army</div>
        <div className="hold-chip" title="Your three meters added up (max 300) — decides the ending's tier">
          Army Strength <b>{armyScore(match.meters)}</b><span className="muted"> / 300</span>
        </div>
        {phase && (
          <div className="chapter-chip">
            Campaign {phase.index + 1} of {phase.count} · {phase.date}
          </div>
        )}
      </header>

      <p className="rule-one">Rule One: the Revolution lives as long as the army does.</p>

      <div className="meters-row solo">
        <MetersBar meters={match.meters} meta={meta} title="Your Army" />
      </div>

      {lowMeter && !feedback && (
        <div className="banner danger" role="alert">
          ⚠️ Your {meta.meters[lowMeter[0]]?.name || lowMeter[0]} is running very low.
        </div>
      )}

      <div className="match-body single">
        <section className="action-panel" aria-live="polite">
          {feedback ? (
            <FeedbackPanel
              feedback={feedback}
              meta={meta}
              matchEnded={!!state.matchEnd}
              onContinue={() => dispatch({ type: 'dismiss-feedback' })}
            />
          ) : eventCard ? (
            showMap ? (
              <MapStrip
                waypoints={waypoints}
                currentIndex={chapterIndex}
                previousIndex={chapterIndex > 0 ? chapterIndex - 1 : null}
                onDone={() => setMapDoneForIndex(chapterIndex)}
              />
            ) : (
              <SituationCard eventCard={eventCard} meta={meta} onContinue={() => dispatch({ type: 'dismiss-event' })} />
            )
          ) : turn?.yourTurn && turn.kind === 'decision' ? (
            <DecisionPanel turn={turn} />
          ) : (
            <div className="waiting-panel"><div className="pulse-dot" aria-hidden="true" /><p>Steady…</p></div>
          )}
        </section>
      </div>
    </div>
  );
}

/* -------- panels -------- */

function SituationCard({ eventCard, meta, onContinue }) {
  const ch = eventCard.chapter;
  return (
    <div className="event-card">
      <div className="event-kicker">Campaign {ch.index + 1} of {ch.count} · {ch.date}</div>
      <h2>{ch.title}</h2>
      <Art name={ch.image} alt={ch.title} className="event-art" />
      <p className="event-text"><VocabText text={eventCard.text} /></p>
      {eventCard.eventEffects && (
        <div className="effects-row">
          {Object.entries(eventCard.eventEffects).map(([k, v]) => (
            <span key={k} className={`effect-chip ${v > 0 ? 'up' : 'down'}`}>
              {meta.meters[k]?.name} {v > 0 ? `+${v}` : v}
            </span>
          ))}
        </div>
      )}
      <button className="btn big" onClick={onContinue}>Give the order</button>
    </div>
  );
}

function DecisionPanel({ turn }) {
  const [busy, setBusy] = useState(false);
  // Synchronous double-click lock. State alone can't stop two clicks landing
  // in the same render frame (both read the stale `busy === false`), and the
  // server acks before pushing turn:resolution — so the second submit would be
  // graded against the NEXT order (server cursor already advanced). The ref
  // engages immediately; `busy` still drives the disabled styling.
  const busyRef = useRef(false);
  const [err, setErr] = useState('');

  // A new order arriving always releases the lock — covers a post-reconnect
  // sync replacing the turn in place without remounting this panel.
  useEffect(() => {
    busyRef.current = false;
    setBusy(false);
  }, [turn.stepIndex]);

  async function choose(choiceIndex) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const res = await emitAck('student:submit_move', { move: { kind: 'decision', choiceIndex } });
    // Deliberately NOT unlocked on success: the ack arrives BEFORE the
    // turn:resolution push. The panel unmounts when feedback arrives, or the
    // stepIndex effect above releases the lock.
    if (!res.ok) { setErr(errorText(res.error)); busyRef.current = false; setBusy(false); }
  }

  return (
    <div className="move-panel">
      <h2>🎖️ Your order</h2>
      <p className="prompt"><VocabText text={turn.prompt} /></p>
      <div className="choice-list">
        {(turn.choices || []).map((label, i) => (
          <button key={i} className="choice-btn" disabled={busy} onClick={() => choose(i)}>
            {label}
          </button>
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
    </div>
  );
}

const VERDICT_UI = {
  right: { label: 'Washington’s call', className: 'right', icon: '✓' },
  partial: { label: 'A half-measure', className: 'partial', icon: '≈' },
  wrong: { label: 'That cost the army', className: 'wrong', icon: '✗' },
};

function FeedbackPanel({ feedback, meta, matchEnded, onContinue }) {
  const v = VERDICT_UI[feedback.verdict] || VERDICT_UI.partial;
  return (
    <div className="feedback-panel">
      <div className={`verdict-badge ${v.className} flash`}>
        <span aria-hidden="true">{v.icon}</span> {v.label}
      </div>
      <p className="feedback-text"><VocabText text={feedback.feedback} /></p>
      <div className="effects-row">
        {Object.entries(feedback.effects || {}).map(([k, val]) => (
          <span key={k} className={`effect-chip ${val > 0 ? 'up' : 'down'}`}>
            {meta.meters[k]?.name} {val > 0 ? `+${val}` : val}
          </span>
        ))}
      </div>
      <button className="btn big" onClick={onContinue}>
        {matchEnded ? 'See how it ends' : 'Next order'}
      </button>
    </div>
  );
}
