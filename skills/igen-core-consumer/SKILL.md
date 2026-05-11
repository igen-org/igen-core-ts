---
name: igen-core-consumer
description: Use this skill when integrating the @igen/core TypeScript package into another project, including installing it, parsing and validating HLA alleles, building HLA haplotypes, using HLA locus enums, ApiError, LoggerService, or Singleton without inspecting the core source repository.
---

# @igen/core Consumer

Use `@igen/core` for shared iGen TypeScript domain primitives. Prefer this skill over opening the package repo for routine consumer integrations.

## Workflow

1. Install the package with the target repo's package manager:

```bash
pnpm add @igen/core
```

Use `npm install @igen/core` or `yarn add @igen/core` when the target repo does not use pnpm.

2. Import from the root package unless the target project intentionally uses subpath imports:

```typescript
import { HlaAllele, HlaHaplotype, HlaLocus } from '@igen/core';
```

Available subpaths are `@igen/core/domain`, `@igen/core/enum`, `@igen/core/error`, `@igen/core/service`, and `@igen/core/singleton`.

3. Treat parser methods as `Result`-returning APIs from `@igen/shared`: check `result.ok` before reading `result.value`.

```typescript
import { HlaAllele } from '@igen/core';

const alleleResult = HlaAllele.fromString('A*01:01:01');
if (!alleleResult.ok) {
    throw alleleResult.error;
}

const allele = alleleResult.value;
```

4. Do not recreate HLA parsing, DRB345 normalization, enum singleton lists, logger wrappers, or API error wrappers locally; use this package's exported classes.

## Common Patterns

Parse and inspect an allele:

```typescript
import { HlaAllele, HlaLocus } from '@igen/core';

const result = HlaAllele.fromString('B3*02:01');
if (!result.ok) {
    throw result.error;
}

const allele = result.value;
const isDrb3 = allele.locus === HlaLocus.DRB3;
const label = allele.displaySpecificity();
```

Create a haplotype from `+`-separated alleles:

```typescript
import { HlaHaplotype, HlaLocus } from '@igen/core';

const result = HlaHaplotype.create('A*01:01+B*08:01');
if (!result.ok) {
    throw result.error;
}

const haplotype = result.value;
const aAllele = haplotype.get(HlaLocus.A);
```

Use HLA loci and groups:

```typescript
import { HlaLocus } from '@igen/core';

const classTwoLoci = HlaLocus.values.filter((locus) => locus.isClassII);
```

Use the logger service:

```typescript
import { LoggerService } from '@igen/core';

const logger = new LoggerService({ name: 'my-feature', level: 'info' }).getLogger();
logger.info('Loaded feature data');
```

Wrap API failures:

```typescript
import { ApiError } from '@igen/core';

throw new ApiError('Failed to load records', 502, error);
```

## Important Behavior

- Allele parsing accepts standard forms like `A*01:01`, higher-resolution forms like `A*01:01:01`, DRB345 aliases `B3`, `B4`, `B5`, `NEGATIVE`, `NEGATIVO`, `MISSING`, `AUSENTE`, and `?`.
- `HlaAllele.fromString`, `HlaAllele.getLocus`, `HlaAllele.getSpecificity`, `HlaHaplotype.create`, `HlaLocus.fromValue`, and `HlaLocusGroup.fromValue` return `Result` objects.
- `HlaHaplotype` is immutable: `set`, `swap`, `swapAll`, `clone`, and `concat` return new haplotype instances or the original instance for a no-op.
- `HlaHaplotype` stores `DRB3`, `DRB4`, `DRB5`, and `DRB345` under the DRB345 key. Use `get(locus, true)` when exact DRB3/4/5 matching matters.
- `LoggerService` reuses one service instance per logger name.

## Detailed Reference

Read [references/api.md](references/api.md) when you need method names, exported type names, enum values, or edge-case behavior.
