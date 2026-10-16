// Regression tests for roll.mjs, driven through the real CLI.
//
//   node --test Stoicism/stoicism-skill/roll.test.mjs
//
// Every test works in its own temporary tree and always passes --history, so the skill's
// default .stoicism-history.json is never read or written (the suite asserts that, too).
// Expectations (fingerprint key, active-axis distance) are computed here, independently of
// the generator, from the emitted chart's composition and section types.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { recordChart, compareNovelty } from "./novelty.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROLL = join(HERE, "roll.mjs");
const DEFAULT_HISTORY = join(HERE, ".stoicism-history.json");

const AXES = {
  hero: ["monument", "diptych", "broadside", "aperture", "index"],
  collection: ["portico", "editorial", "catalog"],
  ending: ["facade", "colophon", "split"],
  navigation: ["chapters", "masthead", "rail"],
  rhythm: ["processional", "editorial", "compact"],
};
const AXIS_NAMES = Object.keys(AXES);
const LEGACY_COMPOSITION = {
  hero: "monument",
  collection: "portico",
  ending: "facade",
  navigation: "chapters",
  rhythm: "processional",
};

let tmp;
let defaultHistoryBefore;
let counter = 0;

before(() => {
  tmp = mkdtempSync(join(tmpdir(), "stoicism-roll-test-"));
  defaultHistoryBefore = existsSync(DEFAULT_HISTORY)
    ? readFileSync(DEFAULT_HISTORY, "utf8")
    : null;
});

after(() => {
  const defaultHistoryAfter = existsSync(DEFAULT_HISTORY)
    ? readFileSync(DEFAULT_HISTORY, "utf8")
    : null;
  if (tmp) rmSync(tmp, { recursive: true, force: true });
  assert.equal(
    defaultHistoryAfter,
    defaultHistoryBefore,
    "tests must never touch the default skill history",
  );
});

// ---- helpers ------------------------------------------------------------------------

const fresh = (label) => {
  const dir = join(tmp, `${label}-${++counter}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};

/** A minimal project the CLI can write into: package.json and index.html exist, so they get patched. */
function makeProject(label = "site") {
  const dir = fresh(label);
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name: "fixture",
        private: true,
        dependencies: { react: "^19.0.0", "@fontsource/old-face": "^5.0.0" },
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(
    join(dir, "index.html"),
    '<!doctype html><html><head><meta name="theme-color" content="#000000"></head><body></body></html>\n',
  );
  return dir;
}

function roll(args, cwd = tmp) {
  const res = spawnSync(process.execPath, [ROLL, ...args], {
    cwd,
    encoding: "utf8",
    timeout: 60_000,
  });
  if (res.error) throw res.error;
  return res;
}

function rollOk(args) {
  const res = roll(args);
  assert.equal(
    res.status,
    0,
    `roll ${args.join(" ")} failed:\n${res.stderr}\n${res.stdout}`,
  );
  return res;
}

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const readChart = (project) => readJson(join(project, "stoicism.chart.json"));
const readHistory = (file) => readJson(file);
const rawOrNull = (file) =>
  existsSync(file) ? readFileSync(file, "utf8") : null;

/** Fresh --out roll into a new project. Returns the chart JSON plus where it went. */
function freshRoll(historyFile, extra = []) {
  const project = makeProject();
  rollOk(["--out", project, "--history", historyFile, ...extra]);
  return { project, chart: readChart(project) };
}

const typesOf = (chart) => chart.sections.map((s) => s.type);
const middleOf = (chart) => typesOf(chart).slice(1, -1);
const hasColonnade = (chart) => typesOf(chart).includes("colonnade");

/** Independent structural key: five axes + ordered section types, nothing cosmetic. */
const structuralKey = (chart) =>
  JSON.stringify([
    ...AXIS_NAMES.filter(
      (axis) => axis !== "collection" || hasColonnade(chart),
    ).map((axis) => chart.composition[axis]),
    typesOf(chart),
  ]);

/** Independent active-axis distance. Collection is ignored unless both charts have a colonnade. */
function changedAxes(a, b) {
  const both = hasColonnade(a) && hasColonnade(b);
  return AXIS_NAMES.filter(
    (axis) =>
      (axis !== "collection" || both) &&
      a.composition[axis] !== b.composition[axis],
  );
}

/** A chart as the generator used to emit it: no schemaVersion, no composition, no novelty. */
function legacyChart(
  seed,
  middle = ["manifesto", "colonnade", "orders", "press", "ascent"],
) {
  const order = ["hero", ...middle, "finale"];
  return {
    seed,
    theme: { seed },
    sections: order.map((type, i) => ({
      id: type,
      type,
      n: i,
      label: type,
      ground: "mist",
      next: null,
      nav: type !== "hero",
    })),
    layout: { hero: { side: "left" } },
  };
}

function writeLegacy(name, seed, middle) {
  const file = join(fresh("legacy"), name);
  writeFileSync(
    file,
    JSON.stringify(legacyChart(seed, middle), null, 2) + "\n",
  );
  return file;
}

/** The parts of a chart that a seed pins, minus novelty bookkeeping. */
const selectedDesign = (chart) => ({
  seed: chart.seed,
  theme: chart.theme,
  fonts: chart.fonts,
  composition: chart.composition,
  sections: chart.sections,
  layout: chart.layout,
});

const readProjectFiles = (project) => ({
  tokens: readFileSync(join(project, "src/styles/tokens.css"), "utf8"),
  theme: readFileSync(join(project, "src/theme.ts"), "utf8"),
  fonts: readFileSync(join(project, "src/fonts.ts"), "utf8"),
  favicon: readFileSync(join(project, "public/favicon.svg"), "utf8"),
});

// ---- tests --------------------------------------------------------------------------

describe("fresh rolls", () => {
  it("a 16-roll sequence has unique structures and honours active-axis distance", () => {
    const history = join(fresh("hist"), "nested", "history.json"); // parent directory is created for us
    const charts = [];
    for (let i = 0; i < 16; i++) charts.push(freshRoll(history).chart);

    // unique structural fingerprints, judged by our own key and by the emitted fingerprint
    const keys = charts.map(structuralKey);
    assert.equal(new Set(keys).size, charts.length, "no structure repeats");
    const prints = charts.map((c) => c.novelty.fingerprint);
    assert.equal(
      new Set(prints).size,
      charts.length,
      "no emitted fingerprint repeats",
    );
    assert.equal(
      new Set(charts.map((c) => c.seed)).size,
      charts.length,
      "every fresh roll has its own seed",
    );

    charts.forEach((chart, i) => {
      if (i === 0) return;
      const previous = charts[i - 1];
      const immediate = changedAxes(chart, previous);
      assert.ok(
        immediate.length >= 3,
        `roll ${i}: only ${immediate.join(",") || "nothing"} changed against its predecessor`,
      );
      assert.notEqual(
        chart.composition.hero,
        previous.composition.hero,
        `roll ${i}: hero must differ from predecessor`,
      );
      for (let j = Math.max(0, i - 5); j < i; j++) {
        const changed = changedAxes(chart, charts[j]);
        assert.ok(
          changed.length >= 2,
          `roll ${i} vs ${j}: only ${changed.join(",") || "nothing"} changed`,
        );
      }
    });

    // history mirrors what was built, in order
    const saved = readHistory(history);
    assert.equal(saved.schemaVersion, 1);
    assert.deepEqual(
      saved.builds.map((b) => b.seed),
      charts.map((c) => c.seed),
    );
    assert.deepEqual(
      saved.builds.map((b) => b.fingerprint),
      prints,
    );
    assert.deepEqual(
      saved.builds.map((b) => b.composition),
      charts.map((c) => c.composition),
    );
  });
});

describe("--against", () => {
  it("avoids a legacy chart silhouette without writing it anywhere", () => {
    const legacy = writeLegacy("old.chart.json", "legacy-against");
    const legacyBytes = readFileSync(legacy, "utf8");
    for (let i = 0; i < 8; i++) {
      const history = join(fresh("hist"), "history.json");
      const { chart } = freshRoll(history, ["--against", legacy]);
      assert.notEqual(
        chart.composition.hero,
        LEGACY_COMPOSITION.hero,
        "must not open like the legacy monument",
      );
      const changed = changedAxes(chart, {
        composition: LEGACY_COMPOSITION,
        sections: legacyChart("x").sections,
      });
      assert.ok(
        changed.length >= 3,
        `only ${changed.join(",") || "nothing"} differs from the legacy chart`,
      );
      assert.deepEqual(
        readHistory(history).builds.map((b) => b.seed),
        [chart.seed],
        "the external chart is compared, not recorded",
      );
    }
    assert.equal(
      readFileSync(legacy, "utf8"),
      legacyBytes,
      "the compared chart is read-only",
    );
  });

  it("works on a preview and leaves history alone", () => {
    const legacy = writeLegacy("old.chart.json", "legacy-preview");
    const history = join(fresh("hist"), "history.json");
    const res = rollOk(["--history", history, "--against", legacy]);
    assert.ok(res.stdout.length > 0);
    assert.equal(existsSync(history), false);
  });
});

describe("--remember", () => {
  it("enrols a legacy chart once, without generating a site or touching the source", () => {
    const legacy = writeLegacy("old.chart.json", "legacy-remember");
    const legacyBytes = readFileSync(legacy, "utf8");
    const dir = fresh("hist");
    const history = join(dir, "history.json");

    rollOk(["--remember", legacy, "--history", history]);
    rollOk(["--remember", legacy, "--history", history]);

    const saved = readHistory(history);
    assert.equal(saved.schemaVersion, 1);
    assert.equal(
      saved.builds.length,
      1,
      "same seed+fingerprint is stored once",
    );
    const [record] = saved.builds;
    assert.equal(record.seed, "legacy-remember");
    assert.deepEqual(record.composition, LEGACY_COMPOSITION);
    assert.deepEqual(record.sectionTypes, typesOf(legacyChart("x")));
    assert.equal(typeof record.fingerprint, "string");
    assert.equal(
      readFileSync(legacy, "utf8"),
      legacyBytes,
      "source chart is untouched",
    );
    assert.deepEqual(
      readdirSync(dir).sort(),
      ["history.json"],
      "no site or other files were generated",
    );
  });

  it("keeps distinct seeds that share a fingerprint, and a generated chart keeps its own fingerprint", () => {
    const a = writeLegacy("a.chart.json", "legacy-a");
    const b = writeLegacy("b.chart.json", "legacy-b");
    const history = join(fresh("hist"), "history.json");
    rollOk(["--remember", a, "--history", history]);
    rollOk(["--remember", b, "--history", history]);
    rollOk(["--remember", a, "--history", history]);
    const saved = readHistory(history);
    assert.deepEqual(saved.builds.map((r) => r.seed).sort(), [
      "legacy-a",
      "legacy-b",
    ]);
    assert.equal(
      saved.builds[0].fingerprint,
      saved.builds[1].fingerprint,
      "legacy charts share one normalized fingerprint",
    );

    const source = join(fresh("hist"), "history.json");
    const { project, chart } = freshRoll(source);
    const target = join(fresh("hist"), "history.json");
    rollOk([
      "--remember",
      join(project, "stoicism.chart.json"),
      "--history",
      target,
    ]);
    rollOk([
      "--remember",
      join(project, "stoicism.chart.json"),
      "--history",
      target,
    ]);
    const [record, ...rest] = readHistory(target).builds;
    assert.equal(rest.length, 0);
    assert.equal(record.seed, chart.seed);
    assert.equal(record.fingerprint, chart.novelty.fingerprint);
    assert.deepEqual(record.composition, chart.composition);
    assert.deepEqual(record.sectionTypes, typesOf(chart));
  });

  it("makes later rolls avoid the remembered design", () => {
    const legacy = writeLegacy("old.chart.json", "legacy-avoided");
    const history = join(fresh("hist"), "history.json");
    rollOk(["--remember", legacy, "--history", history]);
    for (let i = 0; i < 5; i++) {
      const { chart } = freshRoll(history);
      if (i === 0)
        assert.notEqual(chart.composition.hero, LEGACY_COMPOSITION.hero);
      // only the first roll sits right after the remembered build; later ones still must not equal it
      assert.notEqual(
        structuralKey(chart),
        structuralKey({
          composition: LEGACY_COMPOSITION,
          sections: legacyChart("x").sections,
        }),
      );
    }
  });
});

describe("--seed and previews", () => {
  it("reproduces the selected design exactly, whatever the history says", () => {
    const history = join(fresh("hist"), "history.json");
    const { project, chart } = freshRoll(history);
    const original = readProjectFiles(project);
    const historyBytes = readFileSync(history, "utf8");

    // a different history that already contains this very design and more
    const crowded = join(fresh("hist"), "history.json");
    const record = readHistory(history).builds[0];
    writeFileSync(
      crowded,
      JSON.stringify({
        schemaVersion: 1,
        builds: [record, { ...record, seed: "other" }],
      }),
    );
    const crowdedBytes = readFileSync(crowded, "utf8");

    const repaired = makeProject("repair");
    rollOk(["--seed", chart.seed, "--out", repaired, "--history", crowded]);
    const again = readChart(repaired);
    assert.deepEqual(selectedDesign(again), selectedDesign(chart));
    assert.equal(again.novelty.fingerprint, chart.novelty.fingerprint);
    assert.deepEqual(readProjectFiles(repaired), original);
    assert.equal(
      readFileSync(crowded, "utf8"),
      crowdedBytes,
      "repair never writes history",
    );

    // with no history at all, and again into the project it came from
    const missing = join(fresh("hist"), "absent.json");
    const third = makeProject("repair");
    rollOk(["--seed", chart.seed, "--out", third, "--history", missing]);
    assert.deepEqual(selectedDesign(readChart(third)), selectedDesign(chart));
    assert.equal(existsSync(missing), false, "repair never creates history");

    rollOk(["--seed", chart.seed, "--out", project, "--history", history]);
    assert.deepEqual(selectedDesign(readChart(project)), selectedDesign(chart));
    assert.equal(readFileSync(history, "utf8"), historyBytes);
  });

  it("a preview reads history but never reserves a slot", () => {
    const history = join(fresh("hist"), "history.json");
    freshRoll(history);
    const before_ = readFileSync(history, "utf8");
    for (let i = 0; i < 3; i++) {
      rollOk(["--history", history]);
    }
    assert.equal(readFileSync(history, "utf8"), before_);

    const missing = join(fresh("hist"), "absent.json");
    rollOk(["--history", missing]);
    assert.equal(existsSync(missing), false);
  });

  it("the same seed repairs the same pooled design with the same --sections", () => {
    const history = join(fresh("hist"), "history.json");
    const pool = ["manifesto", "press"];
    const { chart } = freshRoll(history, ["--sections", pool.join(",")]);
    const repaired = makeProject("repair");
    rollOk([
      "--seed",
      chart.seed,
      "--sections",
      pool.join(","),
      "--out",
      repaired,
      "--history",
      join(fresh("hist"), "other.json"),
    ]);
    assert.deepEqual(
      selectedDesign(readChart(repaired)),
      selectedDesign(chart),
    );
  });
});

describe("--sections", () => {
  const pools = [
    ["manifesto", "press"],
    ["colonnade", "ascent"],
    ["orders", "press", "ascent"],
    ["ascent", "manifesto", "colonnade", "orders"],
  ];

  for (const pool of pools) {
    it(`never leaks a type outside ${pool.join(",")}`, () => {
      const history = join(fresh("hist"), "history.json");
      for (let i = 0; i < 6; i++) {
        const { chart } = freshRoll(history, ["--sections", pool.join(",")]);
        const middle = middleOf(chart);
        assert.equal(typesOf(chart)[0], "hero");
        assert.equal(typesOf(chart).at(-1), "finale");
        assert.ok(
          middle.length >= 2 && middle.length <= pool.length,
          `middle has ${middle.length} sections`,
        );
        assert.equal(new Set(middle).size, middle.length, "no section repeats");
        for (const type of middle)
          assert.ok(pool.includes(type), `${type} is not eligible`);
        assert.deepEqual([...chart.eligibleSections].sort(), [...pool].sort());
      }
    });
  }

  it("rejects a pool that is too small, unknown, or duplicated, and writes nothing", () => {
    for (const bad of [
      "manifesto",
      "manifesto,manifesto",
      "manifesto,press,gallery",
      "hero,manifesto",
      "",
    ]) {
      const history = join(fresh("hist"), "history.json");
      const project = makeProject();
      const res = roll([
        "--out",
        project,
        "--history",
        history,
        "--sections",
        bad,
      ]);
      assert.notEqual(
        res.status,
        0,
        `--sections ${JSON.stringify(bad)} should fail`,
      );
      assert.ok(res.stderr.length > 0, "failure explains itself on stderr");
      assert.equal(existsSync(history), false);
      assert.equal(existsSync(join(project, "stoicism.chart.json")), false);
    }
  });
});

describe("damaged history", () => {
  const damaged = {
    "invalid JSON": "{ not json",
    "builds that is not a list": JSON.stringify({
      schemaVersion: 1,
      builds: "nope",
    }),
    "a bare array": JSON.stringify([]),
  };

  for (const [name, content] of Object.entries(damaged)) {
    it(`fails on ${name} instead of resetting it`, () => {
      const history = join(fresh("hist"), "history.json");
      writeFileSync(history, content);
      const project = makeProject();
      const legacy = writeLegacy("old.chart.json", "legacy-damaged");

      for (const args of [
        ["--out", project, "--history", history],
        ["--history", history],
        ["--remember", legacy, "--history", history],
      ]) {
        const res = roll(args);
        assert.notEqual(res.status, 0, `roll ${args.join(" ")} should fail`);
        assert.ok(res.stderr.length > 0);
        assert.equal(
          readFileSync(history, "utf8"),
          content,
          "damaged history is left exactly as found",
        );
      }
      assert.equal(
        existsSync(join(project, "stoicism.chart.json")),
        false,
        "no site is written on a failed roll",
      );
    });
  }
});

describe("structural novelty boundaries", () => {
  const base = {
    schemaVersion: 2,
    seed: "baseline",
    composition: LEGACY_COMPOSITION,
    sections: ["hero", "manifesto", "orders", "finale"].map((type) => ({
      type,
    })),
  };

  it("cannot earn novelty from cosmetic changes or an unused collection mode", () => {
    const prior = recordChart(base);
    const cosmetic = {
      ...base,
      seed: "new-name-and-ink",
      palette: { paper: "#ffffff" },
      composition: { ...base.composition, collection: "catalog" },
    };
    assert.equal(recordChart(cosmetic).fingerprint, prior.fingerprint);
    assert.equal(
      compareNovelty(recordChart(cosmetic), [prior]).accepted,
      false,
    );
    const twoActive = {
      ...cosmetic,
      composition: {
        ...cosmetic.composition,
        hero: "diptych",
        ending: "split",
      },
    };
    assert.equal(
      compareNovelty(recordChart(twoActive), [prior]).accepted,
      false,
    );
    const threeActive = {
      ...twoActive,
      composition: { ...twoActive.composition, navigation: "rail" },
    };
    assert.equal(
      compareNovelty(recordChart(threeActive), [prior]).accepted,
      true,
    );
  });

  it("rejects an exact old structure even when it is outside the recent comparison window", () => {
    const old = recordChart(base);
    const recent = recordChart({
      ...base,
      seed: "recent",
      composition: {
        ...base.composition,
        hero: "index",
        ending: "split",
        navigation: "rail",
        rhythm: "compact",
      },
    });
    const rebranded = recordChart({ ...base, seed: "rebranded" });
    assert.equal(
      compareNovelty(rebranded, Array.of(old, ...Array(6).fill(recent)))
        .accepted,
      false,
    );
  });
});

describe("existing project protection", () => {
  it("does not overwrite a reserved design with a fresh seed or a changed pool", () => {
    const history = join(fresh("hist"), "history.json");
    const { project, chart } = freshRoll(history, [
      "--sections",
      "manifesto,colonnade",
    ]);
    const before = readFileSync(join(project, "stoicism.chart.json"), "utf8");
    const ledger = readFileSync(history, "utf8");
    for (const extra of [
      [],
      ["--seed", "different-seed"],
      ["--seed", chart.seed, "--sections", "manifesto,press"],
    ]) {
      const result = roll(["--out", project, "--history", history, ...extra]);
      assert.notEqual(result.status, 0);
      assert.equal(
        readFileSync(join(project, "stoicism.chart.json"), "utf8"),
        before,
      );
      assert.equal(readFileSync(history, "utf8"), ledger);
    }
    rollOk(["--seed", chart.seed, "--out", project, "--history", history]);
    assert.deepEqual(selectedDesign(readChart(project)), selectedDesign(chart));
  });

  it("refuses to regenerate a legacy project using the new generator", () => {
    const project = makeProject("legacy-project");
    const old = legacyChart("legacy-seed");
    const file = join(project, "stoicism.chart.json");
    writeFileSync(file, JSON.stringify(old));
    const before = readFileSync(file, "utf8");
    const history = join(fresh("hist"), "history.json");
    const result = roll([
      "--seed",
      old.seed,
      "--out",
      project,
      "--history",
      history,
    ]);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(file, "utf8"), before);
    assert.equal(existsSync(history), false);
  });
});

it("an explicit known baseline does not displace an older recent build from comparison", () => {
  const history = join(fresh("hist"), "history.json");
  const builds = Array.from({ length: 5 }, () => freshRoll(history));
  const latest = builds.at(-1);
  const { chart } = freshRoll(history, [
    "--against",
    join(latest.project, "stoicism.chart.json"),
  ]);
  assert.deepEqual(
    chart.novelty.comparisons.map((item) => item.seed).sort(),
    builds.map((build) => build.chart.seed).sort(),
  );
});
