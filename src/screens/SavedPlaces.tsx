// Screen 8b · Your saved places: a private grid of your own places (my-place in
// content/places.yaml), and one place in full with Delete and Edit. Back → Note filled (8).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { countPlaces, fill, myPlaces, placeChip, placeKey, text } from '../content';
import { useSavedState } from '../lib/session';
import { sx } from '../lib/sx';
import { Check, ChevronLeft } from '../components/icons';
import { Photo } from '../components/Photo';

const t = text.saved;
const sectionLabel = sx('font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #595959');
const para = sx('margin: 0; font-size: 16px; line-height: 1.55');
const chip = sx('padding: 6px 10px; border-radius: 999px; border: 1px solid #CFCFCF; font-size: 12px; font-weight: 500');
const backStyle = sx('width: 44px; height: 44px; border: none; background: transparent; border-radius: 999px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #111111; text-decoration: none');

export function SavedPlaces() {
  // Deleted places are remembered on the phone; new places added to places.yaml still show up.
  const [deleted, setDeleted] = useSavedState<string[]>('places.deleted', []);
  const [view, setView] = useState<'grid' | 'place'>('grid');
  const [open, setOpen] = useState(myPlaces[0].id);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const list = myPlaces.filter((p) => !deleted.includes(placeKey(p.place)));
  const p = myPlaces.find((x) => x.id === open)!.place;
  const by = p.recommended_by ?? '';
  const isGrid = view === 'grid';
  const sections = [[t.why_label, p.why], [t.what_label, p.what], [t.when_label, p.when]].filter(([, body]) => body);

  return (
    <div className="screen" style={{ background: isGrid ? '#F2F2F2' : '#FFFFFF' }}>
      <div style={sx('display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 4px 8px; min-height: 44px; flex: none')}>
        {isGrid
          ? <Link to="/note/filled" aria-label="Back to Note" style={backStyle}><ChevronLeft /></Link>
          : <button onClick={() => { setView('grid'); setConfirm(false); }} aria-label="Back to your places" style={backStyle}><ChevronLeft /></button>}
      </div>

      {isGrid && (
        <div style={sx('flex: 1 1 auto; overflow-y: auto; min-height: 0; padding: 8px 20px 28px; display: flex; flex-direction: column; gap: 16px')}>
          <div style={sx('display: flex; flex-direction: column; gap: 4px')}>
            <h1 style={sx('margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700')}>{t.title}</h1>
            <p style={sx('margin: 0; font-size: 14px; color: #595959')}>{fill(t.count, { count: countPlaces(list.length) })}</p>
          </div>
          <div style={sx('display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px')}>
            <Link to="/keep" style={sx('min-height: 220px; border-radius: 18px; border: 1.5px dashed #8A8A8A; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-decoration: none; color: #111111')}>
              <span style={sx('width: 44px; height: 44px; border-radius: 50%; background: #111111; display: flex; align-items: center; justify-content: center')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span style={sx('font-size: 14px; font-weight: 600')}>{t.add_button}</span>
            </Link>
            {list.map(({ place: d, id }) => (
              <button key={id} onClick={() => { setOpen(id); setView('place'); setConfirm(false); }} style={sx('min-height: 220px; display: flex; flex-direction: column; text-align: left; background: #FFFFFF; border: none; padding: 0; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.08); cursor: pointer; color: #111111')}>
                <Photo file={d.photo} alt={d.name} style={sx('height: 100px; width: 100%; background: #DDDDDD; box-sizing: border-box')} />
                <div style={sx('padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 3px')}>
                  <span style={sx('font-size: 15px; font-weight: 700; line-height: 1.3')}>{d.name}</span>
                  <span style={sx('font-size: 12px; color: #595959')}>{d.stop} · {d.category}</span>
                  {d.why && <span style={sx('font-size: 13px; line-height: 1.4; color: #3D3D3D; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 4px')}>{d.why}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isGrid && <>
        <div style={sx('flex: 1 1 auto; overflow-y: auto; min-height: 0; padding: 8px 24px 24px')}>
          <div style={sx('display: flex; align-items: center; gap: 12px')}>
            <div style={sx('width: 52px; height: 52px; border-radius: 50%; background: #111111; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; flex: none')}>{by[0]?.toUpperCase()}</div>
            <div style={sx('display: flex; flex-direction: column; gap: 2px')}>
              <div style={sx('font-size: 17px; font-weight: 600')}>{fill(text.pick.recommends, { by })}</div>
              {p.about_recommender && <div style={sx('font-size: 13px; color: #595959')}>{p.about_recommender}</div>}
            </div>
          </div>
          <h1 style={sx('margin: 24px 0 2px; font-size: 32px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em')}>{p.name}</h1>
          {p.name_zh && <div style={sx('font-size: 18px; color: #3D3D3D')}>{p.name_zh}</div>}
          <div style={sx('display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px')}>
            <span style={chip}>{placeChip(p)}</span>
            <span style={chip}>{p.category}</span>
          </div>
          <div style={sx('margin: 22px 0 0; padding: 10px 10px 14px; background: #FFFFFF; border: 1px solid #E3E3E3; box-shadow: 0 6px 18px rgba(0,0,0,0.08); transform: rotate(-1.2deg)')}>
            <Photo file={p.photo} alt={p.name} style={sx('width: 100%; height: 220px; background: #D9D9D9; display: flex; align-items: center; justify-content: center; color: #4A4A4A; font-size: 13px')}>{fill(text.pick.photo_placeholder, { by })}</Photo>
            <div style={sx('margin-top: 10px; font-size: 12px; color: #595959')}>{fill(text.pick.photo_credit, { by })}</div>
          </div>
          <div style={sx('display: flex; flex-direction: column; gap: 22px; margin-top: 30px')}>
            {sections.map(([label, body]) => (
              <div key={label} style={sx('display: flex; flex-direction: column; gap: 6px')}><div style={sectionLabel}>{label}</div><p style={para}>{body}</p></div>
            ))}
          </div>
        </div>
        <div style={sx('padding: 10px 16px 28px; border-top: 1px solid #E3E3E3; background: #FFFFFF; display: flex; flex-direction: column; gap: 8px; flex: none')}>
          <p style={sx('margin: 0; font-size: 12px; color: #595959; text-align: center')}>{t.preview_note}</p>
          <div style={sx('display: flex; gap: 8px')}>
            <button onClick={() => setConfirm(true)} style={sx('height: 48px; padding: 0 18px; border-radius: 12px; border: 1px solid #CFCFCF; background: #FFFFFF; color: #B42318; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; cursor: pointer')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
              {t.delete_button}
            </button>
            <Link to="/keep" style={sx('flex: 1 1 auto; height: 48px; border-radius: 12px; background: #111111; color: #FFFFFF; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 14px; font-weight: 600; text-decoration: none')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
              {t.edit_button}
            </Link>
          </div>
        </div>
      </>}

      {confirm && (
        <div style={sx('position: absolute; inset: 0; z-index: 10; background: rgba(17,17,17,0.45); display: flex; flex-direction: column; justify-content: flex-end')} onClick={(e) => { if (e.target === e.currentTarget) setConfirm(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delTitle" style={sx('background: #FFFFFF; border-radius: 24px 24px 0 0; padding: 24px 20px 28px; display: flex; flex-direction: column; gap: 10px')}>
            <h2 id="delTitle" style={sx('margin: 0; font-size: 20px; font-weight: 700')}>{t.delete_title}</h2>
            <p style={sx('margin: 0 0 8px; font-size: 15px; line-height: 1.5; color: #3D3D3D')}>{t.delete_text}</p>
            <button onClick={() => { setDeleted([...deleted, placeKey(p)]); setView('grid'); setConfirm(false); setToast(true); }} style={sx('height: 52px; border-radius: 14px; border: none; background: #B42318; color: #FFFFFF; font-size: 15px; font-weight: 600; cursor: pointer')}>{t.delete_button}</button>
            <button onClick={() => setConfirm(false)} style={sx('height: 44px; border-radius: 14px; border: none; background: transparent; color: #3D3D3D; font-size: 14px; font-weight: 600; cursor: pointer')}>{t.cancel_button}</button>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" style={sx('position: absolute; z-index: 20; left: 20px; right: 20px; bottom: 28px; background: #111111; color: #FFFFFF; border-radius: 14px; padding: 14px 16px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px')}>
          <Check size={16} />{t.deleted_toast}
        </div>
      )}
    </div>
  );
}
