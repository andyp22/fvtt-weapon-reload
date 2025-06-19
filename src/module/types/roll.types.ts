import { ConsumableData } from './shared.types';

interface D20Roll {
    data?: {
        item: ConsumableData;
    };
}

type MergedRollData = D20Roll['data'] & Roll['data'];

export interface DndD20Roll {
    data?: MergedRollData;
}
