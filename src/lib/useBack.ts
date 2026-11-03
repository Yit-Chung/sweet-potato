import { useLocation, useNavigate } from 'react-router-dom';

/** Go back in history (so Explore keeps its open city); fall back to a route when opened directly. */
export function useBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();
  return () => (location.key === 'default' ? navigate(fallback) : navigate(-1));
}
