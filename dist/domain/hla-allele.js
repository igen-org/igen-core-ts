import { err, ok } from '@igen/shared';
import { HlaLocus } from '../enum/hla-locus.js';
const LOCUS_DISPLAY_MAP = new Map([
    [HlaLocus.DRB3, 'B3'],
    [HlaLocus.DRB4, 'B4'],
    [HlaLocus.DRB5, 'B5'],
    [HlaLocus.DRB345, ''],
]);
const LOCUS_ALTERNATIVE_MAP = {
    B3: HlaLocus.DRB3,
    B4: HlaLocus.DRB4,
    B5: HlaLocus.DRB5,
};
const NEGATIVE_SPECIFICITIES = new Set(['NEGATIVO', 'NEGATIVE']);
const MISSING_SPECIFICITIES = new Set(['AUSENTE', 'MISSING']);
const SPECIFICITY_EXCEPTIONS = new Set([...NEGATIVE_SPECIFICITIES, ...MISSING_SPECIFICITIES, '?']);
const SPECIFICITY_REGEX = /^\d{2,}((:[A-Z]{2,})|(:\d{2,}[A-Z]?)*)$/i;
const isBlank = (value) => value === undefined || value === null || value.trim() === '';
const isValidSpecificity = (specificity) => {
    const normalized = specificity.toUpperCase();
    if (SPECIFICITY_EXCEPTIONS.has(normalized)) {
        return true;
    }
    return SPECIFICITY_REGEX.test(specificity);
};
const parseLocus = (locus) => {
    const normalized = locus.toUpperCase();
    const parsedResult = HlaLocus.fromValue(normalized);
    if (parsedResult.ok) {
        return parsedResult;
    }
    if (Object.hasOwn(LOCUS_ALTERNATIVE_MAP, normalized)) {
        const alternative = LOCUS_ALTERNATIVE_MAP[normalized];
        return ok(alternative);
    }
    return err(new Error(`Unknown locus: ${normalized}`));
};
const extractAlleleParts = (allele) => {
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
export class HlaAllele {
    locus;
    specificity;
    fieldCount;
    macCode;
    displayFieldCount;
    suffix;
    constructor(locus, specificity, fieldCount, macCode, displayFieldCount = 2, suffix = null) {
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
    static fromString(allele) {
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
        }
        catch (error) {
            return err(error instanceof Error ? error : new Error(String(error)));
        }
    }
    static getLocusStr(allele) {
        const partsResult = extractAlleleParts(allele);
        if (!partsResult.ok) {
            return partsResult;
        }
        return ok(partsResult.value[0]);
    }
    static getLocus(allele) {
        const locusResult = HlaAllele.getLocusStr(allele);
        if (!locusResult.ok) {
            return locusResult;
        }
        return parseLocus(locusResult.value);
    }
    static getSpecificity(allele) {
        const partsResult = extractAlleleParts(allele);
        if (!partsResult.ok) {
            return partsResult;
        }
        return ok(partsResult.value[1]);
    }
    static getFieldCount(specificity) {
        return specificity.split(':').length;
    }
    static getMacCode(specificity) {
        const lastField = specificity.split(':').at(-1);
        if (lastField === undefined) {
            return null;
        }
        return lastField.length >= 2 && /^[A-Za-z]+$/.test(lastField) ? lastField.toUpperCase() : null;
    }
    static getSuffix(specificity) {
        const lastField = specificity.split(':').at(-1);
        if (lastField === undefined) {
            return null;
        }
        if (lastField.length >= 3 && !/^[A-Za-z]+$/.test(lastField) && /[A-Za-z]$/.test(lastField)) {
            return lastField.slice(-1).toUpperCase();
        }
        return null;
    }
    static isValidAllele(allele) {
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
    clone() {
        return new HlaAllele(this.locus, this.specificity, this.fieldCount, this.macCode, this.displayFieldCount, this.suffix);
    }
    toString() {
        return this.allele;
    }
    display(forceTruncate = false, keepSuffix = false) {
        return this.reduceSpecificity(this.allele, forceTruncate, keepSuffix);
    }
    displaySpecificity(forceTruncate = false, keepSuffix = false) {
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
    reduceSpecificity(specificity, forceTruncate = false, keepSuffix = false) {
        if (!forceTruncate && this.hasSuffix) {
            return specificity;
        }
        const parts = specificity.split(':');
        const reduced = parts.slice(0, this.displayFieldCount).join(':');
        return keepSuffix && this.suffix !== null ? `${reduced}${this.suffix}` : reduced;
    }
    contains(other) {
        let candidate;
        if (typeof other === 'string') {
            const parsedResult = HlaAllele.fromString(other);
            if (!parsedResult.ok) {
                throw parsedResult.error;
            }
            candidate = parsedResult.value;
        }
        else {
            candidate = other;
        }
        if (this.hasMacCode || candidate.hasMacCode) {
            return false;
        }
        return this.allele.startsWith(candidate.toString());
    }
    withDisplayFieldCount(value) {
        return new HlaAllele(this.locus, this.specificity, this.fieldCount, this.macCode, value, this.suffix);
    }
    withoutSuffix() {
        if (!this.hasSuffix) {
            return this.clone();
        }
        return new HlaAllele(this.locus, this.specificity.slice(0, -1), this.fieldCount, this.macCode, this.displayFieldCount, null);
    }
    asResolution(nField, keepSuffix = true) {
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
    get allele() {
        return `${this.locus.value}*${this.specificity}`;
    }
    get hasMacCode() {
        return !isBlank(this.macCode);
    }
    get hasSuffix() {
        return !isBlank(this.suffix);
    }
    get isDrb345() {
        return this.locus.isDrb345;
    }
    get isNegative() {
        return NEGATIVE_SPECIFICITIES.has(this.specificity.toUpperCase());
    }
    get isMissing() {
        return isBlank(this.specificity) || MISSING_SPECIFICITIES.has(this.specificity.toUpperCase());
    }
    get isClassI() {
        return this.locus.isClassI;
    }
    get isClassII() {
        return this.locus.isClassII;
    }
    get allelicGroup() {
        return this.withDisplayFieldCount(1).display(true);
    }
    get isNull() {
        return this.suffix === 'N';
    }
    get isLow() {
        return this.suffix === 'L';
    }
    get isQuestionable() {
        return this.suffix === 'Q';
    }
    get isLowResolution() {
        return this.fieldCount === 1;
    }
    get isMidResolution() {
        return this.fieldCount === 2 && this.hasMacCode;
    }
    get isHighResolution() {
        return this.fieldCount >= 2 && !this.hasMacCode;
    }
}
//# sourceMappingURL=hla-allele.js.map