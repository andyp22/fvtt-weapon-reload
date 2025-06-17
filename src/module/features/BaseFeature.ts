import FeatureManager from '../managers/FeatureManager';

import { DndActor5e, DndItem5e } from '../types/dnd.types';

export default class BaseFeature {
    private _featureManager: FeatureManager;
    private _actorId: string;
    private _weaponId: string;
    protected EMPTY: string;

    constructor(featureManager: FeatureManager) {
        this._featureManager = featureManager;
        this._actorId = '';
        this._weaponId = '';
        this.EMPTY = this.translate('WEAPON_RELOAD.Empty');
        this.init();
    }

    get featureManager() {
        return this._featureManager;
    }

    get moduleManager() {
        return this._featureManager.moduleManager;
    }

    get character(): DndActor5e {
        return game?.actors?.get(this._actorId) as DndActor5e;
    }

    get characterId() {
        return this._actorId;
    }

    set characterId(id: string) {
        this._actorId = id;
    }

    get weapon(): DndItem5e {
        return this.character.items.get(this._weaponId) as DndItem5e;
    }

    get weaponId() {
        return this._weaponId;
    }

    set weaponId(id: string) {
        this._weaponId = id;
    }

    get loadout() {
        const firearm = this.weapon;
        const maxShots = parseInt(firearm.system.uses.max);
        const currentLoadout =
            (firearm.getFlag(this.moduleManager.id, 'chambered') as string[]) ||
            new Array(maxShots).fill(this.EMPTY);

        if (currentLoadout.length < maxShots) {
            const missing = maxShots - currentLoadout.length;
            for (let i = 0; i < missing; i++) {
                currentLoadout.push(this.EMPTY);
            }
        }

        return currentLoadout;
    }

    get fired() {
        const firearm = this.weapon;
        const maxShots = parseInt(firearm.system.uses.max);
        const fired =
            (firearm.getFlag(this.moduleManager.id, 'fired') as string[]) ||
            new Array(maxShots).fill(this.EMPTY);

        if (fired.length < maxShots) {
            const missing = maxShots - fired.length;
            for (let i = 0; i < missing; i++) {
                fired.push(this.EMPTY);
            }
        }

        return fired;
    }

    ammunition(items: Collection<Item5e>, equipped: boolean = false): Item5e[] {
        return items.filter((item: Item5e) => {
            const gameSystem = (item as DndItem5e).system;
            if (equipped) {
                return (
                    item.type == 'consumable' &&
                    gameSystem.type.subtype == 'firearmBullet' &&
                    gameSystem.equipped
                );
            }
            return (
                item.type == 'consumable' &&
                gameSystem.type.subtype == 'firearmBullet'
            );
        });
    }

    init() {}

    translate(key: string, opts?: { [key: string]: string }, format?: boolean) {
        return this.moduleManager.uiManager.getLocalizedTxt(key, opts, format);
    }

    toString() {
        return 'class BaseFeature';
    }
}
