// Screen 2 · Explore: cities as cards or map pins, then a city's friend picks.
// With `afterTrip` it's screen 8c: the "share your places" banner replaces the news banner.
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fill, mapStops, picksForStop, stopId, text, tripVars } from '../content';
import { useSessionState } from '../lib/session';
import { sx } from '../lib/sx';
import { TabBar } from '../components/TabBar';
import { Rich } from '../components/Rich';
import { ChevronLeft, Close } from '../components/icons';

const t = text.explore;
const toggleOn = sx('min-height: 36px; padding: 0 16px; border-radius: 999px; background: #111111; color: #FFFFFF; font-size: 14px; font-weight: 700');
const toggleOff = sx('min-height: 36px; padding: 0 16px; border-radius: 999px; background: transparent; color: #111111; font-size: 14px');
const bricolage = "'Bricolage Grotesque', 'Noto Sans TC', sans-serif";

export function Explore({ afterTrip = false }: { afterTrip?: boolean }) {
  const base = afterTrip ? '/after-trip' : '/explore';
  const navigate = useNavigate();
  const { city: cityId } = useParams();
  const city = mapStops.find((c) => stopId(c) === cityId);
  const [view, setView] = useSessionState<'cards' | 'map'>('explore.view', 'cards');
  const [news, setNews] = useSessionState(afterTrip ? 'afterTrip.banner' : 'explore.news', true);

  const top = news ? '16px' : '52px';
  const isMap = view === 'map';
  const open = (id: string) => navigate(`${base}/${id}`);

  return (
    <div className="screen screen-explore">
      {news && (afterTrip ? (
        <div role="status" style={sx('flex: none; background: #111111; color: #FFFFFF; padding: 50px 8px 14px 20px; display: flex; gap: 8px; align-items: flex-start')}>
          <div style={sx('flex: 1; display: flex; flex-direction: column; gap: 3px')}>
            <span style={sx('font-size: 11px; font-weight: 700; letter-spacing: 0.6px; color: #BBBBBB')}>{t.after_trip_label}</span>
            <span style={sx('font-size: 15px; font-weight: 700')}>{t.after_trip_title}</span>
            <span style={sx('font-size: 12px; color: #CCCCCC; line-height: 1.4')}>{fill(t.after_trip_text, tripVars)}</span>
            <Link to="/share" style={sx('align-self: flex-start; margin-top: 8px; min-height: 44px; padding: 0 16px; border-radius: 999px; background: #FFFFFF; color: #111111; font-size: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center')}>{t.after_trip_button}</Link>
          </div>
          <DismissButton label="Dismiss" onClick={() => setNews(false)} />
        </div>
      ) : (
        <div role="status" style={sx('flex: none; background: #111111; color: #FFFFFF; padding: 50px 8px 12px 20px; display: flex; gap: 8px; align-items: flex-start')}>
          <div style={sx('flex: 1; display: flex; flex-direction: column; gap: 3px')}>
            <span style={sx('font-size: 11px; font-weight: 700; letter-spacing: 0.6px; color: #BBBBBB')}>{t.news_label}</span>
            <span style={sx('font-size: 15px; font-weight: 700')}>{t.news_title}</span>
            <span style={sx('font-size: 12px; color: #CCCCCC; line-height: 1.4')}>{t.news_text}</span>
          </div>
          <DismissButton label="Dismiss news" onClick={() => setNews(false)} />
        </div>
      ))}

      {!city && <>
        <header style={sx(`padding: ${top} 20px 12px; display: flex; flex-direction: column; gap: 14px`)}>
          <div>
            <p style={sx('margin: 0; font-size: 13px; color: #555555')}>{fill(t.picked_by, tripVars)}</p>
            <h1 style={{ ...sx('margin: 2px 0 0; font-size: 34px; font-weight: 800; letter-spacing: -0.5px'), fontFamily: bricolage }}>{t.title}</h1>
          </div>
          <div style={sx('display: flex; align-items: center; gap: 10px')}>
            <span style={sx('font-size: 13px; color: #555555')}>{t.view_label}</span>
            <div style={sx('display: flex; background: #E5E5E5; border-radius: 999px; padding: 4px; gap: 4px')}>
              <button style={isMap ? toggleOn : toggleOff} onClick={() => setView('map')} aria-pressed={isMap}>{t.map_button}</button>
              <button style={isMap ? toggleOff : toggleOn} onClick={() => setView('cards')} aria-pressed={!isMap}>{t.cards_button}</button>
            </div>
          </div>
        </header>

        <div style={sx('flex: 1; overflow-y: auto; padding: 4px 20px 20px')}>
          {!isMap ? (
            <div style={sx('display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px')}>
              {mapStops.map((c) => (
                <button key={c.name} onClick={() => open(stopId(c))} style={sx('display: flex; flex-direction: column; text-align: left; background: #FFFFFF; border-radius: 18px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.08)')}>
                  <div style={sx('height: 110px; align-self: stretch; background: #DDDDDD; display: flex; align-items: flex-end; padding: 8px')}>
                    <span style={sx('font-size: 11px; color: #333333; background: rgba(255,255,255,0.7); padding: 3px 8px; border-radius: 999px')}>{fill(t.photo_placeholder, { city: c.name })}</span>
                  </div>
                  <div style={sx('padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 2px')}>
                    <span style={{ ...sx('font-weight: 700; font-size: 18px'), fontFamily: "'Bricolage Grotesque', sans-serif" }}>{c.name}</span>
                    <span style={sx('font-size: 12px; color: #555555')}>{fill(t.city_card_line, { city_zh: c.name_zh, count: picksForStop(c.name).length })}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={sx('position: relative; width: 100%; aspect-ratio: 350 / 540; background: #E6E6E6; border-radius: 22px; overflow: hidden')}>
              <svg viewBox="0 0 350 540" aria-hidden="true" style={sx('position: absolute; inset: 0; width: 100%; height: 100%')}>
                <path d="M232 28 C262 30 284 48 280 78 C276 120 270 170 262 220 C254 280 236 340 210 400 C190 446 168 486 150 510 C140 520 128 512 126 498 C118 460 96 420 80 380 C66 344 62 300 74 258 C88 208 116 160 148 118 C176 82 200 30 232 28 Z" fill="#FAFAFA" stroke="#BBBBBB" strokeWidth="2" />
              </svg>
              {mapStops.map((c) => (
                <button key={c.name} onClick={() => open(stopId(c))} aria-label={`Open ${c.name}`}
                  style={{ ...sx('position: absolute; display: flex; align-items: center; gap: 6px; min-height: 44px'), left: `${(c.map_x! / 350) * 100}%`, top: `${(c.map_y! / 540) * 100}%` }}>
                  <span style={sx('width: 14px; height: 14px; border-radius: 999px; background: #111111; border: 3px solid #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.25)')} />
                  <span style={sx('font-size: 13px; font-weight: 700; background: #FFFFFF; padding: 4px 9px; border-radius: 999px; box-shadow: 0 1px 2px rgba(0,0,0,0.12)')}>{c.name} <span style={sx('font-weight: 400; color: #555555')}>{picksForStop(c.name).length}</span></span>
                </button>
              ))}
              <p style={sx('position: absolute; left: 14px; bottom: 12px; margin: 0; font-size: 11px; color: #444444')}>{t.map_note}</p>
            </div>
          )}
        </div>
      </>}

      {city && (
        <div style={sx('flex: 1; overflow-y: auto; display: flex; flex-direction: column')}>
          <div style={sx(`flex: none; height: 220px; background: #DDDDDD; padding: ${top} 16px 16px; display: flex; flex-direction: column; box-sizing: border-box`)}>
            <button onClick={() => navigate(base)} aria-label="Back to all cities" style={sx('width: 44px; height: 44px; border-radius: 999px; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; color: #111111')}>
              <ChevronLeft size={20} />
            </button>
            <span style={sx('align-self: center; margin-top: 50px; font-size: 12px; color: #333333; background: rgba(255,255,255,0.7); padding: 4px 10px; border-radius: 999px')}>{fill(t.photo_placeholder, { city: city.name })}</span>
          </div>
          <div style={sx('padding: 18px 20px 8px')}>
            <h2 style={{ ...sx('margin: 0; font-size: 30px; font-weight: 800'), fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              {city.name} <span style={sx("font-family: 'Noto Sans TC', sans-serif; font-size: 18px; font-weight: 500; color: #555555")}>{city.name_zh}</span>
            </h2>
            <p style={sx('margin: 4px 0 0; font-size: 13px; color: #555555')}>{fill(t.city_subtitle, { count: picksForStop(city.name).length })}</p>
          </div>
          <div style={sx('padding: 8px 20px 20px; display: flex; flex-direction: column; gap: 10px')}>
            {picksForStop(city.name).map(({ place: p, id }) => (
              <Link key={id} to={`/pick/${id}`} style={sx('background: #FFFFFF; border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: #111111')}>
                <div style={sx('display: flex; justify-content: space-between; align-items: baseline; gap: 8px')}>
                  <span style={sx('font-weight: 700; font-size: 16px')}>{p.name}</span>
                  <span style={sx('font-size: 11px; color: #111111; background: #E8E8E8; padding: 3px 8px; border-radius: 999px; white-space: nowrap')}>{p.category}</span>
                </div>
                {p.name_zh && <span style={sx('font-size: 13px; color: #555555')}>{p.name_zh}</span>}
                <span style={sx('font-size: 12px; color: #111111')}><Rich text={fill(t.recommended_by, { by: [p.recommended_by, p.about_recommender].filter(Boolean).join(' · ') })} /></span>
              </Link>
            ))}
            <Link to="/profile" style={sx('display: flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 14px; border: 1.5px dashed #111111; text-decoration: none; font-weight: 700; font-size: 14px')}>{fill(t.add_recommendation, { city: city.name })}</Link>
          </div>
        </div>
      )}

      <TabBar active="explore" exploreTo={base} />
    </div>
  );
}

function DismissButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} style={sx('width: 44px; height: 44px; flex: none; display: flex; align-items: center; justify-content: center; color: #FFFFFF')}>
      <Close size={16} />
    </button>
  );
}
