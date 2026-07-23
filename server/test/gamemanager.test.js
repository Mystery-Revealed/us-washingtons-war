// gamemanager.test.js — drives the manager exactly the way socketHandlers does
// and inspects the emit instructions it returns. No sockets involved. Washington's
// War is single-role solo (no pick, no branch, no AI rival), so these focus on the
// solo lifecycle, the one class-wide group, and the accuracy path.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GameManager } from '../src/GameManager.js';
import game, { phasesFor, SIDE } from '../src/games/usWashingtonsWar.js';

const PIN = '4242';
const stepsOf = () => phasesFor().flatMap((p) => p.steps);

function makeSession(manager, { requireApproval = false } = {}) {
  const res = manager.createSession({ pin: PIN, requireApproval });
  assert.ok(res.joinCode, 'session created');
  return res.joinCode;
}

function join(manager, joinCode, nickname) {
  const res = manager.joinStudent({ joinCode, nickname, mode: 'solo', nation: SIDE });
  assert.ok(!res.error, `join failed: ${res.error}`);
  return res;
}

const studentEvents = (emits, studentId, name) =>
  emits.filter((e) => e.to.type === 'student' && e.to.studentId === studentId && (!name || e.event === name));
const eventsOf = (emits, name) => emits.filter((e) => e.event === name);

function liveSide(manager, joinCode, studentId) {
  const session = manager.registry.get(joinCode);
  const student = session.students.get(studentId);
  const match = session.matches.get(student.matchId);
  return { match, ss: match.gameState.sides[match.side] };
}

function submitReal(manager, joinCode, studentId, verdict) {
  const { ss } = liveSide(manager, joinCode, studentId);
  const step = stepsOf()[ss.cursor];
  const realIndex = step.choices.findIndex((c) => c.verdict === verdict);
  const choiceIndex = ss.shuffles[ss.cursor].indexOf(realIndex);
  return manager.submitMove({ joinCode, studentId, move: { kind: step.kind, choiceIndex } });
}

function playRight(manager, joinCode, studentId) {
  const { match } = liveSide(manager, joinCode, studentId);
  const move = game.aiMove(match.gameState, match.side);
  return manager.submitMove({ joinCode, studentId, move });
}

function playAllRight(manager, joinCode, studentId) {
  let last;
  for (let i = 0; i < game.totalActions; i++) {
    last = playRight(manager, joinCode, studentId);
    assert.ok(!last.error, `decision ${i}: ${last.error}`);
  }
  return last;
}

test('createSession rejects a bad PIN', () => {
  const manager = new GameManager();
  assert.equal(manager.createSession({ pin: 'abc' }).error, 'bad_pin');
  assert.equal(manager.createSession({ pin: '12345' }).error, 'bad_pin');
});

test('the default game is Washington\'s War', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  assert.equal(manager.registry.get(joinCode).gameId, 'us-washingtons-war');
});

test('teacher ops require the right PIN', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  assert.equal(manager.endSession({ joinCode, pin: '9999' }).error, 'bad_pin');
  assert.equal(manager.setApproval({ joinCode, pin: '0000', requireApproval: false }).error, 'bad_pin');
});

test('the teacher\'s roster snapshot on join already shows in_progress, not a stale not_started (regression, see memory shared-engine-gamemanager-bug)', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana');
  const lobbyUpdates = eventsOf(res.emits, 'lobby:update');
  assert.equal(lobbyUpdates.length, 1, 'join emits exactly one lobby:update for an auto-start solo student');
  const student = lobbyUpdates[0].payload.students.find((s) => s.id === res.studentId);
  assert.equal(student.status, 'in_progress', 'the ONLY roster push before completion must not show a stale not_started');
});

test('a student joins, the match begins on join, and all-right earns 100% and the strong ending', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana');

  const begin = studentEvents(res.emits, res.studentId, 'match:begin');
  assert.equal(begin.length, 1, 'solo match begins on join');
  assert.equal(begin[0].payload.side, 'class');
  assert.equal(begin[0].payload.rivalMeters, null, 'no rival');

  const last = playAllRight(manager, joinCode, res.studentId);
  const end = studentEvents(last.emits, res.studentId, 'match:end');
  assert.equal(end.length, 1, 'match ends after 14 decisions');
  assert.equal(end[0].payload.you.accuracy, 100);
  assert.equal(end[0].payload.you.ending.key, 'strong');
  assert.match(end[0].payload.you.debrief, /outlasted/i, 'debrief present');

  const roster = manager.roster(manager.registry.get(joinCode));
  assert.equal(roster.students[0].status, 'completed');
  assert.equal(roster.students[0].accuracy, 100);
});

test('every resolution carries a verdict but never the running answer key', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Bea');
  const r = submitReal(manager, joinCode, res.studentId, 'wrong');
  const resolution = studentEvents(r.emits, res.studentId, 'turn:resolution')[0].payload;
  assert.equal(resolution.verdict, 'wrong');
  assert.ok(resolution.feedback && resolution.feedback.length > 10, 'feedback ships with the resolution');
  assert.equal(typeof resolution.stepIndex, 'number', 'the client can key scene art on stepIndex');
});

test('class accuracy is one class-wide group (spec §1: no pick)', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const a = join(manager, joinCode, 'Ana');
  const b = join(manager, joinCode, 'Ben');
  playAllRight(manager, joinCode, a.studentId);
  playAllRight(manager, joinCode, b.studentId);

  const roster = manager.roster(manager.registry.get(joinCode));
  assert.equal(roster.classAccuracy.class.count, 2, 'both students in one group');
  assert.equal(roster.classAccuracy.class.average, 100);
});

test('approval gate: a solo student waits, then starts on approve', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager, { requireApproval: true });
  const res = join(manager, joinCode, 'Mara');
  assert.equal(res.approved, false);
  assert.equal(studentEvents(res.emits, res.studentId, 'match:begin').length, 0);

  const ok = manager.approveStudent({ joinCode, pin: PIN, studentId: res.studentId });
  assert.equal(studentEvents(ok.emits, res.studentId, 'join:approved').length, 1);
  assert.equal(studentEvents(ok.emits, res.studentId, 'match:begin').length, 1);
});

test('a wrong-kind move is rejected (every decision is a decision)', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana');
  const bad = manager.submitMove({ joinCode, studentId: res.studentId, move: { kind: 'map', choiceIndex: 0 } });
  assert.equal(bad.error, 'wrong_step_kind');
});

test('rejoin returns a full snapshot of the live scene', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  const res = join(manager, joinCode, 'Ana');
  playRight(manager, joinCode, res.studentId); // one decision done; another pending

  manager.markDisconnected({ joinCode, studentId: res.studentId });
  const back = manager.rejoinStudent({ joinCode, studentId: res.studentId });
  assert.ok(!back.error);
  assert.equal(back.sync.screen, 'match');
  assert.equal(back.sync.turn.kind, 'decision');
  assert.ok(Array.isArray(back.sync.turn.choices) && back.sync.turn.choices.length === 3);
});

test('end_session wipes the session from memory', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  join(manager, joinCode, 'Ana');
  const res = manager.endSession({ joinCode, pin: PIN });
  assert.ok(eventsOf(res.emits, 'session:ended').length >= 2, 'teacher + student notified');
  assert.equal(manager.registry.get(joinCode), undefined);
});

test('students cannot reach teacher data: report requires the PIN', () => {
  const manager = new GameManager();
  const joinCode = makeSession(manager);
  assert.equal(manager.sessionReport({ joinCode, pin: '1111' }).error, 'bad_pin');
  assert.ok(manager.sessionReport({ joinCode, pin: PIN }).report);
});
