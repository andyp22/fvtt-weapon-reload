export interface AttackActivity {
    _id: string;
    type: string;
    sort: number;
    activation: Activation;
    actor: Actor5e;
    consumption: Consumption;
    description: Description;
    duration: Duration;
    effects: Effect[];
    item: Item5e;
    range: Range;
    target: Target;
    uses: Uses;
    attack: Attack;
    damage: Damage;
    name: string;
}

export interface UtilityActivity {
    type: string;
    _id: string;
    sort: number;
    activation: Activation;
    actor: Actor5e;
    consumption: Consumption;
    description: Description;
    duration: Duration;
    effects: Effect[];
    item: Item5e;
    range: Range;
    target: Target;
    uses: Uses;
    roll: Roll;
    name: string;
    img: string;
}

interface Activation {
    type: string;
    override: boolean;
    condition: string;
}

interface Affects {
    choice: boolean;
    count?: string;
    type: string;
    special?: string;
}

interface Attack {
    critical: Critical;
    flat: boolean;
    type: Type;
    ability: string;
    bonus: string;
}

interface Consumption {
    scaling: Scaling;
    spellSlot: boolean;
    targets: ConsumptionTargetData[];
}

interface ConsumptionTargetData {
    type: string;
    value: string;
    target: string;
    scaling: Scaling;
}

interface Critical {
    threshold?: null;
    bonus?: string;
}

interface Damage {
    critical: Critical;
    includeBase: boolean;
    parts: DamageData[];
}

interface DamageData {
    types: string[];
    custom: Custom;
    scaling: Scaling;
    number: number;
    denomination: number;
    bonus: string;
}

interface Scaling {
    number: number;
}

interface Custom {
    enabled: boolean;
}

interface Description {
    chatFlavor: string;
}

interface Duration {
    units: string;
    concentration: boolean;
    override: boolean;
}

interface Effect {
    _id: string;
}

interface Range {
    units: string;
    override: boolean;
}

interface RecoveryData {
    period: string;
    type: string;
    formula: string;
    _index: number;
}

interface Roll {
    prompt: boolean;
    visible: boolean;
    name: string;
    formula: string;
}

interface Scaling {
    allowed: boolean;
}

interface Target {
    template: Template;
    affects: Affects;
    override: boolean;
    prompt: boolean;
}

interface Template {
    contiguous: boolean;
    units: string;
    type: string;
}

interface Type {
    value: string;
    classification: string;
}

interface Uses {
    spent: number;
    recovery: RecoveryData[];
    max: string;
}
