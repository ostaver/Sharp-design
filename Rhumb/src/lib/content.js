// All copy for the page lives here. Ostarev, Leftovers, the people quoted and the
// companies named are fictional. Model names are listed only as compatibility.

export const site = {
	name: 'Ostarev',
	title: 'Ostarev — the coding agent that works the night watch',
	description:
		'Hand Ostarev the ticket at dusk. It plans, edits and tests on a constant bearing through the night, and has a pull request waiting by first light.',
	company: 'Leftovers, Inc.',
	year: 2026,
	github: 'https://github.com/',
	discord: 'https://discord.com/',
	x: 'https://x.com/',
	// No real docs exist for a fictional product; "Docs" leads to the install quickstart.
	docs: '#landfall'
};

// The page is one night. Each section starts at a ship's time (minutes after 00:00,
// running past midnight as 24:00+). The ship's clock in the nav interpolates between them.
export const sections = [
	{ id: 'heading', n: '01', label: 'Heading', time: 20 * 60, icon: 'heading' },
	{ id: 'hand-off', n: '02', label: 'Hand-off', time: 20 * 60 + 10, icon: 'handoff' },
	{ id: 'instruments', n: '03', label: 'Instruments', time: 20 * 60 + 20, icon: 'instruments' },
	{ id: 'bearing', n: '04', label: 'Bearing', time: 20 * 60 + 40, icon: 'bearing' },
	{ id: 'night', n: '05', label: 'The night', time: 21 * 60, icon: 'night' },
	{ id: 'signals', n: '06', label: 'Signals', time: 30 * 60 + 30, icon: 'signals' },
	{ id: 'charter', n: '07', label: 'Charter', time: 31 * 60 + 15, icon: 'charter' },
	{ id: 'landfall', n: '08', label: 'Landfall', time: 32 * 60, icon: 'landfall' }
];

export const hero = {
	eyebrow: 'v0.9 — sea trials',
	lines: ['A coding agent', 'that works', 'the night watch'],
	lede: 'Hand Ostarev the ticket before you log off. It holds one bearing through plan, edit, test and review, inside your real editor, with every step on the log. By first light the pull request is waiting.',
	strike: { before: 'Local-first. Any model. No ', struck: 'babysitting', after: '.' },
	modelsLabel: 'Works with any model',
	// logged in the quiet stretch after the camera falls through the planet's air
	through: ['20:06 · through the cloud deck', 'clear to the east · wind ene 3 · 047°'],
	models: ['Claude', 'GPT', 'Gemini', 'Llama', 'Mistral', 'Qwen', 'DeepSeek', 'Kimi', 'Ollama']
};

export const install = [
	{ id: 'curl', label: 'curl', cmd: 'curl -fsSL https://ostarev.dev/install | sh', os: 'macOS · Linux' },
	{ id: 'brew', label: 'brew', cmd: 'brew install leftovers/tap/ostarev', os: 'macOS · Linux' },
	{ id: 'npm', label: 'npm', cmd: 'npm i -g @ostarev/cli', os: 'Node 20+' },
	{ id: 'pwsh', label: 'pwsh', cmd: 'irm https://ostarev.dev/install.ps1 | iex', os: 'Windows' },
	{ id: 'nix', label: 'nix', cmd: 'nix run github:leftovers/ostarev', os: 'NixOS · macOS · Linux' }
];

export const handoff = {
	title: ['Hand it the ticket', 'at dusk.'],
	lede: 'Before it touches a line, Ostarev charts the whole repository: packages, services, tests, even the flaky one everybody skips. Then it commits to a single bearing you can read in ten seconds.',
	steps: [
		{
			k: 'Brief',
			t: 'Paste a ticket, link an issue or just describe it. Ostarev asks the two questions that matter and none that don’t.'
		},
		{
			k: 'Chart',
			t: 'Your language servers index every symbol. Ostarev moves by definition and reference, not by grep and hope.'
		},
		{
			k: 'Bearing',
			t: 'One heading, four waypoints, a deadline. Approve it and close the laptop.'
		}
	],
	// The terminal session, played by scroll. Each line is typed or printed in order.
	// kind: cmd (typed after the prompt), out (printed), gap (blank line)
	session: [
		{ kind: 'path', text: '~/tidewater/billing', branch: 'main' },
		{ kind: 'cmd', text: 'ostarev sail "Move billing webhooks onto Events v2" --until 07:00' },
		{ kind: 'gap' },
		{ kind: 'task', k: 'charting', v: '412 files · 38 packages · 3 services', s: 'done' },
		{ kind: 'task', k: 'soundings', v: '1,284 tests · tsc strict · 81.4% cov', s: 'done' },
		{ kind: 'task', k: 'hazards', v: '2 deprecated APIs · 1 flaky test', s: 'noted' },
		{ kind: 'gap' },
		{ kind: 'bearing', deg: '047°', text: 'webhooks → Events v2' },
		{ kind: 'wp', n: '1', text: 'events client adapter', where: 'packages/billing' },
		{ kind: 'wp', n: '2', text: 'replay store, idempotent keys', where: 'services/ledger' },
		{ kind: 'wp', n: '3', text: 'backfill job, dry run first', where: 'jobs/backfill' },
		{ kind: 'wp', n: '4', text: 'retire v1 handlers behind a flag', where: 'apps/api', last: true },
		{ kind: 'gap' },
		{ kind: 'ask', text: 'hold this bearing until 07:00?', answer: 'y' },
		{ kind: 'ok', text: 'bearing set. Ostarev has the watch. Close the laptop.' }
	]
};

export const instruments = {
	title: ['Every instrument', 'on the bridge.'],
	lede: 'Ostarev doesn’t squint at your codebase from outside. It drives the tools you already trust, wired in rather than bolted on.',
	items: [
		{
			id: 'chart',
			k: 'Chart',
			t: 'A living map of every symbol, built by your language servers. Ostarev navigates by definition and reference.',
			m: '38 pkgs · 9,412 symbols'
		},
		{
			id: 'helm',
			k: 'Helm',
			t: 'Runs inside VS Code, JetBrains, Zed and Neovim over LSP and DAP. Your refactors, formatters and keybindings.',
			m: 'lsp · dap · 4 editors'
		},
		{
			id: 'soundings',
			k: 'Soundings',
			t: 'Every edit is followed by the narrowest test run that covers it. Red means stop. Nothing gets skipped.',
			m: 'median 212 ms'
		},
		{
			id: 'log',
			k: 'Log',
			t: 'Every tool call, diff and decision is timestamped and replayable. Read the night back like a ship’s log.',
			m: '1 entry / action'
		},
		{
			id: 'crew',
			k: 'Crew',
			t: 'Sub-agents work in parallel, each in its own git worktree. Only work that passes its soundings comes aboard.',
			m: 'up to 16 hands'
		},
		{
			id: 'anchor',
			k: 'Anchor',
			t: 'A checkpoint at every waypoint. Haul back to any of them, with files, terminal and context, in one keystroke.',
			m: '⌘ ⇧ Z to any fix'
		}
	]
};

export const bearing = {
	title: ['Most agents drift.', 'Ostarev holds a bearing.'],
	lede: 'Long tasks rarely fail loudly. They wander: a refactor nobody asked for, a test quietly skipped, a dependency bumped “while we’re here.” Every thirty minutes Ostarev re-reads the ticket, measures how far it has drifted from the plan and corrects course. If it can’t, it drops anchor and leaves you a note.',
	stats: [
		{ v: 94, suffix: '%', t: 'of overnight runs finish inside the approved plan' },
		{ v: 0.6, suffix: '°', decimals: 1, t: 'mean drift from the bearing, checked every 30 minutes' },
		{ v: 3, suffix: ' min', t: 'median morning review, because the log reads like prose' }
	],
	source: 'Sea trials, 1,200 overnight tasks across 41 repositories. Q3 2026.',
	definition: {
		word: 'rhumb line',
		pos: 'n.',
		text: 'A course that crosses every meridian at the same angle. Rarely the shortest way. Always the way you meant to go.'
	}
};

export const night = {
	title: ['Nine hours,', 'one heading.'],
	lede: 'This is one real night from the log, lightly trimmed. Scroll to stand the watch.',
	// time in minutes after 00:00; entries past midnight run on as 24:00+
	log: [
		{ time: 21 * 60 + 0, tag: 'plan', k: 'Chart read, bearing set', t: '412 files indexed. Plan approved at 047°.' },
		{ time: 21 * 60 + 48, tag: 'edit', k: 'Adapter compiled', t: '214 call sites moved onto the Events v2 client.', d: '+1,284 −912' },
		{ time: 22 * 60 + 55, tag: 'test', k: 'Three soundings red', t: 'Idempotency keys collide on retried deliveries.', bad: true },
		{ time: 23 * 60 + 31, tag: 'drift', k: 'Course corrected 3.1°', t: 'Reverted an unrequested refactor of ledger/format.ts.' },
		{ time: 24 * 60 + 40, tag: 'crew', k: 'Crew of four dispatched', t: 'Backfill, docs, flag cleanup and a load test, each in its own worktree.' },
		{ time: 26 * 60 + 15, tag: 'data', k: 'Backfill dry run', t: '1.8 M historical events replayed. Zero mismatches.' },
		{ time: 27 * 60 + 52, tag: 'fix', k: 'Flaky test, found and fixed', t: 'invoice.spec.ts assumed the server lived in UTC. It doesn’t.' },
		{ time: 28 * 60 + 30, tag: 'test', k: 'All soundings green', t: '1,291 tests passing, none skipped.', good: true },
		{ time: 29 * 60 + 12, tag: 'pr', k: 'Pull request #4182 opened', t: 'With the night’s log attached, in plain English.' },
		{ time: 29 * 60 + 58, tag: 'done', k: 'Signal sent, anchor dropped', t: 'Summary posted to #billing. Ostarev stands down.' }
	]
};

export const signals = {
	title: ['Signals from the', 'morning watch.'],
	quotes: [
		{
			q: 'I hand it the gnarly migration at six. At nine the next morning there’s a pull request, and a log I can actually read.',
			name: 'Filip Karamazov',
			role: 'Shut yo bitch ass up',
			org: 'Tidewater',
			flag: 'IK'
		},
		{
			q: 'The drift checks are the feature. It told me it was about to refactor something I hadn’t asked for, and then it didn’t.',
			name: 'OSTAVEN',
			role: 'Platform Lead',
			org: 'Northlight',
			flag: 'DM'
		},
		{
			q: 'My editor, my linters, my tests. It’s the first agent that feels like a colleague on the night shift instead of a slot machine.',
			name: 'OSTAREV',
			role: 'Engineering Manager',
			org: 'Saltworks',
			flag: 'PR'
		},
		{
			q: 'We run a crew of eight overnight on the monorepo. Mornings are code review now, not archaeology.',
			name: 'OSTAR',
			role: 'CTO',
			org: 'Halyard',
			flag: 'TF'
		}
	],
	fleet: ['Tidewater', 'Northlight', 'Saltworks', 'Halyard', 'Brine & Co', 'Osprey', 'Lantern', 'Kestrel']
};

export const charter = {
	title: ['Charter a watch.'],
	lede: 'Every plan runs on your machine. Your code only leaves it if you point Ostarev at a remote model.',
	tiers: [
		{
			id: 'deckhand',
			k: 'Deckhand',
			price: 'Free',
			per: 'forever',
			t: 'For side projects and curious evenings.',
			features: ['Local runs, bring your own key', 'One agent, one worktree', 'Three overnight runs a week', 'The full ship’s log'],
			cta: 'Install tonight'
		},
		{
			id: 'navigator',
			k: 'Navigator',
			price: '$24',
			per: 'seat / month',
			t: 'For engineers who would rather sleep.',
			features: ['Unlimited overnight runs', 'A crew of up to four sub-agents', 'Drift reports and anchors', 'Plugins for VS Code, JetBrains, Zed, Neovim'],
			cta: 'Start a 14-day trial',
			featured: true
		},
		{
			id: 'fleet',
			k: 'Fleet',
			price: 'Let’s talk',
			per: 'annual',
			t: 'For teams that ship while the office is dark.',
			features: ['A crew of sixteen, shared charts', 'SSO, SCIM and audit-log export', 'Self-hosted and air-gapped models', 'A named harbour pilot for support'],
			cta: 'Book a call'
		}
	]
};

export const landfall = {
	kicker: 'Landfall · 08:00',
	title: ['Ostarev has', 'the watch.'],
	aside: 'Go outside.',
	lede: 'Install it in one line tonight. Wake up to a green build tomorrow.'
};

// Links that have a home on this page point to it; the rest are placeholders (#).
const L = (t, href = '#') => ({ t, href });
export const footer = {
	columns: [
		{ h: 'Product', links: [L('Features', '#instruments'), L('The night log', '#night'), L('Pricing', '#charter'), L('Changelog'), L('Integrations', '#instruments')] },
		{ h: 'Docs', links: [L('Quickstart', '#landfall'), L('CLI reference'), L('Configuration'), L('Models', '#heading'), L('Editor plugins'), L('MCP servers')] },
		{ h: 'Resources', links: [L('Field notes'), L('Case studies', '#signals'), L('Community'), L('System status'), L('Security'), L('Brand kit')] },
		{ h: 'Company', links: [L('About'), L('Careers'), L('Contact'), L('Terms of service'), L('Privacy policy'), L('Data processing')] }
	],
	plate: 'Pl. VIII — Landfall below Sv. Nikola, patron of sailors. Morning watch.',
	coords: '42°29′ N · 18°41′ E',
	sculp: 'Drawn in code · Leftovers sculp.'
};
