import { useState, type CSSProperties, type ReactNode } from 'react';
import { photoUrl } from '../content';

/** A place's photo from content/photos, or the grey wireframe placeholder when there's none (or it fails to load). */
export function Photo({ file, alt, style, children }: { file?: string; alt: string; style: CSSProperties; children?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (file && !failed) {
    return <img src={photoUrl(file)} alt={alt} onError={() => setFailed(true)} style={{ ...style, objectFit: 'cover', display: 'block', padding: 0 }} />;
  }
  return <div style={style}>{children}</div>;
}
