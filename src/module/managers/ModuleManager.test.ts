import ModuleManager from './ModuleManager';
import FeatureManager from './FeatureManager';
import UiManager from './UiManager';
import TemplateManager from './TemplateManager';
import { jest } from '@jest/globals';

jest.mock('./FeatureManager');
jest.mock('./UiManager');
jest.mock('./TemplateManager');

let moduleManager: ModuleManager;

// Mocks for Foundry globals
beforeEach(() => {
    jest.clearAllMocks();

    (UiManager as jest.Mock).mockImplementation(() => ({
        getLocalizedTxt: jest.fn((k) => `localized:${k}`),
    }));

    (FeatureManager as jest.Mock).mockImplementation(() => ({
        init: jest.fn(),
    }));

    (TemplateManager as unknown as jest.Mock).mockImplementation(() => ({
        init: jest.fn(),
    }));

    moduleManager = new ModuleManager('fvtt-weapon-reload');
});

describe('ModuleManager', () => {
    // --- Constructor ---
    test('constructor(): sets id and initializes managers', () => {
        expect(moduleManager.id).toBe('fvtt-weapon-reload');
        expect(FeatureManager).toHaveBeenCalledWith(moduleManager);
        expect(UiManager).toHaveBeenCalledWith(moduleManager);
        expect(TemplateManager).toHaveBeenCalled();
    });

    // --- Accessors ---
    test('getters: return proper internal instances', () => {
        expect(moduleManager.featureManager).toBeDefined();
        expect(moduleManager.uiManager).toBeDefined();
        expect(moduleManager.templateManager).toBeDefined();
    });

    // --- init() ---
    test('init(): calls systemOverrides, moduleConfigurations, featureManager.init, and templateManager.init', () => {
        const sysSpy = jest.spyOn(moduleManager, 'systemOverrides');
        const modSpy = jest.spyOn(moduleManager, 'moduleConfigurations');
        moduleManager.init();
        expect(sysSpy).toHaveBeenCalled();
        expect(modSpy).toHaveBeenCalled();
        expect((moduleManager as any)._featureManager.init).toHaveBeenCalled();
        expect((moduleManager as any)._templateManager.init).toHaveBeenCalled();
    });

    // --- systemOverrides() ---
    test('systemOverrides(): populates CONFIG.DND5E with expected entries', () => {
        moduleManager.systemOverrides();
        const uiMgr = (moduleManager as any)._uiManager;
        expect(uiMgr.getLocalizedTxt).toHaveBeenCalledWith(
            'WEAPON_RELOAD.ItemFeature'
        );
        expect((global as any).CONFIG.DND5E.featureTypes.item.label).toContain(
            'localized:'
        );
        expect(
            (global as any).CONFIG.DND5E.itemProperties.concealable.label
        ).toContain('localized:');
        expect(
            (global as any).CONFIG.DND5E.itemProperties.unstable.label
        ).toContain('localized:');
        expect(
            (global as any).CONFIG.DND5E.weaponIds.reloadableWeapon
        ).toContain('Compendium.fvtt-weapon-reload');
        expect(
            (global as any).CONFIG.DND5E.validProperties.weapon.has(
                'concealable'
            )
        ).toBe(true);
    });

    // --- moduleConfigurations() ---
    test('moduleConfigurations(): registers expected settings', () => {
        moduleManager.moduleConfigurations();
        const register = (global as any).game.settings.register;
        expect(register).toHaveBeenCalledTimes(5);
        expect(register).toHaveBeenCalledWith(
            'fvtt-weapon-reload',
            'unstableAmmo',
            expect.objectContaining({ type: Boolean })
        );
        expect(register).toHaveBeenCalledWith(
            'fvtt-weapon-reload',
            'unstableAmmoFailureThreshhold',
            expect.objectContaining({ type: Number })
        );
    });

    // --- debug() ---
    test('debug(): toggles CONFIG.debug.hooks and logs', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        moduleManager.debug(true);
        expect((global as any).CONFIG.debug.hooks).toBe(true);
        expect(logSpy).toHaveBeenCalledWith('CONFIG: ', (global as any).CONFIG);
        expect(logSpy).toHaveBeenCalledWith(
            'CONFIG.DND5E: ',
            (global as any).CONFIG.DND5E
        );
        logSpy.mockRestore();
    });

    // --- toString() ---
    test('toString(): returns correct identifier', () => {
        expect(moduleManager.toString()).toBe('class ModuleManager');
    });
});
