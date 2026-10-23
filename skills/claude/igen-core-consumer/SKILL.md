---
name: igen-core-consumer
description: >-
  Integrate @igen/core (shared IGEN TypeScript HLA primitives) into another project: installing it,
  parsing and validating HLA alleles (HlaAllele), building and editing haplotypes (HlaHaplotype),
  HLA locus/group/class/chain enums, DRB3/4/5 (DRB345) handling, resolution and display helpers,
  ApiError, LoggerService, and Singleton. Use when writing or reviewing consumer code that touches
  HLA allele strings or these exports. Do not use for changing the @igen/core library source itself.
---

# Consuming @igen/core

`@igen/core` is the shared source of truth for HLA allele parsing and HLA locus metadata across IGEN
TypeScript projects. Use its exports instead of writing local regexes, locus lists, DRB345 alias
tables, logger wrappers, or HTTP error classes. Everything you need is in this skill and
[references/api.md](references/api.md); you should not need to open the package source.

## Setup

```bash
pnpm add @igen/core   # or npm install / yarn add, matching the target repo
```

The package is ESM-only (`"type": "module"`) and is published to the internal Nexus registry, so the
target repo's `.npmrc` must resolve the `@igen` scope there. It depends on `@igen/shared`, which
provides the `Result` type returned by parsers.

Import from the root. Subpaths (`@igen/core/domain`, `/enum`, `/error`, `/service`, `/singleton`)
exist but only matter if the target project already uses them.

```ts
import { HlaAllele, HlaHaplotype, HlaLocus } from '@igen/core';
```

## Rule 1: parsers return `Result`, so check `ok` first

`HlaAllele.fromString`, `getLocus`, `getLocusStr`, `getSpecificity`, `asResolution`,
`HlaHaplotype.create`, `HlaLocus.fromValue` and `HlaLocusGroup.fromValue` never throw on bad input.
They return `{ ok: true, value } | { ok: false, error }`.

```ts
const parsed = HlaAllele.fromString(input);
if (!parsed.ok) {
    return parsed; // or: throw parsed.error / map to a 400
}
const allele = parsed.value;
```

Never read `.value` without narrowing on `.ok`. For a quick boolean check without building an object,
use `HlaAllele.isValidAllele(input)`.

### These do throw

Some calls throw an `Error`, so wrap them when the input is untrusted:

- `new HlaAllele(...)` with an invalid specificity. Prefer `fromString`.
- `haplotype.get(locus)`, `set(locus, …)` and `has(locus)` when `locus` is an unknown string.
  Pass `HlaLocus.X` constants instead of raw strings.
- `allele.contains('some string')` when the string does not parse.

## Common tasks

Parse and inspect an allele:

```ts
const result = HlaAllele.fromString('B3*02:01');
if (!result.ok) throw result.error;

const a = result.value;
a.locus === HlaLocus.DRB3;   // true. B3/B4/B5 are aliases for DRB3/4/5
a.allele;                    // 'DRB3*02:01'
a.displaySpecificity();      // 'B3*02:01'
a.isClassII;                 // true
```

Build a haplotype from a `+`-separated string (whitespace around `+` is trimmed):

```ts
const hap = HlaHaplotype.create('A*01:01 + B*08:01 + DRB1*03:01');
if (!hap.ok) throw hap.error;

hap.value.get(HlaLocus.A)?.toString();  // 'A*01:01'
hap.value.has(HlaLocus.C);              // false
```

`HlaHaplotype` is immutable, so keep the return value:

```ts
const updated = hap.value.set(HlaLocus.C, cAllele); // new instance
const [h1, h2] = hapA.swap(hapB, HlaLocus.DRB1);    // swapped copies
```

Filter loci by class or group:

```ts
const classII = HlaLocus.values.filter((l) => l.isClassII);
const drLoci = HlaLocus.values.filter((l) => l.groups.includes(HlaLocusGroup.DR));
```

Logger and API errors:

```ts
const logger = new LoggerService({ name: 'matching', level: 'info' }).getLogger();
logger.info('loaded', count);

throw new ApiError('Upstream failed', 502, originalError);
```

## Domain behavior to keep in mind

- **Accepted input:** `A*01`, `A*01:01`, `A*01:01:01:01`, MAC codes (`A*01:AB`), expression suffixes
  (`A*01:01N`, `L`, `Q`), DRB345 aliases (`B3*`, `B4*`, `B5*`), and the sentinels `NEGATIVE`,
  `NEGATIVO`, `MISSING`, `AUSENTE`, `?`. Locus parsing is case-insensitive. A string with no `*`
  (`A0101`) is rejected.
- **Sentinels:** a bare `NEGATIVE`/`MISSING` (and their Portuguese forms) parses as a **DRB345**
  allele. Check `isNegative` / `isMissing` before treating it as a real typing.
- **DRB345 slot:** a haplotype stores DRB3, DRB4, DRB5 and DRB345 in a single slot.
  `get(HlaLocus.DRB4)` returns whatever DRB3/4/5 allele is stored. Pass `exact = true`
  (`get(HlaLocus.DRB4, true)`) when the specific gene matters.
- **Silent no-op:** `set(locus, allele)` returns the *same* instance, unchanged, when the allele's
  locus does not match `locus` (after DRB345 normalization). Compare identity if you need to detect
  this.
- **Resolution flags:** `isLowResolution` means 1 field. `isMidResolution` means 2 fields with a MAC
  code. `isHighResolution` means 2 or more fields without a MAC code (so `A*01:01` counts as high).
- **Display:** `display()` and `displaySpecificity()` truncate to `displayFieldCount` (default 2)
  unless the allele has a suffix. Pass `forceTruncate = true` to truncate anyway and `keepSuffix = true`
  to re-append the suffix. Change the width with `withDisplayFieldCount(n)`.
- **`contains(other)`** is a prefix check (`A*01:01:01` contains `A*01:01`). It always returns
  `false` when either side has a MAC code.
- **`asResolution(n)`** truncates to the first `n` fields (`A*01:01:01N` → `A*01:01N`, or `A*01:01`
  with `keepSuffix = false`). It errors for `n < 1` and returns a clone when `n` exceeds `fieldCount`.
- **LoggerService** caches one instance per `name`. A second `new LoggerService({ name: 'x', level: 'debug' })`
  returns the first instance with its original level and adapter. Inject `adapterFactory` to route
  logs to pino/winston/Nest or to capture them in tests.
- **Singleton:** extend it (with a `protected`/`public` constructor) to get one instance per concrete
  subclass.

## Review checklist for consumer code

- No hand-written HLA regexes, locus arrays, or `B3`→`DRB3` maps. Use `HlaAllele` / `HlaLocus`.
- Every `Result` is narrowed on `.ok` before `.value` is read.
- Locus arguments use `HlaLocus.X` constants, not strings, in `get`/`set`/`has`.
- DRB3/4/5 lookups that must be gene-specific pass `exact = true`.
- Haplotype mutations keep the returned instance.
- Negative/missing sentinels are handled explicitly.

For the full list of signatures, exported types and enum values, read
[references/api.md](references/api.md).
