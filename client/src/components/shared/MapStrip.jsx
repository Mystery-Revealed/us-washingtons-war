// MapStrip.jsx — the between-campaign map strip (spec §5, §6): a purely
// decorative overlay that animates the army's marker sliding from the previous
// campaign's stop to the current one along a steel-blue line, Boston → Yorktown.
// It reads `meta.mapStrip` (shipped by the server as display data only — see
// usWashingtonsWar.js MAP_STRIP) and never touches scoring. Skippable: the Skip
// button jumps straight to the situation card.
//
// `waypoints`: [{ key, place, date, x, y }] — x is 0..1 progress, left→right.
// `currentIndex`: the campaign the marker is moving TO.
// `previousIndex`: the campaign it's moving FROM (null on the very first stop —
// no march to animate; the army simply mobilizes at Boston).

import { useEffect, useRef, useState } from 'react';

const MARCH_MS = 1100;   // how long the sliding transition takes
const PAUSE_MS = 650;    // a beat to look at the map on the very first stop

export default function MapStrip({ waypoints, currentIndex, previousIndex, onDone }) {
  // Mount the marker at the PREVIOUS stop with no transition, then on the next
  // frame flip to the CURRENT stop — that class flip is what makes the CSS
  // `left` change actually animate instead of jumping.
  const [atCurrent, setAtCurrent] = useState(previousIndex == null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Fire onDone exactly once, whichever trigger gets there first: the march's
  // transitionend, the fallback timer, or the Skip button.
  const finishNow = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  };

  useEffect(() => {
    doneRef.current = false;
    setAtCurrent(previousIndex == null);

    let raf1, raf2, fallback;
    if (previousIndex == null) {
      // Nothing to march from — just pause on the map for a beat.
      fallback = setTimeout(finishNow, PAUSE_MS);
    } else {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setAtCurrent(true));
      });
      // Fallback in case transitionend doesn't fire (e.g. reduced-motion).
      fallback = setTimeout(finishNow, MARCH_MS + 300);
    }

    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(fallback); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const markerAt = waypoints[atCurrent ? currentIndex : (previousIndex ?? currentIndex)];

  return (
    <div className="map-strip" role="img" aria-label={`The army's path, marching toward ${waypoints[currentIndex]?.place}`}>
      <div className="map-strip-line">
        {waypoints.map((w, i) => (
          <div key={w.key} className="map-stop" style={{ left: `${w.x * 100}%` }}>
            <span
              className={`map-dot ${i < currentIndex ? 'visited' : ''} ${i === currentIndex ? 'active' : ''}`}
              title={w.place}
            />
            <span className={`map-label ${i === currentIndex ? 'current' : ''}`}>{w.place}</span>
          </div>
        ))}
        {markerAt && (
          <div
            className="map-marker"
            style={{ left: `${markerAt.x * 100}%` }}
            aria-hidden="true"
            onTransitionEnd={(e) => { if (e.propertyName === 'left') finishNow(); }}
          >
            ⚔️
          </div>
        )}
      </div>
      <button type="button" className="btn ghost skip map-skip" onClick={finishNow}>Skip</button>
    </div>
  );
}
