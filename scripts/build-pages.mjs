// Builds every host app and every service app into dist/pages, laid out for GitHub Pages:
//
//   dist/pages/<host>/                         -> host app
//   dist/pages/<host>/<service>/               -> service app (copy per host, matches the relative links in the host catalog)
//
// Apps are discovered from angular.json by folder (projects/host-app/*, projects/service-app/*),
// so a new host or service is picked up automatically.
//
// Env overrides:  PAGES_REPO=<repo name>  (default: parsed from `git remote origin`)

import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'dist', 'pages');
const tmpDir = join(root, 'dist', '.pages-build');

const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: root });

function repoName() {
  if (process.env.PAGES_REPO) return process.env.PAGES_REPO;
  const url = execSync('git remote get-url origin', { cwd: root }).toString().trim();
  const match = url.match(/\/([^/]+?)(?:\.git)?$/);
  if (!match) throw new Error(`Cannot derive repo name from "${url}". Set PAGES_REPO.`);
  return match[1];
}

const angularJson = JSON.parse(readFileSync(join(root, 'angular.json'), 'utf8'));
const byKind = (kind) =>
  Object.entries(angularJson.projects)
    .filter(([, p]) => p.root.replace(/\\/g, '/').startsWith(`projects/${kind}/`))
    .map(([name]) => name);

const hosts = byKind('host-app');
const services = byKind('service-app');
if (!hosts.length) throw new Error('No host apps found under projects/host-app.');

const slug = (name) => name.replace(/-app$/, '');
const repo = repoName();
const baseOf = (...segments) => `/${[repo, ...segments].join('/')}/`;

/** Production build into a temp dir, then copy the browser bundle to `target`. */
function build(project, baseHref, target) {
  rmSync(tmpDir, { recursive: true, force: true });
  run(
    `npx ng build ${project} --configuration production --base-href ${baseHref} --output-path "${tmpDir}"`,
  );
  const browser = join(tmpDir, 'browser');
  mkdirSync(target, { recursive: true });
  cpSync(existsSync(browser) ? browser : tmpDir, target, { recursive: true });
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const host of hosts) {
  const hostSlug = slug(host);
  console.log(`\n=== Host: ${hostSlug} ===`);
  build(host, baseOf(hostSlug), join(outDir, hostSlug));
  for (const service of services) {
    const serviceSlug = slug(service);
    console.log(`\n--- ${hostSlug} / ${serviceSlug} ---`);
    build(service, baseOf(hostSlug, serviceSlug), join(outDir, hostSlug, serviceSlug));
  }
}
rmSync(tmpDir, { recursive: true, force: true });

// Disable Jekyll processing on GitHub Pages.
writeFileSync(join(outDir, '.nojekyll'), '');

console.log(`\nPages build ready in dist/pages (site: /${repo}/). Hosts: ${hosts.map(slug).join(', ')}.`);
