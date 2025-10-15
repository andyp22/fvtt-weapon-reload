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
        this._templateManager.init();
    }

    systemOverrides() {
        (CONFIG as any).DND5E.featureTypes.item = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.ItemFeature'),
        };

        (CONFIG as any).DND5E.itemProperties.concealable = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.Concealable'),
        };
        (CONFIG as any).DND5E.validProperties.weapon.add('concealable');

        (CONFIG as any).DND5E.itemProperties.unstable = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.Unstable'),
            isPhysical: true,
        };

        (CONFIG as any).DND5E.weaponIds.reloadableWeapon =
            'Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.lE60QaS1sctb3OAd';
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

        game.settings.register(moduleName, 'unstableAmmoFailureThreshhold', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Hint',
            type: Number,
            config: true,
            default: 2,
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
            default: false,
        });

        game.settings.register(moduleName, 'repeaterRoundUUID', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.RepeaterRoundUUID.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.RepeaterRoundUUID.Hint',
            type: String,
            config: true,
            default:
                'Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.GQzRN4amlRZX7k0V',
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
