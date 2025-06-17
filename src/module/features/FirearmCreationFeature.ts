import FeatureManager from '../managers/FeatureManager';

import { DndItem5e } from '../types/dnd.types';
import BaseFeature from './BaseFeature';

export class FirearmCreationFeature extends BaseFeature {
    private _creatingFirearm: boolean;

    constructor(featureManager: FeatureManager) {
        super(featureManager);
        this._creatingFirearm = false;
    }

    init() {
        Hooks.on('preCreateItem', this.onPreCreateItem.bind(this));
        Hooks.on('createItem', this.onCreateItem.bind(this));
    }

    async onPreCreateItem(item: DndItem5e) {
        if (item.system.type.baseItem == 'firearm') {
            console.log('Weapon Reload | Triggered Firearm Pre-Creation');

            this.weaponId = item.id;
            this.characterId = item.actor?.id as string;
            this._creatingFirearm = true;
        }
    }

    async onCreateItem(item: DndItem5e) {
        if (!this._creatingFirearm || item.id !== this.weaponId) return;

        console.log('Weapon Reload | Triggered Firearm Creation');

        const firearm = this.weapon;
        const ammoQty = parseInt(firearm.system.uses.max);

        await firearm.update({
            'system.uses.spent': ammoQty,
            'system.uses.value': 0,
        });
        await firearm.setFlag(
            this.moduleManager.id,
            'chambered',
            new Array(ammoQty).fill(this.EMPTY)
        );
        await firearm.setFlag(
            this.moduleManager.id,
            'fired',
            new Array(ammoQty).fill(this.EMPTY)
        );

        this.weaponId = '';
        this.characterId = '';
        this._creatingFirearm = false;
    }

    toString() {
        return 'class FirearmCreationFeature';
    }
}
