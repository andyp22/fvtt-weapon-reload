import FeatureManager from '../managers/FeatureManager';
import { DndItem5e } from '../types';

export default class BaseFeature {
    private _featureManager: FeatureManager;
    private _actorId: string;
    private _weaponId: string;

    constructor(featureManager: FeatureManager) {
        this._featureManager = featureManager;
        this._actorId = '';
        this._weaponId = '';
        this.init();
    }

    get featureManager() {
        return this._featureManager;
    }

    get moduleManager() {
        return this._featureManager.moduleManager;
    }

    get character(): Actor5e {
        return game?.actors?.get(this._actorId) as Actor5e;
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
        return this.getReloadFlag('chambered');
    }

    get fired() {
        return this.getReloadFlag('fired');
    }

    getReloadFlag(name: string) {
        const reloadableWeapon = this.weapon;
        const maxShots = reloadableWeapon.system.uses.max;
        const fired =
            (reloadableWeapon.getFlag(
                this.moduleManager.id,
                name
            ) as string[]) || new Array(maxShots).fill('Empty');

        if (fired.length < maxShots) {
            const missing = maxShots - fired.length;
            for (let i = 0; i < missing; i++) {
                fired.push('Empty');
            }
        }

        return fired;
    }

    ammunition(
        items: Collection<Item5e>,
        equipped: boolean = false,
        exclude: string[] = []
    ): Item5e[] {
        return items.filter((item: Item5e) => {
            const gameSystem = (item as DndItem5e).system;
            if (equipped) {
                return (
                    item.type == 'consumable' &&
                    gameSystem.type.subtype == 'firearmBullet' &&
                    gameSystem.equipped &&
                    !exclude.includes(item.name)
                );
            }
            return (
                item.type == 'consumable' &&
                gameSystem.type.subtype == 'firearmBullet' &&
                !exclude.includes(item.name)
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
