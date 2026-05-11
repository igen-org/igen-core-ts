# @igen/core API Reference

Package: `@igen/core`

Root exports:

```typescript
export {
    HlaAllele,
    HlaHaplotype,
    HlaLocus,
    HlaLocusChain,
    HlaLocusClass,
    HlaLocusEnum,
    HlaLocusGroup,
    HlaLocusGroupEnum,
    ApiError,
    LoggerService,
    Singleton,
};

export type {
    AlleleInput,
    HlaAlleleConstructor,
    HlaAlleleLike,
    HlaHaplotypeConstructor,
    HlaHaplotypeLike,
    LocusInput,
    LogLevel,
    LoggerAdapter,
    LoggerAdapterFactory,
    LoggerServiceOptions,
};
```

Subpath exports:

- `@igen/core/domain`
- `@igen/core/enum`
- `@igen/core/error`
- `@igen/core/service`
- `@igen/core/singleton`

## Result Handling

Parsing and lookup methods return `Result<T, Error>` from `@igen/shared`.

```typescript
const parsed = HlaAllele.fromString(input);
if (!parsed.ok) {
    return parsed;
}

const allele = parsed.value;
```

Avoid `parsed.value` without an `ok` guard.

## HlaAllele

Create from strings with `HlaAllele.fromString(value)`.

Accepted examples:

- `A*01:01`
- `A*01:01:01`
- `A*01:AB` for MAC-code-style final fields
- `A*01:01N`, `A*01:01L`, `A*01:01Q` for suffixes
- `B3*02:01`, `B4*01:01`, `B5*01:01` as aliases for `DRB3`, `DRB4`, `DRB5`
- `NEGATIVE`, `NEGATIVO`, `MISSING`, `AUSENTE`, `?`

Rejected example: `A0101` because allele strings must contain `*`.

Static methods:

- `fromString(allele: string): Result<HlaAllele, Error>`
- `getLocusStr(allele: string): Result<string, Error>`
- `getLocus(allele: string): Result<HlaLocus, Error>`
- `getSpecificity(allele: string): Result<string, Error>`
- `getFieldCount(specificity: string): number`
- `getMacCode(specificity: string): string | null`
- `getSuffix(specificity: string): string | null`
- `isValidAllele(allele: string): boolean`

Instance properties:

- `locus: HlaLocus`
- `specificity: string`
- `fieldCount: number`
- `macCode: string | null`
- `displayFieldCount: number`
- `suffix: string | null`
- `allele: string`
- `hasMacCode: boolean`
- `hasSuffix: boolean`
- `isDrb345: boolean`
- `isNegative: boolean`
- `isMissing: boolean`
- `isClassI: boolean`
- `isClassII: boolean`
- `allelicGroup: string`
- `isNull: boolean`
- `isLow: boolean`
- `isQuestionable: boolean`
- `isLowResolution: boolean`
- `isMidResolution: boolean`
- `isHighResolution: boolean`

Instance methods:

- `clone(): HlaAllele`
- `toString(): string`
- `display(forceTruncate = false, keepSuffix = false): string`
- `displaySpecificity(forceTruncate = false, keepSuffix = false): string`
- `contains(other: HlaAllele | string): boolean`
- `withDisplayFieldCount(value: number): HlaAllele`
- `withoutSuffix(): HlaAllele`
- `asResolution(nField: number, keepSuffix = true): Result<HlaAllele, Error>`

Notes:

- `displaySpecificity()` returns DRB345 aliases as `B3*...`, `B4*...`, or `B5*...` when applicable.
- `contains` returns `false` when either allele has a MAC code.
- `asResolution(nField)` errors when `nField < 1`; when `nField` is greater than the allele field count it returns a clone.

## HlaHaplotype

Create with `HlaHaplotype.create(...)` from a `+`-separated string, an iterable of `HlaAlleleLike`, or another `HlaHaplotype`.

```typescript
const result = HlaHaplotype.create('A*01:01+B*08:01');
if (!result.ok) {
    throw result.error;
}

const haplotype = result.value;
```

Types:

- `AlleleInput = Iterable<HlaAlleleLike> | HlaHaplotype | string`
- `LocusInput = HlaLocus | string`

Methods:

- `static create(alleles: AlleleInput): Result<HlaHaplotype, Error>`
- `get(locus: LocusInput, exact = false): HlaAlleleLike | null`
- `set(locus: LocusInput, allele: HlaAlleleLike): HlaHaplotype`
- `has(locus: LocusInput, exact = false): boolean`
- `swap(haplotype: HlaHaplotype, locus: LocusInput): [HlaHaplotype, HlaHaplotype]`
- `swapAll(haplotype: HlaHaplotype, loci: LocusInput[]): [HlaHaplotype, HlaHaplotype]`
- `clone(): HlaHaplotype`
- `concat(haplotype: HlaHaplotype): HlaHaplotype`
- `toString(): string`
- `[Symbol.iterator](): Iterator<HlaAlleleLike>`

Properties:

- `alleles: HlaAlleleLike[]`

DRB345 behavior:

- `DRB3`, `DRB4`, `DRB5`, and `DRB345` are normalized to the `DRB345` map key.
- `get(HlaLocus.DRB345)` returns whichever DRB345-family allele is stored.
- `get(HlaLocus.DRB4, true)` returns `null` when the stored allele is DRB3 or DRB5.
- `set(locus, allele)` is a no-op and returns the same instance when the normalized locus does not match the allele locus.

## HLA Enums

`HlaLocusEnum` values:

```typescript
{
    A: 'A',
    B: 'B',
    C: 'C',
    DRB1: 'DRB1',
    DRB3: 'DRB3',
    DRB4: 'DRB4',
    DRB5: 'DRB5',
    DRB345: 'DRB345',
    DQB1: 'DQB1',
    DQA1: 'DQA1',
    DPB1: 'DPB1',
    DPA1: 'DPA1',
}
```

`HlaLocus` singleton properties:

- `HlaLocus.A`, `B`, `C`
- `HlaLocus.DRB1`, `DRB3`, `DRB4`, `DRB5`, `DRB345`
- `HlaLocus.DQB1`, `DQA1`, `DPB1`, `DPA1`
- `HlaLocus.values`

`HlaLocus` properties and methods:

- `value`
- `groups`
- `chainType`
- `fromValue(value: string): Result<HlaLocus, Error>`
- `toString(): string`
- `isDrb345`
- `isAlpha`
- `isBeta`
- `isClassI`
- `isClassII`

`HlaLocusGroupEnum` values:

```typescript
{
    A: 'A',
    B: 'B',
    C: 'C',
    DR: 'DR',
    DRB345: 'DRB345',
    DQ: 'DQ',
    DP: 'DP',
}
```

`HlaLocusGroup` singleton properties:

- `HlaLocusGroup.A`, `B`, `C`, `DR`, `DRB345`, `DQ`, `DP`
- `HlaLocusGroup.values`

`HlaLocusGroup` properties and methods:

- `value`
- `hasAlpha`
- `hasBeta`
- `classification`
- `fromValue(value: HlaLocusGroupEnum): Result<HlaLocusGroup, Error>`
- `isClassI`
- `isClassII`

Other enum objects:

- `HlaLocusClass = { I: 'I', II: 'II' }`
- `HlaLocusChain = { ALPHA: 'ALPHA', BETA: 'BETA' }`

## ApiError

```typescript
import { ApiError } from '@igen/core';

throw new ApiError('Failed to fetch data', 502, originalError);
```

Constructor:

- `new ApiError(message: string, statusCode = 500, fromException?: unknown)`

Properties:

- `name = 'ApiError'`
- `statusCode: number`
- `cause: unknown`

`toString()` includes the message, status code, and nested causes when present.

## LoggerService

```typescript
import { LoggerService, type LoggerAdapter } from '@igen/core';

const service = new LoggerService({ name: 'feature', level: 'warn' });
const logger = service.getLogger();
```

Types:

- `LogLevel = 'debug' | 'info' | 'warn' | 'error'`
- `LoggerAdapter = { debug(...args), info(...args), warn(...args), error(...args) }`
- `LoggerAdapterFactory = (name: string, level: LogLevel) => LoggerAdapter`
- `LoggerServiceOptions = { name?: string; level?: LogLevel; adapterFactory?: LoggerAdapterFactory }`

Behavior:

- Default name is `app`.
- Default level is `info`.
- The default adapter logs to `console` with `[name]` prefix.
- Instances are cached by logger name. A second `new LoggerService({ name: 'same' })` returns the first instance.
- Inject `adapterFactory` in tests or when routing logs to a framework logger.

## Singleton

Extend `Singleton` when a class should reuse one instance per subclass constructor.

```typescript
import { Singleton } from '@igen/core';

class AppRegistry extends Singleton {
    public readonly values = new Map<string, unknown>();
}

const one = new AppRegistry();
const two = new AppRegistry();
// one === two
```

The protected constructor returns the existing instance for the concrete subclass.
