import ModuleManager from './ModuleManager';
import {
    FirearmAttackFeature,
    FirearmCreationFeature,
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
            reload: new ReloadFeature(this),
            firearmAttack: new FirearmAttackFeature(this),
            firearmCreation: new FirearmCreationFeature(this),
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
