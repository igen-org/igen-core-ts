import type { ValueOf } from '@igen/shared';

export const HlaLocusChain = {
    ALPHA: 'ALPHA',
    BETA: 'BETA',
} as const;

export type HlaLocusChain = ValueOf<typeof HlaLocusChain>;
