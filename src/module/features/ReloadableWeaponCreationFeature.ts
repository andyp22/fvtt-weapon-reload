import FeatureManager from '../managers/FeatureManager';
import BaseFeature from './BaseFeature';
import { DndItem5e } from '../types';

export class ReloadableWeaponCreationFeature extends BaseFeature {
    private _creatingReloadableWeapon: boolean;
    private _createItemHookId: number;

    constructor(featureManager: FeatureManager) {
        super(featureManager);
        this._creatingReloadableWeapon = false;
        this._createItemHookId = -1;
    }

    init() {
        Hooks.on('preCreateItem', this.onPreCreateItem.bind(this));
    }

    async onPreCreateItem(item: DndItem5e) {
        if (item.system.type.baseItem == 'reloadableWeapon') {
            console.log('Weapon Reload | Triggered Pre-Creation');

            this.weaponId = item.id;
            this.characterId = item.actor?.id as string;
            this._creatingReloadableWeapon = true;
            this._createItemHookId = Hooks.on(
                'createItem',
                this.onCreateItem.bind(this)
            );
        }
    }

    async onCreateItem(item: DndItem5e) {
        if (!this._creatingReloadableWeapon || item.id !== this.weaponId)
            return;

        console.log('Weapon Reload | Triggered ReloadableWeapon Creation');

        const reloadableWeapon = this.weapon;
        const ammoQty = reloadableWeapon.system.uses.max;

        await reloadableWeapon.update({
            'system.uses.spent': ammoQty,
            'system.uses.value': 0,
        });
        await reloadableWeapon.setFlag(
            this.moduleManager.id,
            'chambered',
            new Array(ammoQty).fill('Empty')
        );
        await reloadableWeapon.setFlag(
            this.moduleManager.id,
            'fired',
            new Array(ammoQty).fill('Empty')
        );

        this.weaponId = '';
        this.characterId = '';
        this._creatingReloadableWeapon = false;
        Hooks.off('createItem', this._createItemHookId);
        this._createItemHookId = -1;
    }

    toString() {
        return 'class ReloadableWeaponCreationFeature';
    }
}
