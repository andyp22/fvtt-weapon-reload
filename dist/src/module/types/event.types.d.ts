import { DndItem5e } from './item.types';
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
    subject: {
        _id: string;
        type: string;
        sort: number;
        activation: {
            type: string;
            override: boolean;
        };
        consumption: {
            scaling: {
                allowed: boolean;
            };
            spellSlot: boolean;
            targets: never[];
        };
        description: {};
        duration: {
            units: string;
            concentration: boolean;
            override: boolean;
        };
        effects: never[];
        range: {
            units: string;
            override: boolean;
        };
        target: {
            template: {
                contiguous: boolean;
                units: string;
            };
            affects: {
                choice: boolean;
            };
            override: boolean;
            prompt: boolean;
        };
        uses: {
            spent: number;
            recovery: never[];
        };
        attack: {
            critical: {};
            flat: boolean;
            type: {};
        };
        damage: {
            critical: {};
            includeBase: boolean;
            parts: never[];
        };
        actor: Actor5e;
        item: DndItem5e;
    };
}
