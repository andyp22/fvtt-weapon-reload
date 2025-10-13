import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
import { DndItem5e } from '../types';
export declare class ReloadableWeaponCreationFeature extends BaseFeature {
    private _creatingReloadableWeapon;
    private _createItemHookId;
    constructor(featureManager: FeatureManager);
    init(): void;
    onPreCreateItem(item: DndItem5e): Promise<void>;
    onCreateItem(item: DndItem5e): Promise<void>;
    toString(): string;
}
