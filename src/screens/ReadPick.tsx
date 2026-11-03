// Screen 3 · Read a pick: one friend's place in full (photo, why, what, when), with
// Save / Visited toggles (kept on the phone) and Directions. Back returns to the city it was opened from.
import { Navigate, useParams } from 'react-router-dom';
import { directionsUrl, fill, placeChip, placeKey, places, text } from '../content';
import { useSavedState } from '../lib/session';
import { sx } from '../lib/sx';
import { useBack } from '../lib/useBack';
import { ChevronLeft } from '../components/icons';
import { Photo } from '../components/Photo';

const t = text.pick;
const sectionLabel = sx('font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #595959');
const para = sx('margin: 0; font-size: 16px; line-height: 1.55');
const chip = sx('padding: 6px 10px; border-radius: 999px; border: 1px solid #CFCFCF; font-size: 12px; font-weight: 500');
const pill = (on: boolean) => sx('height: 48px; padding: 0 14px; border-radius: 12px; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; cursor: pointer; ' +
  (on ? 'background: #111111; color: #FFFFFF; border: 1px solid #111111' : 'background: #FFFFFF; color: #111111; border: 1px solid #CFCFCF'));
const icon = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export function ReadPick() {
  const { id } = useParams();
  const p = places[Number(id)];
  if (!p || p.type !== 'friend-pick') return <Navigate to="/explore" replace />;
  return <PickView key={id} id={Number(id)} />;
}

function PickView({ id }: { id: number }) {
  const p = places[id];
  const back = useBack('/explore');
  const key = placeKey(p);
  const [savedKeys, setSavedKeys] = useSavedState<string[]>('picks.saved', []);
  const [visitedKeys, setVisitedKeys] = useSavedState<string[]>('picks.visited', []);
  const saved = savedKeys.includes(key), visited = visitedKeys.includes(key);
  const toggle = (keys: string[]) => (keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key]);
  const by = p.recommended_by ?? '';
  const sections = [[t.why_label, p.why], [t.what_label, p.what], [t.when_label, p.when]].filter(([, body]) => body);

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: center; justify-content: space-between; padding: 12px 12px 4px 8px')}>
        <button onClick={back} aria-label="Back" style={sx('width: 44px; height: 44px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; color: #111111; cursor: pointer')}>
          <ChevronLeft />
        </button>
        <div style={sx('display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; background: #F2F2F2; font-size: 12px; font-weight: 500; color: #3D3D3D')}>
          <svg {...icon} width={14} height={14}><path d="M20 6L9 17l-5-5" /></svg>
          {t.saved_offline}
        </div>
      </div>

      <div style={sx('flex: 1 1 auto; overflow-y: auto; padding: 8px 24px 24px')}>
        <div style={sx('display: flex; align-items: center; gap: 12px')}>
          <div style={sx('width: 52px; height: 52px; border-radius: 50%; background: #111111; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; flex: none')}>{by[0]?.toUpperCase()}</div>
          <div style={sx('display: flex; flex-direction: column; gap: 2px')}>
            <div style={sx('font-size: 17px; font-weight: 600')}>{fill(t.recommends, { by })}</div>
            {p.about_recommender && <div style={sx('font-size: 13px; color: #595959')}>{p.about_recommender}</div>}
          </div>
        </div>

        <h1 style={sx('margin: 24px 0 2px; font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em')}>{p.name}</h1>
        {p.name_zh && <div style={sx("font-size: 18px; color: #3D3D3D; font-family: 'Noto Sans TC', sans-serif")}>{p.name_zh}</div>}

        <div style={sx('display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px')}>
          <span style={chip}>{placeChip(p)}</span>
          <span style={chip}>{p.category}</span>
        </div>

        <div style={sx('margin: 22px 0 0; padding: 10px 10px 14px; background: #FFFFFF; border: 1px solid #E3E3E3; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: rotate(-1.2deg)')}>
          <Photo file={p.photo} alt={p.name} style={sx('width: 100%; height: 220px; background: #D9D9D9; display: flex; align-items: center; justify-content: center; color: #4A4A4A; font-size: 13px')}>{fill(t.photo_placeholder, { by })}</Photo>
          <div style={sx('margin-top: 10px; font-size: 12px; color: #595959')}>{fill(t.photo_credit, { by })}</div>
        </div>

        <div style={sx('display: flex; flex-direction: column; gap: 22px; margin-top: 30px')}>
          {sections.map(([label, body]) => (
            <div key={label} style={sx('display: flex; flex-direction: column; gap: 6px')}>
              <div style={sectionLabel}>{label}</div>
              <p style={para}>{body}</p>
            </div>
          ))}
        </div>

        {/* "See original" has no action yet. */}
        {p.translated_from && (
          <div style={sx('margin-top: 12px; font-size: 12px; color: #595959')}>
            {fill(t.translated_note, { language: p.translated_from })} · <a href="#original" onClick={(e) => e.preventDefault()}>{t.see_original}</a>
          </div>
        )}
      </div>

      <div style={sx('display: flex; align-items: center; gap: 8px; padding: 12px 16px 28px; border-top: 1px solid #E3E3E3; background: #FFFFFF')}>
        <button onClick={() => setSavedKeys(toggle)} aria-pressed={saved} style={pill(saved)}>
          <svg {...icon}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          {saved ? t.saved_button : t.save_button}
        </button>
        <button onClick={() => setVisitedKeys(toggle)} aria-pressed={visited} style={pill(visited)}>
          <svg {...icon}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>
          {visited ? t.been_button : t.visited_button}
        </button>
        <a href={directionsUrl(p)} target="_blank" rel="noreferrer" style={sx('flex: 1 1 auto; height: 48px; border-radius: 12px; background: #111111; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 600; text-decoration: none')}>
          <svg {...icon}><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>
          {t.directions_button}
        </a>
      </div>
    </div>
  );
}
