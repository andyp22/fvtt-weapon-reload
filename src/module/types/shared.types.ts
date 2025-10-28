import { DndItem5e } from './item.types';

export interface ConsumableDataSubject {
    _id: string;
    name: string;
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
    description: {
        chatFlavor: string;
    };
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
        critical: {
            threshold?: number;
        };
        flat: boolean;
        type: {
            value: string;
            classification: string;
        };
    };
    damage: {
        critical: {
            bonus?: string;
        };
        includeBase: boolean;
        parts: never[];
    };
    item: DndItem5e;
    actor: Actor5e;
}

export interface ConsumableData {
    activities: ConsumableDataSubject[];
    uses: {
        spent: number;
        max: number;
        recovery: never[];
        value: number;
        label: string;
    };
    description: {
        value: string;
        chat: string;
    };
    identifier: string;
    source: {
        book: string;
        revision: number;
        rules: string;
        bookPlaceholder: string;
        label: string;
        value: string;
        slug: string;
    };
    identified: boolean;
    unidentified: {
        description: string;
    };
    container?: unknown;
    quantity: number;
    weight: {
        value: number;
        units: string;
    };
    price: {
        value: number;
        denomination: string;
        valueInGP: number;
    };
    rarity: string;
    attunement: string;
    attuned: boolean;
    equipped: boolean;
    crewed: boolean;
    ammunition: {
        type?: string;
    };
    armor: {
        value?: string;
    };
    damage: {
        base: {
            types: string[];
            custom: {
                enabled: boolean;
            };
            scaling: {
                number: number;
            };
            number: number;
            denomination: string;
            bonus: string;
        };
        versatile: {
            types: never[];
            custom: {
                enabled: boolean;
            };
            scaling: {
                number: number;
            };
        };
        replace: boolean;
    };
    mastery: string;
    properties: Set<string>;
    type: {
        value: string;
        subtype: string;
        baseItem: string;
        label: string;
        identifier: string;
    };
    proficient: null;
    range: {
        value: number;
        long: number;
        reach: null;
        units: string;
    };
    prof: {
        deterministic: boolean;
        _baseProficiency: number;
        multiplier: number;
        rounding: string;
    };
    flags: {
        dnd5e: Record<string, Record<string, string>>;
    };
    name: string;
}
