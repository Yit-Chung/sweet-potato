// Screen 2b · Who's recommending: name, home country and intro, asked once before
// recommending a place. Continue → A place you loved (7).
import { Link } from 'react-router-dom';
import { fill, text, tripVars } from '../content';
import { defaultProfile, useSessionState, type Profile as ProfileT } from '../lib/session';
import { sx } from '../lib/sx';
import { useBack } from '../lib/useBack';
import { ChevronLeft } from '../components/icons';

const t = text.profile;
const label = sx('font-size: 13px; font-weight: 600; color: #111111');
const input = sx('height: 48px; padding: 0 14px; border-radius: 12px; border: 1px solid #CFCFCF; background: #FFFFFF; font-size: 16px; color: #111111; outline: none; box-sizing: border-box; width: 100%');
const field = sx('display: flex; flex-direction: column; gap: 6px');

export function Profile() {
  const back = useBack('/explore');
  const [p, setP] = useSessionState<ProfileT>('profile', defaultProfile);
  const set = (k: keyof ProfileT) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.value });

  const name = p.name.trim(), from = p.from.trim(), intro = p.intro.trim();
  const ok = !!name && !!from;

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: center; padding: 12px 16px 0 8px; min-height: 44px; flex: none')}>
        <button onClick={back} aria-label="Back" style={sx('width: 44px; height: 44px; border: none; background: transparent; border-radius: 999px; display: flex; align-items: center; justify-content: center; color: #111111; cursor: pointer')}>
          <ChevronLeft />
        </button>
      </div>

      <div style={sx('flex: 1 1 auto; overflow-y: auto; min-height: 0; padding: 8px 20px 12px; display: flex; flex-direction: column; gap: 18px')}>
        <div style={sx('display: flex; flex-direction: column; gap: 8px')}>
          <h1 style={sx('margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700')}>{t.title}</h1>
          <p style={sx('margin: 0; font-size: 15px; line-height: 1.5; color: #3D3D3D')}>{fill(t.text, tripVars)}</p>
        </div>
        <div style={field}>
          <label htmlFor="nm" style={label}>{t.name_label}</label>
          <input id="nm" type="text" value={p.name} onChange={set('name')} placeholder={t.name_placeholder} style={input} />
        </div>
        <div style={field}>
          <label htmlFor="fr" style={label}>{t.from_label}</label>
          <input id="fr" type="text" value={p.from} onChange={set('from')} placeholder={t.from_placeholder} style={input} />
        </div>
        <div style={field}>
          <label htmlFor="in" style={label}>{t.intro_label} <span style={sx('font-weight: 400; color: #595959')}>{t.intro_optional}</span></label>
          <input id="in" type="text" value={p.intro} onChange={set('intro')} placeholder={t.intro_placeholder} style={input} />
        </div>
        <div style={field}>
          <div style={sx('font-size: 12px; color: #595959')}>{t.preview_label}</div>
          <div style={sx('display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; background: #F4F4F2')}>
            <div style={sx('width: 36px; height: 36px; border-radius: 50%; background: #111111; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; flex: none')}>{name ? name[0].toUpperCase() : '?'}</div>
            <div style={sx('display: flex; flex-direction: column; min-width: 0')}>
              <span style={sx('font-size: 14px; font-weight: 600')}>{fill(t.preview_line, { ...tripVars, name: name || t.preview_name_empty, from: from || t.preview_from_empty })}</span>
              <span style={sx('font-size: 12px; color: #595959; white-space: nowrap; overflow: hidden; text-overflow: ellipsis')}>{intro || t.preview_intro_empty}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={sx('padding: 10px 20px 28px; display: flex; flex-direction: column; gap: 10px; flex: none')}>
        <div style={sx('font-size: 12px; color: #595959; text-align: center')}>{t.once_note}</div>
        <Link to="/keep" aria-disabled={!ok} onClick={(e) => { if (!ok) e.preventDefault(); }}
          style={sx('display: flex; align-items: center; justify-content: center; text-decoration: none; height: 52px; border-radius: 14px; font-size: 15px; font-weight: 600; ' + (ok ? 'background: #111111; color: #FFFFFF' : 'background: #DADADA; color: #595959; cursor: default'))}>{t.continue_button}</Link>
      </div>
    </div>
  );
}
