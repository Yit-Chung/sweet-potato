import { Link } from 'react-router-dom';
import { text } from '../content';
import { sx } from '../lib/sx';
import { BubbleIcon, CalendarIcon, NoteIcon, PinIcon } from './icons';

type Tab = 'explore' | 'trip' | 'phrases' | 'note';

const item = 'min-height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; text-decoration: none; ';
const on = sx(item + 'color: #111111; font-weight: 700');
const off = sx(item + 'color: #555555');

/** Bottom tabs. `exploreTo` lets the after-trip Explore keep its own Explore tab. */
export function TabBar({ active, exploreTo = '/explore' }: { active: Tab; exploreTo?: string }) {
  const tabs: { id: Tab; to: string; label: string; icon: JSX.Element }[] = [
    { id: 'explore', to: exploreTo, label: text.tabs.explore, icon: <PinIcon /> },
    { id: 'trip', to: '/trip', label: text.tabs.trip, icon: <CalendarIcon /> },
    { id: 'phrases', to: '/phrases', label: text.tabs.phrases, icon: <BubbleIcon /> },
    { id: 'note', to: '/note', label: text.tabs.note, icon: <NoteIcon /> },
  ];
  return (
    <nav style={sx("flex: none; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 8px 8px 26px; background: #FFFFFF; border-top: 1px solid #E5E5E5; font-family: Inter, 'Noto Sans TC', system-ui, sans-serif")}>
      {tabs.map((t) => (
        <Link key={t.id} to={t.to} style={t.id === active ? on : off} aria-current={t.id === active ? 'page' : undefined}>
          {t.icon}{t.label}
        </Link>
      ))}
    </nav>
  );
}
