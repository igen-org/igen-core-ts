import type { ValueOf } from '@igen/shared';

export const HlaLocusClass = {
    I: 'I',
    II: 'II',
} as const;

export type HlaLocusClass = ValueOf<typeof HlaLocusClass>;
