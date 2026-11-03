// Screen 1 · Welcome + install. Five steps in one screen: welcome → "Is this your trip?" →
// add to home screen → open it → saving the trip. Ends with "Go to my trip" → Explore.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { countPlaces, dateRange, fill, friendPickCount, picksForStop, routeStops, text, toDate, trip, tripVars } from '../content';
import { sx } from '../lib/sx';
import { Check, ChevronLeft } from '../components/icons';
import { Rich } from '../components/Rich';

const t = text.welcome;

const body = sx('flex: 1 1 auto; display: flex; flex-direction: column; padding: 8px 20px 0; gap: 18px; min-height: 0');
const h1 = sx('margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700');
const lead = sx('margin: 0; font-size: 15px; line-height: 1.5; color: #3D3D3D');
const primary = sx('height: 52px; border-radius: 14px; border: none; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; cursor: pointer');
const featureIcon = sx('width: 36px; height: 36px; border-radius: 10px; background: #F4F4F2; display: flex; align-items: center; justify-content: center; flex: none');
const installRow = sx('display: flex; gap: 14px; align-items: center; padding: 14px 16px; border-radius: 16px; background: #F4F4F2');
const installNum = sx('width: 28px; height: 28px; border-radius: 50%; background: #111111; color: #FFFFFF; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none');
const iconProps = { fill: 'none', stroke: '#111111', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
const avatarColors = ['background: #FFFFFF; color: #111111', 'background: #595959; color: #FFFFFF', 'background: #8A8A8A; color: #FFFFFF'];

export function Welcome() {
  // Steps: 1 welcome · 2 is this your trip · 3 install · 4 open from home screen · 5 saving
  const [step, setStep] = useState(1);
  const [prog, setProg] = useState(0);
  const [mode, setMode] = useState<'app' | 'browser'>('app');

  useEffect(() => {
    if (step !== 5 || prog >= 4) return;
    const timer = setTimeout(() => setProg((p) => p + 1), 650);
    return () => clearTimeout(timer);
  }, [step, prog]);

  const startSave = (m: 'app' | 'browser') => { setMode(m); setProg(0); setStep(5); };

  const saved = step === 5 && prog >= 4;
  const dot = step <= 3 ? step : step - 1;
  const inApp = mode === 'app';
  const hasBack = step > 1 && step < 5;
  const saveLabels = [
    fill(t.saving_item_maps, tripVars),
    fill(t.saving_item_places, { places: friendPickCount }),
    t.saving_item_saved,
    t.saving_item_phrases,
  ];

  return (
    <div className="screen">
      <div style={sx('display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 0; min-height: 44px')}>
        {hasBack ? (
          <button onClick={() => setStep(Math.max(1, step - 1))} aria-label="Back" style={sx('width: 44px; height: 44px; border: none; background: transparent; border-radius: 999px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #111111')}>
            <ChevronLeft />
          </button>
        ) : <div style={sx('width: 44px; height: 44px')} />}
        <div style={sx('display: flex; gap: 6px')} aria-label={`Step ${dot} of 4`} role="img">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={sx('height: 6px; border-radius: 999px; ' + (n === dot ? 'width: 20px; background: #111111' : 'width: 6px; background: ' + (n < dot ? '#595959' : '#CFCFCF')))} />
          ))}
        </div>
        <div style={sx('width: 44px; height: 44px')} />
      </div>

      {step === 1 && <>
        <div style={body}>
          <div style={sx('padding: 24px 22px; border-radius: 24px; background: #111111; color: #FFFFFF; display: flex; flex-direction: column; gap: 12px')}>
            <div style={sx('display: flex; align-items: center')}>
              {trip.friends.map((f, i) => (
                <div key={f} style={sx('width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 19px; font-weight: 700; border: 3px solid #111111; ' + avatarColors[i % avatarColors.length] + (i ? '; margin-left: -12px' : ''))}>
                  {f[0].toUpperCase()}
                </div>
              ))}
            </div>
            <div style={sx('font-size: 28px; font-weight: 700; line-height: 1.15')}>{fill(t.hero_title, tripVars)}</div>
            <div style={sx('font-size: 15px; line-height: 1.5; color: #E6E6E6')}>{fill(t.hero_text, tripVars)}</div>
          </div>
          <div style={sx('display: flex; flex-direction: column; gap: 14px; padding: 4px 2px')}>
            <Feature title={t.feature_1_title} sub={t.feature_1_text}>
              <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.8" {...iconProps}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
            </Feature>
            <Feature title={t.feature_2_title} sub={t.feature_2_text}>
              <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.8" {...iconProps}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
            </Feature>
            <Feature title={t.feature_3_title} sub={t.feature_3_text}>
              <svg width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.8" {...iconProps}><path d="M2 8.5a15 15 0 0 1 20 0" /><path d="M5.5 12a10 10 0 0 1 13 0" /><path d="M9 15.5a5 5 0 0 1 6 0" /><path d="M3 3l18 18" /></svg>
            </Feature>
          </div>
        </div>
        <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column; gap: 10px')}>
          <div style={sx('font-size: 12px; color: #595959; text-align: center')}>{t.private_link_note}</div>
          <button onClick={() => setStep(2)} style={primary}>{t.start_button}</button>
        </div>
      </>}

      {step === 2 && <>
        <div style={sx('flex: 1 1 auto; display: flex; flex-direction: column; padding: 8px 20px 0; gap: 16px; min-height: 0')}>
          <div style={sx('display: flex; flex-direction: column; gap: 8px')}>
            <h1 style={h1}>{t.trip_title}</h1>
            <p style={lead}>{fill(t.trip_summary, tripVars)}</p>
          </div>
          <ol style={sx('margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; overflow-y: auto; min-height: 0')}>
            {routeStops.map((s, i) => (
              <li key={s.name} style={sx('display: flex; gap: 14px; align-items: stretch')}>
                <div style={sx('display: flex; flex-direction: column; align-items: center; width: 14px; flex: none')}>
                  <div style={sx('width: 12px; height: 12px; border-radius: 50%; background: #111111; margin-top: 18px; flex: none')} />
                  <div style={sx('width: 2px; flex: 1 1 auto; background: ' + (i < routeStops.length - 1 ? '#CFCFCF' : 'transparent'))} />
                </div>
                <div style={sx('flex: 1 1 auto; display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid #E6E6E3')}>
                  <div style={sx('display: flex; flex-direction: column; gap: 2px')}>
                    <span style={sx('font-size: 16px; font-weight: 600')}>{s.long_name ?? s.name} <span style={sx('font-weight: 500; color: #595959')}>{s.name_zh}</span></span>
                    <span style={sx('font-size: 13px; color: #595959')}>{dateRange(toDate(s.arrive!), toDate(s.leave!))}</span>
                  </div>
                  <span style={sx('font-size: 13px; color: #3D3D3D; white-space: nowrap')}>{countPlaces(picksForStop(s.name).length)}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column; gap: 10px')}>
          <div style={sx('font-size: 12px; color: #595959; text-align: center')}>{t.trip_wrong_note}</div>
          <button onClick={() => setStep(3)} style={primary}>{t.trip_confirm_button}</button>
        </div>
      </>}

      {step === 3 && <>
        <div style={body}>
          <div style={sx('display: flex; flex-direction: column; gap: 8px')}>
            <h1 style={h1}>{t.install_title}</h1>
            <p style={lead}>{t.install_text}</p>
          </div>
          <ol style={sx('margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 10px')}>
            <li style={installRow}>
              <span style={installNum}>1</span>
              <span style={sx('font-size: 15px; line-height: 1.4; flex: 1 1 auto')}><Rich text={t.install_step_1} /></span>
              <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.8" {...iconProps}><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M6 11H5v10h14V11h-1" /></svg>
            </li>
            <li style={installRow}>
              <span style={installNum}>2</span>
              <span style={sx('font-size: 15px; line-height: 1.4; flex: 1 1 auto')}><Rich text={t.install_step_2} /></span>
              <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.8" {...iconProps}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></svg>
            </li>
            <li style={installRow}>
              <span style={installNum}>3</span>
              <span style={sx('font-size: 15px; line-height: 1.4; flex: 1 1 auto')}><Rich text={t.install_step_3} /></span>
            </li>
          </ol>
        </div>
        <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column; gap: 6px')}>
          <button onClick={() => setStep(4)} style={primary}>{t.install_done_button}</button>
          <button onClick={() => startSave('browser')} style={sx('height: 44px; border-radius: 14px; border: none; background: transparent; color: #3D3D3D; font-size: 14px; font-weight: 600; cursor: pointer')}>{t.install_later_button}</button>
        </div>
      </>}

      {step === 4 && <>
        <div style={sx('flex: 1 1 auto; display: flex; flex-direction: column; padding: 8px 20px 0; gap: 22px; min-height: 0')}>
          <div style={sx('display: flex; flex-direction: column; gap: 8px')}>
            <h1 style={h1}>{t.open_title}</h1>
            <p style={lead}>{t.open_text}</p>
          </div>
          <div style={sx('padding: 24px 16px; border-radius: 24px; background: #F4F4F2; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px 8px; justify-items: center')}>
            {[0, 1, 2, 3, 4].map((i) => <AppPlaceholder key={i} />)}
            <button onClick={() => startSave('app')} aria-label={`Open ${text.common.app_name}`} style={sx('border: none; background: transparent; padding: 0; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px')}>
              <span style={sx('width: 56px; height: 56px; border-radius: 14px; background: #111111; color: #FFFFFF; font-size: 17px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 3px #F4F4F2, 0 0 0 5px #111111')}>{text.common.app_initials}</span>
              <span style={sx('font-size: 11px; font-weight: 600; color: #111111; white-space: nowrap')}>{text.common.app_name}</span>
            </button>
            {[5, 6].map((i) => <AppPlaceholder key={i} />)}
          </div>
        </div>
        <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column; gap: 6px')}>
          <p style={sx('margin: 0; font-size: 13px; line-height: 1.5; color: #595959; text-align: center')}>{t.open_note}</p>
        </div>
      </>}

      {step === 5 && <>
        <div style={sx('flex: 1 1 auto; display: flex; flex-direction: column; padding: 8px 20px 0; gap: 20px; min-height: 0')}>
          <div style={sx('display: flex; flex-direction: column; gap: 8px')}>
            <h1 style={h1}>{saved ? t.saved_title : t.saving_title}</h1>
            <p style={lead}>{inApp ? t.saving_text_app : t.saving_text_browser}</p>
          </div>
          <div style={sx('height: 8px; border-radius: 999px; background: #E6E6E3; overflow: hidden')} role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={prog} aria-label={t.saving_title}>
            <div style={{ ...sx('height: 100%; border-radius: 999px; background: #111111; transition: width 0.4s ease'), width: prog * 25 + '%' }} />
          </div>
          <ul style={sx('margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px')}>
            {saveLabels.map((label, i) => {
              const done = prog > i;
              return (
                <li key={i} style={sx('display: flex; gap: 12px; align-items: center; padding: 10px 0')}>
                  <div style={sx('width: 24px; height: 24px; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; box-sizing: border-box; color: #FFFFFF; ' + (done ? 'background: #111111' : 'border: 2px solid #CFCFCF'))}>
                    {done && <Check width={3} />}
                  </div>
                  <span style={sx('font-size: 15px; ' + (done ? 'color: #111111; font-weight: 500' : 'color: #595959'))}>{label}</span>
                </li>
              );
            })}
          </ul>
          {saved && (
            <div style={sx('display: flex; flex-direction: column; gap: 10px; padding: 16px; border-radius: 16px; background: #F4F4F2')}>
              <div style={sx('display: flex; align-self: flex-start; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: 999px; background: #111111; color: #FFFFFF; font-size: 13px; font-weight: 600')}>
                <Check />{inApp ? t.saved_badge_app : t.saved_badge_browser}
              </div>
              <p style={sx('margin: 0; font-size: 14px; line-height: 1.5; color: #3D3D3D')}>{fill(inApp ? t.saved_note_app : t.saved_note_browser, tripVars)}</p>
            </div>
          )}
        </div>
        <div style={sx('padding: 12px 20px 28px; display: flex; flex-direction: column')}>
          {saved
            ? <Link to="/explore" style={sx('height: 52px; border-radius: 14px; background: #111111; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center')}>{t.go_button}</Link>
            : <div style={sx('height: 52px; border-radius: 14px; background: #DADADA; color: #3D3D3D; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center')}>{t.saving_button}</div>}
        </div>
      </>}
    </div>
  );
}

function Feature({ title, sub, children }: { title: string; sub: string; children: JSX.Element }) {
  return (
    <div style={sx('display: flex; gap: 14px; align-items: flex-start')}>
      <div style={featureIcon}>{children}</div>
      <div style={sx('display: flex; flex-direction: column; gap: 2px')}>
        <span style={sx('font-size: 15px; font-weight: 600')}>{title}</span>
        <span style={sx('font-size: 14px; line-height: 1.45; color: #595959')}>{sub}</span>
      </div>
    </div>
  );
}

function AppPlaceholder() {
  return (
    <div aria-hidden="true" style={sx('display: flex; flex-direction: column; align-items: center; gap: 7px')}>
      <div style={sx('width: 56px; height: 56px; border-radius: 14px; background: #DADADA')} />
      <div style={sx('width: 36px; height: 6px; border-radius: 3px; background: #DADADA')} />
    </div>
  );
}
