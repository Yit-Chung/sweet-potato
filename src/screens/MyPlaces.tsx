// Screen 9 · After the trip: pick which of your saved places to share with friends.
// Share → "Thanks" → Done → Explore (2). Not now → Note (6).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { countPlaces, fill, myPlaces, text, tripVars } from '../content';
import { useSessionState } from '../lib/session';
import { sx } from '../lib/sx';
import { Check } from '../components/icons';
import { Photo } from '../components/Photo';

const t = text.share;

export function MyPlaces() {
  const [picked, setPicked] = useSessionState('share.picked', () => myPlaces.map(() => true));
  const [done, setDone] = useState(false);
  const n = picked.filter(Boolean).length;

  if (done) {
    return (
      <div className="screen">
        <div style={sx('flex: 1 1 auto; min-height: 0; padding: 0 28px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 14px; text-align: center')}>
          <div style={sx('width: 64px; height: 64px; border-radius: 50%; background: #111111; color: #FFFFFF; display: flex; align-items: center; justify-content: center')}>
            <Check size={30} />
          </div>
          <h1 style={sx('margin: 6px 0 0; font-size: 28px; line-height: 1.15; font-weight: 700')}>{fill(t.thanks_title, tripVars)}</h1>
          <p style={sx('margin: 0; font-size: 15px; line-height: 1.5; color: #3D3D3D')}>{fill(n === 1 ? t.thanks_text_one : t.thanks_text_other, { ...tripVars, count: countPlaces(n) })}</p>
        </div>
        <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column; flex: none')}>
          <Link to="/explore" style={sx('height: 52px; border-radius: 14px; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center')}>{t.done_button}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div style={sx('flex: 1 1 auto; overflow-y: auto; min-height: 0; padding: 56px 20px 12px; display: flex; flex-direction: column; gap: 18px')}>
        <div style={sx('display: flex; flex-direction: column; gap: 8px')}>
          <p style={sx('margin: 0; font-size: 13px; font-weight: 600; color: #595959')}>{fill(t.trip_line, tripVars)}</p>
          <h1 style={sx('margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700')}>{fill(t.title, tripVars)}</h1>
          <p style={sx('margin: 0; font-size: 15px; line-height: 1.5; color: #3D3D3D')}>{fill(t.intro, { ...tripVars, count: countPlaces(myPlaces.length) })}</p>
        </div>
        <ul style={sx('margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px')}>
          {myPlaces.map(({ place: p, id }, i) => {
            const on = picked[i];
            return (
              <li key={id}>
                <button onClick={() => setPicked(picked.map((x, k) => (k === i ? !x : x)))} role="checkbox" aria-checked={on}
                  style={sx('width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 16px; cursor: pointer; color: #111111; ' + (on ? 'background: #F4F4F2; border: 1.5px solid #111111' : 'background: #FFFFFF; border: 1.5px solid #E3E3E3'))}>
                  <span style={sx('width: 24px; height: 24px; border-radius: 7px; flex: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; color: #FFFFFF; ' + (on ? 'background: #111111' : 'border: 2px solid #8A8A8A; background: #FFFFFF'))}>
                    {on && <Check width={3} />}
                  </span>
                  <Photo file={p.photo} alt="" style={sx('width: 56px; height: 56px; border-radius: 12px; background: #DDDDDD; flex: none')} />
                  <span style={sx('display: flex; flex-direction: column; gap: 3px; min-width: 0; text-align: left')}>
                    <span style={sx('font-size: 15px; font-weight: 700')}>{p.name} <span style={sx('font-weight: 500; color: #595959')}>{p.name_zh}</span></span>
                    <span style={sx('font-size: 12px; color: #595959')}>{p.stop} · {p.category}</span>
                    {p.why && <span style={sx('font-size: 13px; line-height: 1.4; color: #3D3D3D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis')}>{p.why}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column; gap: 6px; flex: none')}>
        <p style={sx('margin: 0 0 4px; font-size: 12px; line-height: 1.5; color: #595959; text-align: center')}>{fill(t.footnote, tripVars)}</p>
        <button onClick={() => { if (n) setDone(true); }} aria-disabled={n === 0}
          style={sx('height: 52px; border-radius: 14px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; ' + (n ? 'background: #111111; color: #FFFFFF' : 'background: #DADADA; color: #595959'))}>
          {n === 0 ? t.pick_button : fill(t.share_button, { count: countPlaces(n) })}
        </button>
        <Link to="/note" style={sx('height: 44px; border-radius: 14px; color: #3D3D3D; font-size: 14px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center')}>{t.not_now_button}</Link>
      </div>
    </div>
  );
}
