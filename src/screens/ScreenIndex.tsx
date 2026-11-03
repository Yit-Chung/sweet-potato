// Screen index (/#/screens): a list of every screen, for jumping around in demos.
// Nothing in the app links here.
import { Link } from 'react-router-dom';
import { places } from '../content';
import { sx } from '../lib/sx';
import { ChevronRight } from '../components/icons';

const firstPick = places.findIndex((p) => p.type === 'friend-pick');

const screens = [
  ['1', 'Welcome + install', '/'],
  ['2', 'Explore', '/explore'],
  ['2b', 'Who’s recommending (first time)', '/profile'],
  ['3', 'Read a pick', `/pick/${firstPick}`],
  ['4', 'Trip tab: checklist', '/trip'],
  ['5', 'Phrases tab', '/phrases'],
  ['6', 'Note tab', '/note'],
  ['7', 'A place you loved', '/keep'],
  ['8', 'Note, filled', '/note/filled'],
  ['8b', 'Your saved places', '/saved'],
  ['8c', 'After the trip: Explore banner', '/after-trip'],
  ['9', 'After the trip: share your places', '/share'],
];

export function ScreenIndex() {
  return (
    <div className="screen">
      <div style={sx('flex: 1 1 auto; overflow-y: auto; padding: 28px 20px 28px; display: flex; flex-direction: column; gap: 16px')}>
        <div style={sx('display: flex; flex-direction: column; gap: 4px')}>
          <h1 style={sx('margin: 0; font-size: 28px; line-height: 1.15; font-weight: 700')}>Screens</h1>
          <p style={sx('margin: 0; font-size: 14px; color: #595959')}>Tap to jump to any screen</p>
        </div>
        <ol style={sx('margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column')}>
          {screens.map(([num, name, to]) => (
            <li key={num}>
              <Link to={to} style={sx('display: flex; align-items: center; gap: 14px; min-height: 56px; border-bottom: 1px solid #E6E6E3; text-decoration: none; color: #111111')}>
                <span style={sx('width: 32px; height: 32px; border-radius: 50%; background: #F4F4F2; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none')}>{num}</span>
                <span style={sx('flex: 1 1 auto; font-size: 15px; font-weight: 600')}>{name}</span>
                <span style={sx('font-size: 12px; color: #595959')}>{to}</span>
                <ChevronRight />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
