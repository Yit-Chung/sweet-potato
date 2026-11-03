// Screen 5 · Phrases tab: pinned phrase cards, then phrases by group from
// content/phrases.yaml. A phrase opens in place; "Full screen" shows it large to a shopkeeper.
import { useState } from 'react';
import { phrases, text } from '../content';
import { useSessionState } from '../lib/session';
import { sx } from '../lib/sx';
import { TabBar } from '../components/TabBar';

const t = text.phrases;
const groups = [...new Set(phrases.map((p) => p.group))];
const sectionLabel = sx('font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #595959; padding: 16px 4px 4px');
const zhFont = "'Noto Sans TC', sans-serif";

export function Phrases() {
  const [open, setOpen] = useSessionState('phrases.open', () => phrases.findIndex((p) => p.open_on_start));
  const [pins, setPins] = useSessionState<Record<number, boolean>>('phrases.pins', () => Object.fromEntries(phrases.map((p, i) => [i, !!p.pinned])));
  const [editing, setEditing] = useState(false);
  const [full, setFull] = useState(false);
  const [shown, setShown] = useState(-1);

  const cur = phrases[shown >= 0 ? shown : open >= 0 ? open : 0];
  const pinned = open >= 0 && !!pins[open];
  const exitFull = () => { setFull(false); setShown(-1); };

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: center; justify-content: space-between; padding: 16px 12px 8px 20px')}>
        <div style={sx('font-size: 26px; font-weight: 700')}>{t.title}</div>
        {/* No action yet. */}
        <button style={sx('height: 40px; padding: 0 14px; border-radius: 999px; border: none; background: #111111; color: #FFFFFF; font-size: 14px; font-weight: 600; cursor: pointer')}>{t.new_button}</button>
      </div>

      <div style={sx('flex: 1 1 auto; overflow-y: auto; padding: 0 16px 28px')}>
        <div style={sx('font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #595959; padding: 8px 4px')}>{t.pinned_label}</div>
        <div style={sx('display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px')}>
          {/* No action yet. */}
          <button style={sx('min-height: 88px; padding: 12px; border-radius: 16px; border: none; background: #111111; color: #FFFFFF; display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; text-align: left; cursor: pointer')}>
            <span style={sx('font-size: 16px; font-weight: 700')}>{t.food_card_title}</span>
            <span style={sx('font-size: 12px; color: #D0D0D0')}>{t.food_card_text}</span>
          </button>
          {phrases.map((p, i) => pins[i] && (
            <button key={i} onClick={() => { setFull(true); setShown(i); }} style={sx('min-height: 88px; padding: 12px; border-radius: 16px; border: 1px solid #E3E3E3; background: #F7F7F7; color: #111111; display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 6px; text-align: left; cursor: pointer')}>
              <span style={{ ...sx('font-size: 20px; font-weight: 700; line-height: 1.25'), fontFamily: zhFont }}>{p.chinese}</span>
              <span style={sx('font-size: 12px; color: #595959')}>{p.english}</span>
            </button>
          ))}
        </div>

        {groups.map((g) => (
          <div key={g}>
            <div style={sectionLabel}>{g}</div>
            {phrases.map((p, i) => p.group !== g ? null : i !== open ? (
              <button key={i} onClick={() => { setOpen(i); setEditing(false); }} aria-expanded="false" style={sx('width: 100%; min-height: 56px; padding: 6px 4px; border: none; border-bottom: 1px solid #E3E3E3; background: transparent; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; cursor: pointer; color: #111111')}>
                <span style={sx('font-size: 15px; font-weight: 600')}>{p.english}</span>
                <span style={{ ...sx('font-size: 17px; color: #3D3D3D; white-space: nowrap'), fontFamily: zhFont }}>{p.chinese}</span>
              </button>
            ) : (
              <div key={i} style={sx('margin: 8px 0; padding: 22px 18px 16px; border-radius: 22px; background: #F4F4F2; display: flex; flex-direction: column; gap: 8px')}>
                <button onClick={() => { setOpen(-1); setEditing(false); }} aria-expanded="true" style={sx('align-self: flex-end; min-height: 32px; padding: 0; border: none; background: transparent; color: #3D3D3D; font-size: 13px; font-weight: 600; cursor: pointer')}>{t.close_button}</button>
                <div style={{ ...sx('font-size: 40px; font-weight: 700; line-height: 1.25; text-align: center'), fontFamily: zhFont }}>{p.chinese}</div>
                <div style={sx('font-size: 16px; color: #3D3D3D; text-align: center')}>{p.pinyin}</div>
                {editing ? <>
                  <label htmlFor="enQ2" className="sr-only">English</label>
                  <input id="enQ2" type="text" value={p.english} readOnly style={sx('height: 48px; padding: 0 12px; border-radius: 12px; border: 1.5px dashed #8A8A8A; background: #FFFFFF; font-size: 16px; font-weight: 600; text-align: center; color: #111111; outline: none')} />
                </> : <div style={sx('font-size: 15px; color: #595959; text-align: center')}>{p.english}</div>}
                <div style={sx('display: flex; gap: 8px; margin-top: 8px')}>
                  <button onClick={() => setPins({ ...pins, [open]: !pinned })} aria-pressed={pinned} aria-label={pinned ? 'Unpin' : 'Pin to top'}
                    style={sx('width: 48px; height: 48px; border-radius: 12px; flex: none; display: flex; align-items: center; justify-content: center; cursor: pointer; ' + (pinned ? 'background: #111111; color: #FFFFFF; border: 1px solid #111111' : 'background: #FFFFFF; color: #111111; border: 1px solid #111111'))}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 17v5" /><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z" /></svg>
                  </button>
                  <button onClick={() => setEditing(!editing)} style={sx('flex: 1 1 0; height: 48px; border-radius: 12px; border: 1px solid #111111; background: #FFFFFF; color: #111111; font-size: 14px; font-weight: 600; cursor: pointer')}>{editing ? t.done_editing_button : t.edit_button}</button>
                  <button onClick={() => { setFull(true); setShown(-1); }} style={sx('flex: 1 1 0; height: 48px; border-radius: 12px; border: none; background: #111111; color: #FFFFFF; font-size: 14px; font-weight: 600; cursor: pointer')}>{t.full_screen_button}</button>
                </div>
              </div>
            ))}
            {/* No action yet. */}
            <button style={sx('width: 100%; min-height: 48px; border: none; background: transparent; color: #3D3D3D; font-size: 14px; font-weight: 600; text-align: left; padding: 0 4px; cursor: pointer')}>{t.add_phrase_button}</button>
          </div>
        ))}
      </div>

      {full && cur && (
        <div style={sx('position: absolute; inset: 0; z-index: 10; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 24px; box-sizing: border-box; text-align: center')}>
          <div style={{ ...sx('font-size: 56px; font-weight: 700; line-height: 1.25'), fontFamily: zhFont }}>{cur.chinese}</div>
          <div style={sx('font-size: 18px; color: #3D3D3D')}>{cur.pinyin}</div>
          <button onClick={exitFull} style={sx('margin-top: 40px; height: 48px; padding: 0 20px; border-radius: 999px; border: 1px solid #CFCFCF; background: #FFFFFF; color: #111111; font-size: 14px; font-weight: 600; cursor: pointer')}>{t.done_button}</button>
        </div>
      )}

      <TabBar active="phrases" />
    </div>
  );
}
