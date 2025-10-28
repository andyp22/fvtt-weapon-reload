import { ConsumableDataSubject } from './shared.types';
export interface DndAttackEvent {
    attackMode: string;
    event: {
        isTrusted: boolean;
    };
    hookNames: string[];
    rolls: {
        options: {
            attackMode: string;
            criticalSuccess: number;
            advantageMode: number;
        };
    }[];
    subject: ConsumableDataSubject;
}
