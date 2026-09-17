import { ConsumableData } from './shared.types';
export interface AmmoItemOption {
    name: string;
    value: string;
    count: number;
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
    update: (obj: Record<string, unknown>) => Promise<this>;
    use: (config?: object, dialog?: object, message?: object) => void;
    getFlag: (moduleId: string, name: string) => unknown;
    setFlag: (moduleId: string, name: string, value: unknown) => Promise<this>;
    toObject: () => void;
}
