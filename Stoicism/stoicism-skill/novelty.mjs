// Novelty policy for the Stoicism skill: canonical fingerprints, persistent history, and
// admission of a candidate composition against previous builds. Dependency-free Node.
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

const HISTORY_VERSION = 1;

export const AXES = {
  hero: ["monument", "diptych", "broadside", "aperture", "index"],
  collection: ["portico", "editorial", "catalog"],
  ending: ["facade", "colophon", "split"],
  navigation: ["chapters", "masthead", "rail"],
  rhythm: ["processional", "editorial", "compact"],
};
const AXIS_NAMES = Object.keys(AXES);
const SECTION_TYPES = [
  "hero",
  "manifesto",
  "colonnade",
  "orders",
  "press",
  "ascent",
  "finale",
];

// What every chart generated before composition existed looked like.
const LEGACY_COMPOSITION = {
  hero: "monument",
  collection: "portico",
  ending: "facade",
  navigation: "chapters",
  rhythm: "processional",
};

const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

function validateComposition(composition) {
  if (!isObject(composition)) throw new Error("composition must be an object");
  for (const key of Object.keys(composition)) {
    if (!AXIS_NAMES.includes(key))
      throw new Error(`composition has unknown axis "${key}"`);
  }
  const out = {};
  for (const axis of AXIS_NAMES) {
    const value = composition[axis];
    if (!AXES[axis].includes(value)) {
      throw new Error(
        `composition.${axis} must be one of ${AXES[axis].join(" | ")}, got ${JSON.stringify(value)}`,
      );
    }
    out[axis] = value;
  }
  return out;
}

function sectionTypesOf(chart) {
  let types;
  if (Array.isArray(chart.sections)) {
    types = chart.sections.map((s, i) => {
      if (!isObject(s)) throw new Error(`sections[${i}] must be an object`);
      return s.type;
    });
  } else if (Array.isArray(chart.sectionTypes)) {
    types = chart.sectionTypes;
  } else {
    throw new Error('chart needs a "sections" array or a "sectionTypes" array');
  }
  if (!types.length) throw new Error("section types must not be empty");
  for (const t of types) {
    if (!SECTION_TYPES.includes(t))
      throw new Error(`unknown section type ${JSON.stringify(t)}`);
  }
  return [...types];
}

// The collection axis only exists when there is a colonnade; otherwise it is omitted so that
// changing it cannot manufacture a unique fingerprint.
function fingerprintOf(composition, sectionTypes) {
  const colonnade = sectionTypes.includes("colonnade");
  return JSON.stringify({
    composition: AXIS_NAMES.filter(
      (axis) => axis !== "collection" || colonnade,
    ).map((axis) => [axis, composition[axis]]),
    sections: sectionTypes,
  });
}

/**
 * Normalize a chart (generated chart.ts data, chart JSON, legacy chart, or an existing history
 * record) into {seed, fingerprint, composition, sectionTypes}. Throws on anything malformed.
 * Charts without schemaVersion 2 are legacy and get the old composition; a schemaVersion 2 chart
 * must carry a valid composition.
 */
export function recordChart(chart) {
  if (!isObject(chart)) throw new Error("chart must be an object");
  if (typeof chart.seed !== "string" || !chart.seed)
    throw new Error("chart.seed must be a non-empty string");
  const sectionTypes = sectionTypesOf(chart);

  const version = chart.schemaVersion;
  let composition;
  if (version === 2) {
    composition = validateComposition(chart.composition);
  } else if (version === undefined || version === 1) {
    composition =
      chart.composition === undefined
        ? { ...LEGACY_COMPOSITION }
        : validateComposition(chart.composition);
  } else {
    throw new Error(
      `unsupported chart schemaVersion ${JSON.stringify(version)}`,
    );
  }

  const fingerprint = fingerprintOf(composition, sectionTypes);
  if (chart.fingerprint !== undefined && chart.fingerprint !== fingerprint) {
    throw new Error(
      `fingerprint does not match composition and sectionTypes (seed ${chart.seed})`,
    );
  }
  return { seed: chart.seed, fingerprint, composition, sectionTypes };
}

function validateRecord(record, index) {
  try {
    if (!isObject(record)) throw new Error("record must be an object");
    if (typeof record.fingerprint !== "string")
      throw new Error("record.fingerprint is required");
    if (record.schemaVersion !== undefined && record.schemaVersion !== 2) {
      throw new Error(
        `unsupported record schemaVersion ${JSON.stringify(record.schemaVersion)}`,
      );
    }
    // Records are always explicit: a missing composition must never fall back to the legacy one.
    validateComposition(record.composition);
    return recordChart(record);
  } catch (error) {
    throw new Error(`history record ${index}: ${error.message}`);
  }
}

/** Load saved records. Missing file is an empty history; anything else malformed throws. */
export function loadHistory(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw new Error(`cannot read novelty history ${path}: ${error.message}`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(
      `novelty history ${path} is not valid JSON: ${error.message}`,
    );
  }
  if (!isObject(data) || data.schemaVersion !== HISTORY_VERSION) {
    throw new Error(
      `novelty history ${path} has unsupported schemaVersion ${JSON.stringify(data?.schemaVersion)} (expected ${HISTORY_VERSION})`,
    );
  }
  if (!Array.isArray(data.builds))
    throw new Error(`novelty history ${path} has no "builds" array`);
  try {
    return data.builds.map(validateRecord);
  } catch (error) {
    throw new Error(`novelty history ${path} is invalid: ${error.message}`);
  }
}

/** Write {schemaVersion:1, builds} via temp file + rename, creating parent directories. */
export function saveHistory(path, records) {
  if (!Array.isArray(records)) throw new Error("records must be an array");
  const builds = records.map((r, i) => {
    const record = validateRecordShape(r, i);
    return {
      seed: record.seed,
      fingerprint: record.fingerprint,
      composition: record.composition,
      sectionTypes: record.sectionTypes,
    };
  });
  mkdirSync(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  try {
    writeFileSync(
      temp,
      `${JSON.stringify({ schemaVersion: HISTORY_VERSION, builds }, null, 2)}\n`,
    );
    renameSync(temp, path);
  } catch (error) {
    rmSync(temp, { force: true });
    throw new Error(`cannot write novelty history ${path}: ${error.message}`);
  }
}

// Saved records come from recordChart(); re-normalizing keeps corrupt data out of the file.
function validateRecordShape(record, index) {
  try {
    return recordChart(record);
  } catch (error) {
    throw new Error(`record ${index}: ${error.message}`);
  }
}

const hasColonnade = (record) => record.sectionTypes.includes("colonnade");

/** Axes that count when comparing two records; collection only if both have a colonnade. */
function activeAxes(a, b) {
  const both = hasColonnade(a) && hasColonnade(b);
  return AXIS_NAMES.filter((axis) => axis !== "collection" || both);
}

/**
 * Admit or reject a candidate. previousRecords is chronological, newest last.
 *  - exact fingerprint seen anywhere in history: reject
 *  - latest build: >= 3 changed active axes and a different hero
 *  - the 4 before it: >= 2 changed active axes
 * comparisons lists the latest five builds, newest first.
 */
export function compareNovelty(candidateRecord, previousRecords) {
  const candidate = recordChart(candidateRecord);
  const previous = previousRecords.map((r, i) => validateRecordShape(r, i));
  const reasons = [];

  for (const prior of previous) {
    if (prior.fingerprint === candidate.fingerprint) {
      reasons.push(`exact fingerprint already used by seed ${prior.seed}`);
    }
  }

  const comparisons = [];
  const recent = previous.slice(-5).reverse();
  recent.forEach((prior, i) => {
    const required = i === 0 ? 3 : 2;
    const changedAxes = activeAxes(candidate, prior).filter(
      (axis) => candidate.composition[axis] !== prior.composition[axis],
    );
    comparisons.push({ seed: prior.seed, changedAxes, required });
    if (changedAxes.length < required) {
      reasons.push(
        `only ${changedAxes.length} active axes differ from seed ${prior.seed} (${changedAxes.join(", ") || "none"}); need ${required}`,
      );
    }
    if (i === 0 && candidate.composition.hero === prior.composition.hero) {
      reasons.push(
        `hero "${candidate.composition.hero}" repeats the previous build (seed ${prior.seed})`,
      );
    }
  });

  return { accepted: reasons.length === 0, comparisons, reasons };
}
