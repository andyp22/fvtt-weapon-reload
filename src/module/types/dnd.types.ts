export interface ConsumableData {
    activities: any;
    uses: {
        spent: number;
        recovery: any[];
        autoDestroy: boolean;
        max: string;
    };
    description: {
        value: string;
        chat: string;
    };
    identifier: string;
    source: {
        revision: number;
        rules: string;
    };
    identified: boolean;
    unidentified: {
        description: string;
    };
    container?: any;
    quantity: number;
    weight: {
        value: number;
        units: string;
    };
    price: {
        value: number;
        denomination: string;
    };
    rarity: string;
    attunement: string;
    damage: {
        base: {
            types: any[];
            custom: {
                enabled: string;
            };
            scaling: {
                number: number;
            };
            number?: number;
            denomination?: string;
            bonus?: string;
        };
        replace: boolean;
    };
    properties: any[];
    type: {
        value: string;
        subtype: string;
        baseItem?: string;
        label?: string;
    };
    attuned: boolean;
    equipped: boolean;
}

export interface DndItem5e extends Item5e {
    id: string;
    name: string;
    system: ConsumableData;
    labels?: {
        activations?: string[];
        attacks?: string[];
        damages?: string[];
        properties?: string[];
        recovery?: string;
    };
    update: (obj: { [key: string]: any }) => Promise<this>;
    use: (config?: object, dialog?: object, message?: object) => void;
}

export interface DndActor5e extends Actor5e {
    sourcedItems: any;
}

export interface DndActiveEffect extends ActiveEffect {
    description: string;
}

export type DndItem5eSet = [itemId: string, quantitySet: Set<DndItem5e>];

export interface DndD20Roll {
    data?: {
        currency: {};
        abilities: {};
        bonuses: {};
        skills: {};
        tools: {};
        spells: {};
        attributes: {};
        bastion: {};
        details: {};
        traits: {};
        resources: {};
        favorites: never[];
        scale: {};
        prof: string;
        classes: {};
        subclasses: {};
        flags: {};
        name: string;
        statuses: {};
        srd5e: {
            self: { name: string };
            name: { pocketpistol: number };
            user: { id: string };
            userchar: {
                spellAttackRanged: number;
                spellAttackMelee: number;
                spellSaveDc: number;
                spellMod: number;
            };
        };
        item: {
            activities: {
                _id: string;
                type: string;
                sort: number;
                activation: { type: string; override: boolean };
                consumption: {
                    scaling: { allowed: boolean };
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
                range: { units: string; override: boolean };
                target: {
                    template: { contiguous: boolean; units: string };
                    affects: { choice: boolean };
                    override: boolean;
                    prompt: boolean;
                };
                uses: { spent: number; recovery: never[] };
                attack: { critical: {}; flat: boolean; type: {} };
                damage: { critical: {}; includeBase: boolean; parts: never[] };
                item: DndItem5e;
                actor: DndActor5e;
            }[];
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
            unidentified: { description: string };
            container: null;
            quantity: number;
            weight: { value: number; units: string };
            price: { value: number; denomination: string; valueInGP: number };
            rarity: string;
            attunement: string;
            attuned: boolean;
            equipped: boolean;
            crewed: boolean;
            ammunition: {};
            armor: {};
            damage: {
                base: {
                    types: string[];
                    custom: { enabled: boolean };
                    scaling: { number: number };
                    number: number;
                    denomination: number;
                    bonus: string;
                };
                versatile: {
                    types: never[];
                    custom: { enabled: boolean };
                    scaling: { number: number };
                };
            };
            mastery: string;
            properties: {};
            proficient: null;
            range: { value: number; long: number; reach: null; units: string };
            type: {
                value: string;
                baseItem: string;
                label: string;
                identifier: string;
            };
            prof: {
                deterministic: boolean;
                _baseProficiency: number;
                multiplier: number;
                rounding: string;
            };
            flags: {
                dnd5e: { last: { KgLuwlueI0vcjAXw: { attackMode: string } } };
            };
            name: string;
        };
        scaling: {};
        activity: {
            type: string;
            name: string;
            img: string;
            sort: number;
            activation: {
                type: string;
                value: null;
                override: boolean;
                scalar: boolean;
            };
            consumption: {
                scaling: { allowed: boolean };
                spellSlot: boolean;
                targets: never[];
            };
            description: {};
            duration: {
                value: null;
                units: string;
                concentration: boolean;
                override: boolean;
                scalar: boolean;
            };
            effects: never[];
            range: {
                value: number;
                units: string;
                override: boolean;
                long: number;
                reach: null;
                scalar: boolean;
            };
            target: {
                template: {
                    count: null;
                    contiguous: boolean;
                    size: null;
                    width: null;
                    height: null;
                    units: string;
                    dimensions: { size: string };
                    label: string;
                };
                affects: {
                    count: null;
                    choice: boolean;
                    labels: { sheet: string; statblock: string };
                };
                override: boolean;
                prompt: boolean;
            };
            uses: {
                spent: number;
                recovery: never[];
                value: number;
                label: string;
            };
            attack: {
                critical: {};
                flat: boolean;
                type: { value: string; classification: string };
            };
            damage: {
                critical: {};
                includeBase: boolean;
                parts: {
                    types: string[];
                    custom: { enabled: boolean };
                    scaling: { number: number };
                    number: number;
                    denomination: number;
                    bonus: string;
                }[];
            };
            labels: {
                activation: string;
                duration: string;
                concentrationDuration: string;
                range: string;
                rangeParts: string;
                target: string;
                recovery: string;
                damages: {
                    formula: string;
                    label: string;
                    base: boolean;
                    damageType: string;
                }[];
                damage: {
                    formula: string;
                    label: string;
                    base: boolean;
                    damageType: string;
                }[];
                modifier: string;
                toHit: string;
            };
        };
        mod: number;
    };
}

export interface DndAttackEvent {
    attackMode: string;
    event: { isTrusted: boolean };
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
        activation: { type: string; override: boolean };
        consumption: {
            scaling: { allowed: boolean };
            spellSlot: boolean;
            targets: never[];
        };
        description: {};
        duration: { units: string; concentration: boolean; override: boolean };
        effects: never[];
        range: { units: string; override: boolean };
        target: {
            template: { contiguous: boolean; units: string };
            affects: { choice: boolean };
            override: boolean;
            prompt: boolean;
        };
        uses: { spent: number; recovery: never[] };
        attack: { critical: {}; flat: boolean; type: {} };
        damage: { critical: {}; includeBase: boolean; parts: never[] };
        actor: DndActor5e;
        item: DndItem5e;
    };
}
