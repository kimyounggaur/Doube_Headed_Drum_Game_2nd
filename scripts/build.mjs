import * as esbuild from 'esbuild';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const assetsDir = path.join(dist, 'assets');

await rm(dist, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

try {
  const publicEntries = await readdir(publicDir, { withFileTypes: true });
  await Promise.all(
    publicEntries.map((entry) =>
      cp(path.join(publicDir, entry.name), path.join(dist, entry.name), {
        recursive: true,
        force: true,
      }),
    ),
  );
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

await esbuild.build({
  entryPoints: [path.join(root, 'src/main.tsx')],
  bundle: true,
  outdir: assetsDir,
  entryNames: 'main',
  assetNames: '[name]-[hash]',
  format: 'esm',
  target: ['es2022'],
  jsx: 'automatic',
  minify: false,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  loader: {
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.svg': 'file',
  },
  logLevel: 'info',
});

await writeFile(
  path.join(dist, 'index.html'),
  `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#102538" />
    <title>조선의 북소리: 전장의 지휘자</title>
    <link rel="stylesheet" href="/assets/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/main.js"></script>
  </body>
</html>
`,
  'utf8',
);
