import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
import { type AmmoItemOption, DndItem5e, UtilityActivity } from '../types';
export declare class ReloadFeature extends BaseFeature {
    private _hookId;
    private _handleChoiceDialogClose;
    private _repeaterRound;
    constructor(featureManager: FeatureManager);
    init(): void;
    getRepeaterAmmo(): Promise<void>;
    onUseActivity(activity: UtilityActivity): boolean;
    weaponReload(refundAmmo?: boolean): void;
    refundChamberedAmmo(inventoryAmmunition: DndItem5e[]): AmmoItemOption[];
    onSubmitChooseAmmunition(data: unknown): Promise<void>;
    chooseAmmunition(ammoOptions: AmmoItemOption[], currentLoadout: string[]): Promise<void>;
    onCloseChoiceDialog(loadout: string[]): void;
    buildReloadChat(reloadableWeapon: Item5e, reloadCanceled: boolean, loadout: string[]): Promise<string>;
    reloadReloadableWeapon(loadout: string[], reloadCanceled?: boolean): Promise<void>;
    removeLoadout(counts: Record<string, number>): boolean;
    onReloadCallback(actor: Actor5e, weapon: DndItem5e): Promise<void>;
    getLoadoutCounts(currentLoadout: string[]): Record<string, number>;
    toString(): string;
}
