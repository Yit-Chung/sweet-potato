// Vite plugin that connects content/ to the app:
//  - checks the content files and turns each .yaml file into data the screens can import
//    (a mistake shows up as a clear error instead of a broken page);
//  - serves content/photos while developing, and on build publishes a phone-sized copy
//    of each photo a place uses (max 1200px wide, location data removed).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin } from 'vite';
import { contentFiles, type ContentKey } from '../src/content/schema.ts';
import { checkContent, formatProblems, photosDir, type CheckResult } from './content-rules.ts';

const MAX_WIDTH = 1200;
const types: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

export function contentPlugin(): Plugin {
  let root = process.cwd();
  let result: CheckResult | undefined;
  const check = () => {
    result = checkContent(root);
    if (result.errors.length) throw new Error(`\n${formatProblems(result)}\n`);
    return result.content!;
  };

  return {
    name: 'sweet-potato-content',
    configResolved(config) { root = config.root; },
    buildStart() {
      result = undefined;
      for (const { file } of Object.values(contentFiles)) this.addWatchFile(path.join(root, 'content', file));
    },
    load(id) {
      const file = path.basename(id);
      const key = (Object.keys(contentFiles) as ContentKey[]).find((k) => contentFiles[k].file === file);
      if (!key || !id.includes(`${path.sep}content${path.sep}`)) return null;
      const content = result?.content ?? check();
      return `export default ${JSON.stringify(content[key])};`;
    },
    handleHotUpdate({ file, server }) {
      // Any content edit re-checks everything and reloads the page.
      if (file.includes(`${path.sep}content${path.sep}`)) {
        result = undefined;
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
    configureServer(server) {
      server.middlewares.use('/photos', (req, res, next) => {
        const name = decodeURIComponent((req.url ?? '').split('?')[0].replace(/^\//, ''));
        const file = path.join(photosDir(root), name);
        if (name.includes('..') || !fs.existsSync(file)) return next();
        res.setHeader('Content-Type', types[path.extname(name).toLowerCase()] ?? 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
    async generateBundle() {
      const content = result?.content ?? check();
      const used = [...new Set(content.places.map((p) => p.photo).filter((p): p is string => !!p))];
      for (const name of used) {
        const image = sharp(path.join(photosDir(root), name)).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
        const ext = path.extname(name).toLowerCase();
        const out = ext === '.png' ? image.png({ compressionLevel: 9 }) : ext === '.webp' ? image.webp({ quality: 80 }) : image.jpeg({ quality: 80, mozjpeg: true });
        this.emitFile({ type: 'asset', fileName: `photos/${name}`, source: await out.toBuffer() });
      }
    },
  };
}
