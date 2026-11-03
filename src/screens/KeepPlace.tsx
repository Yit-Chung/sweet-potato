// Screen 7 · A place you loved: fill in the blanks of a sentence (stop, place, why, what,
// when), in English or Chinese. Save → Note filled (8). Close with content asks first:
// Save → 8, Discard → Note (6). The form starts fresh on each visit; the language is kept.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routeStops, text, trip } from '../content';
import { defaultProfile, useSessionState, type Profile } from '../lib/session';
import { sx } from '../lib/sx';
import { Close } from '../components/icons';

type Lang = 'zh' | 'en';
type Val = { zh: string; en: string } | null;

const BLANKS = ['stop', 'place', 'why', 'what', 'when'] as const;
const ex = text.keep_place;

/** Splits the sentence from text.yaml into text and blanks: "In {stop}, I…" → ['In ', 0, ', I…']. */
const frame = (lang: Lang) =>
  ex[lang].sentence.split(/\{(stop|place|why|what|when)\}/).map((part, i) => (i % 2 ? BLANKS.indexOf(part as typeof BLANKS[number]) : part)).filter((p) => p !== '');

const stopOptions = routeStops.map((s) => ({ zh: s.name_zh, en: s.name }));
const fieldLabel = sx('font-size: 12px; font-weight: 600; color: #3D3D3D');
const langPill = (on: boolean) => sx('height: 32px; padding: 0 12px; border-radius: 999px; border: none; font-size: 13px; font-weight: 600; white-space: nowrap; cursor: pointer; ' + (on ? 'background: #111111; color: #FFFFFF' : 'background: transparent; color: #3D3D3D'));
const closeBtn = sx('width: 44px; height: 44px; flex: none; border: none; background: transparent; border-radius: 999px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #111111; text-decoration: none');

export function KeepPlace() {
  const [lang, setLang] = useSessionState<Lang>('keep.lang', 'en');
  const [profile] = useSessionState<Profile>('profile', defaultProfile);
  const [active, setActive] = useState(2);
  const [vals, setVals] = useState<Val[]>([stopOptions[0], null, null, null, null]);
  const [link, setLink] = useState(ex.example_link);
  const [typed, setTyped] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const L = lang;
  const t = ex[L];

  // A pasted Google Maps link fills in the example place and category; Instagram links don't.
  const isLink = /https?:|goo\.gl|maps|instagram/i.test(link), isIG = /instagram/i.test(link);
  const auto = isLink && !isIG ? { zh: ex.example_place_zh, en: ex.example_place_en } : null;
  const autoCat = isLink && !isIG ? ex.example_category : null;
  const catNow = cat === 'none' ? null : cat || autoCat;

  const shown = vals.slice();
  shown[1] = typed ? { zh: typed, en: typed } : auto;
  const filled = shown.filter(Boolean).length;
  const hasContent = filled > 0 || !!link;

  const nextEmpty = (v: Val[], from: number) => { for (let i = 1; i <= 5; i++) { const j = (from + i) % 5; if (!v[j]) return j; } return from; };
  const fillStop = (o: { zh: string; en: string }) => { const v = shown.slice(); v[active] = o; setVals(v); setActive(nextEmpty(v, active)); };
  const blankLabel = [t.blank_stop, t.blank_place, t.blank_why, t.blank_what, t.blank_when];
  const fillingLabel = [t.filling_stop, t.filling_place, t.filling_why, t.filling_what, t.filling_when];

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 16px 6px 8px')}>
        <div style={sx('display: flex; align-items: center; gap: 4px; min-width: 0')}>
          {hasContent
            ? <button onClick={() => setClosing(true)} aria-label="Close" style={closeBtn}><Close /></button>
            : <Link to="/note" aria-label="Close" style={closeBtn}><Close /></Link>}
          <div style={sx('font-size: 15px; font-weight: 600; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis')}>{t.title}</div>
        </div>
        <div style={sx('display: flex; flex: none; padding: 3px; border-radius: 999px; background: #F0F0F0')}>
          <button onClick={() => setLang('zh')} aria-pressed={L === 'zh'} style={langPill(L === 'zh')}>中文</button>
          <button onClick={() => setLang('en')} aria-pressed={L === 'en'} style={langPill(L === 'en')}>EN</button>
        </div>
      </div>

      <div style={sx('flex: 1 1 auto; overflow-y: auto; padding: 18px 22px 10px; display: flex; flex-direction: column; gap: 22px')}>
        <div style={sx('font-size: 27px; line-height: 1.75; font-weight: 600; letter-spacing: -0.01em')} lang={L === 'zh' ? 'zh-Hant' : 'en'}>
          {frame(L).map((p, i) => {
            if (typeof p === 'string') return <span key={i}>{p}</span>;
            const v = shown[p], on = p === active;
            let style = 'font: inherit; font-size: 27px; padding: 0 8px; margin: 0 2px; border-radius: 10px; cursor: pointer; line-height: 1.4; ';
            if (on) style += 'background: #111111; color: #FFFFFF; border: 2px solid #111111';
            else if (v) style += 'background: transparent; color: #111111; border: none; border-bottom: 3px solid #111111; border-radius: 0';
            else style += 'background: #F4F4F2; color: #6B6B6B; border: 2px dashed #8A8A8A';
            return <button key={i} onClick={() => setActive(p)} style={sx(style)}>{v ? v[L] : blankLabel[p]}</button>;
          })}
        </div>

        <div style={sx('display: flex; align-items: flex-end; justify-content: space-between')}>
          {/* No action yet. */}
          <button style={sx('width: 120px; height: 120px; border-radius: 10px; border: 2px dashed #8A8A8A; background: #F7F7F7; transform: rotate(-4deg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #111111; cursor: pointer')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="12" cy="12.5" r="3.5" /></svg>
            <span style={sx('font-size: 13px; font-weight: 600')}>{t.photo_button}</span>
            <span style={sx('font-size: 11px; color: #595959')}>{t.photo_optional}</span>
          </button>
          <div style={sx('font-size: 22px; font-weight: 700; transform: rotate(-2deg)')}>— {profile.name.trim() || trip.traveller}</div>
        </div>
      </div>

      <div style={sx('background: #F4F4F2; border-radius: 24px 24px 0 0; padding: 16px 16px 28px; display: flex; flex-direction: column; gap: 12px')}>
        <div style={sx('font-size: 12px; font-weight: 600; color: #3D3D3D')}>{fillingLabel[active]}</div>
        {t.required_note && <div style={sx('font-size: 12px; color: #595959; margin-top: -6px')}>{t.required_note}</div>}

        {active === 1 && (
          <div style={sx('display: flex; flex-direction: column; gap: 10px')}>
            <div style={sx('display: flex; flex-direction: column; gap: 4px')}>
              <label htmlFor="linkF" style={fieldLabel}>{t.link_label}</label>
              <div style={sx('display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 14px; border-radius: 14px; border: 1.5px solid #111111; background: #FFFFFF')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
                <input id="linkF" type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder={t.link_placeholder}
                  style={sx('flex: 1 1 auto; min-width: 0; border: none; outline: none; background: transparent; font-size: 15px; color: #111111')} />
              </div>
            </div>
            <div style={sx('display: flex; flex-direction: column; gap: 4px')}>
              <label htmlFor="nameF" style={fieldLabel}>{t.name_label}</label>
              <div style={sx('display: flex; align-items: center; gap: 8px; height: 52px; padding: 0 14px; border-radius: 14px; border: 1px solid #CFCFCF; background: #FFFFFF')}>
                <input id="nameF" type="text" value={typed ?? (auto ? auto[L] : '')} onChange={(e) => setTyped(e.target.value || null)}
                  placeholder={isIG ? t.name_placeholder_instagram : t.name_placeholder}
                  style={sx('flex: 1 1 auto; min-width: 0; border: none; outline: none; background: transparent; font-size: 15px; color: ' + (!typed && auto ? '#6B6B6B' : '#111111'))} />
                {!typed && auto && <span style={sx('font-size: 11px; color: #595959; white-space: nowrap')}>{t.from_link_tag}</span>}
              </div>
            </div>
            <div style={sx('display: flex; flex-direction: column; gap: 6px')}>
              <div style={sx('display: flex; justify-content: space-between; align-items: baseline')}>
                <span id="catL" style={fieldLabel}>{t.type_label}</span>
                <span style={sx('font-size: 11px; color: #595959')}>{!cat && autoCat ? t.type_from_link : catNow ? '' : t.type_pick_one}</span>
              </div>
              <div role="group" aria-labelledby="catL" style={sx('display: flex; flex-wrap: wrap; gap: 6px')}>
                {trip.categories.map((k) => {
                  const on = catNow === k.english;
                  return (
                    <button key={k.english} onClick={() => setCat(on ? 'none' : k.english)} aria-pressed={on}
                      style={sx('height: 36px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; ' + (on ? 'background: #111111; color: #FFFFFF; border: 1px solid #111111' : 'background: #FFFFFF; color: #111111; border: 1px solid #CFCFCF'))}>
                      {L === 'zh' ? k.chinese : k.english}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {active === 0 && (
          <div style={sx('display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px')}>
            {stopOptions.map((o) => {
              const on = !!shown[0] && shown[0].en === o.en;
              return (
                <button key={o.en} onClick={() => fillStop(o)} aria-pressed={on}
                  style={sx('height: 44px; border-radius: 10px; font-size: 14px; cursor: pointer; ' + (on ? 'background: #111111; color: #FFFFFF; border: 1px solid #111111; font-weight: 700' : 'background: #FFFFFF; color: #111111; border: 1px solid #CFCFCF; font-weight: 500'))}>
                  {o[L]}
                </button>
              );
            })}
          </div>
        )}

        {active >= 2 && <>
          <label htmlFor="ownF" className="sr-only">{t.answer_placeholder}</label>
          <input id="ownF" type="text" value={vals[active] ? vals[active]![L] : ''}
            onChange={(e) => { const v = vals.slice(); const value = e.target.value; v[active] = value ? { zh: value, en: value } : null; setVals(v); }}
            placeholder={t.answer_placeholder}
            style={sx('height: 48px; padding: 0 16px; border-radius: 14px; border: 1px solid #CFCFCF; background: #FFFFFF; font-size: 15px; color: #111111; outline: none; box-sizing: border-box')} />
        </>}

        <div style={sx('display: flex; gap: 8px')}>
          <Link to="/note/filled" style={sx('flex: 1 1 auto; height: 48px; padding: 0 18px; border-radius: 14px; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center')}>{t.save_button}</Link>
        </div>
      </div>

      {closing && (
        <div style={sx('position: absolute; inset: 0; z-index: 10; background: rgba(17,17,17,0.45); display: flex; flex-direction: column; justify-content: flex-end')} onClick={(e) => { if (e.target === e.currentTarget) setClosing(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="leaveT" style={sx('background: #FFFFFF; border-radius: 24px 24px 0 0; padding: 24px 20px 28px; display: flex; flex-direction: column; gap: 10px')}>
            <h2 id="leaveT" style={sx('margin: 0; font-size: 20px; font-weight: 700')}>{t.leave_title}</h2>
            <p style={sx('margin: 0 0 8px; font-size: 15px; line-height: 1.5; color: #3D3D3D')}>{t.leave_text}</p>
            <Link to="/note/filled" style={sx('height: 52px; border-radius: 14px; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center')}>{t.leave_save}</Link>
            <Link to="/note" style={sx('height: 48px; border-radius: 14px; border: 1px solid #CFCFCF; background: #FFFFFF; color: #B42318; font-size: 15px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box')}>{t.leave_discard}</Link>
            <button onClick={() => setClosing(false)} style={sx('height: 44px; border-radius: 14px; border: none; background: transparent; color: #3D3D3D; font-size: 14px; font-weight: 600; cursor: pointer')}>{t.leave_keep_editing}</button>
          </div>
        </div>
      )}
    </div>
  );
}
