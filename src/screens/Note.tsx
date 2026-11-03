// Screens 6 and 8 · Note tab: a journal page per stop and day. Screen 8 (`filled`) is the
// same page after keeping a place: an example entry plus the first of your saved places.
// The note you write on screen 6 is kept on the phone; screen 8's example is not.
import { Link } from 'react-router-dom';
import { addDays, fill, myPlaces, routeStops, text, tripDayIndex, tripStart, weekdayDate } from '../content';
import { useSavedState, useSessionState } from '../lib/session';
import { sx } from '../lib/sx';
import { TabBar } from '../components/TabBar';
import { Check, ChevronRight } from '../components/icons';

const t = text.note;
const stopDays = routeStops.map((s) => [tripDayIndex(s.arrive!), tripDayIndex(s.leave!)] as const);

export function Note({ filled = false }: { filled?: boolean }) {
  const k = filled ? 'noteFilled' : 'note';
  const [stop, setStop] = useSessionState(k + '.stop', 0);
  const [day, setDay] = useSessionState(k + '.day', stopDays[0][0]);
  const [note, setNote] = useSavedState('note.text', '');
  const [example, setExample] = useSessionState('noteFilled.text', t.example_entry);
  const [entry, setEntry] = filled ? [example, setExample] : [note, setNote];
  const picks = filled ? myPlaces.slice(0, 1).map((p) => p.place) : [];

  const [first, last] = stopDays[stop];

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 6px 20px')}>
        <div style={sx('font-size: 26px; font-weight: 700')}>{t.title}</div>
        <button onClick={() => setDay(day >= last ? first : day + 1)} style={sx('height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid #111111; background: #FFFFFF; color: #111111; font-size: 14px; font-weight: 600; cursor: pointer')}>
          {weekdayDate(addDays(tripStart, day))} ▾
        </button>
      </div>

      <div className="hscroll" style={sx('display: flex; gap: 6px; padding: 6px 20px 12px; overflow-x: auto; flex: none')}>
        {routeStops.map((s, i) => {
          const on = i === stop;
          return (
            <button key={s.name} onClick={() => { setStop(i); setDay(tripDayIndex(s.arrive!)); }} aria-pressed={on}
              style={sx('flex: none; min-height: 40px; padding: 0 14px; border-radius: 999px; font-size: 14px; font-weight: 600; white-space: nowrap; cursor: pointer; ' + (on ? 'background: #111111; color: #FFFFFF; border: 1px solid #111111' : 'background: #FFFFFF; color: #111111; border: 1px solid #CFCFCF'))}>
              {s.name}
            </button>
          );
        })}
      </div>

      <div style={sx('flex: 1 1 auto; margin: 0 16px; border-radius: 22px; background-color: #F7F7F5; background-image: radial-gradient(#D6D6D2 1.2px, transparent 1.2px); background-size: 18px 18px; overflow-y: auto; padding: 18px 16px; display: flex; flex-direction: column; gap: 12px')}>
        <label htmlFor="jt" className="sr-only">{t.title}</label>
        <textarea id="jt" rows={5} value={entry} onChange={(e) => setEntry(e.target.value)} placeholder={fill(t.placeholder, { stop: routeStops[stop].name })}
          style={sx('width: 100%; flex: none; resize: none; border: none; outline: none; background: transparent; font-size: 17px; line-height: 1.6; color: #111111; padding: 0')} />
        {picks.map((p) => (
          <div key={p.name} style={sx('flex: none; padding: 14px; border-radius: 16px; background: #FFFFFF; border: 1.5px solid #111111; display: flex; flex-direction: column; gap: 6px')}>
            <div style={sx('display: flex; align-items: center; justify-content: space-between; gap: 8px')}>
              <span style={sx('font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #595959')}>{t.place_label}</span>
              <span style={sx('font-size: 11px; font-weight: 600; color: #111111; display: flex; align-items: center; gap: 4px')}><Check size={12} />{t.place_saved}</span>
            </div>
            <div style={sx('font-size: 17px; font-weight: 700')}>{p.name} <span style={sx("font-family: 'Noto Sans TC', sans-serif; font-weight: 500; color: #3D3D3D")}>{p.name_zh}</span></div>
            {p.why && <div style={sx('font-size: 14px; line-height: 1.5; color: #3D3D3D')}>“{p.why}”</div>}
          </div>
        ))}
      </div>

      <div style={sx('padding: 12px 16px 28px; display: flex; flex-direction: column; gap: 8px')}>
        {filled
          ? <Link to="/saved" style={sx('min-height: 32px; font-size: 13px; font-weight: 600; color: #111111; display: flex; align-items: center; justify-content: center; gap: 4px')}>{t.see_saved_link}<ChevronRight /></Link>
          : <div style={sx('font-size: 12px; color: #595959; text-align: center')}>{t.private_note}</div>}
        <div style={sx('display: flex; gap: 8px')}>
          <Link to="/keep" style={sx('flex: 1 1 auto; height: 52px; border-radius: 14px; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center')}>
            {picks.length ? t.keep_another_button : t.keep_button}
          </Link>
        </div>
      </div>

      <TabBar active="note" />
    </div>
  );
}
