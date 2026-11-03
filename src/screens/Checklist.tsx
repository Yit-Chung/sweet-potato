// Screen 4 · Trip tab: the "before you fly" checklist from content/checklist.yaml.
// Ticks, removals and added items are kept for the session.
import { checklist, fill, text, tripVars } from '../content';
import { useSessionState } from '../lib/session';
import { sx } from '../lib/sx';
import { TabBar } from '../components/TabBar';
import { Close } from '../components/icons';

type Item = { text: string; hint?: string; done: boolean };

const t = text.checklist;
const dotGrid = 'border-radius: 22px; background-color: #F7F7F5; background-image: radial-gradient(#D6D6D2 1.2px, transparent 1.2px); background-size: 18px 18px; overflow-y: auto';

export function Checklist() {
  const [items, setItems] = useSessionState<Item[]>('checklist.items', () => checklist.map((c) => ({ text: c.item, hint: c.hint, done: !!c.ticked })));
  const [draft, setDraft] = useSessionState('checklist.draft', '');
  const n = items.length, d = items.filter((x) => x.done).length;

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    setItems([...items, { text: value, done: false }]);
    setDraft('');
  };

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: flex-end; justify-content: space-between; padding: 16px 20px 12px')}>
        <div style={sx('display: flex; flex-direction: column; gap: 2px')}>
          <div style={sx('font-size: 26px; font-weight: 700')}>{t.title}</div>
          <div style={sx('font-size: 13px; color: #595959')}>{fill(t.subtitle, tripVars)}</div>
        </div>
        <div style={sx('font-size: 13px; font-weight: 600; color: #3D3D3D')}>{fill(t.progress, { done: d, total: n })}</div>
      </div>

      <div style={sx('margin: 0 20px 12px; height: 6px; border-radius: 3px; background: #E6E6E3; overflow: hidden')}>
        <div style={{ ...sx('height: 100%; background: #111111'), width: (n ? Math.round((d / n) * 100) : 0) + '%' }} />
      </div>

      <div style={sx('flex: 1 1 auto; margin: 0 16px; padding: 8px 14px; ' + dotGrid)}>
        {items.map((it, i) => (
          <div key={i} style={sx('display: flex; align-items: center; gap: 10px; min-height: 60px; border-bottom: 1px solid #E3E3E3')}>
            <button onClick={() => setItems(items.map((x, k) => (k === i ? { ...x, done: !x.done } : x)))} role="checkbox" aria-checked={it.done} aria-label={it.text}
              style={sx('width: 44px; height: 44px; margin-left: -8px; border: none; background: transparent; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: none')}>
              <span style={sx('width: 28px; height: 28px; border-radius: 8px; flex: none; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; ' + (it.done ? 'background: #111111; color: #FFFFFF; border: 2px solid #111111' : 'background: #FFFFFF; color: #111111; border: 2px solid #8A8A8A'))}>{it.done ? '✓' : ''}</span>
            </button>
            <div style={sx('flex: 1 1 auto; display: flex; flex-direction: column; gap: 2px; min-width: 0')}>
              <span style={sx('font-size: 16px; font-weight: 600; ' + (it.done ? 'color: #595959; text-decoration: line-through' : 'color: #111111'))}>{it.text}</span>
              {it.hint && <span style={sx('font-size: 12px; color: #595959')}>{it.hint}</span>}
            </div>
            <button onClick={() => setItems(items.filter((_, k) => k !== i))} aria-label={'Remove ' + it.text}
              style={sx('width: 44px; height: 44px; border: none; background: transparent; color: #8A8A8A; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: none')}>
              <Close size={16} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); add(); }} style={sx('padding: 12px 16px 28px; display: flex; flex-direction: column; gap: 8px')}>
        <div style={sx('font-size: 12px; color: #595959; text-align: center')}>{t.stays_note}</div>
        <div style={sx('display: flex; gap: 8px')}>
          <label htmlFor="addCk" className="sr-only">{t.add_placeholder}</label>
          <input id="addCk" type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t.add_placeholder}
            style={sx('flex: 1 1 auto; min-width: 0; height: 52px; padding: 0 14px; border-radius: 14px; border: 1px solid #CFCFCF; background: #FFFFFF; font-size: 15px; color: #111111; outline: none; box-sizing: border-box')} />
          <button type="submit" style={sx('height: 52px; padding: 0 20px; border-radius: 14px; border: none; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; cursor: pointer; flex: none')}>{t.add_button}</button>
        </div>
      </form>

      <TabBar active="trip" />
    </div>
  );
}
