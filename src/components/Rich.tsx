import { Fragment } from 'react';

/** Shows wording from text.yaml, making **starred** words bold. */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>))}</>;
}
