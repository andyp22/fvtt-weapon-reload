import FeatureManager from '../managers/FeatureManager';
import { DndAttackEvent, DndD20Roll, DndItem5e } from '../types';
import BaseFeature from './BaseFeature';
export declare class RepeatingShotFeature extends BaseFeature {
    private _ammo;
    constructor(featureManager: FeatureManager);
    init(): void;
    onUseActivity(d20Roll: DndD20Roll[], event: DndAttackEvent): Promise<boolean> | undefined;
    fireRound(): Promise<boolean>;
    findAmmo(name: string): DndItem5e;
    hasAmmo(name: string): boolean;
    loadAmmo(): Promise<void>;
    toString(): string;
}
