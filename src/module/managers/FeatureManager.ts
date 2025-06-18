import ModuleManager from './ModuleManager';
import {
    NextRoundFeature,
    ReloadableWeaponAttackFeature,
    ReloadableWeaponCreationFeature,
    ReloadFeature,
} from '../features';

export default class FeatureManager {
    private _moduleManager: ModuleManager;
    private _features: { [key: string]: any };

    constructor(moduleManager: ModuleManager) {
        this._moduleManager = moduleManager;
        this._features = {};
    }

    init() {
        this._features = {
            nextRound: new NextRoundFeature(this),
            reload: new ReloadFeature(this),
            reloadableWeaponAttack: new ReloadableWeaponAttackFeature(this),
            reloadableWeaponCreation: new ReloadableWeaponCreationFeature(this),
        };
    }

    getFeature(id: string) {
        if (this._features[id]) {
            return this._features[id];
        }
        return null;
    }

    get moduleManager() {
        return this._moduleManager;
    }

    toString() {
        return `class FeatureManager: ${this._features.length}`;
    }
}
