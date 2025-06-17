import FeatureManager from './FeatureManager';
import UiManager from './UiManager';
import TemplateManager from './TemplateManager';

export default class ModuleManager {
    private _moduleId: string;
    private _featureManager: FeatureManager;
    private _uiManager: UiManager;
    private _templateManager: TemplateManager;

    constructor(id: string) {
        this._moduleId = id;
        this._featureManager = new FeatureManager(this);
        this._uiManager = new UiManager(this);
        this._templateManager = new TemplateManager();
    }

    get id() {
        return this._moduleId;
    }

    get featureManager() {
        return this._featureManager;
    }

    get uiManager() {
        return this._uiManager;
    }

    get templateManager() {
        return this._templateManager;
    }

    init() {
        this.systemOverrides();
        this.moduleConfigurations();
        this._featureManager.init();
        this._uiManager.init();
        this._templateManager.init();
    }

    systemOverrides() {
        (CONFIG as any).DND5E.featureTypes.item = {
            label: this.uiManager.getLocalizedTxt('ItemFeature'),
        };

        (CONFIG as any).DND5E.itemProperties.concealable = {
            label: this.uiManager.getLocalizedTxt('Concealable'),
        };
        (CONFIG as any).DND5E.validProperties.weapon.add('concealable');

        (CONFIG as any).DND5E.itemProperties.unstable = {
            label: this.uiManager.getLocalizedTxt('Unstable'),
            isPhysical: true,
        };

        (CONFIG as any).DND5E.weaponIds.firearm =
            'Compendium.fvtt-weapon-reload.item-pack.Item.lE60QaS1sctb3OAd';
    }

    moduleConfigurations() {
        const moduleName = 'fvtt-weapon-reload';

        game.settings.register(moduleName, 'unstableAmmo', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Hint',
            type: Boolean,
            config: true,
            default: true,
        });

        game.settings.register(moduleName, 'useMisfires', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UseMisfires.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UseMisfires.Hint',
            type: Boolean,
            config: true,
            default: true,
        });

        game.settings.register(moduleName, 'filterAmmunitionByEquipped', {
            scope: 'user',
            name: 'SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Hint',
            type: Boolean,
            config: true,
            default: true,
        });
    }

    debug(hooks: boolean = false) {
        CONFIG.debug.hooks = hooks;
        console.log('CONFIG: ', CONFIG);
        console.log('CONFIG.DND5E: ', (CONFIG as any).DND5E);
    }

    toString() {
        return 'class ModuleManager';
    }
}
