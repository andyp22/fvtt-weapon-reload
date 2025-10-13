import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
import { type AmmoItemOption, DndItem5e } from '../types';
export declare class ReloadFeature extends BaseFeature {
    private _hookId;
    private _handleChoiceDialogClose;
    constructor(featureManager: FeatureManager);
    init(): void;
    onUseActivity(activity: any): boolean;
    weaponReload(refundAmmo?: boolean): void;
    refundChamberedAmmo(inventoryAmmunition: DndItem5e[]): AmmoItemOption[];
    onSubmitChooseAmmunition({ loadout, reloadCanceled, }: {
        loadout: string[];
        reloadCanceled: boolean;
    }): Promise<void>;
    chooseAmmunition(ammoOptions: AmmoItemOption[], currentLoadout: string[]): Promise<void>;
    onCloseChoiceDialog(loadout: string[]): void;
    buildReloadChat(reloadableWeapon: Item5e, reloadCanceled: boolean, loadout: string[]): Promise<any>;
    reloadReloadableWeapon(loadout: string[], reloadCanceled?: boolean): Promise<void>;
    removeLoadout(counts: {
        [key: string]: number;
    }): boolean;
    onReloadCallback(actor: Actor5e, weapon: DndItem5e): Promise<void>;
    getLoadoutCounts(currentLoadout: string[]): {
        [key: string]: number;
    };
    toString(): string;
}
