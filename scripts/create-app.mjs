// Creates a new host app or service app and registers it everywhere it needs to be.
//
//   npm run create:host:app    -- [name] ["Display Name"]      e.g.  npm run create:host:app -- digha "Digha"
//   npm run create:service:app -- [name] ["Display Name"]      e.g.  npm run create:service:app -- jobs "Jobs"
//   Without a name the script asks for it (and the display name) interactively.
//
// Host app (clone of kakdwip-app, port 72xx):
//   projects/host-app/<name>-app/  (PWA, theme, i18n, landing page, service catalog)
//   angular.json, package.json (start:host:<name> / start:service:<name> + `start`), tsconfig.json references.
// Service app (clone of trendhub-app, port 62xx):
//   projects/service-app/<name>-app/
//   with login-page / home-page / provideFirebase (fill in firebase.config.ts), like matrimony-app,
//   angular.json, package.json, tsconfig.json, SERVICE_APPS + messages in a-common-lib,
//   and the service is excluded from every host's service-worker navigation.
//
// Nothing is overwritten: the script stops if the app already exists.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...parts) => join(root, ...parts);

const TEMPLATES = {
  host: { dir: 'host-app', template: 'kakdwip', portBase: 7200 },
  service: { dir: 'service-app', template: 'trendhub', portBase: 6200 },
};

// ---------- args ----------
const [kind, nameArg, displayArg] = process.argv.slice(2);
if (!TEMPLATES[kind]) {
  console.error('Usage: node scripts/create-app.mjs <host|service> [name] ["Display Name"]');
  process.exit(1);
}
const { dir, template, portBase } = TEMPLATES[kind];
const templateProject = `${template}-app`;
const angularJson = JSON.parse(readFileSync(p('angular.json'), 'utf8'));

const toSlug = (raw) => raw.trim().toLowerCase().replace(/-app$/, '');
const titleCase = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

/** Returns a message when `raw` cannot be used as the name of a new app, otherwise null. */
function nameProblem(raw) {
  const candidate = toSlug(raw);
  if (!candidate) return 'The name cannot be empty.';
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(candidate)) {
    return `"${raw.trim()}" is not valid. Use lowercase letters, digits and dashes, starting with a letter (e.g. "digha" or "new-town").`;
  }
  if (angularJson.projects[`${candidate}-app`]) return `An app called "${candidate}-app" already exists in angular.json.`;
  if (existsSync(p(`projects/${dir}/${candidate}-app`))) return `projects/${dir}/${candidate}-app already exists.`;
  return null;
}

let slug;
let display = displayArg;

if (nameArg !== undefined && nameArg !== '') {
  const problem = nameProblem(nameArg);
  if (problem) fail(problem);
  slug = toSlug(nameArg);
} else {
  // No name on the command line: ask for it on the next line.
  if (!process.stdin.isTTY) fail(`No app name given. Run: npm run create:${kind}:app -- <name> ["Display Name"]`);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.on('close', () => {
    if (!slug) {
      console.error('\nCancelled, nothing was created.');
      process.exit(1);
    }
  });
  const kindLabel = kind === 'host' ? 'host (club)' : 'service';
  console.log(`Creating a new ${kindLabel} app. Press Ctrl+C to cancel.`);
  for (let attempt = 0; !slug; attempt++) {
    const answer = await rl.question(`Enter the ${kindLabel} app name (e.g. ${kind === 'host' ? 'digha' : 'jobs'}):
> `);
    const problem = nameProblem(answer);
    if (problem) console.error(`  ✖ ${problem}`);
    else slug = toSlug(answer);
  }
  if (display === undefined) {
    const suggestion = titleCase(slug);
    const answer = (await rl.question(`Display name [${suggestion}] (press Enter to accept):
> `)).trim();
    display = answer || suggestion;
  }
  rl.close();
}
display ??= titleCase(slug);
const project = `${slug}-app`;
const appRoot = `projects/${dir}/${project}`;

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

// ---------- helpers ----------
const eolOf = (text) => (text.includes('\r\n') ? '\r\n' : '\n');
const writeLike = (file, text, original) => writeFileSync(file, original && eolOf(original) === '\r\n' ? text.replace(/\r?\n/g, '\r\n') : text);

function editText(file, fn) {
  const original = readFileSync(file, 'utf8');
  const next = fn(original.replace(/\r\n/g, '\n'));
  if (next !== original.replace(/\r\n/g, '\n')) writeLike(file, next, original);
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const TEXT_FILE = /\.(ts|html|scss|json|webmanifest)$/;
const upperId = slug.toUpperCase().replace(/-/g, '_');
const quote = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** Replaces the template app's name in every spelling used in its files. */
function rename(text) {
  return text
    .replaceAll(`${template[0].toUpperCase()}${template.slice(1)}App`, display)
    .replaceAll(template.toUpperCase(), upperId)
    .replaceAll(`${template[0].toUpperCase()}${template.slice(1)}`, quote(display))
    .replaceAll(template, slug);
}

/** Next free port in the 62xx / 72xx series (looks at package.json and at the library's service list). */
function nextPort() {
  const pkg = readFileSync(p('package.json'), 'utf8');
  const lib = readFileSync(p('projects/a-common-lib/src/lib/service-catalog/service-catalog.ts'), 'utf8');
  const used = [...pkg.matchAll(/--port (\d+)/g), ...lib.matchAll(/devPort: (\d+)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n > portBase && n < portBase + 100);
  return used.length ? Math.max(...used) + 1 : portBase + 1;
}

/** A deterministic colour scheme per club name, so every new host looks different. */
function palette() {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  const hex = (h, s, l) => {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  return {
    light: { primary: hex(hue, 65, 30), onPrimary: '#ffffff', secondary: hex(hue + 45, 60, 36), accent: hex(hue + 180, 80, 38) },
    dark: { primary: hex(hue, 65, 62), onPrimary: hex(hue, 60, 9), secondary: hex(hue + 45, 70, 66), accent: hex(hue + 180, 90, 62) },
  };
}

// ---------- 1. copy + rename the template app ----------
cpSync(p(`projects/${TEMPLATES[kind].dir}/${templateProject}`), p(appRoot), { recursive: true });
for (const file of walk(p(appRoot))) {
  if (TEXT_FILE.test(file)) editText(file, rename);
}

if (kind === 'host') {
  const app = p(appRoot, 'src/app');

  // theme
  const colors = palette();
  const line = (c) => `{ primary: '${c.primary}', onPrimary: '${c.onPrimary}', secondary: '${c.secondary}', accent: '${c.accent}' }`;
  writeFileSync(
    join(app, 'app.theme.ts'),
    `import type { ThemePalette } from 'a-common-lib';\n\n/** ${display} club colours. Change them here only; nothing else in the workspace knows about this club's palette. */\nexport const ${upperId}_THEME: ThemePalette = {\n  light: ${line(colors.light)},\n  dark: ${line(colors.dark)},\n};\n`,
  );

  // texts: Bengali/Hindi club names were replaced by the Latin name; address and map are placeholders to fill in
  editText(join(app, 'app.i18n.ts'), (t) =>
    t
      .replaceAll('কাকদ্বীপ', quote(display))
      .replaceAll('काकद्वीप', quote(display))
      .replace(/\/\*\* .*? \*\//, `/** All ${display} page texts. TODO: the Bengali/Hindi club name and address below are placeholders. */`)
      .replace(
        /('location\.address': \{)[\s\S]*?\n  \},/,
        `$1\n    en: '${quote(display)}, India',\n    bn: '${quote(display)}, ভারত',\n    hi: '${quote(display)}, भारत',\n  },`,
      ),
  );
  editText(join(app, 'app.content.ts'), (t) =>
    t
      .replace(/\/\*\* Club house position[^\n]*\n/, '/** PLACEHOLDER map position (Kolkata). Set the real latitude/longitude of the club house. */\n')
      .replace(/lat: [\d.]+, lng: [\d.]+/, 'lat: 22.5726, lng: 88.3639'),
  );

  // manifest + title
  editText(p(appRoot, 'public/manifest.webmanifest'), (t) => t);
}

// Service apps start with the same auth set-up as matrimony-app: login-page, home-page (guarded),
// provideFirebase() and routes that always lead to home-page (the guard sends guests to login-page).
if (kind === 'service') {
  const app = p(appRoot, 'src/app');
  const put = (relative, content) => {
    const file = join(app, relative);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  };

  put(
    'firebase.config.ts',
    `import { FirebaseOptions } from 'firebase/app';

// TODO: paste this app's own Firebase web config (Firebase console → Project settings → Your apps → Web app).
// It is public by design; access is protected by Firebase security rules.
export const firebaseConfig: FirebaseOptions = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};
`,
  );

  put(
    'app.routes.ts',
    `import { Routes } from '@angular/router';
import { authGuard } from 'a-common-lib';
import { HomePageComponent } from './pages/home-page';
import { LoginPageComponent } from './pages/login-page';

export const routes: Routes = [
  { path: 'login-page', component: LoginPageComponent },
  { path: 'home-page', component: HomePageComponent, canActivate: [authGuard()] },
  { path: '', pathMatch: 'full', redirectTo: 'home-page' },
  { path: '**', redirectTo: 'home-page' },
];
`,
  );

  editText(join(app, 'app.config.ts'), (t) =>
    t
      .replace("import { provideI18n, provideTheme } from 'a-common-lib';", "import { provideFirebase, provideI18n, provideTheme } from 'a-common-lib';")
      .replace("import { routes } from './app.routes';", "import { firebaseConfig } from './firebase.config';\nimport { routes } from './app.routes';")
      .replace('    provideRouter(routes),\n', '    provideRouter(routes),\n    provideFirebase(firebaseConfig),\n'),
  );

  put(
    'pages/login-page/login-page.component.ts',
    `import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from 'a-common-lib';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly router = inject(Router);

  protected onSignedIn() {
    this.router.navigate(['/home-page']);
  }
}
`,
  );
  put('pages/login-page/login-page.component.html', '<lib-login (signedIn)="onSignedIn()" />\n');
  put('pages/login-page/login-page.component.scss', ':host { display: block; padding: 1rem; }\n');
  put('pages/login-page/index.ts', "export * from './login-page.component';\n");

  put(
    'pages/home-page/home-page.component.ts',
    `import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'a-common-lib';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login-page']);
  }
}
`,
  );
  put(
    'pages/home-page/home-page.component.html',
    `<h2>Home</h2>
<p>Welcome, {{ auth.user()?.displayName ?? auth.user()?.email }}</p>
<button type="button" (click)="logout()">Sign out</button>
`,
  );
  put('pages/home-page/home-page.component.scss', ':host { display: block; padding: 1rem; }\n');
  put('pages/home-page/index.ts', "export * from './home-page.component';\n");
}

// ---------- 2. angular.json ----------
{
  const templateEntry = angularJson.projects[templateProject];
  const entry = JSON.parse(JSON.stringify(templateEntry).replaceAll(templateProject, project).replaceAll(`${dir}/${templateProject}`, `${dir}/${project}`));
  angularJson.projects[project] = entry;
  const original = readFileSync(p('angular.json'), 'utf8');
  writeLike(p('angular.json'), JSON.stringify(angularJson, null, 2) + '\n', original);
}

// ---------- 3. package.json ----------
const port = nextPort();
{
  const original = readFileSync(p('package.json'), 'utf8');
  const pkg = JSON.parse(original);
  const prefix = `start:${kind}:`;
  const isStart = (k) => /^start:(service|host):/.test(k);
  const entries = Object.entries(pkg.scripts).filter(([k]) => k !== 'start');
  // new script goes after the last one of its kind (else after the last start:* script, else at the end)
  let at = entries.map(([k]) => k.startsWith(prefix)).lastIndexOf(true);
  if (at < 0) at = entries.map(([k]) => isStart(k)).lastIndexOf(true);
  if (at < 0) at = entries.length - 1;
  entries.splice(at + 1, 0, [`${prefix}${slug}`, `ng serve ${project} --port ${port}`]);
  // `start` runs every start:service:* and start:host:* script together
  const startKeys = entries.map(([k]) => k).filter(isStart);
  const names = startKeys.map((k) => k.split(':').at(-1));
  const startAll = `concurrently -k -n ${names.join(',')} ${startKeys.map((k) => `"npm:${k}"`).join(' ')}`;
  const lastStart = startKeys.at(-1);
  const scripts = {};
  for (const [k, v] of entries) {
    scripts[k] = v;
    if (k === lastStart) scripts['start'] = startAll;
  }
  pkg.scripts = scripts;
  writeLike(p('package.json'), JSON.stringify(pkg, null, 2) + '\n', original);
}

// ---------- 4. tsconfig.json references ----------
editText(p('tsconfig.json'), (t) => {
  const add = [`./${appRoot}/tsconfig.app.json`, `./${appRoot}/tsconfig.spec.json`].map((f) => `    { "path": "${f}" }`).join(',\n');
  return t.replace(/\}\s*\n\s*\]\s*\n\}\s*$/, `},\n${add}\n  ]\n}\n`);
});

// ---------- 5. service apps: register in the library + every host ----------
if (kind === 'service') {
  editText(p('projects/a-common-lib/src/lib/service-catalog/service-catalog.ts'), (t) => {
    const lines = t.split('\n');
    const last = lines.map((l) => /^\s*\{ path: '/.test(l)).lastIndexOf(true);
    lines.splice(last + 1, 0, `  { path: '${slug}', devPort: ${port} },`);
    return lines.join('\n');
  });

  editText(p('projects/a-common-lib/src/lib/i18n/common-messages.ts'), (t) => {
    const lines = t.split('\n');
    const last = lines.map((l) => /^\s*'service\./.test(l)).lastIndexOf(true);
    const name = quote(display);
    lines.splice(
      last + 1,
      0,
      `  'service.${slug}.name': { en: '${name}', bn: '${name}', hi: '${name}' },`,
      `  'service.${slug}.description': { en: 'Placeholder service app.', bn: 'প্লেসহোল্ডার পরিষেবা অ্যাপ।', hi: 'प्लेसहोल्डर सेवा ऐप।' },`,
    );
    return lines.join('\n');
  });

  // Hosts' service workers must not answer navigations to the service's folder with the host's index.html.
  for (const file of walk(p('projects/host-app')).filter((f) => f.endsWith('ngsw-config.json'))) {
    editText(file, (t) => {
      if (t.includes(`"!/${slug}/**"`)) return t;
      const matches = [...t.matchAll(/"!\/[\w-]+\/\*\*"/g)];
      const lastMatch = matches.at(-1);
      if (!lastMatch) return t;
      const at = lastMatch.index + lastMatch[0].length;
      return `${t.slice(0, at)},\n    "!/${slug}/**"${t.slice(at)}`;
    });
  }
}

// ---------- done ----------
console.log(`\n✔ Created ${kind} app "${project}" in ${appRoot}`);
console.log(`  port ${port}  →  npm run start:${kind}:${slug}   (also included in npm start)`);
if (kind === 'host') {
  console.log('\nNext steps for the host:');
  console.log(`  - texts:   ${appRoot}/src/app/app.i18n.ts   (Bengali/Hindi club name + address are placeholders)`);
  console.log(`  - content: ${appRoot}/src/app/app.content.ts (events, map position, contact email, hero video)`);
  console.log(`  - theme:   ${appRoot}/src/app/app.theme.ts   (colours were generated from the name)`);
  console.log(`  - icons:   ${appRoot}/public/icons/*.png      (replace with the club's logo)`);
  console.log(`  - hide a service for this club: add exclude: ['<service>'] in src/app/app-catalog.ts`);
} else {
  console.log('\nNext steps for the service:');
  console.log(`  - texts:  service name/description in projects/a-common-lib/src/lib/i18n/common-messages.ts (all 3 languages)`);
  console.log(`  - build:  ${appRoot}/src/app/  (the page already uses the shared header, theme and language switch)`);
}
