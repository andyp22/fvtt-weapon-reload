import { ConsumableData } from './shared.types';

export type AmmoItemOption = {
    name: string;
    value: string;
    count: number;
    equipped: boolean;
};

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
