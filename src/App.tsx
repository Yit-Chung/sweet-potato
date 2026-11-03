import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SessionProvider } from './lib/session';
import { Welcome } from './screens/Welcome';
import { Explore } from './screens/Explore';
import { Profile } from './screens/Profile';
import { ReadPick } from './screens/ReadPick';
import { Checklist } from './screens/Checklist';
import { Phrases } from './screens/Phrases';
import { Note } from './screens/Note';
import { KeepPlace } from './screens/KeepPlace';
import { SavedPlaces } from './screens/SavedPlaces';
import { MyPlaces } from './screens/MyPlaces';
import { ScreenIndex } from './screens/ScreenIndex';

// The app shell: one phone-width column, and which screen each web address shows.
// Screen numbers match the "Screens and navigation" table in the original brief.
export function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <div className="app">
          <AppRoutes />
        </div>
      </HashRouter>
    </SessionProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/explore/:city" element={<Explore />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/pick/:id" element={<ReadPick />} />
      <Route path="/trip" element={<Checklist />} />
      <Route path="/phrases" element={<Phrases />} />
      <Route path="/note" element={<Note />} />
      <Route path="/keep" element={<KeepPlace />} />
      <Route path="/note/filled" element={<Note filled />} />
      <Route path="/saved" element={<SavedPlaces />} />
      <Route path="/after-trip" element={<Explore afterTrip />} />
      <Route path="/after-trip/:city" element={<Explore afterTrip />} />
      <Route path="/share" element={<MyPlaces />} />
      <Route path="/screens" element={<ScreenIndex />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
