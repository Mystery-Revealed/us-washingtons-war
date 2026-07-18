// Datapad.jsx — the student game. A small state machine over socket pushes:
// title → how to play → join → (approval) → briefing → match (7 campaigns, 14
// decisions) → result. Single role, no pick, no branch: everyone commands the
// same Continental Army through the same seven campaigns. The server owns all
// truth; this component only renders what it's told.

import { useEffect, useReducer, useRef } from 'react';
import { getSocket, emitAck, errorText } from '../../services/socket.js';
import { Art } from '../../services/assets.jsx';
import VocabText from './VocabText.jsx';
import MatchView from './MatchView.jsx';
import ResultScreen from './ResultScreen.jsx';

const SIDE = 'class';

const initialState = {
  screen: 'title', // title | how | join | waiting_approval | briefing | match | result | ended
  joinCode: '',
  name: '',
  studentId: null,
  error: '',
  endedMessage: '',
  match: null,
  matchEnd: null,
};

function freshMatch(begin) {
  return {
    begin,
    meters: begin.meters,
    eventCard: null,
    turn: null,
    feedback: null,
  };
}

// Merge live payloads (chapter:event, turn:begin, turn:resolution) into the match.
function mergeLive(match, payload) {
  const next = { ...match };
  if (payload.meters) next.meters = payload.meters;
  return next;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ui':
      return { ...state, ...action.patch };
    case 'joined':
      return {
        ...state,
        studentId: action.studentId,
        error: '',
        screen: action.approved ? 'briefing' : 'waiting_approval',
      };
    case 'approved':
      return { ...state, screen: state.screen === 'waiting_approval' ? 'briefing' : state.screen };
    case 'match:begin':
      return { ...state, screen: 'match', matchEnd: null, match: freshMatch(action.payload) };
    case 'chapter:event': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, eventCard: action.payload } };
    }
    case 'turn:begin': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, turn: action.payload } };
    }
    case 'turn:resolution': {
      if (!state.match) return state;
      const match = mergeLive(state.match, action.payload);
      return { ...state, match: { ...match, feedback: action.payload } };
    }
    case 'match:end': {
      // Hold the result until the pending feedback is dismissed (chronological).
      const showNow = !state.match?.feedback;
      return { ...state, matchEnd: action.payload, screen: showNow ? 'result' : state.screen };
    }
    case 'dismiss-feedback': {
      if (!state.match) return state;
      if (state.matchEnd) return { ...state, screen: 'result', match: { ...state.match, feedback: null } };
      return { ...state, match: { ...state.match, feedback: null } };
    }
    case 'dismiss-event':
      return state.match ? { ...state, match: { ...state.match, eventCard: null } } : state;
    case 'sync': {
      const s = action.sync;
      if (s.screen === 'waiting_approval') return { ...state, screen: 'waiting_approval' };
      if (s.screen === 'lobby') return { ...state, screen: 'briefing' };
      if (s.screen === 'result') return { ...state, screen: 'result', matchEnd: s.matchEnd };
      if (s.screen === 'match') {
        const match = freshMatch(s.matchBegin);
        return {
          ...state,
          screen: 'match',
          matchEnd: null,
          match: { ...match, eventCard: s.chapterEvent, turn: s.turn },
        };
      }
      return state;
    }
    case 'removed':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: '', error: 'Your teacher removed you from the session. You can join again.' };
    case 'ended':
      return { ...initialState, screen: 'ended', endedMessage: 'Your teacher ended this session. The army’s story is told.' };
    case 'play-again':
      return { ...initialState, screen: 'join', joinCode: state.joinCode, name: state.name };
    default:
      return state;
  }
}

export default function Datapad() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const socket = getSocket();
    const on = (event, type) => {
      const fn = (payload) => dispatch({ type, payload });
      socket.on(event, fn);
      return [event, fn];
    };
    const subs = [
      on('match:begin', 'match:begin'),
      on('chapter:event', 'chapter:event'),
      on('turn:begin', 'turn:begin'),
      on('turn:resolution', 'turn:resolution'),
      on('match:end', 'match:end'),
    ];
    const approved = () => dispatch({ type: 'approved' });
    const removed = () => dispatch({ type: 'removed' });
    const ended = () => dispatch({ type: 'ended' });
    socket.on('join:approved', approved);
    socket.on('student:removed', removed);
    socket.on('session:ended', ended);

    // School wifi blip: the socket reconnects → re-attach and re-sync the screen.
    const onReconnect = async () => {
      const s = stateRef.current;
      if (!s.studentId || !s.joinCode) return;
      const res = await emitAck('student:rejoin', { joinCode: s.joinCode, studentId: s.studentId });
      if (res.ok) dispatch({ type: 'sync', sync: res.sync });
    };
    socket.io.on('reconnect', onReconnect);

    return () => {
      for (const [event, fn] of subs) socket.off(event, fn);
      socket.off('join:approved', approved);
      socket.off('student:removed', removed);
      socket.off('session:ended', ended);
      socket.io.off('reconnect', onReconnect);
    };
  }, []);

  const { screen } = state;
  return (
    <div className="app student-app">
      {screen === 'title' && <TitleScreen onStart={() => dispatch({ type: 'ui', patch: { screen: 'join' } })} onHow={() => dispatch({ type: 'ui', patch: { screen: 'how' } })} />}
      {screen === 'how' && <HowToPlay onBack={() => dispatch({ type: 'ui', patch: { screen: 'title' } })} />}
      {screen === 'join' && <JoinForm state={state} dispatch={dispatch} />}
      {screen === 'waiting_approval' && (
        <WaitCard title="Hold your position!" text="Your teacher is checking names. You take command in a moment." />
      )}
      {screen === 'briefing' && (
        <WaitCard
          title="You command the Continental Army."
          text="1775. Boston is under siege. Your first order is being drawn up — stand ready."
        />
      )}
      {screen === 'match' && state.match && <MatchView state={state} dispatch={dispatch} />}
      {screen === 'result' && state.matchEnd && <ResultScreen state={state} dispatch={dispatch} />}
      {screen === 'ended' && (
        <WaitCard title="Session ended" text={state.endedMessage}>
          <button className="btn" onClick={() => dispatch({ type: 'ui', patch: { ...initialState, screen: 'title' } })}>
            Back to the title screen
          </button>
        </WaitCard>
      )}
      <footer className="app-footer">Made for 8th Grade U.S. History · TEKS 8.4B, 8.4C, 8.22A, 8.31B</footer>
    </div>
  );
}

/* ---------------- small screens ---------------- */

function TitleScreen({ onStart, onHow }) {
  return (
    <div className="card title-screen">
      <Art name="title_hero.jpg" alt="Washington at a lantern-lit field table with officers and maps, tent canvas moving in the wind" className="hero-art" />
      <h1 className="game-title">Washington's War</h1>
      <p className="tagline">Keep the Army Alive</p>
      <p className="title-blurb">
        Command the Continental Army from <b>Boston</b> to <b>Yorktown</b> —
        seven campaigns, fourteen orders. Washington's real strategy was
        <b> survival, not glory.</b> He lost more battles than he won and still
        won the war. The winning move is almost never the bold one — retreat,
        drill, endure, and be standing when the French fleet shuts the trap.
      </p>
      <div className="btn-col">
        <button className="btn big" onClick={onStart}>Join your class</button>
        <button className="btn secondary" onClick={onHow}>How to play</button>
      </div>
    </div>
  );
}

function HowToPlay({ onBack }) {
  return (
    <div className="card how-screen">
      <h2>How to play</h2>
      <ol className="how-list">
        <li><b>Join with your class code</b> and your first name.</li>
        <li><b>Live 7 campaigns,</b> Boston to Yorktown, 1775–1781. Each one gives you <b>two orders</b> to give.</li>
        <li><b>Pick the move Washington actually made.</b> The bold, glorious choice is almost always the wrong one.</li>
        <li><b>Keep the army alive.</b> Still have an army when the French fleet reaches Yorktown, and the war is won.</li>
      </ol>
      <div className="note">
        <b>Winning versus accuracy.</b> Your three meters are drama — they set
        the ending's tier. <b>Accuracy is your grade:</b> did you command the
        way Washington really did? Even a perfect commander watches the meters
        dip at Valley Forge — that's the true cost of the war, not a mistake.
      </div>
      <h3>Your three meters</h3>
      <ul className="how-list">
        <li>🪖 <b>Army</b> — trained soldiers still in the ranks.</li>
        <li>🎒 <b>Supplies</b> — food, powder, and shoes.</li>
        <li>🔥 <b>Morale</b> — the will to stay when enlistments run out.</li>
      </ul>
      <h3>Words to know (tap them in the game)</h3>
      <ul className="how-list vocab-list">
        <li><VocabText text="Siege — surrounding a place to starve it out." /></li>
        <li><VocabText text="Militia — part-time citizen soldiers, not full-time trained troops." /></li>
        <li><VocabText text="Mercenary — a soldier paid to fight for a foreign country, like the Hessians." /></li>
        <li><VocabText text="Forage — searching the countryside for food and supplies." /></li>
      </ul>
      <button className="btn" onClick={onBack}>Back</button>
    </div>
  );
}

function JoinForm({ state, dispatch }) {
  const set = (patch) => dispatch({ type: 'ui', patch });
  const busyRef = useRef(false);

  async function join() {
    if (busyRef.current) return;
    busyRef.current = true;
    set({ error: '' });
    const res = await emitAck('student:join', {
      joinCode: state.joinCode.trim(),
      nickname: state.name.trim(),
      mode: 'solo',
      nation: SIDE,
    });
    busyRef.current = false;
    if (!res.ok) return set({ error: errorText(res.error) });
    dispatch({ type: 'joined', studentId: res.studentId, approved: res.approved });
  }

  const ready = state.joinCode.length === 6 && state.name.trim().length >= 2;

  return (
    <div className="card join-screen">
      <h2>Join your class</h2>
      <p className="muted">It's 1775. You will command the Continental Army through the Revolutionary War.</p>
      <label htmlFor="join-code">Class code</label>
      <input
        id="join-code" inputMode="numeric" autoComplete="off" maxLength={6}
        placeholder="6-digit code" value={state.joinCode}
        onChange={(e) => set({ joinCode: e.target.value.replace(/\D/g, '') })}
      />
      <label htmlFor="join-name">Your first name</label>
      <input
        id="join-name" maxLength={20} placeholder="e.g. Ana R." value={state.name}
        onChange={(e) => set({ name: e.target.value })}
      />

      <p className="err" role="alert">{state.error}</p>
      <div className="btn-col">
        <button className="btn big" disabled={!ready} onClick={join}>Take command</button>
        <button className="btn ghost" onClick={() => set({ screen: 'title', error: '' })}>Back</button>
      </div>
    </div>
  );
}

function WaitCard({ title, text, children }) {
  return (
    <div className="card wait-card">
      <div className="pulse-dot" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </div>
  );
}
