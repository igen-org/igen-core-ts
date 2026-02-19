import { err, ok, type Result } from '@igen/shared';
import { HlaLocus } from '../enum/hla-locus.js';

const LOCUS_DISPLAY_MAP = new Map<HlaLocus, string>([
    [HlaLocus.DRB3, 'B3'],
    [HlaLocus.DRB4, 'B4'],
    [HlaLocus.DRB5, 'B5'],
    [HlaLocus.DRB345, ''],
]);

const LOCUS_ALTERNATIVE_MAP = {
    B3: HlaLocus.DRB3,
    B4: HlaLocus.DRB4,
    B5: HlaLocus.DRB5,
} as const;

type LocusAlternativeMapKey = keyof typeof LOCUS_ALTERNATIVE_MAP;

const NEGATIVE_SPECIFICITIES = new Set(['NEGATIVO', 'NEGATIVE']);
const MISSING_SPECIFICITIES = new Set(['AUSENTE', 'MISSING']);
const SPECIFICITY_EXCEPTIONS = new Set([...NEGATIVE_SPECIFICITIES, ...MISSING_SPECIFICITIES, '?']);
const SPECIFICITY_REGEX = /^\d{2,}((:[A-Z]{2,})|(:\d{2,}[A-Z]?)*)$/i;

const isBlank = (value: string | null | undefined): boolean => value === undefined || value === null || value.trim() === '';

const isValidSpecificity = (specificity: string): boolean => {
    const normalized = specificity.toUpperCase();
    if (SPECIFICITY_EXCEPTIONS.has(normalized)) {
        return true;
    }

    return SPECIFICITY_REGEX.test(specificity);
};

const parseLocus = (locus: string): Result<HlaLocus, Error> => {
    const normalized = locus.toUpperCase();
    const parsedResult = HlaLocus.fromValue(normalized);
    if (parsedResult.ok) {
        return parsedResult;
    }

    if (Object.hasOwn(LOCUS_ALTERNATIVE_MAP, normalized)) {
        const alternative = LOCUS_ALTERNATIVE_MAP[normalized as LocusAlternativeMapKey];
        return ok(alternative);
    }

    return err(new Error(`Unknown locus: ${normalized}`));
};

const extractAlleleParts = (allele: string): Result<[string, string], Error> => {
    const normalized = allele.trim().toUpperCase();

    if (NEGATIVE_SPECIFICITIES.has(normalized) || MISSING_SPECIFICITIES.has(normalized)) {
        return ok(['DRB345', normalized]);
    }

    if (!allele.includes('*')) {
        return err(new Error(`Allele must contain '*': ${allele}`));
    }

    const [locus, specificity] = allele.split('*', 2);
    if (locus === undefined || specificity === undefined) {
        return err(new Error(`Invalid allele: ${allele}`));
    }

    return ok([locus, specificity]);
};

export interface HlaAlleleLike {
    readonly locus: HlaLocus;
    readonly specificity: string;
    readonly fieldCount: number;
    readonly macCode: string | null;
    readonly displayFieldCount: number;
    readonly suffix: string | null;
    readonly allele: string;
    readonly hasMacCode: boolean;
    readonly hasSuffix: boolean;
    readonly isDrb345: boolean;
    readonly isNegative: boolean;
    readonly isMissing: boolean;
    readonly isClassI: boolean;
    readonly isClassII: boolean;
    readonly allelicGroup: string;
    readonly isNull: boolean;
    readonly isLow: boolean;
    readonly isQuestionable: boolean;
    readonly isLowResolution: boolean;
    readonly isMidResolution: boolean;
    readonly isHighResolution: boolean;

    clone(): HlaAllele;
    toString(): string;
    display(forceTruncate?: boolean, keepSuffix?: boolean): string;
    displaySpecificity(forceTruncate?: boolean, keepSuffix?: boolean): string;
    contains(other: HlaAllele | string): boolean;
    withDisplayFieldCount(value: number): HlaAllele;
    withoutSuffix(): HlaAllele;
    asResolution(nField: number, keepSuffix?: boolean): Result<HlaAllele, Error>;
}

export class HlaAllele implements HlaAlleleLike {
    public readonly locus: HlaLocus;
    public readonly specificity: string;
    public readonly fieldCount: number;
    public readonly macCode: string | null;
    public readonly displayFieldCount: number;
    public readonly suffix: string | null;

    public constructor(
        locus: HlaLocus,
        specificity: string,
        fieldCount: number,
        macCode: string | null,
        displayFieldCount: number = 2,
        suffix: string | null = null
    ) {
        if (!isValidSpecificity(specificity)) {
            throw new Error(`Invalid specificity: ${specificity}`);
        }

        this.locus = locus;
        this.specificity = specificity;
        this.fieldCount = fieldCount;
        this.macCode = macCode;
        this.displayFieldCount = displayFieldCount;
        this.suffix = suffix;
    }

    public static fromString(allele: string): Result<HlaAllele, Error> {
        const partsResult = extractAlleleParts(allele);
        if (!partsResult.ok) {
            return partsResult;
        }

        const [locusToken, specificity] = partsResult.value;
        const locusResult = parseLocus(locusToken);
        if (!locusResult.ok) {
            return locusResult;
        }

        const fieldCount = HlaAllele.getFieldCount(specificity);
        const macCode = HlaAllele.getMacCode(specificity);
        const suffix = HlaAllele.getSuffix(specificity);

        try {
            return ok(new HlaAllele(locusResult.value, specificity, fieldCount, macCode, 2, suffix));
        } catch (error) {
            return err(error instanceof Error ? error : new Error(String(error)));
        }
    }

    public static getLocusStr(allele: string): Result<string, Error> {
        const partsResult = extractAlleleParts(allele);
        if (!partsResult.ok) {
            return partsResult;
        }

        return ok(partsResult.value[0]);
    }

    public static getLocus(allele: string): Result<HlaLocus, Error> {
        const locusResult = HlaAllele.getLocusStr(allele);
        if (!locusResult.ok) {
            return locusResult;
        }

        return parseLocus(locusResult.value);
    }

    public static getSpecificity(allele: string): Result<string, Error> {
        const partsResult = extractAlleleParts(allele);
        if (!partsResult.ok) {
            return partsResult;
        }

        return ok(partsResult.value[1]);
    }

    public static getFieldCount(specificity: string): number {
        return specificity.split(':').length;
    }

    public static getMacCode(specificity: string): string | null {
        const lastField = specificity.split(':').at(-1);
        if (lastField === undefined) {
            return null;
        }

        return lastField.length >= 2 && /^[A-Za-z]+$/.test(lastField) ? lastField.toUpperCase() : null;
    }

    public static getSuffix(specificity: string): string | null {
        const lastField = specificity.split(':').at(-1);
        if (lastField === undefined) {
            return null;
        }

        if (lastField.length >= 3 && !/^[A-Za-z]+$/.test(lastField) && /[A-Za-z]$/.test(lastField)) {
            return lastField.slice(-1).toUpperCase();
        }

        return null;
    }

    public static isValidAllele(allele: string): boolean {
        const partsResult = extractAlleleParts(allele);
        if (!partsResult.ok) {
            return false;
        }

        const [locusToken, specificity] = partsResult.value;
        const locusResult = parseLocus(locusToken);
        if (!locusResult.ok) {
            return false;
        }

        return isValidSpecificity(specificity);
    }

    public clone(): HlaAllele {
        return new HlaAllele(
            this.locus,
            this.specificity,
            this.fieldCount,
            this.macCode,
            this.displayFieldCount,
            this.suffix
        );
    }

    public toString(): string {
        return this.allele;
    }

    public display(forceTruncate: boolean = false, keepSuffix: boolean = false): string {
        return this.reduceSpecificity(this.allele, forceTruncate, keepSuffix);
    }

    public displaySpecificity(forceTruncate: boolean = false, keepSuffix: boolean = false): string {
        const reduced = this.reduceSpecificity(this.specificity, forceTruncate, keepSuffix);

        if (!this.isDrb345) {
            return reduced;
        }

        const alias = LOCUS_DISPLAY_MAP.get(this.locus);
        if (isBlank(alias)) {
            return reduced;
        }

        return `${alias}*${reduced}`;
    }

    private reduceSpecificity(specificity: string, forceTruncate: boolean = false, keepSuffix: boolean = false): string {
        if (!forceTruncate && this.hasSuffix) {
            return specificity;
        }

        const parts = specificity.split(':');
        const reduced = parts.slice(0, this.displayFieldCount).join(':');
        return keepSuffix && this.suffix !== null ? `${reduced}${this.suffix}` : reduced;
    }

    public contains(other: HlaAllele | string): boolean {
        let candidate: HlaAllele;
        if (typeof other === 'string') {
            const parsedResult = HlaAllele.fromString(other);
            if (!parsedResult.ok) {
                throw parsedResult.error;
            }
            candidate = parsedResult.value;
        } else {
            candidate = other;
        }

        if (this.hasMacCode || candidate.hasMacCode) {
            return false;
        }

        return this.allele.startsWith(candidate.toString());
    }

    public withDisplayFieldCount(value: number): HlaAllele {
        return new HlaAllele(this.locus, this.specificity, this.fieldCount, this.macCode, value, this.suffix);
    }

    public withoutSuffix(): HlaAllele {
        if (!this.hasSuffix) {
            return this.clone();
        }

        return new HlaAllele(
            this.locus,
            this.specificity.slice(0, -1),
            this.fieldCount,
            this.macCode,
            this.displayFieldCount,
            null
        );
    }

    public asResolution(nField: number, keepSuffix: boolean = true): Result<HlaAllele, Error> {
        if (nField < 1) {
            return err(new Error('nField must be >= 1'));
        }

        if (nField > this.fieldCount) {
            return ok(this.clone());
        }

        const specificity = this.reduceSpecificity(this.specificity, true, false);
        const suffix = keepSuffix && this.hasSuffix ? this.suffix : null;
        const macCode = HlaAllele.getMacCode(specificity);

        return ok(new HlaAllele(this.locus, specificity, nField, macCode, Math.min(this.displayFieldCount, nField), suffix));
    }

    get allele(): string {
        return `${this.locus.value}*${this.specificity}`;
    }

    get hasMacCode(): boolean {
        return !isBlank(this.macCode);
    }

    get hasSuffix(): boolean {
        return !isBlank(this.suffix);
    }

    get isDrb345(): boolean {
        return this.locus.isDrb345;
    }

    get isNegative(): boolean {
        return NEGATIVE_SPECIFICITIES.has(this.specificity.toUpperCase());
    }

    get isMissing(): boolean {
        return isBlank(this.specificity) || MISSING_SPECIFICITIES.has(this.specificity.toUpperCase());
    }

    get isClassI(): boolean {
        return this.locus.isClassI;
    }

    get isClassII(): boolean {
        return this.locus.isClassII;
    }

    get allelicGroup(): string {
        return this.withDisplayFieldCount(1).display(true);
    }

    get isNull(): boolean {
        return this.suffix === 'N';
    }

    get isLow(): boolean {
        return this.suffix === 'L';
    }

    get isQuestionable(): boolean {
        return this.suffix === 'Q';
    }

    get isLowResolution(): boolean {
        return this.fieldCount === 1;
    }

    get isMidResolution(): boolean {
        return this.fieldCount === 2 && this.hasMacCode;
    }

    get isHighResolution(): boolean {
        return this.fieldCount >= 2 && !this.hasMacCode;
    }
}

export type HlaAlleleConstructor = typeof HlaAllele;
