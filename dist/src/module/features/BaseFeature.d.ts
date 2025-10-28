import FeatureManager from '../managers/FeatureManager';
import { DndActor5e, DndItem5e } from '../types';
export default class BaseFeature {
    private _featureManager;
    private _actorId;
    private _weaponId;
    constructor(featureManager: FeatureManager);
    get featureManager(): FeatureManager;
    get moduleManager(): import("../managers/ModuleManager").default;
    get character(): DndActor5e;
    get characterId(): string;
    set characterId(id: string);
    get weapon(): DndItem5e;
    get weaponId(): string;
    set weaponId(id: string);
    get loadout(): string[];
    get fired(): string[];
    getReloadFlag(name: string): string[];
    ammunition(items: Collection<Item5e>, equipped?: boolean, exclude?: string[]): Item5e[];
    init(): void;
    translate(key: string, opts?: Record<string, string>, format?: boolean): string;
    toString(): string;
}
