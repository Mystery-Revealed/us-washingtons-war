// ResultScreen.jsx — two stories, in order: (1) how the ARMY fared (Army
// Strength — the three meters summed — and its ending tier: The World Turned
// Upside Down / By a Thread / An Army of Ghosts), (2) the score that matters to
// your teacher — accuracy, whether your fourteen orders were the ones Washington
// actually gave — then the shared debrief: America outlasted Britain; it did not
// overpower her (spec §3, §10 checklist, 8.4C/8.22A).

import { Art } from '../../services/assets.jsx';

const TIER_CLASS = { strong: 'win', barely: 'mid', ghosts: 'low' };
const ENDING_ART = { strong: 'scene_yorktown.jpg', barely: 'scene_yorktown.jpg', ghosts: 'scene_valley_forge.jpg' };
const ENDING_ALT = {
  strong: 'Siege trenches at golden hour, allied flags side by side, a white flag rising beyond',
  barely: 'Siege trenches at golden hour, allied flags side by side, a white flag rising beyond',
  ghosts: 'Log huts under snow at dusk, a thin line of soldiers drilling anyway',
};

export default function ResultScreen({ state, dispatch }) {
  const end = state.matchEnd;
  const meta = end.meta || state.match?.begin?.meta;
  const you = end.you;
  const ending = you.ending;
  const score = you.score ?? 0;
  const tierCls = TIER_CLASS[ending.key] || 'mid';

  return (
    <div className="card result-screen">
      <div className="event-kicker">Yorktown · October 19, 1781</div>
      <h1 className={`result-headline ${tierCls}`}>{ending.title}</h1>

      <Art
        name={ENDING_ART[ending.key] || 'scene_yorktown.jpg'}
        alt={ENDING_ALT[ending.key]}
        className="result-art"
      />

      <p className="fall-note">
        This was never about “winning” Yorktown — history won it either way.
        It was about <b>whether your orders were the ones Washington actually gave</b>.
        Your accuracy shows exactly that.
      </p>

      <div className={`ending-block ${tierCls}`}>
        <p>{ending.text}</p>
      </div>

      <div className="score-block" aria-label="Army Strength">
        <div className="score-head">
          <span className="score-title">🪖 Army Strength</span>
          <span className="score-num">{score}<span className="muted"> / 300</span></span>
        </div>
        <span className="score-bar-track">
          <span className={`score-bar ${tierCls}`} style={{ width: `${Math.min(100, (score / 300) * 100)}%` }} />
        </span>
        <div className="meter-final-row">
          {Object.entries(you.meters || {}).map(([k, v]) => (
            <span key={k} className="meter-final">{meta?.meters?.[k]?.name || k}: <b>{v}</b></span>
          ))}
        </div>
      </div>

      <div className="accuracy-block">
        <div className="accuracy-number">{you.accuracy}%</div>
        <div>
          <b>Your accuracy — the score your teacher sees.</b>
          <p>How many of your fourteen orders were the moves Washington actually made — patience, drill, and endurance over glory. The meters were drama; this is the grade.</p>
        </div>
      </div>

      <div className="debrief">
        <h3>Why it worked</h3>
        <p>{you.debrief}</p>
      </div>

      <div className="btn-col">
        <button className="btn big" onClick={() => dispatch({ type: 'play-again' })}>
          Play again — command the whole war
        </button>
      </div>
    </div>
  );
}
